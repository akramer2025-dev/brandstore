import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteFakeCustomers() {
  console.log('🧹 بدء حذف العملاء الوهميين...\n')
  
  try {
    // عرض العملاء الوهميين قبل الحذف
    const fakeCustomers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
        email: {
          contains: 'fake'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })

    console.log(`📊 عدد العملاء الوهميين: ${fakeCustomers.length}\n`)
    
    if (fakeCustomers.length > 0) {
      console.log('👥 قائمة العملاء الوهميين:')
      fakeCustomers.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.name} - ${customer.email}`)
      })
      
      console.log('\n🗑️ حذف العملاء الوهميين...')
      
      // حذف العملاء الوهميين
      const deleteResult = await prisma.user.deleteMany({
        where: {
          role: 'CUSTOMER',
          email: {
            contains: 'fake'
          }
        }
      })

      console.log(`✅ تم حذف ${deleteResult.count} عميل وهمي بنجاح!\n`)
    } else {
      console.log('✨ لا يوجد عملاء وهميين للحذف.\n')
    }

    // عرض العملاء الحقيقيين المتبقيين
    const realCustomers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        accounts: {
          select: {
            provider: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('👥 العملاء الحقيقيين المتبقيين:')
    console.log(`📊 إجمالي: ${realCustomers.length} عميل\n`)
    
    realCustomers.forEach((customer, index) => {
      const authMethod = customer.accounts.length > 0 
        ? `Google OAuth` 
        : 'Email/Password'
      console.log(`${index + 1}. ${customer.name}`)
      console.log(`   📧 ${customer.email}`)
      console.log(`   🔐 ${authMethod}`)
      console.log(`   📅 ${customer.createdAt.toLocaleDateString('ar-EG')}\n`)
    })

    console.log('✨ تم تنظيف قاعدة البيانات بنجاح!')
    
  } catch (error) {
    console.error('❌ خطأ في حذف العملاء:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteFakeCustomers()
