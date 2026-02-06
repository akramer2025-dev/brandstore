import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Accept order
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'VENDOR') {
      return NextResponse.json(
        { message: 'غير مصرح' },
        { status: 403 }
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id }
    });

    if (!vendor) {
      return NextResponse.json(
        { message: 'الشريك غير موجود' },
        { status: 404 }
      );
    }

    const { id } = await params;
    const order = await prisma.order.findFirst({
      where: { 
        id,
        vendorId: vendor.id,
        status: 'PENDING',
        deletedAt: null,
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: 'الطلب غير موجود أو لا يمكن قبوله' },
        { status: 404 }
      );
    }

    // Update order status to CONFIRMED
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // إنشاء إشعار للعميل بقبول الطلب
    await prisma.customerNotification.create({
      data: {
        customerId: updatedOrder.customerId,
        type: 'ORDER_CONFIRMED',
        title: 'تم قبول طلبك! 🎉',
        message: `تم قبول طلبك رقم ${updatedOrder.orderNumber} وجاري تجهيزه للشحن`,
        orderId: updatedOrder.id,
      },
    });

    // إرسال Push Notification للعميل (حتى لو التطبيق مقفول)
    const { sendPushToCustomer } = await import('@/lib/push-service');
    await sendPushToCustomer(updatedOrder.customerId, {
      title: 'تم قبول طلبك! 🎉',
      body: `طلبك رقم ${updatedOrder.orderNumber} جاري تجهيزه`,
      data: {
        type: 'ORDER_CONFIRMED',
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
      },
      actions: [
        {
          action: 'view',
          title: 'عرض الطلب',
        },
      ],
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error accepting order:', error);
    return NextResponse.json(
      { message: 'فشل في قبول الطلب' },
      { status: 500 }
    );
  }
}
