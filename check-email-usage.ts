import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkEmailUsage() {
  try {
    // اسأل عن البريد المراد فحصه
    const testEmail = process.argv[2]
    
    if (!testEmail) {
      console.log('❌ الرجاء إدخال البريد للفحص')
      console.log('الاستخدام: npx tsx check-email-usage.ts البريد@example.com')
      return
    }
    
    console.log('\n🔍 فحص البريد:', testEmail)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // البحث في جدول المستخدمين
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
      include: {
        vendor: {
          include: {
            partners: true,
          },
        },
      },
    })
    
    if (user) {
      console.log('✅ البريد موجود في النظام!')
      console.log('\n📧 معلومات المستخدم:')
      console.log('   الاسم:', user.name)
      console.log('   البريد:', user.email)
      console.log('   الدور:', user.role)
      console.log('   تاريخ الإنشاء:', user.createdAt)
      
      if (user.vendor) {
        console.log('\n🏪 لديه حساب Vendor:')
        console.log('   Vendor ID:', user.vendor.id)
        console.log('   رأس المال:', user.vendor.capitalBalance)
        console.log('   موافق عليه:', user.vendor.isApproved ? 'نعم' : 'لا')
        
        if (user.vendor.partners && user.vendor.partners.length > 0) {
          console.log('\n👥 الشركاء المرتبطين:')
          user.vendor.partners.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.partnerName} (${p.capitalAmount} ج)`)
          })
        } else {
          console.log('\n⚠️ ليس له شركاء مرتبطين')
        }
      } else {
        console.log('\n❌ ليس له حساب Vendor')
      }
    } else {
      console.log('❌ البريد غير موجود في النظام')
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkEmailUsage()
