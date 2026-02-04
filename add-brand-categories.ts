/**
 * إضافة فئات شي إن وترينديول
 * 
 * هذا السكريبت يضيف فئتين احترافيتين:
 * 1. شي إن (Shein)
 * 2. ترينديول (Trendyol)
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addBrandCategories() {
  console.log('🏷️  جاري إضافة فئات العلامات التجارية...\n')

  try {
    const categories = [
      {
        name: 'Shein',
        nameAr: 'شي إن',
        description: 'منتجات شي إن - أزياء عصرية وأسعار مميزة',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&h=300&fit=crop'
      },
      {
        name: 'Trendyol',
        nameAr: 'ترينديول',
        description: 'منتجات ترينديول - أحدث صيحات الموضة',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&h=300&fit=crop'
      }
    ]

    for (const categoryData of categories) {
      // التحقق من وجود الفئة
      const existingCategory = await prisma.category.findFirst({
        where: {
          OR: [
            { name: categoryData.name },
            { nameAr: categoryData.nameAr }
          ]
        }
      })

      if (existingCategory) {
        console.log(`⚠️  الفئة "${categoryData.nameAr}" موجودة بالفعل`)
        continue
      }

      // إضافة الفئة
      const category = await prisma.category.create({
        data: categoryData
      })

      console.log(`✅ تم إضافة فئة "${category.nameAr}" (${category.name})`)
    }

    // عرض جميع الفئات
    console.log('\n📊 جميع الفئات المتاحة:\n')
    const allCategories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        nameAr: 'asc'
      }
    })

    allCategories.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category.nameAr} (${category.name})`)
      console.log(`      المنتجات: ${category._count.products}`)
      if (category.description) {
        console.log(`      الوصف: ${category.description}`)
      }
      console.log('')
    })

    console.log('🎉 تم إضافة الفئات بنجاح!')
    console.log('💡 يمكنك الآن ربط المنتجات بهذه الفئات')
    
  } catch (error) {
    console.error('❌ حدث خطأ:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// تشغيل السكريبت
addBrandCategories()
  .catch((error) => {
    console.error('❌ فشلت العملية:', error)
    process.exit(1)
  })
