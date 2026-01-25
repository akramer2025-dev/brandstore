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

    // حساب الإحصائيات
    const [totalOrders, totalProducts, pendingPayouts] = await Promise.all([
      // إجمالي الطلبات
      prisma.order.count({
        where: { vendorId: vendor.id },
      }),
      
      // إجمالي المنتجات
      prisma.product.count({
        where: { vendorId: vendor.id },
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
    ])

    // إجمالي الإيرادات (من totalSales في جدول Vendor)
    const totalRevenue = vendor.totalSales

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      pendingPayouts: pendingPayouts._sum.amount || 0,
      totalProducts,
    })
  } catch (error: any) {
    console.error('Vendor stats error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
