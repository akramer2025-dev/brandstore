import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Generate unique agreement number
function generateAgreementNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `AGR-${timestamp}-${random}`;
}

// POST - Create new installment agreement and order
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    
    const body = await req.json();
    const {
      nationalIdImage,
      signature,
      selfieImage,
      fullName,
      nationalId,
      totalAmount,
      downPayment,
      numberOfInstallments,
      monthlyInstallment,
      // بيانات الطلب من السلة
      cartItems,
      deliveryAddress,
      deliveryPhone,
      deliveryMethod,
      deliveryFee,
      governorate,
      customerNotes
    } = body;
    
    // Validation
    if (!nationalIdImage || !signature || !selfieImage) {
      return NextResponse.json(
        { error: 'جميع المستندات مطلوبة (البطاقة الشخصية، التوقيع، الصورة الشخصية)' },
        { status: 400 }
      );
    }
    
    if (!totalAmount || !downPayment || !numberOfInstallments || !monthlyInstallment) {
      return NextResponse.json(
        { error: 'بيانات التقسيط غير مكتملة' },
        { status: 400 }
      );
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'السلة فارغة' },
        { status: 400 }
      );
    }

    if (!deliveryAddress || !deliveryPhone) {
      return NextResponse.json(
        { error: 'بيانات التوصيل غير مكتملة' },
        { status: 400 }
      );
    }
    
    // Get user IP and User Agent
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Generate order number
    const generateOrderNumber = () => {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `ORD-${timestamp}-${random}`;
    };

    // Create agreement and order in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create installment agreement with PENDING status
      const agreement = await tx.installmentAgreement.create({
        data: {
          userId: session.user.id!,
          agreementNumber: generateAgreementNumber(),
          status: 'PENDING', // تغيير: القبول المبدئي - بانتظار مراجعة المدير
          nationalIdImage,
          signature,
          selfieImage,
          fullName: fullName || session.user.name || '',
          nationalId: nationalId || '',
          totalAmount,
          downPayment,
          numberOfInstallments,
          monthlyInstallment,
          interestRate: 0, // No interest for now
          acceptedTerms: true,
          acceptedAt: new Date(),
          ip,
          userAgent
        }
      });

      // 2. Create order with installment
      const order = await tx.order.create({
        data: {
          customerId: session.user.id!,
          orderNumber: generateOrderNumber(),
          status: 'PENDING', // بانتظار مراجعة التقسيط
          totalAmount,
          deliveryAddress,
          deliveryPhone,
          deliveryMethod: deliveryMethod || 'HOME_DELIVERY',
          deliveryFee: deliveryFee || 0,
          governorate: governorate || '',
          paymentMethod: 'INSTALLMENT_4',
          paymentStatus: 'PENDING',
          customerNotes: customerNotes || '',
          finalAmount: totalAmount + (deliveryFee || 0),
          items: {
            create: cartItems.map((item: any) => ({
              productId: item.productId || item.id,
              quantity: item.quantity,
              price: item.price,
              vendorId: item.vendorId
            }))
          }
        }
      });

      // 3. Link agreement to order
      await tx.installmentAgreement.update({
        where: { id: agreement.id },
        data: { orderId: order.id }
      });

      // 4. Update product stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId || item.id },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return { agreement, order };
    });

    // 🔔 إشعار للمدير: طلب تقسيط جديد مع طلب مرتبط
    console.log('🔔 [ADMIN NOTIFICATION] طلب تقسيط جديد مع طلب!');
    console.log(`📝 رقم الاتفاقية: ${result.agreement.agreementNumber}`);
    console.log(`📦 رقم الطلب: ${result.order.orderNumber}`);
    console.log(`👤 العميل: ${fullName || session.user.name}`);
    console.log(`💰 المبلغ: ${totalAmount} ج.م`);
    console.log(`📅 التاريخ: ${new Date().toLocaleString('ar-EG')}`);
    
    return NextResponse.json({
      success: true,
      agreement: {
        id: result.agreement.id,
        agreementNumber: result.agreement.agreementNumber,
        status: result.agreement.status
      },
      order: {
        id: result.order.id,
        orderNumber: result.order.orderNumber,
        status: result.order.status
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating installment agreement and order:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الاتفاقية والطلب' },
      { status: 500 }
    );
  }
}

// GET - Get user's agreements
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    
    const agreements = await prisma.installmentAgreement.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true
          }
        }
      }
    });
    
    return NextResponse.json({ agreements });
    
  } catch (error) {
    console.error('Error fetching agreements:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الاتفاقيات' },
      { status: 500 }
    );
  }
}
