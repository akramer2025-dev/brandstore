// اختبار إضافة شريك جديد مع حساب
// تشغيل: npx tsx test-create-partner.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testCreatePartner() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧪 اختبار إنشاء شريك جديد مع حساب')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log()

  try {
    const partnerEmail = 'testpartner@example.com'
    const partnerPassword = 'Partner@123'

    // التحقق من وجود المستخدم
    const existingUser = await prisma.user.findUnique({
      where: { email: partnerEmail },
    })

    if (existingUser) {
      console.log('⚠️  الشريك موجود مسبقاً. سيتم حذفه وإعادة إنشائه...')
      
      // حذف الـ vendor أولاً
      await prisma.vendor.deleteMany({
        where: { userId: existingUser.id },
      })
      
      // حذف الـ user
      await prisma.user.delete({
        where: { id: existingUser.id },
      })
      
      console.log('✅ تم حذف الشريك القديم')
      console.log()
    }

    // إنشاء المستخدم
    const hashedPassword = await bcrypt.hash(partnerPassword, 10)
    
    const user = await prisma.user.create({
      data: {
        name: 'شريك تجريبي',
        email: partnerEmail,
        password: hashedPassword,
        role: 'VENDOR',
        phone: '01234567890',
      },
    })

    console.log('✅ تم إنشاء المستخدم:')
    console.log(`   ID: ${user.id}`)
    console.log(`   الاسم: ${user.name}`)
    console.log(`   البريد: ${user.email}`)
    console.log(`   الدور: ${user.role}`)
    console.log()

    // إنشاء الـ vendor
    const vendor = await prisma.vendor.create({
      data: {
        userId: user.id,
        phone: '01234567890',
        address: 'عنوان تجريبي',
        capitalBalance: 50000,
        isApproved: true,
      },
    })

    console.log('✅ تم إنشاء Vendor:')
    console.log(`   ID: ${vendor.id}`)
    console.log(`   User ID: ${vendor.userId}`)
    console.log(`   رأس المال: ${vendor.capitalBalance} جنيه`)
    console.log()

    // إنشاء سجل الشريك
    const partner = await prisma.partnerCapital.create({
      data: {
        vendorId: vendor.id,
        partnerName: 'شريك تجريبي',
        partnerType: 'PARTNER',
        capitalAmount: 50000,
        initialAmount: 50000,
        currentAmount: 50000,
        capitalPercent: 100,
        notes: 'شريك تجريبي للاختبار',
      },
    })

    console.log('✅ تم إنشاء سجل الشريك:')
    console.log(`   ID: ${partner.id}`)
    console.log(`   الاسم: ${partner.partnerName}`)
    console.log(`   رأس المال: ${partner.capitalAmount} جنيه`)
    console.log(`   النسبة: ${partner.capitalPercent}%`)
    console.log()

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ تم إنشاء الشريك بنجاح!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log()
    console.log('📋 بيانات الدخول:')
    console.log(`   البريد: ${partnerEmail}`)
    console.log(`   كلمة المرور: ${partnerPassword}`)
    console.log()
    console.log('🔗 رابط الدخول:')
    console.log('   http://localhost:3000/auth/login')
    console.log()
    console.log('💡 جرب الدخول الآن!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCreatePartner()
