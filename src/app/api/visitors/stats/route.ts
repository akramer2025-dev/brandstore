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

    // Get total visitors count
    const totalVisitors = await prisma.visitor.count();

    // Get today's visitors
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVisitors = await prisma.visitor.count({
      where: {
        visitedAt: {
          gte: today
        }
      }
    });

    // Get this week's visitors
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekVisitors = await prisma.visitor.count({
      where: {
        visitedAt: {
          gte: weekAgo
        }
      }
    });

    // Get this month's visitors
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthVisitors = await prisma.visitor.count({
      where: {
        visitedAt: {
          gte: monthAgo
        }
      }
    });

    // Get unique visitors (by IP)
    const uniqueVisitors = await prisma.visitor.groupBy({
      by: ['ipAddress'],
      _count: true
    });

    // Device breakdown
    const deviceStats = await prisma.visitor.groupBy({
      by: ['device'],
      _count: true
    });

    // Browser breakdown
    const browserStats = await prisma.visitor.groupBy({
      by: ['browser'],
      _count: true
    });

    // Recent visitors (last 10)
    const recentVisitors = await prisma.visitor.findMany({
      take: 10,
      orderBy: {
        visitedAt: 'desc'
      },
      select: {
        id: true,
        page: true,
        device: true,
        browser: true,
        visitedAt: true,
        ipAddress: true
      }
    });

    return NextResponse.json({
      total: totalVisitors,
      today: todayVisitors,
      week: weekVisitors,
      month: monthVisitors,
      unique: uniqueVisitors.length,
      devices: deviceStats,
      browsers: browserStats,
      recent: recentVisitors
    });

  } catch (error) {
    console.error('Error fetching visitor stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
