import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Send order to admin
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const order = await prisma.order.findFirst({
      where: { 
        id: params.id,
        vendorId: vendor.id,
        deletedAt: null,
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    // Update order - mark as sent to admin (can add a flag if needed)
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: 'CONFIRMED',
        customerNotes: order.customerNotes 
          ? `${order.customerNotes}\n\n[تم إرسال الطلب للإدارة بواسطة الشريك]`
          : '[تم إرسال الطلب للإدارة بواسطة الشريك]',
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

    // TODO: إضافة إشعار للإدارة هنا

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error sending order to admin:', error);
    return NextResponse.json(
      { message: 'فشل في إرسال الطلب للإدارة' },
      { status: 500 }
    );
  }
}
