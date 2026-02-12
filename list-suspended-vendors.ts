/**
 * List All Suspended Vendors
 * عرض قائمة بجميع الشركاء الموقوفين
 * 
 * Usage: npx tsx list-suspended-vendors.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listSuspendedVendors() {
  console.log('🔍 Searching for suspended vendors...\n')

  try {
    const suspendedVendors = await prisma.vendor.findMany({
      where: {
        isSuspended: true
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            phone: true,
          }
        }
      },
      orderBy: {
        suspendedAt: 'desc'
      }
    })

    if (suspendedVendors.length === 0) {
      console.log('✅ No suspended vendors found!')
      console.log('   All vendor accounts are active.')
      return
    }

    console.log(`🔴 Found ${suspendedVendors.length} suspended vendor(s):\n`)
    console.log('═'.repeat(80))

    suspendedVendors.forEach((vendor, index) => {
      console.log(`\n${index + 1}. ${vendor.storeNameAr || vendor.user?.name || 'N/A'}`)
      console.log('─'.repeat(80))
      console.log(`   📧 Email: ${vendor.user?.email}`)
      console.log(`   📞 Phone: ${vendor.user?.phone || 'N/A'}`)
      console.log(`   💬 WhatsApp: ${vendor.whatsapp || 'N/A'}`)
      console.log(`   🆔 Vendor ID: ${vendor.id}`)
      console.log(`\n   📋 Suspension Details:`)
      console.log(`      Reason: ${vendor.suspensionReason || 'N/A'}`)
      console.log(`      Suspended At: ${vendor.suspendedAt?.toLocaleString('ar-EG') || 'N/A'}`)
      console.log(`      Suspended By: ${vendor.suspendedBy || 'N/A'}`)
      console.log(`\n   🔓 To activate:`)
      console.log(`      npx tsx activate-vendor.ts ${vendor.user?.email}`)
    })

    console.log('\n' + '═'.repeat(80))
    console.log(`\n📊 Summary:`)
    console.log(`   Total Suspended: ${suspendedVendors.length}`)
    console.log(`\n💡 To activate a vendor, use:`)
    console.log(`   npx tsx activate-vendor.ts [email or vendorId]`)

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

listSuspendedVendors()
