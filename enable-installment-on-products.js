const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function enableInstallmentOnProducts() {
  try {
    console.log('🔄 جاري تفعيل التقسيط على المنتجات...\n');

    // تحديث جميع المنتجات المرئية لتفعيل التقسيط عليها
    const result = await prisma.product.updateMany({
      where: {
        isVisible: true,
        // اختياري: يمكن إضافة شرط السعر (مثلاً المنتجات أكثر من 500 جنيه)
        price: {
          gte: 100 // المنتجات بسعر 100 جنيه فأكثر
        }
      },
      data: {
        allowInstallment: true
      }
    });

    console.log(`✅ تم تفعيل التقسيط على ${result.count} منتج\n`);

    // عرض بعض المنتجات التي تم تفعيل التقسيط عليها
    const productsWithInstallment = await prisma.product.findMany({
      where: {
        allowInstallment: true
      },
      take: 10,
      select: {
        id: true,
        name: true,
        price: true,
        allowInstallment: true
      }
    });

    console.log('📦 أمثلة على المنتجات القابلة للتقسيط:\n');
    productsWithInstallment.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   💰 السعر: ${product.price} ج`);
      console.log(`   🏦 التقسيط: مفعّل ✅\n`);
    });

    console.log('✨ تم بنجاح! الآن يمكنك إضافة أي منتج للسلة وسيظهر خيار التقسيط');

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

enableInstallmentOnProducts();
