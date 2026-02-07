import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
    }

    // جلب جميع الكوبونات النشطة للمستخدم
    const coupons = await prisma.coupon.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // حساب المجموع الإجمالي للخصومات المتاحة
    const totalDiscount = coupons.reduce((sum, coupon) => {
      // التحقق من أن الكوبون لم يستخدم بالكامل
      if (coupon.usedCount < coupon.maxUses) {
        return sum + coupon.discount;
      }
      return sum;
    }, 0);

    return NextResponse.json({
      coupons,
      totalDiscount,
      count: coupons.length
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الخصومات' },
      { status: 500 }
    );
  }
}
