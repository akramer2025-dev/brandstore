import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - التحقق من صحة كود الكوبون
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { valid: false, error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'كود الكوبون غير صحيح' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // البحث عن الكوبون بهذا الكود والـ userId
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        userId: userId,
        isActive: true,
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: 'كود الكوبون غير صحيح أو غير متاح' },
        { status: 404 }
      );
    }

    // التحقق من انتهاء الصلاحية
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'انتهت صلاحية هذا الكوبون' },
        { status: 400 }
      );
    }

    // التحقق من عدد مرات الاستخدام
    if (coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { valid: false, error: 'تم استخدام هذا الكوبون بالكامل' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount: coupon.discount,
        minPurchase: coupon.minPurchase,
        maxUses: coupon.maxUses,
        usedCount: coupon.usedCount,
        isActive: coupon.isActive,
        expiresAt: coupon.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { valid: false, error: 'حدث خطأ في التحقق من الكوبون' },
      { status: 500 }
    );
  }
}
