import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllPartnersActivityStats, getUserActivityStats } from '@/lib/user-activity';

/**
 * GET /api/admin/partners/activity
 * جلب إحصائيات نشاط جميع الشركاء (للمدير فقط)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    
    // الحصول على query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // إذا كان هناك userId محدد، نجلب إحصائياته فقط
    if (userId) {
      const stats = await getUserActivityStats(userId);
      return NextResponse.json({ stats });
    }
    
    // جلب إحصائيات جميع الشركاء
    const allStats = await getAllPartnersActivityStats();
    
    // ترتيب حسب مستوى النشاط
    const activityOrder = { 'نشط جداً': 4, 'نشط': 3, 'متوسط': 2, 'خامل': 1 };
    allStats.sort((a: any, b: any) => {
      const levelA = activityOrder[a.activityLevel as keyof typeof activityOrder] || 0;
      const levelB = activityOrder[b.activityLevel as keyof typeof activityOrder] || 0;
      return levelB - levelA;
    });
    
    return NextResponse.json({
      success: true,
      stats: allStats,
      summary: {
        total: allStats.length,
        veryActive: allStats.filter((s: any) => s.activityLevel === 'نشط جداً').length,
        active: allStats.filter((s: any) => s.activityLevel === 'نشط').length,
        medium: allStats.filter((s: any) => s.activityLevel === 'متوسط').length,
        inactive: allStats.filter((s: any) => s.activityLevel === 'خامل').length,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching activity stats:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الإحصائيات' },
      { status: 500 }
    );
  }
}
