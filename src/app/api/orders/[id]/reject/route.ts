import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    // فقط VENDOR أو ADMIN أو DEVELOPER يمكنهم رفض الطلبات
    if (!['VENDOR', 'ADMIN', 'DEVELOPER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مصرح لك برفض الطلبات' }, { status: 403 });
    }

    const { id } = await params;
    const { rejectionReason } = await req.json();

    if (!rejectionReason || rejectionReason.trim() === '') {
      return NextResponse.json({ error: 'يجب إدخال سبب الرفض' }, { status: 400 });
    }

    // التحقق من وجود الطلب
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        vendor: true,
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    // التحقق من الصلاحيات
    if (session.user.role === 'VENDOR') {
      // جلب بيانات التاجر من userId
      const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (!vendor) {
        return NextResponse.json({ error: 'لم يتم العثور على بيانات التاجر' }, { status: 404 });
      }

      // الشريك يمكنه رفض طلباته فقط
      if (order.vendorId !== vendor.id) {
        return NextResponse.json({ error: 'غير مصرح لك برفض هذا الطلب' }, { status: 403 });
      }
    }

    // التحقق من حالة الطلب (لا يمكن رفض طلب تم توصيله أو ملغى)
    if (order.status === 'DELIVERED') {
      return NextResponse.json({ error: 'لا يمكن رفض طلب تم توصيله' }, { status: 400 });
    }

    if (order.status === 'CANCELLED') {
      return NextResponse.json({ error: 'لا يمكن رفض طلب ملغى' }, { status: 400 });
    }

    if (order.status === 'REJECTED') {
      return NextResponse.json({ error: 'الطلب مرفوض بالفعل' }, { status: 400 });
    }

    // تحديث حالة الطلب إلى مرفوض
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        vendor: true
      }
    });

    // إعادة المخزون للمنتجات (إذا كان الطلب تم تأكيده)
    if (order.status === 'CONFIRMED' || order.status === 'PREPARING' || order.status === 'OUT_FOR_DELIVERY') {
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }
    }

    // إرسال إشعار للعميل
    await prisma.notification.create({
      data: {
        userId: order.customerId,
        title: '❌ تم رفض طلبك',
        message: `تم رفض طلبك رقم ${order.orderNumber}. السبب: ${rejectionReason}`,
        type: 'ORDER_REJECTED',
        link: `/orders/${order.id}`,
        isRead: false,
      }
    });

    // إنشاء سجل في تقرير الطلبات المرفوضة
    await prisma.orderRejectionLog.create({
      data: {
        orderId: order.id,
        rejectedBy: session.user.id,
        rejectedByRole: session.user.role,
        rejectionReason,
        orderValue: order.finalAmount,
        vendorId: order.vendorId || undefined,
      }
    });

    console.log(`✅ تم رفض الطلب ${order.orderNumber} بواسطة ${session.user.email}`);

    return NextResponse.json({
      message: 'تم رفض الطلب بنجاح',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error rejecting order:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء رفض الطلب' },
      { status: 500 }
    );
  }
}
