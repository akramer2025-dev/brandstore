import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function searchAllNadaAccounts() {
  console.log('🔍 البحث عن جميع حسابات ندى...\n')
  
  try {
    // البحث عن جميع المستخدمين الذين يحتوي اسمهم أو بريدهم على "ندى" أو "nada"
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: 'ندى', mode: 'insensitive' } },
          { name: { contains: 'nada', mode: 'insensitive' } },
          { email: { contains: 'nada', mode: 'insensitive' } },
          { name: { contains: 'هانم', mode: 'insensitive' } },
        ]
      },
      include: {
        vendor: {
          include: {
            _count: {
              select: {
                products: true
              }
            }
          }
        }
      }
    })

    console.log(`📊 عدد الحسابات المطابقة: ${users.length}\n`)

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`)
      console.log(`   - البريد: ${user.email}`)
      console.log(`   - الصلاحية: ${user.role}`)
      console.log(`   - ID: ${user.id}`)
      
      if (user.vendor) {
        console.log(`   - ✅ حساب بائع موجود`)
        console.log(`   - عدد المنتجات: ${user.vendor._count.products}`)
      } else {
        console.log(`   - ❌ ليس بائع`)
      }
      console.log('')
    })

    // البحث عن جميع البائعين (Vendors)
    console.log('\n📦 جميع البائعين في النظام:\n')
    const allVendors = await prisma.vendor.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    allVendors.forEach((vendor, index) => {
      console.log(`${index + 1}. ${vendor.user.name}`)
      console.log(`   - البريد: ${vendor.user.email}`)
      console.log(`   - عدد المنتجات: ${vendor._count.products}`)
      console.log(`   - اسم المتجر: ${vendor.storeName || 'غير محدد'}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

searchAllNadaAccounts()
