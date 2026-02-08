import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - دفع للمورد
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      select: { id: true, canAddOfflineProducts: true },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'حساب الشريك غير موجود' }, { status: 404 });
    }

    if (!vendor.canAddOfflineProducts) {
      return NextResponse.json({ 
        error: 'ليس لديك صلاحية إدارة البضاعة الخارجية' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { productIds, amount, paymentMethod, notes } = body;

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ 
        error: 'المبلغ المدفوع يجب أن يكون أكبر من صفر' 
      }, { status: 400 });
    }

    const supplierId = params.id;

    // التحقق من المورد
    const supplier = await prisma.offlineSupplier.findFirst({
      where: { 
        id: supplierId,
        vendorId: vendor.id,
      },
      include: {
        offlineProducts: {
          where: productIds?.length > 0 ? { id: { in: productIds } } : {},
          select: {
            id: true,
            purchasePrice: true,
            quantity: true,
            amountPaid: true,
          },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json({ error: 'المورد غير موجود' }, { status: 404 });
    }

    const paidAmount = parseFloat(amount);

    // إنشاء سجل الدفع
    const payment = await prisma.offlineSupplierPayment.create({
      data: {
        supplierId: supplier.id,
        vendorId: vendor.id,
        amount: paidAmount,
        paymentMethod: paymentMethod || 'CASH',
        notes: notes || null,
        paidBy: session.user.name || session.user.email || 'Unknown',
      },
    });

    // توزيع المبلغ على المنتجات
    let remainingAmount = paidAmount;
    
    for (const product of supplier.offlineProducts) {
      if (remainingAmount <= 0) break;
      
      const productTotal = product.purchasePrice * product.quantity;
      const productRemaining = productTotal - (product.amountPaid || 0);
      
      if (productRemaining > 0) {
        const paymentForProduct = Math.min(remainingAmount, productRemaining);
        
        await prisma.offlineProduct.update({
          where: { id: product.id },
          data: {
            amountPaid: {
              increment: paymentForProduct,
            },
            isPaid: (product.amountPaid || 0) + paymentForProduct >= productTotal,
          },
        });
        
        remainingAmount -= paymentForProduct;
      }
    }

    return NextResponse.json({ 
      success: true,
      payment,
      message: 'تم تسجيل الدفع بنجاح',
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة الدفع' },
      { status: 500 }
    );
  }
}
