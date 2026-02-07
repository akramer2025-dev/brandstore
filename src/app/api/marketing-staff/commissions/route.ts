import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// حساب العمولات للطلبات المكتملة
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    // يمكن أن ينفذها admin أو موظف التسويق
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MARKETING_STAFF') {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 });
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'رقم الطلب مطلوب' }, { status: 400 });
    }

    // جلب الطلب مع المنتجات
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                marketingStaff: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    // التحقق من أن الطلب مكتمل
    if (order.status !== 'DELIVERED') {
      return NextResponse.json({ 
        error: 'يجب أن يكون الطلب مكتملاً لحساب العمولة' 
      }, { status: 400 });
    }

    const commissionsCreated = [];

    // المرور على كل منتج في الطلب
    for (const item of order.items) {
      const product = item.product;
      
      // تخطي المنتجات غير المستوردة
      if (!product.isImported || !product.marketingStaffId) {
        continue;
      }

      const marketingStaff = product.marketingStaff;
      
      if (!marketingStaff) {
        console.warn(`⚠️ منتج ${product.id} مستورد بدون موظف تسويق`);
        continue;
      }

      // التحقق من عدم وجود عمولة سابقة لهذا المنتج في هذا الطلب
      const existingCommission = await prisma.marketingCommission.findFirst({
        where: {
          orderId: order.id,
          productId: product.id,
          marketingStaffId: marketingStaff.id,
        },
      });

      if (existingCommission) {
        console.log(`⚠️ العمولة موجودة بالفعل للمنتج ${product.id} في الطلب ${order.id}`);
        continue;
      }

      // حساب العمولة
      const saleAmount = item.price * item.quantity;
      const commissionAmount = saleAmount * marketingStaff.commissionRate / 100;

      // إنشاء سجل العمولة
      const commission = await prisma.marketingCommission.create({
        data: {
          marketingStaffId: marketingStaff.id,
          productId: product.id,
          orderId: order.id,
          saleAmount,
          commissionRate: marketingStaff.commissionRate,
          commissionAmount,
          quantity: item.quantity,
        },
      });

      // تحديث إجمالي المبيعات والعمولات لموظف التسويق
      await prisma.marketingStaff.update({
        where: { id: marketingStaff.id },
        data: {
          totalSales: { increment: saleAmount },
          totalCommission: { increment: commissionAmount },
        },
      });

      commissionsCreated.push({
        productName: product.nameAr,
        quantity: item.quantity,
        saleAmount,
        commissionAmount,
        staffName: marketingStaff.name,
      });

      console.log(`✅ تم إنشاء عمولة: ${commissionAmount.toFixed(2)} جنيه لـ ${marketingStaff.name}`);
    }

    return NextResponse.json({
      success: true,
      commissionsCreated,
      message: `تم حساب ${commissionsCreated.length} عمولة للطلب`,
    });

  } catch (error) {
    console.error('❌ خطأ في حساب العمولات:', error);
    return NextResponse.json({ 
      error: 'حدث خطأ في حساب العمولات' 
    }, { status: 500 });
  }
}

// جلب العمولات لموظف التسويق
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    if (session.user.role !== 'MARKETING_STAFF' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 });
    }

    let staffId: string | undefined;

    if (session.user.role === 'MARKETING_STAFF') {
      // للموظف: جلب عمولاته فقط
      const staff = await prisma.marketingStaff.findUnique({
        where: { userId: session.user.id },
      });

      if (!staff) {
        return NextResponse.json({ error: 'الحساب غير موجود' }, { status: 404 });
      }

      staffId = staff.id;
    }

    // جلب العمولات
    const commissions = await prisma.marketingCommission.findMany({
      where: staffId ? { marketingStaffId: staffId } : undefined,
      include: {
        marketingStaff: {
          select: {
            name: true,
            phone: true,
          },
        },
        product: {
          select: {
            nameAr: true,
            price: true,
          },
        },
        order: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // حساب الإحصائيات
    const stats = {
      totalCommissions: commissions.length,
      totalAmount: commissions.reduce((sum, c) => sum + c.commissionAmount, 0),
      paidAmount: commissions.filter(c => c.isPaid).reduce((sum, c) => sum + c.commissionAmount, 0),
      unpaidAmount: commissions.filter(c => !c.isPaid).reduce((sum, c) => sum + c.commissionAmount, 0),
      paidCount: commissions.filter(c => c.isPaid).length,
      unpaidCount: commissions.filter(c => !c.isPaid).length,
    };

    return NextResponse.json({
      commissions,
      stats,
    });

  } catch (error) {
    console.error('❌ خطأ في جلب العمولات:', error);
    return NextResponse.json({ 
      error: 'حدث خطأ في جلب البيانات' 
    }, { status: 500 });
  }
}
