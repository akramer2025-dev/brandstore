/**
 * حذف المنتجات التجريبية بناءً على الاسم
 * يحذف المنتجات التي أسماؤها تبدأ بـ "Product"
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteTestProductsByName() {
  console.log('🔍 جاري البحث عن المنتجات التجريبية...\n')

  try {
    // 1. البحث عن المنتجات التجريبية
    const testProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { startsWith: 'Product' } },
          { nameAr: { startsWith: 'Product' } },
        ]
      },
      select: {
        id: true,
        name: true,
        nameAr: true,
        price: true,
        stock: true,
        createdAt: true,
        vendor: {
          select: {
            user: {
              select: {
                username: true,
                email: true
              }
            }
          }
        }
      }
    })

    console.log('📊 الإحصائيات:')
    console.log(`   المنتجات التجريبية المكتشفة: ${testProducts.length}\n`)

    if (testProducts.length === 0) {
      console.log('✓ لا توجد منتجات تجريبية للحذف\n')
      return
    }

    // 2. عرض المنتجات التي سيتم حذفها
    console.log('🗑️  المنتجات التي سيتم حذفها:')
    testProducts.forEach((product, index) => {
      const vendorName = product.vendor?.user.username || product.vendor?.user.email || 'غير معروف'
      console.log(`   ${index + 1}. ${product.name} - ${product.nameAr}`)
      console.log(`      السعر: ${product.price}ج - المخزون: ${product.stock}`)
      console.log(`      الشريك: ${vendorName}\n`)
    })

    const productIds = testProducts.map(p => p.id)

    // 3. حذف التبعيات أولاً
    console.log('🗑️  جاري حذف البيانات المرتبطة...\n')

    // حذف عناصر الطلبات
    const deletedOrderItems = await prisma.orderItem.deleteMany({
      where: { productId: { in: productIds } }
    })
    console.log(`   ✅ حذف ${deletedOrderItems.count} عنصر طلب`)

    // حذف عناصر المخزون
    const deletedInventoryItems = await prisma.inventoryItem.deleteMany({
      where: { productId: { in: productIds } }
    })
    console.log(`   ✅ حذف ${deletedInventoryItems.count} عنصر مخزون`)

    // حذف عناصر المفضلة
    const deletedWishlistItems = await prisma.wishlistItem.deleteMany({
      where: { productId: { in: productIds } }
    })
    console.log(`   ✅ حذف ${deletedWishlistItems.count} عنصر مفضلة`)

    // حذف التقييمات
    const deletedReviews = await prisma.review.deleteMany({
      where: { productId: { in: productIds } }
    })
    console.log(`   ✅ حذف ${deletedReviews.count} تقييم`)

    // حذف FabricPieces
    const deletedFabricPieces = await prisma.fabricPiece.deleteMany({
      where: { productId: { in: productIds } }
    })
    console.log(`   ✅ حذف ${deletedFabricPieces.count} قطعة قماش`)

    // حذف Productions
    const deletedProductions = await prisma.production.deleteMany({
      where: { productId: { in: productIds } }
    })
    console.log(`   ✅ حذف ${deletedProductions.count} عملية إنتاج`)

    // حذف SupplierPayments
    const deletedSupplierPayments = await prisma.supplierPayment.deleteMany({
      where: { productId: { in: productIds } }
    })
    console.log(`   ✅ حذف ${deletedSupplierPayments.count} دفعة مورد\n`)

    // 4. حذف المنتجات نفسها
    console.log('🗑️  جاري حذف المنتجات التجريبية...')
    const deletedProducts = await prisma.product.deleteMany({
      where: { id: { in: productIds } }
    })
    console.log(`   ✅ تم حذف ${deletedProducts.count} منتج تجريبي\n`)

    // 5. عرض النتائج النهائية
    const totalProducts = await prisma.product.count()
    const vendorProducts = await prisma.product.count({
      where: { vendorId: { not: null } }
    })

    console.log('✅ تم الحذف بنجاح!')
    console.log(`   المنتجات المتبقية: ${totalProducts}`)
    console.log(`   منتجات الشركاء: ${vendorProducts}\n`)

    // 6. عرض المنتجات المتبقية
    const remainingProducts = await prisma.product.findMany({
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

    if (remainingProducts.length > 0) {
      console.log('📦 المنتجات المتبقية:')
      remainingProducts.forEach((product, index) => {
        const vendorName = product.vendor?.user.username || product.vendor?.user.email || 'غير معروف'
        console.log(`   ${index + 1}. ${product.name}`)
        console.log(`      الشريك: ${vendorName}`)
        console.log(`      السعر: ${product.price}ج - المخزون: ${product.stock}\n`)
      })
    }

    console.log('🎉 العملية اكتملت بنجاح!')
    console.log('💡 المنتجات الحقيقية من الشركاء محفوظة وآمنة')
    
  } catch (error) {
    console.error('❌ حدث خطأ:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// تشغيل السكريبت
deleteTestProductsByName()
  .catch((error) => {
    console.error('❌ فشلت العملية:', error)
    process.exit(1)
  })
