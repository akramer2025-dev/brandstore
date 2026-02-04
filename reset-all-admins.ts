// إعادة تعيين كلمة المرور لجميع المدراء
// تشغيل: npx tsx reset-all-admins.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetAllAdmins() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔄 إعادة تعيين كلمات المرور لجميع المدراء')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log()

  try {
    // جلب جميع المدراء
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
      },
    })

    if (admins.length === 0) {
      console.log('❌ لم يتم العثور على حسابات مدراء')
      return
    }

    console.log(`✅ تم العثور على ${admins.length} مدير`)
    console.log()

    const newPassword = 'Admin@123'
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // تحديث كلمة المرور لجميع المدراء
    for (const admin of admins) {
      await prisma.user.update({
        where: { id: admin.id },
        data: { password: hashedPassword },
      })

      console.log(`✅ ${admin.name || 'مدير'}`)
      console.log(`   البريد: ${admin.email}`)
      console.log(`   كلمة المرور: ${newPassword}`)
      console.log()
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ تم تحديث كلمات المرور بنجاح!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log()
    console.log('🔗 رابط الدخول:')
    console.log('   http://localhost:3000/auth/login')
    console.log()
    console.log('📋 كلمة المرور الموحدة: Admin@123')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAllAdmins()
