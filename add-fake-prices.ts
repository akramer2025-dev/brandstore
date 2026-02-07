import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addFakePrices() {
  try {
    console.log('💰 إضافة أسعار وهمية لجميع المنتجات...\n');

    // جلب جميع المنتجات
    const products = await prisma.product.findMany({
      select: {
        id: true,
        nameAr: true,
        price: true,
        originalPrice: true,
      },
    });

    console.log(`📦 إجمالي المنتجات: ${products.length}\n`);

    let updated = 0;

    for (const product of products) {
      // إذا كان المنتج لا يحتوي على سعر أصلي، أضف واحدًا
      if (!product.originalPrice || product.originalPrice <= product.price) {
        // نسبة الزيادة الوهمية بين 25% و 45%
        const increasePercentage = 0.25 + Math.random() * 0.2; // بين 25% و 45%
        const fakeOriginalPrice = Math.round(product.price * (1 + increasePercentage));
        
        // تحديث المنتج
        await prisma.product.update({
          where: { id: product.id },
          data: { originalPrice: fakeOriginalPrice },
        });

        const discount = Math.round((increasePercentage * 100));
        console.log(`✅ ${product.nameAr}`);
        console.log(`   السعر الحالي: ${product.price} جنيه`);
        console.log(`   السعر الوهمي: ${fakeOriginalPrice} جنيه (خصم ${discount}%)`);
        console.log(`   الوفورات: ${fakeOriginalPrice - product.price} جنيه\n`);
        
        updated++;
      } else {
        console.log(`⏭️  ${product.nameAr} - لديه سعر أصلي بالفعل (${product.originalPrice} جنيه)`);
      }
    }

    console.log(`\n✅ تم تحديث ${updated} منتج بنجاح!`);
    console.log(`⏭️  تم تخطي ${products.length - updated} منتج (لديهم أسعار أصلية بالفعل)`);

    // إحصائيات نهائية
    const avgDiscount = await prisma.product.aggregate({
      where: {
        originalPrice: {
          not: null,
          gt: 0,
        },
      },
      _avg: {
        price: true,
        originalPrice: true,
      },
    });

    if (avgDiscount._avg.price && avgDiscount._avg.originalPrice) {
      const avgDiscountPercent = Math.round(
        ((avgDiscount._avg.originalPrice - avgDiscount._avg.price) / avgDiscount._avg.originalPrice) * 100
      );
      console.log(`\n📊 متوسط الخصم في المتجر: ${avgDiscountPercent}%`);
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addFakePrices();
