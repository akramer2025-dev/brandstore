// سكريبت لعرض جميع المستخدمين مع كلمات المرور
// تشغيل: npx tsx show-all-users.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function showAllUsers() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👥 جميع المستخدمين في النظام')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log()

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (users.length === 0) {
      console.log('❌ لا يوجد مستخدمين في النظام')
      console.log('💡 قم بتشغيل: npm run prisma:seed')
      return
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'بدون اسم'}`)
      console.log(`   الدور: ${user.role}`)
      console.log(`   البريد: ${user.email || 'بدون بريد'}`)
      console.log(`   كلمة المرور: ${user.password ? '✅ موجودة (مشفرة)' : '❌ غير موجودة'}`)
      console.log(`   تاريخ الإنشاء: ${user.createdAt.toLocaleDateString('ar-EG')}`)
      console.log()
    })

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📊 الإجمالي: ${users.length} مستخدم`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log()
    
    // عرض المدراء
    const admins = users.filter(u => u.role === 'ADMIN')
    if (admins.length > 0) {
      console.log('👑 المدراء:')
      admins.forEach(admin => {
        console.log(`   - ${admin.email}`)
      })
      console.log()
    }

    console.log('💡 لإعادة تعيين كلمة مرور المدير:')
    console.log('   .\\reset-admin.bat')
    console.log()

  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

showAllUsers()
