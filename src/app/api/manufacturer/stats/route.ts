import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'MANUFACTURER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Get production stats
    const [
      totalProductions,
      completedProductions,
      pendingProductions,
      totalFabrics,
      totalMaterials,
      lowStockMaterials,
      todayProductions,
      weekProductions,
      monthProductions
    ] = await Promise.all([
      prisma.production.count(),
      prisma.production.count({ where: { status: 'COMPLETED' } }),
      prisma.production.count({ where: { status: 'PENDING' } }),
      prisma.fabric.count(),
      prisma.rawMaterial.count(),
      prisma.rawMaterial.count({ where: { quantity: { lt: 10 } } }),
      prisma.production.aggregate({
        where: { createdAt: { gte: today }, status: 'COMPLETED' },
        _sum: { quantity: true }
      }),
      prisma.production.aggregate({
        where: { createdAt: { gte: weekAgo }, status: 'COMPLETED' },
        _sum: { quantity: true }
      }),
      prisma.production.aggregate({
        where: { createdAt: { gte: monthAgo }, status: 'COMPLETED' },
        _sum: { quantity: true }
      })
    ]);

    return NextResponse.json({
      totalProductions,
      completedProductions,
      pendingProductions,
      totalFabrics,
      totalMaterials,
      lowStockMaterials,
      todayOutput: todayProductions._sum.quantity || 0,
      weeklyOutput: weekProductions._sum.quantity || 0,
      monthlyOutput: monthProductions._sum.quantity || 0
    });

  } catch (error) {
    console.error('Error fetching manufacturer stats:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الإحصائيات' },
      { status: 500 }
    );
  }
}
