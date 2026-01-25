import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ بدء حذف المنتجات غير الملابس...');

  // حذف منتجات الميكياج والعناية بالبشرة (prod18, prod21-prod33)
  const makeupIds = [
    'prod18', 'prod21', 'prod22', 'prod23', 'prod24', 'prod25', 'prod26', 'prod27',
    'prod28', 'prod29', 'prod30', 'prod31', 'prod32', 'prod33'
  ];

  // حذف منتجات الأحذية (prod19, prod20)
  const shoesIds = ['prod19', 'prod20'];

  // حذف منتجات الأدوات المكتبية (prod34-prod60)
  const stationeryIds = [
    'prod34', 'prod35', 'prod36', 'prod37', 'prod38', 'prod39', 'prod40', 'prod41',
    'prod42', 'prod43', 'prod44', 'prod45', 'prod46', 'prod47', 'prod48',
    'prod49', 'prod50', 'prod51', 'prod52', 'prod53', 'prod54', 'prod55',
    'prod56', 'prod57', 'prod58', 'prod59', 'prod60'
  ];

  // حذف منتجات الصيدلية (prod85-prod96)
  const pharmacyIds = [
    'prod85', 'prod86', 'prod87', 'prod88', 'prod89', 'prod90', 'prod91',
    'prod92', 'prod93', 'prod94', 'prod95', 'prod96'
  ];

  const allNonClothingIds = [...makeupIds, ...shoesIds, ...stationeryIds, ...pharmacyIds];

  console.log(`📋 سيتم حذف ${allNonClothingIds.length} منتج`);

  // حذف التقييمات
  console.log('1️⃣ حذف التقييمات...');
  await prisma.review.deleteMany({
    where: {
      productId: {
        in: allNonClothingIds
      }
    }
  });

  // حذف عناصر الأوردرات
  console.log('2️⃣ حذف عناصر الأوردرات...');
  await prisma.orderItem.deleteMany({
    where: {
      productId: {
        in: allNonClothingIds
      }
    }
  });

  // حذف عناصر المفضلة
  console.log('3️⃣ حذف عناصر المفضلة...');
  await prisma.wishlistItem.deleteMany({
    where: {
      productId: {
        in: allNonClothingIds
      }
    }
  });

  // حذف المنتجات نفسها
  console.log('4️⃣ حذف المنتجات...');
  const result = await prisma.product.deleteMany({
    where: {
      id: {
        in: allNonClothingIds
      }
    }
  });

  console.log(`✅ تم حذف ${result.count} منتج بنجاح!`);
  console.log('\n📊 المنتجات المتبقية (الملابس فقط):');
  
  const remainingProducts = await prisma.product.findMany({
    select: {
      id: true,
      nameAr: true,
      category: {
        select: {
          nameAr: true
        }
      }
    }
  });

  console.log(`إجمالي: ${remainingProducts.length} منتج`);
  remainingProducts.forEach((p) => {
    console.log(`- ${p.id}: ${p.nameAr} (${p.category.nameAr})`);
  });
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
