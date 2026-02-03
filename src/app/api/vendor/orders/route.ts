import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id }
    });

    if (!vendor) {
      return NextResponse.json({ error: 'لم يتم العثور على الشريك' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const where: any = { vendorId: vendor.id };
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            name: true,
            username: true,
            email: true
          }
        },
        items: true
      }
    });

    const formattedOrders = orders.map(order => ({
      id: order.id,
      customerName: order.customer?.name || order.customer?.username || 'عميل',
      total: order.finalAmount,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      itemsCount: order.items.length
    }));

    return NextResponse.json({ orders: formattedOrders });

  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الطلبات' },
      { status: 500 }
    );
  }
}
