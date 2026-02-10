import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setDefaultPasswords() {
  try {
    console.log('🔐 تحديث كلمات المرور لجميع المستخدمين...\n')

    const defaultPassword = 'Aa123456'
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    // جلب جميع المستخدمين الذين ليس لديهم كلمة مرور
    const usersWithoutPassword = await prisma.user.findMany({
      where: {
        OR: [
          { password: null },
          { password: '' }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    })

    console.log(`📊 عدد المستخدمين بدون كلمة مرور: ${usersWithoutPassword.length}\n`)

    if (usersWithoutPassword.length === 0) {
      console.log('✅ جميع المستخدمين لديهم كلمات مرور بالفعل!')
      return
    }

    // تحديث كلمات المرور
    const updatePromises = usersWithoutPassword.map(user => 
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })
    )

    await Promise.all(updatePromises)

    console.log('✅ تم تحديث كلمات المرور بنجاح!\n')
    console.log('════════════════════════════════════════════════════════════════════════════════')
    console.log('📋 المستخدمين الذين تم تحديث كلمات مرورهم:')
    console.log('════════════════════════════════════════════════════════════════════════════════\n')

    // تجميع حسب الدور
    const byRole = usersWithoutPassword.reduce((acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = []
      }
      acc[user.role].push(user)
      return acc
    }, {} as Record<string, typeof usersWithoutPassword>)

    const roleNames: Record<string, string> = {
      'ADMIN': 'المدير',
      'CUSTOMER': 'عميل',
      'VENDOR': 'شريك',
      'DELIVERY_STAFF': 'موظف توصيل',
      'MARKETING_STAFF': 'موظف تسويق',
      'PARTNER_STAFF': 'موظف شريك',
      'MANUFACTURER': 'مصنع'
    }

    for (const [role, users] of Object.entries(byRole)) {
      console.log(`\n📋 ${roleNames[role] || role} - العدد: ${users.length}`)
      console.log('─'.repeat(80))
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`)
        console.log(`   📧 Email: ${user.email}`)
        console.log(`   🔑 Password: ${defaultPassword}`)
        console.log()
      })
    }

    console.log('\n════════════════════════════════════════════════════════════════════════════════')
    console.log('✅ جميع المستخدمين الآن يمكنهم تسجيل الدخول باستخدام:')
    console.log(`🔑 كلمة المرور: ${defaultPassword}`)
    console.log('════════════════════════════════════════════════════════════════════════════════\n')

  } catch (error) {
    console.error('❌ حدث خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setDefaultPasswords()
