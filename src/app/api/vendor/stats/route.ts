import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // الحصول على معلومات البائع
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    })

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }

    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // حساب الإحصائيات
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      pendingPayouts,
      todaySales,
      weekSales,
      monthSales
    ] = await Promise.all([
      // إجمالي الطلبات
      prisma.order.count({
        where: { vendorId: vendor.id },
      }),
      
      // الطلبات المعلقة
      prisma.order.count({
        where: { vendorId: vendor.id, status: 'PENDING' },
      }),
      
      // الطلبات المكتملة
      prisma.order.count({
        where: { vendorId: vendor.id, status: 'DELIVERED' },
      }),
      
      // الطلبات الملغية
      prisma.order.count({
        where: { vendorId: vendor.id, status: 'CANCELLED' },
      }),
      
      // إجمالي المنتجات
      prisma.product.count({
        where: { vendorId: vendor.id },
      }),
      
      // المنتجات ذات المخزون المنخفض
      prisma.product.count({
        where: { vendorId: vendor.id, stock: { gt: 0, lte: 10 } },
      }),
      
      // المنتجات النفذة
      prisma.product.count({
        where: { vendorId: vendor.id, stock: 0 },
      }),
      
      // المدفوعات المعلقة
      prisma.vendorPayout.aggregate({
        where: {
          vendorId: vendor.id,
          status: 'PENDING',
        },
        _sum: {
          amount: true,
        },
      }),
      
      // مبيعات اليوم
      prisma.sale.aggregate({
        where: { vendorId: vendor.id, saleDate: { gte: today } },
        _sum: { totalAmount: true }
      }),
      
      // مبيعات الأسبوع
      prisma.sale.aggregate({
        where: { vendorId: vendor.id, saleDate: { gte: weekAgo } },
        _sum: { totalAmount: true }
      }),
      
      // مبيعات الشهر
      prisma.sale.aggregate({
        where: { vendorId: vendor.id, saleDate: { gte: monthAgo } },
        _sum: { totalAmount: true }
      }),
    ])

    // إجمالي الإيرادات
    const totalRevenue = vendor.totalSales

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      pendingPayouts: pendingPayouts._sum.amount || 0,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      todaySales: todaySales._sum.totalAmount || 0,
      weekSales: weekSales._sum.totalAmount || 0,
      monthSales: monthSales._sum.totalAmount || 0,
      revenueGrowth: 0, // يمكن حسابها لاحقاً
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      totalCustomers: 0 // يمكن حسابها لاحقاً
    })
  } catch (error: any) {
    console.error('Vendor stats error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
