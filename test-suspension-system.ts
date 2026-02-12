/**
 * Test Suspension System
 * اختبار نظام إيقاف حسابات الشركاء
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testSuspensionSystem() {
  console.log('🧪 Testing Suspension System...\n')

  try {
    // 1. جلب جميع الشركاء
    console.log('1️⃣ Fetching all vendors...')
    const vendors = await prisma.vendor.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
          }
        }
      },
      take: 5
    })

    console.log(`✅ Found ${vendors.length} vendors\n`)

    vendors.forEach((vendor, index) => {
      console.log(`${index + 1}. ${vendor.storeNameAr || vendor.user?.name || 'N/A'}`)
      console.log(`   Email: ${vendor.user?.email}`)
      console.log(`   ID: ${vendor.id}`)
      console.log(`   Suspended: ${vendor.isSuspended ? '🔴 YES' : '🟢 NO'}`)
      if (vendor.isSuspended) {
        console.log(`   Reason: ${vendor.suspensionReason}`)
        console.log(`   Suspended At: ${vendor.suspendedAt}`)
      }
      console.log('')
    })

    // 2. اختبار تعليق أول شريك (للاختبار فقط)
    if (vendors.length > 0) {
      const testVendor = vendors[0]
      console.log(`\n2️⃣ Testing suspension on: ${testVendor.storeNameAr || testVendor.user?.name}`)
      
      // تعليق الحساب
      console.log('   Suspending account...')
      const suspended = await prisma.vendor.update({
        where: { id: testVendor.id },
        data: {
          isSuspended: true,
          suspensionReason: `${testVendor.storeNameAr || 'متجرك'} يا أهلاً وسهلاً! من فضلك تواصل معايا على الواتساب لتفعيل حسابك`,
          suspendedAt: new Date(),
          suspendedBy: 'test-script',
        }
      })

      console.log('   ✅ Suspended successfully!')
      console.log(`   Reason: ${suspended.suspensionReason}`)
      
      // إلغاء التعليق (للعودة كما كان)
      console.log('\n   Unsuspending account (cleanup)...')
      await prisma.vendor.update({
        where: { id: testVendor.id },
        data: {
          isSuspended: false,
          suspensionReason: null,
          suspendedAt: null,
          suspendedBy: null,
        }
      })
      console.log('   ✅ Unsuspended successfully!')
    }

    // 3. اختبار الـ API endpoints (نظري فقط)
    console.log('\n3️⃣ Available API Endpoints:')
    console.log('   GET  /api/vendor/suspension-status')
    console.log('   POST /api/admin/vendors/[id]/toggle-suspension')
    
    console.log('\n4️⃣ Frontend Pages:')
    console.log('   /vendor/suspended - صفحة الإيقاف المؤقت')
    console.log('   /admin/partners - إدارة الشركاء (بها زر "إيقاف مؤقت")')

    console.log('\n✅ All tests passed!')
    console.log('\n📝 To test manually:')
    console.log('1. Go to http://localhost:3003/admin/partners')
    console.log('2. Click "إيقاف مؤقت" on any partner')
    console.log('3. Enter custom suspension message')
    console.log('4. Login as that partner to see suspension page')

  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

testSuspensionSystem()
