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
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        vendor: {
          select: {
            storeName: true,
            totalSales: true,
            totalOrders: true,
            commission: true,
            isActive: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`📊 إجمالي الشركاء: ${allPartners.length}`)
    console.log('─'.repeat(80))
    
    if (allPartners.length === 0) {
      console.log('⚠️  لا يوجد أي شركاء في قاعدة البيانات!')
      console.log('\n🔍 التحقق من السجلات المحذوفة أو المعطلة...')
      
      // التحقق من المستخدمين المعطلين
      const inactivePartners = await prisma.vendor.findMany({
        where: {
          isActive: false
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
      
      console.log(`❌ شركاء معطلين: ${inactivePartners.length}`)
      
      if (inactivePartners.length > 0) {
        console.log('\n❌ الشركاء المعطلين:')
        inactivePartners.forEach((vendor, i) => {
          console.log(`${i + 1}. ${vendor.user.name} (${vendor.user.email})`)
          console.log(`   🏪 Store: ${vendor.storeName}`)
          console.log(`   📅 Created: ${vendor.createdAt.toLocaleDateString('ar-EG')}`)
        })
      }
      
    } else {
      console.log('\n✅ الشركاء الموجودين:\n')
      
      allPartners.forEach((partner, index) => {
        console.log(`${index + 1}. ${partner.name}`)
        console.log(`   📧 Email: ${partner.email}`)
        console.log(`   📱 Phone: ${partner.phone || 'N/A'}`)
        console.log(`   🏪 Store: ${partner.vendor?.storeName || 'N/A'}`)
        console.log(`   💰 Sales: ${partner.vendor?.totalSales || 0} EGP`)
        console.log(`   📦 Orders: ${partner.vendor?.totalOrders || 0}`)
        console.log(`   ✅ Active: ${partner.vendor?.isActive ? 'نعم' : 'لا'}`)
        console.log(`   📅 Created: ${partner.createdAt.toLocaleDateString('ar-EG')}`)
        console.log('─'.repeat(80))
      })
    }
    
    // التحقق من المنتجات الخاصة بالشركاء
    console.log('\n📦 فحص منتجات الشركاء...')
    const partnerProducts = await prisma.product.findMany({
      where: {
        vendorId: {
          not: null
        }
      },
      select: {
        id: true,
        nameAr: true,
        vendor: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    console.log(`📦 إجمالي المنتجات للشركاء: ${partnerProducts.length}`)
    
    if (partnerProducts.length > 0) {
      const vendorGroups = partnerProducts.reduce((acc, p) => {
        const vendorName = p.vendor?.name || 'Unknown'
        acc[vendorName] = (acc[vendorName] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
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
