const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log('🔍 جاري البحث عن المنتجات...\n');

    // البحث عن كل المنتجات
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        nameAr: true,
        descriptionAr: true,
        price: true,
      }
    });

    console.log(`📦 إجمالي المنتجات: ${allProducts.length}\n`);

    // البحث عن موبايلات
    const mobiles = allProducts.filter(p => 
      p.nameAr?.includes('موبايل') || 
      p.nameAr?.includes('موبيل') ||
      p.nameAr?.includes('جوال') ||
      p.nameAr?.includes('هاتف') ||
      p.descriptionAr?.includes('موبايل') ||
      p.descriptionAr?.includes('موبيل')
    );

    console.log(`📱 منتجات الموبايل (${mobiles.length}):`);
    mobiles.forEach(p => {
      console.log(`  - ${p.nameAr} (${p.price} جنيه)`);
      console.log(`    الوصف: ${p.descriptionAr?.substring(0, 50)}...`);
    });

    // البحث عن لاب توب
    const laptops = allProducts.filter(p => 
      p.nameAr?.includes('لاب توب') || 
      p.nameAr?.includes('لابتوب') ||
      p.nameAr?.includes('كمبيوتر') ||
      p.descriptionAr?.includes('لاب توب') ||
      p.descriptionAr?.includes('لابتوب')
    );

    console.log(`\n💻 منتجات اللاب توب (${laptops.length}):`);
    laptops.forEach(p => {
      console.log(`  - ${p.nameAr} (${p.price} جنيه)`);
      console.log(`    الوصف: ${p.descriptionAr?.substring(0, 50)}...`);
    });

    // اختبار البحث
    console.log('\n\n🧪 اختبار البحث:');
    const searchTerm = 'لاب توب';
    const searchResults = allProducts.filter(p => {
      const matchesName = p.nameAr?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDesc = p.descriptionAr?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesName || matchesDesc;
    });

    console.log(`\n🔎 نتائج البحث عن "${searchTerm}": ${searchResults.length}`);
    searchResults.forEach(p => {
      console.log(`  ✅ ${p.nameAr}`);
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
