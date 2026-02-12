import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserActivities, getUserActivityStats } from '@/lib/user-activity';

/**
 * GET /api/user/activity - الحصول على نشاط المستخدم الحالي
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const statsOnly = searchParams.get('stats') === 'true';

    if (statsOnly) {
      const stats = await getUserActivityStats(session.user.id);
      return NextResponse.json(stats);
    }

    const activities = await getUserActivities(session.user.id, limit);
    
    return NextResponse.json({
      success: true,
      activities,
    });
  } catch (error: any) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
