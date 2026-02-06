import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    // جلب الشركاء مع بيانات الـ vendor والـ user
    const partners = await prisma.partnerCapital.findMany({
      include: {
        vendor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    console.log('\n👥 الشركاء وحساباتهم:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    partners.forEach((partner, index) => {
      console.log(`\n${index + 1}. ${partner.partnerName}`)
      console.log(`   Vendor ID: ${partner.vendorId}`)
      if (partner.vendor && partner.vendor.user) {
        console.log(`   ✅ له حساب:`)
        console.log(`      الاسم: ${partner.vendor.user.name}`)
        console.log(`      البريد: ${partner.vendor.user.email}`)
        console.log(`      الدور: ${partner.vendor.user.role}`)
      } else {
        console.log(`   ❌ ليس له حساب`)
      }
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // جلب جميع المستخدمين
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })
    
    console.log('\n📧 جميع المستخدمين في النظام:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`)
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
