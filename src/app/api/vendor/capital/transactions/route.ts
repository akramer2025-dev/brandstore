import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - جلب معاملات رأس المال
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

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = { vendorId: vendor.id }
    if (type) {
      where.type = type
    }

    const transactions = await prisma.capitalTransaction.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    // حساب الإجماليات
    const summary = await prisma.capitalTransaction.groupBy({
      by: ['type'],
      where: { vendorId: vendor.id },
      _sum: { amount: true }
    })

    // جلب الرصيد الحالي من vendor.capitalBalance
    const currentVendor = await prisma.vendor.findUnique({
      where: { id: vendor.id },
      select: { capitalBalance: true }
    })

    return NextResponse.json({
      transactions,
      summary,
      currentBalance: currentVendor?.capitalBalance || 0
    })

  } catch (error) {
    console.error('Error fetching capital transactions:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المعاملات' },
      { status: 500 }
    )
  }
}

// POST - إضافة معاملة جديدة (إيداع أو سحب)
export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const { type, amount, description, descriptionAr, notes } = body

    if (!type || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'البيانات غير كاملة' },
        { status: 400 }
      )
    }

    // جلب رأس المال الحالي من vendor.capitalBalance
    const balanceBefore = vendor.capitalBalance
    let balanceAfter = balanceBefore

    // حساب الرصيد الجديد
    if (type === 'DEPOSIT' || type === 'SALE_PROFIT' || type === 'CONSIGNMENT_PROFIT' || type === 'REFUND') {
      balanceAfter = balanceBefore + amount
    } else if (type === 'WITHDRAWAL' || type === 'PURCHASE' || type === 'EXPENSE') {
      balanceAfter = balanceBefore - amount
      if (balanceAfter < 0 && type !== 'ADJUSTMENT') {
        return NextResponse.json(
          { error: 'الرصيد غير كافي' },
          { status: 400 }
        )
      }
    } else if (type === 'ADJUSTMENT') {
      balanceAfter = amount // التعديل يحدد الرصيد الجديد مباشرة
    }

    // تحديث رأس المال
    const result = await prisma.$transaction(async (tx) => {
      // إنشاء المعاملة
      const transaction = await tx.capitalTransaction.create({
        data: {
          vendorId: vendor.id,
          type,
          amount: type === 'ADJUSTMENT' ? Math.abs(amount - balanceBefore) : amount,
          balanceBefore,
          balanceAfter,
          description: description || getTransactionDescription(type),
          descriptionAr: descriptionAr || getTransactionDescriptionAr(type),
          notes
        }
      })

      // تحديث vendor.capitalBalance
      await tx.vendor.update({
        where: { id: vendor.id },
        data: { capitalBalance: balanceAfter }
      })

      return transaction
    })

    return NextResponse.json({
      success: true,
      transaction: result,
      newBalance: balanceAfter
    })

  } catch (error) {
    console.error('Error creating capital transaction:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء المعاملة' },
      { status: 500 }
    )
  }
}

function getTransactionDescription(type: string): string {
  const descriptions: Record<string, string> = {
    DEPOSIT: 'Capital deposit',
    WITHDRAWAL: 'Capital withdrawal',
    PURCHASE: 'Product purchase',
    SALE_PROFIT: 'Sale profit',
    CONSIGNMENT_PROFIT: 'Consignment product profit',
    EXPENSE: 'Expense',
    REFUND: 'Refund',
    ADJUSTMENT: 'Manual adjustment'
  }
  return descriptions[type] || 'Transaction'
}

function getTransactionDescriptionAr(type: string): string {
  const descriptions: Record<string, string> = {
    DEPOSIT: 'إيداع رأس مال',
    WITHDRAWAL: 'سحب من رأس المال',
    PURCHASE: 'شراء بضاعة',
    SALE_PROFIT: 'ربح من بيع',
    CONSIGNMENT_PROFIT: 'ربح من منتج وسيط',
    EXPENSE: 'مصروف',
    REFUND: 'استرداد',
    ADJUSTMENT: 'تعديل يدوي'
  }
  return descriptions[type] || 'معاملة'
}
