import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - جلب مناديب التوصيل للشريك
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'البائع غير موجود' }, { status: 404 })
    }

    const agents = await prisma.vendorDeliveryAgent.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(agents)
  } catch (error) {
    console.error('Error fetching delivery agents:', error)
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

// POST - إضافة مندوب توصيل جديد
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'البائع غير موجود' }, { status: 404 })
    }

    const data = await req.json()

    const agent = await prisma.vendorDeliveryAgent.create({
      data: {
        vendorId: vendor.id,
        name: data.name,
        phone: data.phone,
        alternativePhone: data.alternativePhone || null,
        whatsapp: data.whatsapp || null,
        address: data.address || null,
        area: data.area || null,
        vehicleType: data.vehicleType || null,
        vehicleNumber: data.vehicleNumber || null,
        deliveryFee: parseFloat(data.deliveryFee) || 0,
        notes: data.notes || null,
      }
    })

    return NextResponse.json(agent, { status: 201 })
  } catch (error) {
    console.error('Error creating delivery agent:', error)
    return NextResponse.json({ error: 'خطأ في إنشاء المندوب' }, { status: 500 })
  }
}
