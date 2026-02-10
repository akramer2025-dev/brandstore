#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixVendorStores() {
  try {
    console.log('🔧 إصلاح أسماء المتاجر واعتماد الشركاء...\n')
    
    // كل الـ vendors
    const allVendors = await prisma.vendor.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    console.log(`📊 إجمالي الشركاء: ${allVendors.length}\n`)
    
    let fixed = 0
    let alreadyOk = 0
    
    for (const vendor of allVendors) {
      const userName = vendor.user.name || 'شريك'
      const storeName = vendor.storeName || `متجر ${userName}`
      const needsUpdate = !vendor.storeName || !vendor.isApproved
      
      if (needsUpdate) {
        await prisma.vendor.update({
          where: { id: vendor.id },
          data: {
            storeName: storeName,
            storeNameAr: storeName,
            isApproved: true,  // اعتماد الشريك
          }
        })
        
        console.log(`✅ تم إصلاح: ${vendor.user.name} (${vendor.user.email})`)
        console.log(`   🏪 Store: "${storeName}"`)
        console.log(`   ✅ تم الاعتماد`)
        console.log('─'.repeat(80))
        fixed++
      } else {
        alreadyOk++
      }
    }
    
    console.log(`\n📊 النتيجة:`)
    console.log(`✅ تم الإصلاح: ${fixed}`)
    console.log(`✅ كانوا جاهزين: ${alreadyOk}`)
    
    console.log('\n🎉 تم الإصلاح بنجاح! الآن جميع الشركاء معتمدين ولهم أسماء متاجر.')
    
  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixVendorStores()
