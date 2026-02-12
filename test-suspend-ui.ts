/**
 * Test Suspension UI - Suspend One Vendor
 * اختبار واجهة الإيقاف - إيقاف شريك واحد
 * 
 * Usage: npx tsx test-suspend-ui.ts [email]
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function suspendVendor(email: string) {
  console.log('🛑 Suspending vendor for UI testing...\n')

  try {
    const vendor = await prisma.vendor.findFirst({
      where: {
        user: {
          email: email
        }
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
      console.log('❌ Vendor not found with email:', email)
      return
    }

    console.log('✅ Found vendor:')
    console.log(`   Name: ${vendor.storeNameAr || vendor.user?.name}`)
    console.log(`   Email: ${vendor.user?.email}`)
    console.log(`   Currently Suspended: ${vendor.isSuspended ? '🔴 YES' : '🟢 NO'}`)

    if (vendor.isSuspended) {
      console.log('\n⚠️  Already suspended!')
      console.log(`   Reason: ${vendor.suspensionReason}`)
      return
    }

    console.log('\n🔄 Suspending account for testing...')
    const suspended = await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        isSuspended: true,
        suspensionReason: `${vendor.storeNameAr || 'متجرك'} يا أهلاً وسهلاً! من فضلك تواصل معايا على الواتساب لتفعيل حسابك`,
        suspendedAt: new Date(),
        suspendedBy: 'test-script',
      }
    })

    console.log('✅ Suspended successfully!')
    console.log(`\n📋 Suspension Details:`)
    console.log(`   Reason: ${suspended.suspensionReason}`)
    console.log(`   Suspended At: ${suspended.suspendedAt?.toLocaleString('ar-EG')}`)
    
    console.log(`\n🌐 Now you can:`)
    console.log(`   1. Visit: http://localhost:3003/admin/partners`)
    console.log(`   2. See "موقوف مؤقتاً" badge on ${vendor.storeNameAr || vendor.user?.name}`)
    console.log(`   3. Click "تفعيل الحساب" button to activate`)
    console.log(`\n   Or login as vendor:`)
    console.log(`   Email: ${vendor.user?.email}`)
    console.log(`   Visit: http://localhost:3003/vendor/dashboard`)
    console.log(`   Should redirect to: http://localhost:3003/vendor/suspended`)

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

const email = process.argv[2] || 'vendor@bs.com'
suspendVendor(email)
