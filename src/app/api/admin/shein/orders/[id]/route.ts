import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/admin/shein/orders/[id] - تحديث طلب شي إن (للأدمن فقط)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
    }

    const orderId = params.id;
    const body = await req.json();

    // Check if order exists
    const existingOrder = await prisma.sheinOrder.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    // Update the order
    const updatedOrder = await prisma.sheinOrder.update({
      where: { id: orderId },
      data: {
        ...body,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send notification to customer about order update
    // You can use the notification system here

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الطلب بنجاح',
      order: updatedOrder,
    });

  } catch (error: any) {
    console.error('❌ خطأ في تحديث طلب شي إن:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث الطلب' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/shein/orders/[id] - جلب تفاصيل طلب معين (للأدمن فقط)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
    }

    const order = await prisma.sheinOrder.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب تفاصيل الطلب:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب تفاصيل الطلب' },
      { status: 500 }
    );
  }
}
