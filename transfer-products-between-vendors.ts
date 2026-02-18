import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * نقل منتجات من بائع لبائع آخر بطريقة آمنة
 * 
 * الاستخدام:
 * npx tsx transfer-products-between-vendors.ts
 */

async function transferProductsBetweenVendors() {
  try {
    console.log('🔍 جاري التحقق من البيانات...\n');

    // ========== الخطوة 1: حدد معلومات النقل ==========
    const FROM_VENDOR_ID = 'VENDOR_ID_HERE'; // 👈 ضع ID البائع القديم هنا
    const TO_VENDOR_ID = 'NEW_VENDOR_ID_HERE'; // 👈 ضع ID البائع الجديد هنا
    const PRODUCT_IDS = [
      // 👈 ضع IDs المنتجات اللي عاوز تنقلها هنا
      'product_id_1',
      'product_id_2',
      'product_id_3',
    ];

    // ========== الخطوة 2: التحقق من البائع القديم ==========
    const fromVendor = await prisma.vendor.findUnique({
      where: { id: FROM_VENDOR_ID },
      include: { 
        user: true,
        products: { where: { id: { in: PRODUCT_IDS } } }
      }
    });

    if (!fromVendor) {
      throw new Error('❌ البائع القديم غير موجود!');
    }

    console.log(`✅ البائع القديم: ${fromVendor.businessName || fromVendor.user.name}`);
    console.log(`   عدد المنتجات المتاحة: ${fromVendor.products.length}/${PRODUCT_IDS.length}\n`);

    // ========== الخطوة 3: التحقق من البائع الجديد ==========
    const toVendor = await prisma.vendor.findUnique({
      where: { id: TO_VENDOR_ID },
      include: { user: true }
    });

    if (!toVendor) {
      throw new Error('❌ البائع الجديد غير موجود!');
    }

    if (!toVendor.isActive) {
      throw new Error('❌ البائع الجديد غير نشط!');
    }

    console.log(`✅ البائع الجديد: ${toVendor.businessName || toVendor.user.name}`);
    console.log(`   الحالة: ${toVendor.isActive ? 'نشط' : 'غير نشط'}\n`);

    // ========== الخطوة 4: التحقق من المنتجات ==========
    const productsToTransfer = await prisma.product.findMany({
      where: {
        id: { in: PRODUCT_IDS },
        vendorId: FROM_VENDOR_ID
      },
      include: {
        _count: {
          select: {
            orderItems: true,
            reviews: true,
            cartItems: true,
            wishlistItems: true
          }
        }
      }
    });

    if (productsToTransfer.length === 0) {
      throw new Error('❌ لم يتم العثور على منتجات تنتمي للبائع القديم!');
    }

    console.log('📦 المنتجات المراد نقلها:\n');
    productsToTransfer.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   - الطلبات: ${product._count.orderItems}`);
      console.log(`   - التقييمات: ${product._count.reviews}`);
      console.log(`   - في السلة: ${product._count.cartItems}`);
      console.log(`   - في المفضلة: ${product._count.wishlistItems}\n`);
    });

    // ========== الخطوة 5: تحذير للمنتجات المرتبطة بطلبات ==========
    const hasOrders = productsToTransfer.some(p => p._count.orderItems > 0);
    if (hasOrders) {
      console.log('⚠️  تحذير: بعض المنتجات مرتبطة بطلبات موجودة!');
      console.log('   سيتم النقل لكن الطلبات القديمة ستظل مرتبطة بالبائع القديم.\n');
    }

    // ========== الخطوة 6: النقل بطريقة Transaction آمنة ==========
    console.log('🚀 جاري نقل المنتجات...\n');

    const result = await prisma.$transaction(async (tx) => {
      // تحديث vendorId لجميع المنتجات
      const updateResult = await tx.product.updateMany({
        where: {
          id: { in: PRODUCT_IDS },
          vendorId: FROM_VENDOR_ID
        },
        data: {
          vendorId: TO_VENDOR_ID
        }
      });

      // تحديث إحصائيات البائع القديم
      await tx.vendor.update({
        where: { id: FROM_VENDOR_ID },
        data: {
          totalSales: {
            decrement: productsToTransfer.length
          }
        }
      });

      // تحديث إحصائيات البائع الجديد
      await tx.vendor.update({
        where: { id: TO_VENDOR_ID },
        data: {
          totalSales: {
            increment: productsToTransfer.length
          }
        }
      });

      // تحديث المخزون إذا كان موجود
      const inventoryItems = await tx.inventoryItem.findMany({
        where: { 
          productId: { in: PRODUCT_IDS },
          vendorId: FROM_VENDOR_ID
        }
      });

      if (inventoryItems.length > 0) {
        await tx.inventoryItem.updateMany({
          where: {
            productId: { in: PRODUCT_IDS },
            vendorId: FROM_VENDOR_ID
          },
          data: {
            vendorId: TO_VENDOR_ID
          }
        });
        console.log(`   ✅ تم تحديث ${inventoryItems.length} عنصر في المخزون`);
      }

      return updateResult;
    });

    // ========== الخطوة 7: تأكيد النجاح ==========
    console.log('\n✅ تم نقل المنتجات بنجاح!\n');
    console.log('📊 ملخص العملية:');
    console.log(`   - عدد المنتجات المنقولة: ${result.count}`);
    console.log(`   - من: ${fromVendor.businessName || fromVendor.user.name}`);
    console.log(`   - إلى: ${toVendor.businessName || toVendor.user.name}\n`);

    // ========== الخطوة 8: التحقق النهائي ==========
    const verifyProducts = await prisma.product.findMany({
      where: { 
        id: { in: PRODUCT_IDS },
        vendorId: TO_VENDOR_ID
      },
      select: { id: true, name: true, vendorId: true }
    });

    console.log('🔍 التحقق النهائي من المنتجات المنقولة:\n');
    verifyProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ✅ تم النقل`);
    });

  } catch (error) {
    console.error('\n❌ حدث خطأ أثناء نقل المنتجات:\n');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
transferProductsBetweenVendors();
