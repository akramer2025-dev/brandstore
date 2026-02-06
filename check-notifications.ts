import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNotifications() {
  try {
    console.log('🔍 فحص نظام الإشعارات...\n');

    // فحص المنتجات
    const products = await prisma.product.findMany({
      select: {
        id: true,
        nameAr: true,
        vendorId: true,
      },
      take: 5,
    });

    console.log('📦 المنتجات:');
    products.forEach(product => {
      console.log(`  - ${product.nameAr}: vendorId = ${product.vendorId || '❌ NULL'}`);
    });

    // فحص الطلبات الأخيرة
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        vendorId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log('\n📝 آخر الطلبات:');
    orders.forEach(order => {
      console.log(`  - #${order.orderNumber.slice(0, 8)}: vendorId = ${order.vendorId || '❌ NULL'} (${order.createdAt.toLocaleString('ar-EG')})`);
    });

    // فحص الإشعارات
    const notifications = await prisma.vendorNotification.findMany({
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        isRead: true,
        vendorId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log('\n🔔 الإشعارات:');
    if (notifications.length === 0) {
      console.log('  ❌ لا توجد إشعارات في قاعدة البيانات!');
    } else {
      notifications.forEach(notif => {
        console.log(`  - ${notif.type}: ${notif.title}`);
        console.log(`    vendorId: ${notif.vendorId}`);
        console.log(`    ${notif.isRead ? '✅ مقروء' : '🔵 غير مقروء'}`);
        console.log(`    ${notif.createdAt.toLocaleString('ar-EG')}\n`);
      });
    }

    // فحص الشركاء
    const vendors = await prisma.vendor.findMany({
      select: {
        id: true,
        businessName: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    console.log('\n👥 الشركاء:');
    if (vendors.length === 0) {
      console.log('  ❌ لا توجد حسابات شركاء!');
    } else {
      vendors.forEach(vendor => {
        console.log(`  - ${vendor.businessName} (${vendor.user.email})`);
        console.log(`    ID: ${vendor.id}\n`);
      });
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNotifications();
