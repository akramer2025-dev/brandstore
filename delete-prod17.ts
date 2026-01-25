import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ حذف prod17 (طقم أحمر شفاه)...');

  // حذف التقييمات
  await prisma.review.deleteMany({
    where: { productId: 'prod17' }
  });

  // حذف عناصر الأوردرات  
  await prisma.orderItem.deleteMany({
    where: { productId: 'prod17' }
  });

  // حذف عناصر المفضلة
  await prisma.wishlistItem.deleteMany({
    where: { productId: 'prod17' }
  });

  // حذف المنتج
  await prisma.product.delete({
    where: { id: 'prod17' }
  });

  console.log('✅ تم الحذف بنجاح!');
  
  const count = await prisma.product.count();
  console.log(`📊 إجمالي المنتجات: ${count} منتج (ملابس فقط)`);
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
