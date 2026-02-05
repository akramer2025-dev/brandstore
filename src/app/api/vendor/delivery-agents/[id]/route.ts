import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - جلب مندوب محدد
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

    const agent = await prisma.vendorDeliveryAgent.findFirst({
      where: { id, vendorId: vendor.id }
    })

    if (!agent) {
      return NextResponse.json({ error: 'المندوب غير موجود' }, { status: 404 })
    }

    return NextResponse.json(agent)
  } catch (error) {
    console.error('Error fetching delivery agent:', error)
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

// PUT - تحديث مندوب
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

    const agent = await prisma.vendorDeliveryAgent.updateMany({
      where: { id, vendorId: vendor.id },
      data: {
        name: data.name,
        phone: data.phone,
        alternativePhone: data.alternativePhone || null,
        whatsapp: data.whatsapp || null,
        address: data.address || null,
        area: data.area || null,
        vehicleType: data.vehicleType || null,
        vehicleNumber: data.vehicleNumber || null,
        deliveryFee: parseFloat(data.deliveryFee) || 0,
        isActive: data.isActive ?? true,
        notes: data.notes || null,
      }
    })

    return NextResponse.json({ success: true, count: agent.count })
  } catch (error) {
    console.error('Error updating delivery agent:', error)
    return NextResponse.json({ error: 'خطأ في التحديث' }, { status: 500 })
  }
}

// DELETE - حذف مندوب
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

    await prisma.vendorDeliveryAgent.deleteMany({
      where: { id, vendorId: vendor.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting delivery agent:', error)
    return NextResponse.json({ error: 'خطأ في الحذف' }, { status: 500 })
  }
}
