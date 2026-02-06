import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔔 فحص الإشعارات...\n');

  // عرض إشعارات الشركاء
  const vendorNotifications = await prisma.vendorNotification.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // عرض إشعارات العملاء
  const customerNotifications = await prisma.customerNotification.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const totalNotifications = vendorNotifications.length + customerNotifications.length;

  console.log(`📊 إجمالي الإشعارات: ${totalNotifications}`);
  console.log(`   👔 إشعارات الشركاء: ${vendorNotifications.length}`);
  console.log(`   👤 إشعارات العملاء: ${customerNotifications.length}\n`);

  if (vendorNotifications.length > 0) {
    console.log('🔔 إشعارات الشركاء:\n');
    for (const notif of vendorNotifications) {
      console.log(`  📌 ${notif.title}`);
      console.log(`     💬 ${notif.message}`);
      console.log(`     🆔 ${notif.vendorId}`);
      console.log(`     📅 ${notif.createdAt.toLocaleString('ar-EG')}`);
      console.log(`     ✅ مقروء: ${notif.isRead ? 'نعم' : 'لا'}`);
      console.log();
    }
  }

  if (customerNotifications.length > 0) {
    console.log('🔔 إشعارات العملاء:\n');
    for (const notif of customerNotifications) {
      console.log(`  📌 ${notif.title}`);
      console.log(`     💬 ${notif.message}`);
      console.log(`     🆔 ${notif.customerId}`);
      console.log(`     📅 ${notif.createdAt.toLocaleString('ar-EG')}`);
      console.log(`     ✅ مقروء: ${notif.isRead ? 'نعم' : 'لا'}`);
      console.log();
    }
  }

  // حذف الإشعارات إذا تم تمرير DELETE_NOTIFICATIONS=true
  if (process.env.DELETE_NOTIFICATIONS === 'true') {
    console.log('🗑️  جاري حذف جميع الإشعارات...\n');
    
    const deletedVendor = await prisma.vendorNotification.deleteMany({});
    const deletedCustomer = await prisma.customerNotification.deleteMany({});
    
    const totalDeleted = deletedVendor.count + deletedCustomer.count;
    console.log(`✅ تم حذف ${totalDeleted} إشعار بنجاح!`);
    console.log(`   👔 حذف ${deletedVendor.count} إشعار شركاء`);
    console.log(`   👤 حذف ${deletedCustomer.count} إشعار عملاء ✨`);
  } else if (totalNotifications > 0) {
    console.log('💡 لحذف الإشعارات، قم بتشغيل:');
    console.log('   $env:DELETE_NOTIFICATIONS="true"; npx tsx clear-notifications.ts\n');
  } else {
    console.log('✅ لا توجد إشعارات');
  }
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
