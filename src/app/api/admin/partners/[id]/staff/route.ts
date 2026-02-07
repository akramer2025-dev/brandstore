import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * إضافة موظف جديد لشريك معين
 * POST /api/admin/partners/[id]/staff
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // التحقق من صلاحيات المستخدم
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      )
    }

    const partnerId = params.id
    const body = await request.json()
    const {
      name,
      email,
      password,
      phone,
      permissions = {}
    } = body

    // التحقق من البيانات المطلوبة
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة' },
        { status: 400 }
      )
    }

    // التحقق من وجود الشريك
    const partner = await prisma.partnerCapital.findUnique({
      where: { id: partnerId }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'الشريك غير موجود' },
        { status: 404 }
      )
    }

    // التحقق من عدم وجود حساب بنفس البريد الإلكتروني
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10)

    // إنشاء حساب الموظف
    const staffUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: 'PARTNER_STAFF',
        partnerId,
        partnerStaffPermissions: permissions
      }
    })

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ تم إنشاء حساب موظف شريك جديد:')
    console.log(`   الاسم: ${name}`)
    console.log(`   البريد: ${email}`)
    console.log(`   كلمة المرور: ${password}`)
    console.log(`   الشريك: ${partner.partnerName}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return NextResponse.json({
      message: 'تم إضافة الموظف بنجاح',
      staff: {
        id: staffUser.id,
        name: staffUser.name,
        email: staffUser.email,
        phone: staffUser.phone,
        role: staffUser.role,
        partnerId: staffUser.partnerId,
        permissions: staffUser.partnerStaffPermissions,
        credentials: {
          email,
          password // إرجاع كلمة المرور للعرض مرة واحدة فقط
        }
      }
    })

  } catch (error) {
    console.error('خطأ في إضافة موظف الشريك:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إضافة الموظف' },
      { status: 500 }
    )
  }
}

/**
 * الحصول على قائمة موظفي الشريك
 * GET /api/admin/partners/[id]/staff
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // التحقق من صلاحيات المستخدم
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      )
    }

    const partnerId = params.id

    // التحقق من وجود الشريك
    const partner = await prisma.partnerCapital.findUnique({
      where: { id: partnerId },
      include: {
        staffMembers: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            partnerStaffPermissions: true,
            createdAt: true
          }
        }
      }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'الشريك غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      partner: {
        id: partner.id,
        name: partner.partnerName
      },
      staff: partner.staffMembers
    })

  } catch (error) {
    console.error('خطأ في جلب موظفي الشريك:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الموظفين' },
      { status: 500 }
    )
  }
}
