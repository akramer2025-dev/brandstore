import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProducts() {
  try {
    console.log('🔍 فحص المنتجات في قاعدة البيانات...\n')

    // إجمالي المنتجات
    const totalProducts = await prisma.product.count()
    console.log(`📦 إجمالي المنتجات: ${totalProducts}`)

    // المنتجات النشطة
    const activeProducts = await prisma.product.count({
      where: { isActive: true }
    })
    console.log(`✅ المنتجات النشطة (isActive=true): ${activeProducts}`)

    // المنتجات الظاهرة
    const visibleProducts = await prisma.product.count({
      where: { isVisible: true }
    })
    console.log(`👁️ المنتجات الظاهرة (isVisible=true): ${visibleProducts}`)

    // المنتجات النشطة والظاهرة معاً
    const activeAndVisible = await prisma.product.count({
      where: { 
        isActive: true,
        isVisible: true 
      }
    })
    console.log(`🎯 المنتجات النشطة والظاهرة معاً: ${activeAndVisible}`)

    // المنتجات المخفية
    const hiddenProducts = await prisma.product.count({
      where: { 
        OR: [
          { isActive: false },
          { isVisible: false }
        ]
      }
    })
    console.log(`🚫 المنتجات المخفية: ${hiddenProducts}`)

    console.log('\n📊 عينة من المنتجات:')
    const sampleProducts = await prisma.product.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        nameAr: true,
        price: true,
        stock: true,
        isActive: true,
        isVisible: true,
        images: true
      }
    })

    sampleProducts.forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.nameAr || p.name}`)
      console.log(`   - السعر: ${p.price} جنيه`)
      console.log(`   - المخزون: ${p.stock}`)
      console.log(`   - نشط: ${p.isActive ? '✅' : '❌'}`)
      console.log(`   - ظاهر: ${p.isVisible ? '✅' : '❌'}`)
      console.log(`   - صور: ${p.images ? '✅' : '❌'}`)
    })

    // فحص الفئات
    console.log('\n\n📁 فحص الفئات:')
    const totalCategories = await prisma.category.count()
    console.log(`إجمالي الفئات: ${totalCategories}`)

    const categoriesWithProducts = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      take: 5
    })

    categoriesWithProducts.forEach(cat => {
      console.log(`- ${cat.nameAr || cat.name}: ${cat._count.products} منتج`)
    })

  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProducts()
