import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Check if user is admin
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. إجمالي الزوار
    const totalVisitors = await prisma.visitor.count();

    // 2. زوار اليوم
    const todayVisitors = await prisma.visitor.count({
      where: { visitedAt: { gte: today } }
    });

    // 3. زوار الأسبوع
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekVisitors = await prisma.visitor.count({
      where: { visitedAt: { gte: weekAgo } }
    });

    // 4. زوار الشهر
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthVisitors = await prisma.visitor.count({
      where: { visitedAt: { gte: monthAgo } }
    });

    // 5. زوار فريدون (Unique IPs)
    const uniqueVisitors = await prisma.visitor.groupBy({
      by: ['ipAddress'],
      _count: true
    });

    // 6. إحصائيات الأجهزة
    const deviceStats = await prisma.visitor.groupBy({
      by: ['device'],
      _count: true
    });

    // 7. إحصائيات المتصفحات
    const browserStats = await prisma.visitor.groupBy({
      by: ['browser'],
      _count: true
    });

    // 8. مصادر الزيارات (Referrers)
    const referrerStats = await prisma.visitor.groupBy({
      by: ['referrer'],
      _count: true,
      orderBy: {
        _count: {
          referrer: 'desc'
        }
      },
      take: 10
    });

    // 9. الصفحات الأكثر زيارة
    const popularPages = await prisma.visitor.groupBy({
      by: ['page'],
      _count: true,
      orderBy: {
        _count: {
          page: 'desc'
        }
      },
      take: 10
    });

    // 10. آخر 20 زائر
    const recentVisitors = await prisma.visitor.findMany({
      take: 20,
      orderBy: { visitedAt: 'desc' },
      select: {
        id: true,
        page: true,
        device: true,
        browser: true,
        referrer: true,
        visitedAt: true,
        ipAddress: true
      }
    });

    // 11. عدد العملاء الجدد اليوم
    const newCustomersToday = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: { gte: today }
      }
    });

    // 12. عدد الطلبات اليوم
    const ordersToday = await prisma.order.count({
      where: {
        createdAt: { gte: today }
      }
    });

    // 13. معدل التحويل (Conversion Rate)
    const conversionRate = todayVisitors > 0 
      ? ((ordersToday / todayVisitors) * 100).toFixed(2)
      : '0.00';

    // 14. إحصائيات الزوار بالساعة (آخر 24 ساعة)
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    
    const hourlyVisitors = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('hour', "visitedAt") as hour,
        COUNT(*) as count
      FROM visitors
      WHERE "visitedAt" >= ${last24Hours}
      GROUP BY hour
      ORDER BY hour DESC
      LIMIT 24
    `;

    return NextResponse.json({
      summary: {
        total: totalVisitors,
        today: todayVisitors,
        week: weekVisitors,
        month: monthVisitors,
        unique: uniqueVisitors.length,
        newCustomersToday,
        ordersToday,
        conversionRate
      },
      devices: deviceStats,
      browsers: browserStats,
      referrers: referrerStats,
      popularPages,
      recent: recentVisitors,
      hourlyData: hourlyVisitors
    });

  } catch (error) {
    console.error('Error fetching detailed visitor stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
