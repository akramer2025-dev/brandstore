import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ بدء حذف جميع البيانات...');

  // حذف كل شيء بالترتيب الصحيح
  await prisma.review.deleteMany({});
  console.log('✅ تم حذف التقييمات');

  await prisma.wishlistItem.deleteMany({});
  console.log('✅ تم حذف المفضلة');

  await prisma.orderItem.deleteMany({});
  console.log('✅ تم حذف تفاصيل الطلبات');

  await prisma.order.deleteMany({});
  console.log('✅ تم حذف الطلبات');

  await prisma.fabricPiece.deleteMany({});
  console.log('✅ تم حذف قطع الأقمشة');

  await prisma.fabric.deleteMany({});
  console.log('✅ تم حذف الأقمشة');

  await prisma.production.deleteMany({});
  console.log('✅ تم حذف الإنتاج');

  await prisma.product.deleteMany({});
  console.log('✅ تم حذف المنتجات');

  await prisma.category.deleteMany({});
  console.log('✅ تم حذف الأصناف');

  await prisma.message.deleteMany({});
  console.log('✅ تم حذف الرسائل');

  await prisma.inventoryLog.deleteMany({});
  console.log('✅ تم حذف سجلات المخزون');

  await prisma.vendorPayout.deleteMany({});
  console.log('✅ تم حذف المدفوعات');

  await prisma.vendor.deleteMany({});
  console.log('✅ تم حذف الشركاء');

  await prisma.deliveryStaff.deleteMany({});
  console.log('✅ تم حذف مندوبي التوصيل');

  await prisma.account.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✅ تم حذف المستخدمين');

  console.log('✅ تم حذف جميع البيانات بنجاح!');
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
