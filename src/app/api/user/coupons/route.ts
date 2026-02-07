import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - جلب كوبونات المستخدم المتاحة
export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // جلب جميع الكوبونات المتاحة والصالحة للمستخدم
    const coupons = await prisma.coupon.findMany({
      where: {
        userId: userId,
        isActive: true,
        expiresAt: {
          gt: new Date(), // الكوبونات غير منتهية الصلاحية
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // تصفية الكوبونات التي لم يتم استخدامها بالكامل
    const availableCoupons = coupons.filter(coupon => coupon.usedCount < coupon.maxUses);

    // حساب إجمالي الرصيد المتاح (مجموع قيم الخصومات)
    const totalBalance = availableCoupons.reduce((sum, coupon) => {
      // عدد المرات المتبقية للاستخدام
      const remainingUses = coupon.maxUses - coupon.usedCount;
      // إضافة قيمة الخصم × عدد المرات المتبقية
      return sum + (coupon.discount * remainingUses);
    }, 0);

    // عدد الكوبونات المتاحة
    const availableCouponsCount = availableCoupons.length;

    return NextResponse.json({
      coupons: availableCoupons,
      totalBalance,
      availableCouponsCount,
    });
  } catch (error) {
    console.error('Error fetching user coupons:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الكوبونات' },
      { status: 500 }
    );
  }
}
