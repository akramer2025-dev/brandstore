import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // جلب جميع المشتريات للشريك
    const purchases = await prisma.purchase.findMany({
      where: {
        vendorId: session.user.id,
      },
      select: {
        supplier: true,
        totalCost: true,
        createdAt: true,
        productName: true,
        receiptNumber: true,
      },
    })

    // تجميع البيانات حسب المورد
    const suppliersMap = new Map()

    purchases.forEach((purchase) => {
      const supplierName = purchase.supplier || 'غير محدد'
      
      if (!suppliersMap.has(supplierName)) {
        suppliersMap.set(supplierName, {
          name: supplierName,
          totalPurchases: 0,
          paidAmount: 0,
          pendingPayment: 0,
          lastPurchaseDate: purchase.createdAt,
          productsCount: new Set(),
        })
      }

      const supplier = suppliersMap.get(supplierName)
      supplier.totalPurchases += purchase.totalCost
      // في هذا النظام، Purchase لا يتتبع المدفوعات - كل شيء محسوب من رأس المال
      supplier.paidAmount += purchase.totalCost
      supplier.pendingPayment += 0
      
      // تحديث آخر تاريخ شراء
      if (new Date(purchase.createdAt) > new Date(supplier.lastPurchaseDate)) {
        supplier.lastPurchaseDate = purchase.createdAt
      }

      // إضافة المنتجات
      supplier.productsCount.add(purchase.productName)
    })

    // تحويل Map إلى Array
    const suppliers = Array.from(suppliersMap.values()).map((supplier, index) => ({
      id: `supplier-${index}`,
      name: supplier.name,
      totalPurchases: supplier.totalPurchases,
      paidAmount: supplier.paidAmount,
      pendingPayment: supplier.pendingPayment,
      lastPurchaseDate: supplier.lastPurchaseDate,
      productsCount: supplier.productsCount.size,
    }))

    // ترتيب حسب المستحقات (الأعلى أولاً)
    suppliers.sort((a, b) => b.pendingPayment - a.pendingPayment)

    // حساب الإحصائيات
    const stats = {
      totalSuppliers: suppliers.length,
      totalPending: suppliers.reduce((sum, s) => sum + s.pendingPayment, 0),
      totalPaid: suppliers.reduce((sum, s) => sum + s.paidAmount, 0),
      totalPurchases: suppliers.reduce((sum, s) => sum + s.totalPurchases, 0),
    }

    return NextResponse.json({ suppliers, stats })
    
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    )
  }
}
