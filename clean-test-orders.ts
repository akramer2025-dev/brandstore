import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanTestOrders() {
  try {
    console.log('🧹 بدء تنظيف الطلبات التجريبية...\n');

    // 1. حذف جميع الطلبات
    const deletedItems = await prisma.orderItem.deleteMany({});
    console.log(`✅ تم حذف ${deletedItems.count} عنصر طلب`);

    const deletedOrders = await prisma.order.deleteMany({});
    console.log(`✅ تم حذف ${deletedOrders.count} طلب`);

    // 2. إعادة تعيين رأس المال للشركاء
    console.log('\n💰 إعادة تعيين رأس المال للشركاء...');
    const partners = await prisma.partnerCapital.findMany({
      select: {
        id: true,
        partnerName: true,
        capitalAmount: true,
        currentAmount: true,
      },
    });

    for (const partner of partners) {
      // إعادة currentAmount إلى capitalAmount الأصلي
      await prisma.partnerCapital.update({
        where: { id: partner.id },
        data: { currentAmount: partner.capitalAmount },
      });
      console.log(`  ✅ ${partner.partnerName}: ${partner.currentAmount} ← ${partner.capitalAmount} جنيه`);
    }

    // 3. حذف جميع المعاملات المالية للشركاء
    const deletedTransactions = await prisma.capitalTransaction.deleteMany({});
    console.log(`\n✅ تم حذف ${deletedTransactions.count} معاملة مالية`);

    // 4. إعادة تعيين رصيد الشركاء في جدول Vendor
    console.log('\n💼 إعادة تعيين رصيد الشركاء في Vendor...');
    const vendors = await prisma.vendor.findMany({
      include: {
        partners: true,
      },
    });

    for (const vendor of vendors) {
      if (vendor.partners && vendor.partners.length > 0) {
        // استخدام رأس المال من أول شريك
        const partnerCapital = vendor.partners[0].capitalAmount;
        await prisma.vendor.update({
          where: { id: vendor.id },
          data: { 
            capitalBalance: partnerCapital,
            totalSales: 0,
          },
        });
        console.log(`  ✅ ${vendor.partners[0].partnerName}: رصيد = ${partnerCapital} جنيه`);
      }
    }

    // 5. إعادة تعيين مخزون المنتجات
    console.log('\n📦 إعادة تعيين المخزون...');
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stock: true,
      },
    });

    // في الغالب المخزون الأصلي غير معروف، لذلك سنعيده إلى القيم الحالية
    // إذا كنت تريد قيمة محددة، يمكن تعديلها هنا
    console.log(`  ℹ️  لديك ${products.length} منتج في المخزون`);
    console.log(`  💡 المخزون الحالي سيبقى كما هو. إذا أردت إعادة ضبطه، قم بتحديثه يدوياً`);

    console.log('\n✨ تم تنظيف جميع البيانات التجريبية بنجاح!');
    console.log('\n📊 ملخص العمليات:');
    console.log(`   • ${deletedOrders.count} طلب محذوف`);
    console.log(`   • ${deletedItems.count} عنصر طلب محذوف`);
    console.log(`   • ${partners.length} شريك تم إعادة تعيين رأس ماله`);
    console.log(`   • ${deletedTransactions.count} معاملة مالية محذوفة`);
    console.log(`   • ${vendors.length} شريك تم إعادة تعيين رصيده`);

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanTestOrders();
