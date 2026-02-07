import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { LoyaltyService } from '@/lib/loyalty-service';

/**
 * الحصول على تاريخ النقاط
 * GET /api/loyalty/history
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const history = await LoyaltyService.getPointsHistory(session.user.id, limit);

    return NextResponse.json({
      history,
      total: history.length,
    });
  } catch (error) {
    console.error('❌ Error fetching points history:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب التاريخ' },
      { status: 500 }
    );
  }
}
