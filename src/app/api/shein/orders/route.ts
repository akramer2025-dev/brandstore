import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/shein/orders - إنشاء طلب شي إن جديد
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      productLinks,
      productImages,
      selectedColors,
      notes,
    } = body;

    // التحقق من البيانات المطلوبة
    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { error: 'الاسم ورقم الهاتف مطلوبان' },
        { status: 400 }
      );
    }

    if ((!productLinks || productLinks.length === 0) && (!productImages || productImages.length === 0)) {
      return NextResponse.json(
        { error: 'يجب إضافة رابط واحد على الأقل أو صورة' },
        { status: 400 }
      );
    }

    // إنشاء الطلب
    const sheinOrder = await prisma.sheinOrder.create({
      data: {
        userId: session.user.id,
        customerName,
        customerPhone,
        customerEmail: customerEmail || session.user.email || null,
        productLinks: productLinks || [],
        productImages: productImages || [],
        selectedColors: selectedColors || [],
        notes,
        status: 'PENDING',
      },
    });

    // يمكن هنا إرسال إشعار للإدارة
    // TODO: Send notification to admin

    return NextResponse.json({
      success: true,
      message: 'تم استلام طلبك بنجاح! سيتم التواصل معك قريباً',
      orderId: sheinOrder.id,
    });

  } catch (error: any) {
    console.error('❌ خطأ في إنشاء طلب شي إن:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء الطلب' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/shein/orders - جلب طلبات المستخدم
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    const orders = await prisma.sheinOrder.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب طلبات شي إن:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب الطلبات' },
      { status: 500 }
    );
  }
}
