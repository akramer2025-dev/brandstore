import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('💰 تحديث أسعار الجملة للمنتجات...\n');

    // جلب جميع المنتجات
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        nameAr: true,
        price: true,
        wholesalePrice: true,
      },
    });

    console.log(`📦 تم العثور على ${products.length} منتج\n`);

    let updated = 0;

    for (const product of products) {
      // إذا لم يكن هناك سعر جملة، نحدده بـ 80% من سعر القطعة
      if (!product.wholesalePrice) {
        const wholesalePrice = Math.round(product.price * 0.8 * 100) / 100; // تقريب لأقرب قرشين

        await prisma.product.update({
          where: { id: product.id },
          data: {
            wholesalePrice,
            minWholesaleQuantity: 6, // الحد الأدنى 6 قطع
          },
        });

        console.log(`✅ ${product.nameAr || product.name}:`);
        console.log(`   سعر القطعة: ${product.price} جنيه`);
        console.log(`   سعر الجملة: ${wholesalePrice} جنيه (6 قطع فأكثر)`);
        console.log(`   الوفر: ${(product.price - wholesalePrice).toFixed(2)} جنيه للقطعة\n`);

        updated++;
      }
    }

    console.log(`\n🎉 تم تحديث ${updated} منتج بنجاح!`);
    console.log(`📊 المنتجات الجاهزة للبيع بالجملة: ${products.length}\n`);

    // عرض إحصائيات
    const avgPrice = await prisma.product.aggregate({
      _avg: { price: true, wholesalePrice: true },
    });

    console.log('📈 إحصائيات الأسعار:');
    console.log(`   متوسط سعر القطعة: ${avgPrice._avg.price?.toFixed(2)} جنيه`);
    console.log(`   متوسط سعر الجملة: ${avgPrice._avg.wholesalePrice?.toFixed(2)} جنيه`);
    console.log(`   متوسط الوفر: ${((avgPrice._avg.price || 0) - (avgPrice._avg.wholesalePrice || 0)).toFixed(2)} جنيه\n`);

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
