import { PrismaClient } from '@prisma/client';
import { requirePasswordBeforeDelete, createBackupBeforeDelete, confirmDeletion } from './safe-delete-protection';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ بدء حذف جميع البيانات...\n');

  // 🔒 طلب الباسورد
  if (!(await requirePasswordBeforeDelete('حذف كل البيانات من القاعدة'))) {
    console.log('❌ العملية ملغية!');
    process.exit(1);
  }

  // 💾 عمل backup إجباري
  await createBackupBeforeDelete('حذف كامل للقاعدة');

  // ✅ تأكيد نهائي
  const totalCount = await prisma.product.count() + await prisma.user.count();
  if (!(await confirmDeletion(totalCount, 'سجل (كل البيانات)'))) {
    console.log('❌ العملية ملغية!');
    process.exit(1);
  }

  console.log('\n⚠️  جاري الحذف...\n');

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
