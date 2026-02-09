import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkVendorRecords() {
  console.log('🔍 فحص سجلات البائعين...\n')
  
  try {
    // جلب جميع المستخدمين بصلاحية VENDOR
    const vendorUsers = await prisma.user.findMany({
      where: {
        role: 'VENDOR'
      },
      include: {
        vendor: true
      }
    })

    console.log(`📊 إجمالي مستخدمي VENDOR: ${vendorUsers.length}\n`)

    const usersWithoutVendorRecord: any[] = []
    const usersWithVendorRecord: any[] = []

    for (const user of vendorUsers) {
      if (user.vendor) {
        usersWithVendorRecord.push(user)
        console.log(`✅ ${user.name} (${user.email}) - لديه سجل Vendor`)
      } else {
        usersWithoutVendorRecord.push(user)
        console.log(`❌ ${user.name} (${user.email}) - ليس لديه سجل Vendor!`)
      }
    }

    console.log(`\n📊 الإحصائيات:`)
    console.log(`✅ لديهم سجل Vendor: ${usersWithVendorRecord.length}`)
    console.log(`❌ ليس لديهم سجل Vendor: ${usersWithoutVendorRecord.length}`)

    // إنشاء سجلات Vendor للمستخدمين المفقودة
    if (usersWithoutVendorRecord.length > 0) {
      console.log(`\n🔧 إنشاء سجلات Vendor للمستخدمين المفقودة...`)
      
      for (const user of usersWithoutVendorRecord) {
        try {
          const newVendor = await prisma.vendor.create({
            data: {
              userId: user.id,
              businessName: user.name || 'متجر جديد',
              storeName: user.name || 'متجر جديد',
              isApproved: true,
              isActive: true,
              initialCapital: 7500,
              capitalBalance: 7500,
            }
          })
          console.log(`✅ تم إنشاء سجل Vendor لـ: ${user.name}`)
        } catch (error) {
          console.error(`❌ فشل إنشاء Vendor لـ ${user.name}:`, error)
        }
      }

      console.log(`\n✨ تم إصلاح جميع السجلات!`)
    } else {
      console.log(`\n✨ جميع المستخدمين لديهم سجلات Vendor صحيحة!`)
    }

  } catch (error) {
    console.error('❌ خطأ في فحص السجلات:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkVendorRecords()
