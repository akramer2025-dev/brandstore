const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteSampleInstallmentOrder() {
  try {
    const orderId = process.argv[2];

    if (!orderId) {
      console.log('❌ يرجى تحديد رقم الطلب');
      console.log('مثال: node delete-sample-installment.js ORDER_ID');
      return;
    }

    console.log('🗑️  جاري حذف الطلب التجريبي...\n');

    // 1. نجيب الطلب
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        installmentPlan: {
          include: {
            payments: true
          }
        }
      }
    });

    if (!order) {
      console.error('❌ الطلب غير موجود!');
      return;
    }

    console.log(`📋 الطلب: ${order.id}`);
    console.log(`💰 المبلغ: ${order.totalAmount} جنيه`);

    // 2. نحذف الدفعات إن وجدت
    if (order.installmentPlan?.payments?.length > 0) {
      await prisma.installmentPayment.deleteMany({
        where: { installmentPlanId: order.installmentPlan.id }
      });
      console.log('✅ تم حذف الدفعات');
    }

    // 3. نحذف خطة التقسيط
    if (order.installmentPlan) {
      await prisma.installmentPlan.delete({
        where: { id: order.installmentPlan.id }
      });
      console.log('✅ تم حذف خطة التقسيط');
    }

    // 4. نحذف منتجات الطلب
    await prisma.orderItem.deleteMany({
      where: { orderId: order.id }
    });
    console.log('✅ تم حذف منتجات الطلب');

    // 5. نحذف الطلب نفسه
    await prisma.order.delete({
      where: { id: order.id }
    });
    console.log('✅ تم حذف الطلب');

    console.log('\n🎉 تم حذف الطلب التجريبي بنجاح!');

  } catch (error) {
    console.error('❌ حدث خطأ:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteSampleInstallmentOrder();
