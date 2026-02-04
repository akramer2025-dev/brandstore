import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get order details for vendor
export async function GET(
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
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        deliveryStaff: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { message: 'فشل في جلب الطلب' },
      { status: 500 }
    );
  }
}
