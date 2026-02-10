#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkVendorTable() {
  try {
    console.log('🔍 فحص جدول Vendor مباشرة...\n')
    
    // كل الـ vendors
    const allVendors = await prisma.vendor.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    })
    
    console.log(`📊 إجمالي Vendors في الجدول: ${allVendors.length}\n`)
    
    if (allVendors.length === 0) {
      console.log('⚠️  جدول Vendor فاضي تماماً!\n')
      console.log('💡 السبب: تم حذف جميع سجلات الـ Vendors\n')
      console.log('📝 الحل: إنشاء vendor profiles جديدة للشركاء\n')
    } else {
      console.log('✅ Vendors الموجودة:\n')
      allVendors.forEach((vendor, i) => {
        console.log(`${i + 1}. ${vendor.storeName}`)
        console.log(`   👤 User: ${vendor.user.name} (${vendor.user.email})`)
        console.log(`   📱 Phone: ${vendor.phone || 'N/A'}`)
        console.log(`   💰 Commission: ${vendor.commissionRate}%`)
        console.log(`   💵 Capital: ${vendor.capitalBalance} EGP`)
        console.log(`   ✅ Active: ${vendor.isActive ? 'نعم' : 'لا'}`)
        console.log(`   ✅ Approved: ${vendor.isApproved ? 'نعم' : 'لا'}`)
        console.log('─'.repeat(80))
      })
    }
    
    // الـ users بصلاحية VENDOR
    const vendorUsers = await prisma.user.count({
      where: { role: 'VENDOR' }
    })
    
    console.log(`\n📊 إجمالي Users بصلاحية VENDOR: ${vendorUsers}`)
    console.log(`📊 إجمالي Vendor records: ${allVendors.length}`)
    console.log(`📊 الفرق: ${vendorUsers - allVendors.length} شريك بدون vendor profile\n`)
    
  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkVendorTable()
