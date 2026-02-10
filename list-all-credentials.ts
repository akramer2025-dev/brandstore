#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getUserCredentials() {
  try {
    console.log('🔐 بيانات تسجيل الدخول لجميع المستخدمين\n')
    console.log('═'.repeat(100))
    
    // جميع المستخدمين
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        password: true,
        createdAt: true,
        vendor: {
          select: {
            storeName: true,
            isApproved: true,
            isActive: true,
          }
        }
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    
    // تجميع حسب الـ role
    const groupedUsers = allUsers.reduce((acc, user) => {
      const role = user.role
      if (!acc[role]) acc[role] = []
      acc[role].push(user)
      return acc
    }, {} as Record<string, typeof allUsers>)
    
    // عرض كل role
    for (const [role, users] of Object.entries(groupedUsers)) {
      let roleNameAr = role
      switch(role) {
        case 'ADMIN': roleNameAr = 'المدير'; break
        case 'CUSTOMER': roleNameAr = 'عميل'; break
        case 'VENDOR': roleNameAr = 'شريك'; break
        case 'DELIVERY_STAFF': roleNameAr = 'موظف توصيل'; break
        case 'MARKETING_STAFF': roleNameAr = 'موظف تسويق'; break
      }
      
      console.log(`\n📋 ${roleNameAr} (${role}) - العدد: ${users.length}`)
      console.log('─'.repeat(100))
      
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name || 'بدون اسم'}`)
        console.log(`   📧 Email: ${user.email || 'N/A'}`)
        console.log(`   👤 Username: ${user.username || 'N/A'}`)
        console.log(`   📱 Phone: ${user.phone || 'N/A'}`)
        
        if (user.password) {
          console.log(`   🔑 Password Hash: ${user.password.substring(0, 40)}...`)
          console.log(`   ⚠️  ملحوظة: كلمة المرور مشفرة (bcrypt)`)
        } else {
          console.log(`   🔑 Password: غير محدد`)
        }
        
        if (user.vendor) {
          console.log(`   🏪 Store: ${user.vendor.storeName}`)
          console.log(`   ✅ Approved: ${user.vendor.isApproved ? 'نعم' : 'لا'}`)
          console.log(`   ✅ Active: ${user.vendor.isActive ? 'نعم' : 'لا'}`)
        }
        
        console.log(`   📅 Created: ${user.createdAt.toLocaleDateString('ar-EG')}`)
      })
      
      console.log('\n' + '═'.repeat(100))
    }
    
    console.log(`\n📊 الإجمالي: ${allUsers.length} مستخدم\n`)
    
    // عرض الحسابات اللي ممكن نسترجع باسوردها
    console.log('\n⚠️  ملاحظة مهمة:')
    console.log('كلمات المرور مشفرة بـ bcrypt ومش ممكن استرجاعها.')
    console.log('\n💡 الحلول المتاحة:')
    console.log('1. إعادة ضبط كلمة مرور لحساب معين')
    console.log('2. تسجيل دخول الشركاء من لوحة التحكم الرئيسية')
    
  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getUserCredentials()
