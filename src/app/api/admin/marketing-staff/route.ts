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
      commissionRate = 0,
      baseSalary = 0,
      performanceBonus = 0,
      notes = '',
    } = body

    // التحقق من البيانات المطلوبة
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة' },
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
        phone: phone || '',
        commissionRate: parseFloat(commissionRate.toString()),
        baseSalary: parseFloat(baseSalary.toString()),
        performanceBonus: parseFloat(performanceBonus.toString()),
        notes: notes,
        totalCommission: 0,
        isApproved: true,
      },
    })

    console.log('✅ تم إنشاء موظف التسويق:', marketingStaff.id)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ تم إنشاء موظف تسويق (Media Buyer) بنجاح!')
    console.log(`   الاسم: ${name}`)
    console.log(`   البريد: ${email}`)
    console.log(`   الهاتف: ${phone || 'غير محدد'}`)
    console.log(`   نسبة العمولة: ${commissionRate}%`)
    console.log(`   الراتب الأساسي: ${baseSalary} ج`)
    console.log(`   مكافأة الأداء: ${performanceBonus} ج`)
    console.log(`   Role: ${user.role}`)
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
        baseSalary: marketingStaff.baseSalary,
        performanceBonus: marketingStaff.performanceBonus,
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
