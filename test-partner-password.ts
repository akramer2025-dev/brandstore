// اختبار سريع لنظام إضافة الشريك مع كلمة المرور
// تشغيل: npx tsx test-partner-password.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPartnerPassword() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧪 اختبار نظام كلمة المرور للشركاء')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log()

  try {
    // البحث عن شريك تجريبي
    const testPartner = await prisma.user.findFirst({
      where: {
        email: 'store@partner.com',
      },
      include: {
        vendor: {
          include: {
            partnerCapitals: true,
          },
        },
      },
    })

    if (testPartner) {
      console.log('✅ تم العثور على شريك تجريبي:')
      console.log(`   📧 البريد: ${testPartner.email}`)
      console.log(`   👤 الاسم: ${testPartner.name}`)
      console.log(`   🔐 كلمة المرور: مشفرة (bcrypt)`)
      console.log(`   🏪 Vendor ID: ${testPartner.vendor?.id || 'N/A'}`)
      console.log(`   💰 رأس المال: ${testPartner.vendor?.capitalBalance || 0} جنيه`)
      console.log()
      console.log('📋 معلومات الشراكة:')
      
      if (testPartner.vendor?.partnerCapitals.length) {
        testPartner.vendor.partnerCapitals.forEach((capital, index) => {
          console.log(`   ${index + 1}. ${capital.partnerName}`)
          console.log(`      - المبلغ: ${capital.capitalAmount} جنيه`)
          console.log(`      - النسبة: ${capital.capitalPercent}%`)
          console.log(`      - النوع: ${capital.partnerType}`)
        })
      } else {
        console.log('   ⚠️ لا توجد سجلات شراكة')
      }
    } else {
      console.log('⚠️ لم يتم العثور على شريك تجريبي')
      console.log('💡 قم بتشغيل: npm run prisma:seed')
    }

    console.log()
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📝 بيانات الدخول للاختبار:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔗 الرابط: http://localhost:3000/auth/login')
    console.log('📧 البريد: store@partner.com')
    console.log('🔑 كلمة المرور: Aazxc')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log()
    console.log('✅ لإضافة شريك جديد:')
    console.log('   1. افتح: http://localhost:3000/admin/partners')
    console.log('   2. اضغط "إضافة شريك"')
    console.log('   3. ✅ فعّل "إنشاء حساب VENDOR للشريك"')
    console.log('   4. أدخل كلمة المرور')
    console.log('   5. احفظ البيانات!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPartnerPassword()
