import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                nameAr: true,
                images: true,
              },
            },
          },
        },
        customer: {
          select: {
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    // التحقق من أن المستخدم هو صاحب الطلب أو شريك أو مسؤول
    const isOwner = order.customerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    const isVendor = session.user.role === 'VENDOR';

    if (!isOwner && !isAdmin && !isVendor) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات الطلب' },
      { status: 500 }
    );
  }
}
