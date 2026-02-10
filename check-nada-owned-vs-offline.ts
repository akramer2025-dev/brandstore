import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkNadaProductsDetailed() {
  console.log('🔍 فحص منتجات ندى بالتفصيل...\n')
  
  try {
    // البحث عن حساب ندى الأساسي
    const nadaUser = await prisma.user.findFirst({
      where: {
        email: 'nada@gmail.com'
      },
      include: {
        vendor: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                isActive: true,
                vendorId: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        }
      }
    })

    if (!nadaUser || !nadaUser.vendor) {
      console.log('❌ لم يتم العثور على حساب ندى كبائع')
      return
    }

    console.log('✅ حساب ندى:')
    console.log(`   - الاسم: ${nadaUser.name}`)
    console.log(`   - البريد: ${nadaUser.email}`)
    console.log(`   - Vendor ID: ${nadaUser.vendor.id}`)
    console.log('')

    // المنتجات المملوكة (في جدول Product)
    const ownedProducts = nadaUser.vendor.products
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📦 المنتجات المملوكة (Owned Products):')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`   - العدد الإجمالي: ${ownedProducts.length} منتج`)
    console.log(`   - هذه المنتجات يملكها البائع ويديرها بنفسه`)
    console.log(`   - تظهر في المتجر الإلكتروني`)
    console.log(`   - لها مخزون خاص بالبائع`)
    console.log('')

    if (ownedProducts.length > 0) {
      console.log('📋 قائمة المنتجات المملوكة:\n')
      ownedProducts.forEach((product, index) => {
        const status = product.isActive ? '✅' : '❌'
        console.log(`${index + 1}. ${status} ${product.name}`)
        console.log(`   - السعر: ${product.price} جنيه`)
        console.log(`   - المخزون: ${product.stock} قطعة`)
        console.log(`   - ID: ${product.id}`)
        console.log('')
      })
    }

    // منتجات الوسيط (في جدول OfflineProduct)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔄 منتجات الوسيط (Offline Products):')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const offlineProducts = await prisma.offlineProduct.findMany({
      where: {
        vendorId: nadaUser.vendor.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`   - العدد الإجمالي: ${offlineProducts.length} منتج`)
    console.log(`   - منتجات يتم بيعها بالعمولة/الوساطة`)
    console.log(`   - قد تكون من مورد خارجي`)
    console.log(`   - تدار بشكل منفصل عن المتجر الإلكتروني`)
    console.log('')

    if (offlineProducts.length > 0) {
      console.log('📋 قائمة منتجات الوسيط:\n')
      offlineProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name || 'بدون اسم'}`)
        console.log(`   - السعر: ${product.price || 0} جنيه`)
        console.log(`   - الكمية المباعة: ${product.quantity || 0}`)
        console.log(`   - التكلفة: ${product.cost || 0} جنيه`)
        console.log(`   - نوع المعاملة: ${product.transactionType || 'غير محدد'}`)
        console.log(`   - تاريخ المعاملة: ${product.transactionDate ? product.transactionDate.toLocaleDateString('ar-EG') : 'غير محدد'}`)
        console.log(`   - ID: ${product.id}`)
        console.log('')
      })
    }

    // ملخص
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 الملخص النهائي:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`   📦 المنتجات المملوكة: ${ownedProducts.length} منتج`)
    console.log(`   🔄 منتجات الوسيط: ${offlineProducts.length} منتج`)
    console.log(`   📈 الإجمالي الكلي: ${ownedProducts.length + offlineProducts.length} منتج`)
    console.log('')

    console.log('💡 الفرق الرئيسي:')
    console.log('   • المنتجات المملوكة = منتجات المتجر الرئيسية (تظهر للعملاء)')
    console.log('   • منتجات الوسيط = منتجات offline/عمولة (معاملات خارجية)')
    console.log('')

  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkNadaProductsDetailed()
