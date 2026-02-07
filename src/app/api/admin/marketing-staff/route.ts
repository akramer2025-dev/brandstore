import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * إنشاء موظف تسويق جديد (Admin فقط)
 * POST /api/admin/marketing-staff
 */
export async function POST(request: NextRequest) {
  try {
    // التحقق من صلاحيات المستخدم
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      email,
      password,
      phone,
      commissionRate = 5,
    } = body

    // التحقق من البيانات المطلوبة
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'الاسم والبريد الإلكتروني وكلمة المرور والهاتف مطلوبة' },
        { status: 400 }
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

    // إنشاء حساب موظف التسويق
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: 'MARKETING_STAFF', // 🎯 تحديد الـ role بشكل صريح!
      }
    })

    console.log('✅ تم إنشاء مستخدم:', user.id, '| Role:', user.role)

    // إنشاء موظف التسويق
    const marketingStaff = await prisma.marketingStaff.create({
      data: {
        userId: user.id,
        phone,
        commissionRate: parseFloat(commissionRate.toString()),
        totalCommission: 0,
        paidCommission: 0,
        pendingCommission: 0,
        isApproved: true,
      },
    })

    console.log('✅ تم إنشاء موظف التسويق:', marketingStaff.id)

    // إنشاء طريقة دفع افتراضية (InstaPay)
    await prisma.marketingPaymentMethod.create({
      data: {
        marketingStaffId: marketingStaff.id,
        type: 'INSTAPAY',
        details: phone,
        isDefault: true,
      },
    })

    console.log('✅ تم إنشاء طريقة الدفع الافتراضية')

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ تم إنشاء موظف تسويق بنجاح!')
    console.log(`   الاسم: ${name}`)
    console.log(`   البريد: ${email}`)
    console.log(`   الهاتف: ${phone}`)
    console.log(`   نسبة العمولة: ${commissionRate}%`)
    console.log(`   Role: ${user.role}`) // للتأكد
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return NextResponse.json({
      message: 'تم إنشاء موظف التسويق بنجاح',
      staff: {
        id: marketingStaff.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        commissionRate: marketingStaff.commissionRate,
      }
    })

  } catch (error) {
    console.error('❌ خطأ في إنشاء موظف التسويق:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الموظف' },
      { status: 500 }
    )
  }
}
