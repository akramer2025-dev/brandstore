import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixOrdersVendor() {
  try {
    console.log('🔍 البحث عن الطلبات بدون vendor...');

    // الحصول على جميع الطلبات بدون vendorId
    const ordersWithoutVendor = await prisma.order.findMany({
      where: {
        vendorId: null,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log(`📦 وجدت ${ordersWithoutVendor.length} طلب بدون vendor`);

    if (ordersWithoutVendor.length === 0) {
      console.log('✅ جميع الطلبات مربوطة بالـ vendors بالفعل');
      return;
    }

    // تحديث كل طلب
    for (const order of ordersWithoutVendor) {
      if (order.items.length === 0) {
        console.log(`⚠️ الطلب ${order.id} ليس له منتجات - تخطي`);
        continue;
      }

      // الحصول على vendorId من أول منتج
      const firstProduct = order.items[0].product;
      
      if (!firstProduct.vendorId) {
        console.log(`⚠️ المنتج ${firstProduct.nameAr} ليس له vendor - تخطي`);
        continue;
      }

      // تحديث الطلب
      await prisma.order.update({
        where: { id: order.id },
        data: {
          vendorId: firstProduct.vendorId,
        },
      });

      console.log(`✅ تم ربط الطلب ${order.orderNumber} بالـ vendor ${firstProduct.vendorId}`);
    }

    console.log('✅ تم إصلاح جميع الطلبات بنجاح!');
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOrdersVendor();
