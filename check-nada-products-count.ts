import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkNadaProducts() {
  console.log('🔍 فحص منتجات ندى...\n')
  
  try {
    // البحث عن مستخدم ندى
    const nadaUser = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: 'ندى', mode: 'insensitive' } },
          { name: { contains: 'nada', mode: 'insensitive' } },
          { email: { contains: 'nada', mode: 'insensitive' } },
        ]
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
                createdAt: true,
              }
            }
          }
        }
      }
    })

    if (!nadaUser) {
      console.log('❌ لم يتم العثور على حساب ندى')
      return
    }

    console.log('✅ تم العثور على حساب ندى:')
    console.log(`   - الاسم: ${nadaUser.name}`)
    console.log(`   - البريد: ${nadaUser.email}`)
    console.log(`   - الصلاحية: ${nadaUser.role}`)
    console.log('')

    if (!nadaUser.vendor) {
      console.log('❌ ندى ليس لديها حساب بائع (Vendor)')
      return
    }

    const products = nadaUser.vendor.products
    const activeProducts = products.filter(p => p.isActive)
    const inactiveProducts = products.filter(p => !p.isActive)
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0)

    console.log('📊 إحصائيات المنتجات:')
    console.log(`   - إجمالي المنتجات: ${products.length}`)
    console.log(`   - منتجات نشطة: ${activeProducts.length}`)
    console.log(`   - منتجات غير نشطة: ${inactiveProducts.length}`)
    console.log(`   - إجمالي المخزون: ${totalStock} قطعة`)
    console.log('')

    if (products.length > 0) {
      console.log('📦 قائمة المنتجات:')
      products.forEach((product, index) => {
        const status = product.isActive ? '✅' : '❌'
        console.log(`   ${index + 1}. ${status} ${product.name}`)
        console.log(`      - السعر: ${product.price} جنيه`)
        console.log(`      - المخزون: ${product.stock} قطعة`)
        console.log(`      - تاريخ الإضافة: ${product.createdAt.toLocaleDateString('ar-EG')}`)
        console.log('')
      })
    } else {
      console.log('📭 لا توجد منتجات حالياً')
    }

  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkNadaProducts()
