import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - ملخص رأس المال والأرباح
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'لم يتم العثور على الشريك' }, { status: 404 })
    }

    // جلب رأس المال الحالي
    const partner = await prisma.partnerCapital.findFirst({
      where: { vendorId: vendor.id, isActive: true }
    })

    // إحصائيات المنتجات
    const ownedProducts = await prisma.product.count({
      where: { vendorId: vendor.id, productSource: 'OWNED' }
    })

    const consignmentProducts = await prisma.product.count({
      where: { vendorId: vendor.id, productSource: 'CONSIGNMENT' }
    })

    // المستحقات للموردين
    const pendingSupplierPayments = await prisma.supplierPayment.aggregate({
      where: { vendorId: vendor.id, status: 'PENDING' },
      _sum: { amountDue: true },
      _count: true
    })

    // إجمالي الأرباح من المنتجات الوسيط
    const consignmentProfits = await prisma.supplierPayment.aggregate({
      where: { vendorId: vendor.id, status: 'PAID' },
      _sum: { profit: true }
    })

    // إجمالي المشتريات
    const totalPurchases = await prisma.purchase.aggregate({
      where: { vendorId: vendor.id, fromCapital: true },
      _sum: { totalCost: true }
    })

    // إجمالي المبيعات
    const totalSales = await prisma.sale.aggregate({
      where: { vendorId: vendor.id },
      _sum: { totalAmount: true, profit: true }
    })

    // المعاملات الأخيرة
    const recentTransactions = await prisma.capitalTransaction.findMany({
      where: { vendorId: vendor.id },
      take: 10,
      orderBy: { createdAt: 'desc' }
    })

    // حساب الإيداعات والسحوبات
    const deposits = await prisma.capitalTransaction.aggregate({
      where: { vendorId: vendor.id, type: 'DEPOSIT' },
      _sum: { amount: true }
    })

    const withdrawals = await prisma.capitalTransaction.aggregate({
      where: { vendorId: vendor.id, type: 'WITHDRAWAL' },
      _sum: { amount: true }
    })

    return NextResponse.json({
      capital: {
        current: partner?.capitalAmount || 0,
        totalDeposits: deposits._sum.amount || 0,
        totalWithdrawals: withdrawals._sum.amount || 0
      },
      products: {
        owned: ownedProducts,
        consignment: consignmentProducts,
        total: ownedProducts + consignmentProducts
      },
      suppliers: {
        pendingPayments: pendingSupplierPayments._sum.amountDue || 0,
        pendingCount: pendingSupplierPayments._count || 0,
        consignmentProfits: consignmentProfits._sum.profit || 0
      },
      financials: {
        totalPurchases: totalPurchases._sum.totalCost || 0,
        totalSales: totalSales._sum.totalAmount || 0,
        totalProfit: totalSales._sum.profit || 0
      },
      recentTransactions
    })

  } catch (error) {
    console.error('Error fetching capital summary:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الملخص' },
      { status: 500 }
    )
  }
}
