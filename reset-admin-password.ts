// سكريبت لإعادة تعيين كلمة المرور للمدير
// تشغيل: npx tsx reset-admin-password.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetAdminPassword() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔄 إعادة تعيين كلمة مرور المدير')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log()

  try {
    // البحث عن المدير
    const admin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN',
      },
    })

    if (!admin) {
      console.log('❌ لم يتم العثور على حساب مدير')
      console.log('💡 قم بإنشاء مدير جديد من خلال seed')
      return
    }

    console.log('✅ تم العثور على المدير:')
    console.log(`   البريد: ${admin.email}`)
    console.log(`   الاسم: ${admin.name || 'غير محدد'}`)
    console.log()

    // كلمة المرور الجديدة
    const newPassword = 'Admin@123'
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // تحديث كلمة المرور
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    })

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ تم إعادة تعيين كلمة المرور بنجاح!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log()
    console.log('📋 بيانات الدخول:')
    console.log(`   البريد: ${admin.email}`)
    console.log(`   كلمة المرور: ${newPassword}`)
    console.log()
    console.log('🔗 رابط الدخول:')
    console.log('   http://localhost:3000/auth/login')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword()
