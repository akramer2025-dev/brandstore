import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function restoreFromBackup() {
  try {
    const backupPath = path.join(__dirname, 'backups', 'backup-2026-02-08T02-59-13-993Z.json')
    console.log(`📂 قراءة الbackup من: ${backupPath}\n`)

    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'))
    const { products, categories, users, orders, vendors } = backupData.data

    console.log('📊 محتويات الbackup:')
    console.log(`  - ${products?.length || 0} منتج`)
    console.log(`  - ${categories?.length || 0} فئة`)
    console.log(`  - ${users?.length || 0} مستخدم`)
    console.log(`  - ${orders?.length || 0} طلب`)
    console.log(`  - ${vendors?.length || 0} متجر`)
    console.log('\n⚠️  هيبدأ الاسترجاع دلوقتي...\n')
    
    // استرجاع الفئات أولاً (بدون العلاقات)
    if (categories && categories.length > 0) {
      console.log('📁 استرجاع الفئات...')
      for (const cat of categories) {
        await prisma.category.create({
          data: {
            id: cat.id,
            name: cat.name,
            nameAr: cat.nameAr,
            description: cat.description,
            image: cat.image,
            createdAt: new Date(cat.createdAt),
            updatedAt: new Date(cat.updatedAt),
          },
        }).catch(err => console.log(`  تخطي ${cat.nameAr}: ${err.message}`))
      }
      console.log(`✅ تم استرجاع ${categories.length} فئة`)
    }

    // استرجاع المستخدمين (بدون العلاقات)
    if (users && users.length > 0) {
      console.log('\n👥 استرجاع المستخدمين...')
      for (const user of users) {
        await prisma.user.create({
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
            image: user.image,
            password: user.password,
            role: user.role,
            phone: user.phone,
            address: user.address,
            isActive: user.isActive,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
          },
        }).catch(err => console.log(`  تخطي ${user.email}: ${err.message}`))
      }
      console.log(`✅ تم استرجاع ${users.length} مستخدم`)
    }

    // استرجاع المتاجر (Vendors)
    if (vendors && vendors.length > 0) {
      console.log('\n🏪 استرجاع المتاجر...')
      for (const vendor of vendors) {
        await prisma.vendor.create({
          data: {
            id: vendor.id,
            name: vendor.name,
            userId: vendor.userId,
            description: vendor.description,
            logo: vendor.logo,
            isActive: vendor.isActive,
            createdAt: new Date(vendor.createdAt),
            updatedAt: new Date(vendor.updatedAt),
          },
        }).catch(err => console.log(`  تخطي ${vendor.name}: ${err.message}`))
      }
      console.log(`✅ تم استرجاع ${vendors.length} متجر`)
    }

    // استرجاع المنتجات
    if (products && products.length > 0) {
      console.log('\n📦 استرجاع المنتجات...')
      for (const product of products) {
        await prisma.product.create({
          data: {
            id: product.id,
            name: product.name,
            nameAr: product.nameAr,
            description: product.description,
            descriptionAr: product.descriptionAr,
            price: product.price,
            originalPrice: product.originalPrice,
            categoryId: product.categoryId,
            images: product.images,
            stock: product.stock,
            isActive: product.isActive,
            vendorId: product.vendorId,
            isOwnProduct: product.isOwnProduct,
            isFlashDeal: product.isFlashDeal,
            flashDealEndsAt: product.flashDealEndsAt ? new Date(product.flashDealEndsAt) : null,
            badge: product.badge,
            soldCount: product.soldCount,
            viewCount: product.viewCount,
            sizes: product.sizes,
            colors: product.colors,
            saleType: product.saleType,
            bundleProducts: product.bundleProducts,
            bundleDiscount: product.bundleDiscount,
            platformCommission: product.platformCommission,
            isVisible: product.isVisible,
            productionCost: product.productionCost,
            isImported: product.isImported,
            importSource: product.importSource,
            marketingStaffId: product.marketingStaffId,
            downPaymentPercent: product.downPaymentPercent,
            deliveryDaysMin: product.deliveryDaysMin,
            deliveryDaysMax: product.deliveryDaysMax,
            importNotes: product.importNotes,
            allowCashOnDelivery: product.allowCashOnDelivery,
            productSource: product.productSource,
            supplierName: product.supplierName,
            supplierPhone: product.supplierPhone,
            supplierCost: product.supplierCost,
            isSupplierPaid: product.isSupplierPaid,
            supplierPaidAt: product.supplierPaidAt ? new Date(product.supplierPaidAt) : null,
            supplierNotes: product.supplierNotes,
            createdAt: new Date(product.createdAt),
            updatedAt: new Date(product.updatedAt),
          },
        }).catch(err => console.log(`  تخطي ${product.nameAr}: ${err.message}`))
      }
      console.log(`✅ تم استرجاع ${products.length} منتج`)
    }

    // استرجاع الطلبات (إذا كانت موجودة)
    if (orders && orders.length > 0) {
      console.log('\n📋 استرجاع الطلبات...')
      let restored = 0
      for (const order of orders) {
        try {
          await prisma.order.create({
            data: {
              id: order.id,
              userId: order.userId,
              vendorId: order.vendorId,
              totalAmount: order.totalAmount,
              status: order.status,
              deliveryName: order.deliveryName,
              deliveryPhone: order.deliveryPhone,
              deliveryAddress: order.deliveryAddress,
              deliveryCity: order.deliveryCity,
              deliveryGovernorate: order.deliveryGovernorate,
              deliveryPostalCode: order.deliveryPostalCode,
              paymentMethod: order.paymentMethod,
              notes: order.notes,
              createdAt: new Date(order.createdAt),
              updatedAt: new Date(order.updatedAt),
            },
          })
          restored++
        } catch (err: any) {
          console.log(`  تخطي طلب ${order.id}: ${err.message}`)
        }
      }
      console.log(`✅ تم استرجاع ${restored} طلب من ${orders.length}`)
    }

    console.log('\n\n✅✅✅ تم استرجاع كل البيانات بنجاح! ✅✅✅')
    console.log('\n🔍 تحقق من البيانات:')
    
    const check = {
      products: await prisma.product.count(),
      categories: await prisma.category.count(),
      users: await prisma.user.count(),
      orders: await prisma.order.count(),
      vendors: await prisma.vendor.count(),
    }

    console.log(`📦 المنتجات: ${check.products}`)
    console.log(`📁 الفئات: ${check.categories}`)
    console.log(`👥 المستخدمين: ${check.users}`)
    console.log(`📋 الطلبات: ${check.orders}`)
    console.log(`🏪 المتاجر: ${check.vendors}`)

  } catch (error) {
    console.error('❌ خطأ في الاسترجاع:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreFromBackup()
