/**
 * حذف المنتجات التجريبية والاحتفاظ بمنتجات الشركاء فقط
 * 
 * هذا السكريبت يحذف:
 * - المنتجات بدون vendor (منتجات تجريبية)
 * - يمكن تخصيصه لحذف منتجات معينة
 * 
 * الاستخدام:
 * npx ts-node delete-test-products.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteTestProducts() {
  console.log('🔍 جاري البحث عن المنتجات التجريبية...\n')

  try {
    // 1. عرض إحصائيات المنتجات الحالية
    const totalProducts = await prisma.product.count()
    const vendorProducts = await prisma.product.count({
      where: {
        vendorId: { not: null }
      }
    })
    const testProducts = await prisma.product.count({
      where: {
        vendorId: null
      }
    })

    console.log('📊 الإحصائيات الحالية:')
    console.log(`   إجمالي المنتجات: ${totalProducts}`)
    console.log(`   منتجات الشركاء: ${vendorProducts}`)
    console.log(`   منتجات تجريبية (بدون vendor): ${testProducts}\n`)

    // 2. عرض المنتجات التجريبية
    if (testProducts > 0) {
      const testProductsList = await prisma.product.findMany({
        where: {
          vendorId: null
        },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          createdAt: true,
        }
      })

      console.log('🗑️  المنتجات التي سيتم حذفها:')
      testProductsList.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (السعر: ${product.price}ج - المخزون: ${product.stock})`)
      })
      console.log('')

      // 3. حذف عناصر الطلبات المرتبطة (إن وجدت)
      console.log('📦 جاري حذف عناصر الطلبات المرتبطة...')
      const deletedOrderItems = await prisma.orderItem.deleteMany({
        where: {
          product: {
            vendorId: null
          }
        }
      })
      console.log(`   ✅ تم حذف ${deletedOrderItems.count} عنصر طلب\n`)

      // 4. حذف عناصر المخزون المرتبطة
      console.log('📊 جاري حذف عناصر المخزون المرتبطة...')
      const deletedInventoryItems = await prisma.inventoryItem.deleteMany({
        where: {
          product: {
            vendorId: null
          }
        }
      })
      console.log(`   ✅ تم حذف ${deletedInventoryItems.count} عنصر مخزون\n`)

      // 5. حذف عناصر Wishlist المرتبطة
      console.log('❤️  جاري حذف عناصر المفضلة المرتبطة...')
      const deletedWishlistItems = await prisma.wishlistItem.deleteMany({
        where: {
          product: {
            vendorId: null
          }
        }
      })
      console.log(`   ✅ تم حذف ${deletedWishlistItems.count} عنصر مفضلة\n`)

      // 6. حذف التقييمات المرتبطة
      console.log('⭐ جاري حذف التقييمات المرتبطة...')
      const deletedReviews = await prisma.review.deleteMany({
        where: {
          product: {
            vendorId: null
          }
        }
      })
      console.log(`   ✅ تم حذف ${deletedReviews.count} تقييم\n`)

      // 7. حذف المنتجات التجريبية
      console.log('🗑️  جاري حذف المنتجات التجريبية...')
      const deletedProducts = await prisma.product.deleteMany({
        where: {
          vendorId: null
        }
      })
      console.log(`   ✅ تم حذف ${deletedProducts.count} منتج تجريبي\n`)

      // 8. عرض النتائج النهائية
      const remainingProducts = await prisma.product.count()
      console.log('✅ تم الحذف بنجاح!')
      console.log(`   المنتجات المتبقية: ${remainingProducts}`)
      console.log(`   جميع المنتجات المتبقية مرتبطة بالشركاء ✓\n`)
    } else {
      console.log('✓ لا توجد منتجات تجريبية للحذف\n')
    }

    // 9. عرض قائمة منتجات الشركاء المتبقية
    const vendorProductsList = await prisma.product.findMany({
      where: {
        vendorId: { not: null }
      },
      include: {
        vendor: {
          include: {
            user: {
              select: {
                username: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (vendorProductsList.length > 0) {
      console.log('📦 منتجات الشركاء المحفوظة:')
      vendorProductsList.forEach((product, index) => {
        const vendorName = product.vendor?.user.username || product.vendor?.user.email || 'غير معروف'
        console.log(`   ${index + 1}. ${product.name}`)
        console.log(`      الشريك: ${vendorName}`)
        console.log(`      السعر: ${product.price}ج - المخزون: ${product.stock}`)
        console.log(`      تاريخ الإضافة: ${product.createdAt.toLocaleDateString('ar-EG')}\n`)
      })
    }

    console.log('🎉 العملية اكتملت بنجاح!')
    console.log('💡 ملاحظة: كل المنتجات التي يضيفها الشركاء الآن محفوظة بشكل دائم في قاعدة البيانات')
    
  } catch (error) {
    console.error('❌ حدث خطأ:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// تشغيل السكريبت
deleteTestProducts()
  .catch((error) => {
    console.error('❌ فشلت العملية:', error)
    process.exit(1)
  })
