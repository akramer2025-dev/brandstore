/**
 * Activate Suspended Vendor
 * تفعيل حساب شريك موقوف
 * 
 * Usage: npx tsx activate-vendor.ts [vendorId or email]
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function activateVendor(identifier: string) {
  console.log('🔓 Activating vendor account...\n')

  try {
    // البحث عن الشريك بالـ ID أو Email
    let vendor = await prisma.vendor.findFirst({
      where: {
        OR: [
          { id: identifier },
          { 
            user: {
              email: identifier
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    if (!vendor) {
      console.log('❌ Vendor not found!')
      console.log(`   Searched for: ${identifier}`)
      console.log('\n💡 Try using:')
      console.log('   - Vendor ID (e.g., cml780cyl0003e31w0dmzl4pz)')
      console.log('   - Email (e.g., vendor@bs.com)')
      return
    }

    console.log('✅ Found vendor:')
    console.log(`   Name: ${vendor.storeNameAr || vendor.user?.name || 'N/A'}`)
    console.log(`   Email: ${vendor.user?.email}`)
    console.log(`   Status: ${vendor.isSuspended ? '🔴 SUSPENDED' : '🟢 ACTIVE'}`)

    if (!vendor.isSuspended) {
      console.log('\n⚠️  Already active! No action needed.')
      return
    }

    console.log(`\n📋 Suspension Details:`)
    console.log(`   Reason: ${vendor.suspensionReason || 'N/A'}`)
    console.log(`   Suspended At: ${vendor.suspendedAt?.toLocaleString('ar-EG') || 'N/A'}`)
    console.log(`   Suspended By: ${vendor.suspendedBy || 'N/A'}`)

    // تفعيل الحساب
    console.log('\n🔄 Activating account...')
    const activated = await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        isSuspended: false,
        suspensionReason: null,
        suspendedAt: null,
        suspendedBy: null,
      }
    })

    console.log('✅ Account activated successfully!')
    console.log(`\n🎉 ${activated.storeNameAr || 'The vendor'} can now access their dashboard!`)

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// الحصول على الـ identifier من الـ command line
const identifier = process.argv[2]

if (!identifier) {
  console.log('❌ Missing vendor identifier!')
  console.log('\n📖 Usage:')
  console.log('   npx tsx activate-vendor.ts [vendorId or email]')
  console.log('\n📝 Examples:')
  console.log('   npx tsx activate-vendor.ts cml780cyl0003e31w0dmzl4pz')
  console.log('   npx tsx activate-vendor.ts vendor@bs.com')
  console.log('   npx tsx activate-vendor.ts nada@vendor.com')
  process.exit(1)
}

activateVendor(identifier)
