import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - جلب شركات الشحن للشريك
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

    const companies = await prisma.vendorShippingCompany.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error('Error fetching shipping companies:', error)
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

// POST - إضافة شركة شحن جديدة
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

    const company = await prisma.vendorShippingCompany.create({
      data: {
        vendorId: vendor.id,
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
        notes: data.notes || null,
      }
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error('Error creating shipping company:', error)
    return NextResponse.json({ error: 'خطأ في إنشاء شركة الشحن' }, { status: 500 })
  }
}
