import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Accept order
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
      where: { id: params.id },
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

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error accepting order:', error);
    return NextResponse.json(
      { message: 'فشل في قبول الطلب' },
      { status: 500 }
    );
  }
}
