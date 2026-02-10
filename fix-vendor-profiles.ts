#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixVendorProfiles() {
  try {
    console.log('🔧 إصلاح بروفايلات الشركاء...\n')
    
    // جميع الشركاء اللي مفيش ليهم vendor profile
    const partnersWithoutProfile = await prisma.user.findMany({
      where: {
        role: 'VENDOR',
        vendor: null  // مفيش vendor profile
      }
    })
    
    console.log(`📊 عدد الشركاء المحتاجين إصلاح: ${partnersWithoutProfile.length}\n`)
    
    if (partnersWithoutProfile.length === 0) {
      console.log('✅ كل الشركاء عندهم بروفايل!')
      return
    }
    
    let fixed = 0
    let errors = 0
    
    for (const partner of partnersWithoutProfile) {
      try {
        // إنشاء vendor profile جديد
        await prisma.vendor.create({
          data: {
            userId: partner.id,
            storeName: partner.name || 'متجر بدون اسم',
            storeNameAr: partner.name || 'متجر بدون اسم',
            phone: partner.phone || '',
            whatsapp: partner.phone || '',
            commissionRate: 30.0, // عمولة افتراضية 30%
            initialCapital: 0,
            capitalBalance: 0,
            isActive: true,
            isApproved: true,
            canDeleteOrders: false,
            canUploadShein: false,
            canAddOfflineProducts: true,
          }
        })
        
        console.log(`✅ تم إصلاح: ${partner.name} (${partner.email})`)
        fixed++
        
      } catch (error) {
        console.error(`❌ خطأ في: ${partner.name} - ${error}`)
        errors++
      }
    }
    
    console.log(`\n📊 النتيجة:`)
    console.log(`✅ تم الإصلاح: ${fixed}`)
    console.log(`❌ فشل: ${errors}`)
    
  } catch (error) {
    console.error('❌ خطأ عام:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixVendorProfiles()
