import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LoyaltyService } from '@/lib/loyalty-service';

/**
 * استبدال النقاط بخصم
 * POST /api/loyalty/redeem
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { points, orderId } = body;

    if (!points || points <= 0) {
      return NextResponse.json(
        { error: 'عدد النقاط غير صحيح' },
        { status: 400 }
      );
    }

    // استبدال النقاط
    const result = await LoyaltyService.redeemPoints(
      session.user.id,
      points,
      `استبدال ${points} نقطة بخصم`,
      orderId
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'فشل استبدال النقاط' },
        { status: 400 }
      );
    }

    const discount = LoyaltyService.convertPointsToDiscount(points);

    return NextResponse.json({
      success: true,
      points,
      discount,
      remaining: result.remaining,
      message: `تم استبدال ${points} نقطة بخصم ${discount.toFixed(2)} جنيه`,
    });
  } catch (error) {
    console.error('❌ Error redeeming points:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في استبدال النقاط' },
      { status: 500 }
    );
  }
}

/**
 * الحصول على معلومات النقاط
 * GET /api/loyalty/redeem
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    // الحصول على الإحصائيات
    const stats = await LoyaltyService.getPointsStats(session.user.id);
    
    // الحصول على المستوى
    const tier = LoyaltyService.getTierFromPoints(stats.current);
    
    // خيارات الاستبدال
    const redemptionOptions = LoyaltyService.getRedemptionOptions(stats.current);

    return NextResponse.json({
      ...stats,
      tier,
      redemptionOptions,
    });
  } catch (error) {
    console.error('❌ Error fetching loyalty info:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب معلومات الولاء' },
      { status: 500 }
    );
  }
}
