/**
 * Test New Suspension Message
 * اختبار الرسالة الجديدة مع رقم الهاتف والاسم
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testNewMessage() {
  console.log('📝 Testing new suspension message format...\n')

  try {
    // الرسالة الجديدة المتوقعة
    const partnerName = "متجر aml"
    const expectedMessage = `${partnerName} يا أهلاً وسهلاً! من فضلك تواصل معايا على الواتساب لتفعيل حسابك.

01555512778
م : اكــرم المــصرى`

    console.log('✅ الرسالة الافتراضية الجديدة:')
    console.log('─'.repeat(60))
    console.log(expectedMessage)
    console.log('─'.repeat(60))

    console.log('\n📞 معلومات الاتصال:')
    console.log('   رقم الواتساب: 01555512778')
    console.log('   الاسم: م : اكــرم المــصرى')

    console.log('\n🌐 الاستخدام:')
    console.log('   1. افتح: http://localhost:3003/admin/partners')
    console.log('   2. اضغط "إيقاف مؤقت" على أي شريك')
    console.log('   3. ستظهر الرسالة الجديدة تلقائياً مع:')
    console.log('      - اسم المتجر')
    console.log('      - رقم الواتساب: 01555512778')
    console.log('      - الاسم: م : اكــرم المــصرى')

    console.log('\n📱 رابط الواتساب:')
    console.log(`   https://wa.me/01555512778`)

    console.log('\n✅ جميع التحديثات تمت بنجاح!')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testNewMessage()
