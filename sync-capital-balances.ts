/**
 * مزامنة رأس المال - إصلاح مشكلة عدم تحديث capitalBalance
 * 
 * هذا السكريبت يقوم بـ:
 * 1. جلب جميع سجلات رأس المال من partnerCapital
 * 2. تحديث capitalBalance في جدول Vendor
 * 3. إنشاء معاملات capitalTransaction المفقودة
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function syncCapitalBalances() {
  console.log('🔄 جاري مزامنة أرصدة رأس المال...\n')

  try {
    // جلب جميع الشركاء
    const vendors = await prisma.vendor.findMany({
      include: {
        partners: {
          where: { partnerType: 'OWNER' },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    console.log(`📊 عدد الشركاء: ${vendors.length}\n`)

    for (const vendor of vendors) {
      const partner = vendor.partners[0]
      
      if (!partner) {
        console.log(`⚠️  الشريك ${vendor.id} ليس لديه رأس مال مسجل`)
        continue
      }

      console.log(`\n👤 الشريك: ${vendor.id}`)
      console.log(`   رأس المال المسجل: ${partner.initialAmount.toLocaleString()} ج`)
      console.log(`   الرصيد الحالي في capitalBalance: ${vendor.capitalBalance?.toLocaleString() || 0} ج`)

      // حساب الرصيد الصحيح من المعاملات
      const transactions = await prisma.capitalTransaction.findMany({
        where: { vendorId: vendor.id },
        orderBy: { createdAt: 'asc' }
      })

      let calculatedBalance = 0
      
      // إذا لم توجد معاملات، نضيف معاملة الإيداع الأولي
      if (transactions.length === 0) {
        console.log(`   ⚠️  لا توجد معاملات! سيتم إنشاء معاملة الإيداع الأولي...`)
        
        await prisma.capitalTransaction.create({
          data: {
            vendorId: vendor.id,
            type: 'DEPOSIT',
            amount: partner.initialAmount,
            description: 'إيداع رأس المال الأساسي',
            descriptionAr: partner.notes || 'إيداع رأس المال الأساسي',
            balanceBefore: 0,
            balanceAfter: partner.initialAmount,
          }
        })
        
        calculatedBalance = partner.initialAmount
        console.log(`   ✅ تم إنشاء معاملة الإيداع`)
      } else {
        // حساب الرصيد من المعاملات
        for (const transaction of transactions) {
          if (transaction.type === 'DEPOSIT') {
            calculatedBalance += transaction.amount
          } else {
            calculatedBalance -= transaction.amount
          }
        }
        console.log(`   📊 الرصيد المحسوب من المعاملات: ${calculatedBalance.toLocaleString()} ج`)
      }

      // تحديث capitalBalance
      if (vendor.capitalBalance !== calculatedBalance) {
        await prisma.vendor.update({
          where: { id: vendor.id },
          data: { capitalBalance: calculatedBalance }
        })
        console.log(`   ✅ تم تحديث الرصيد من ${vendor.capitalBalance?.toLocaleString() || 0} إلى ${calculatedBalance.toLocaleString()} ج`)
      } else {
        console.log(`   ✓ الرصيد صحيح بالفعل`)
      }
    }

    console.log('\n\n📊 ملخص النتائج:\n')
    
    const updatedVendors = await prisma.vendor.findMany({
      include: {
        partners: {
          where: { partnerType: 'OWNER' },
          take: 1
        }
      }
    })

    updatedVendors.forEach((vendor, index) => {
      const partner = vendor.partners[0]
      console.log(`   ${index + 1}. الشريك ${vendor.id}`)
      console.log(`      رأس المال: ${partner?.initialAmount?.toLocaleString() || 0} ج`)
      console.log(`      الرصيد المتاح: ${vendor.capitalBalance?.toLocaleString() || 0} ج\n`)
    })

    console.log('🎉 تمت مزامنة أرصدة رأس المال بنجاح!')
    
  } catch (error) {
    console.error('❌ حدث خطأ:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// تشغيل السكريبت
syncCapitalBalances()
  .catch((error) => {
    console.error('❌ فشلت العملية:', error)
    process.exit(1)
  })
