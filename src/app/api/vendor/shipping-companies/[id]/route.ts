import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - جلب شركة شحن محددة
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id } = await params
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'البائع غير موجود' }, { status: 404 })
    }

    const company = await prisma.vendorShippingCompany.findFirst({
      where: { id, vendorId: vendor.id }
    })

    if (!company) {
      return NextResponse.json({ error: 'شركة الشحن غير موجودة' }, { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error fetching shipping company:', error)
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

// PUT - تحديث شركة شحن
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id } = await params
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'البائع غير موجود' }, { status: 404 })
    }

    const data = await req.json()

    const company = await prisma.vendorShippingCompany.updateMany({
      where: { id, vendorId: vendor.id },
      data: {
        name: data.name,
        phone: data.phone || null,
        website: data.website || null,
        trackingUrl: data.trackingUrl || null,
        accountNumber: data.accountNumber || null,
        contactPerson: data.contactPerson || null,
        contactPhone: data.contactPhone || null,
        defaultFee: parseFloat(data.defaultFee) || 0,
        estimatedDays: parseInt(data.estimatedDays) || null,
        areas: data.areas || null,
        isActive: data.isActive ?? true,
        notes: data.notes || null,
      }
    })

    return NextResponse.json({ success: true, count: company.count })
  } catch (error) {
    console.error('Error updating shipping company:', error)
    return NextResponse.json({ error: 'خطأ في التحديث' }, { status: 500 })
  }
}

// DELETE - حذف شركة شحن
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id } = await params
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'البائع غير موجود' }, { status: 404 })
    }

    await prisma.vendorShippingCompany.deleteMany({
      where: { id, vendorId: vendor.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting shipping company:', error)
    return NextResponse.json({ error: 'خطأ في الحذف' }, { status: 500 })
  }
}
