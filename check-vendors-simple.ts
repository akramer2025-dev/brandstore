#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPartnersStatus() {
  try {
    console.log('🔍 فحص حالة الشركاء...\n')
    
    // جميع الشركاء
    const allPartners = await prisma.user.findMany({
      where: {
        role: 'VENDOR'
      },
      include: {
        vendor: true
      }
    })
    
    console.log(`📊 إجمالي الشركاء (VENDOR): ${allPartners.length}`)
    console.log('─'.repeat(80))
    
    if (allPartners.length === 0) {
      console.log('⚠️  لا يوجد أي شركاء بصلاحية VENDOR!\n')
    } else {
      console.log('\n✅ الشركاء الموجودين:\n')
      
      allPartners.forEach((partner, index) => {
        console.log(`${index + 1}. ${partner.name || 'بدون اسم'}`)
        console.log(`   📧 Email: ${partner.email || 'N/A'}`)
        console.log(`   📱 Phone: ${partner.phone || 'N/A'}`)
        console.log(`   🏪 Store: ${partner.vendor?.storeName || 'N/A'}`)
        console.log(`   ✅ Active: ${partner.vendor?.isActive ? 'نعم' : 'لا'}`)
        console.log(`   📅 Created: ${partner.createdAt.toLocaleDateString('ar-EG')}`)
        console.log('─'.repeat(80))
      })
    }
    
    // الشركاء المعطلين
    const inactivePartners = await prisma.vendor.findMany({
      where: {
        isActive: false
      },
      include: {
        user: true
      }
    })
    
    console.log(`\n❌ شركاء معطلين: ${inactivePartners.length}`)
    if (inactivePartners.length > 0) {
      inactivePartners.forEach((vendor, i) => {
        console.log(`${i + 1}. ${vendor.user.name} - ${vendor.storeName}`)
      })
    }
    
    // التحقق من المنتجات
    console.log('\n📦 فحص منتجات الشركاء...')
    const partnerProducts = await prisma.product.findMany({
      where: {
        vendorId: {
          not: null
        }
      },
      include: {
        vendor: {
          include: {
            user: true
          }
        }
      }
    })
    
    console.log(`📦 إجمالي المنتجات للشركاء: ${partnerProducts.length}`)
    
    if (partnerProducts.length > 0) {
      const vendorGroups = partnerProducts.reduce((acc, p) => {
        const vendorName = p.vendor?.user.name || 'Unknown'
        acc[vendorName] = (acc[vendorName] || 0) + 1
        return acc
      },  {} as Record<string, number>)
      
      console.log('\n📊 توزيع المنتجات:')
      Object.entries(vendorGroups).forEach(([vendor, count]) => {
        console.log(`   ${vendor}: ${count} منتج`)
      })
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPartnersStatus()
