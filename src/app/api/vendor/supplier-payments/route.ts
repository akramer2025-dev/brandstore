import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - جلب المستحقات للموردين
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
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = { vendorId: vendor.id }
    if (status) {
      where.status = status
    }

    const payments = await prisma.supplierPayment.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            images: true
          }
        }
      }
    })

    // حساب الإجماليات
    const totals = await prisma.supplierPayment.aggregate({
      where: { vendorId: vendor.id },
      _sum: {
        amountDue: true,
        amountPaid: true,
        profit: true
      }
    })

    const pendingTotal = await prisma.supplierPayment.aggregate({
      where: { vendorId: vendor.id, status: 'PENDING' },
      _sum: { amountDue: true }
    })

    return NextResponse.json({
      payments,
      totals: {
        totalDue: totals._sum.amountDue || 0,
        totalPaid: totals._sum.amountPaid || 0,
        totalProfit: totals._sum.profit || 0,
        pendingAmount: pendingTotal._sum.amountDue || 0
      }
    })

  } catch (error) {
    console.error('Error fetching supplier payments:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المستحقات' },
      { status: 500 }
    )
  }
}

// POST - تسجيل دفع للمورد
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
    const { paymentId, amountPaid, paymentMethod, paymentNotes } = body

    if (!paymentId || !amountPaid || amountPaid <= 0) {
      return NextResponse.json(
        { error: 'البيانات غير كاملة' },
        { status: 400 }
      )
    }

    const payment = await prisma.supplierPayment.findFirst({
      where: { id: paymentId, vendorId: vendor.id }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'لم يتم العثور على المستحق' },
        { status: 404 }
      )
    }

    const newAmountPaid = payment.amountPaid + amountPaid
    const remaining = payment.amountDue - newAmountPaid
    
    let newStatus = payment.status
    if (remaining <= 0) {
      newStatus = 'PAID'
    } else if (newAmountPaid > 0) {
      newStatus = 'PARTIAL'
    }

    const updated = await prisma.supplierPayment.update({
      where: { id: paymentId },
      data: {
        amountPaid: newAmountPaid,
        status: newStatus,
        paidAt: newStatus === 'PAID' ? new Date() : null,
        paymentMethod,
        paymentNotes
      }
    })

    // تحديث المنتج إذا تم الدفع بالكامل
    if (newStatus === 'PAID' && payment.productId) {
      await prisma.product.update({
        where: { id: payment.productId },
        data: {
          isSupplierPaid: true,
          supplierPaidAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      payment: updated,
      remaining: Math.max(0, remaining)
    })

  } catch (error) {
    console.error('Error recording supplier payment:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدفع' },
      { status: 500 }
    )
  }
}
