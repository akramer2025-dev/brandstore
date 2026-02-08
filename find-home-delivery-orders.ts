const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findHomeDeliveryOrders() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        deliveryMethod: 'HOME_DELIVERY',
        status: {
          in: ['PENDING', 'CONFIRMED', 'PREPARING']
        }
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        deliveryMethod: true,
        bustaShipmentId: true,
        customer: {
          select: {
            name: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    if (orders.length === 0) {
      console.log('❌ مفيش طلبات توصيل للبيت متاحة حالياً');
      return;
    }

    console.log('\n=== 🚚 طلبات التوصيل للبيت المتاحة ===\n');
    orders.forEach((order, index) => {
      console.log(`${index + 1}. رقم الطلب: ${order.orderNumber}`);
      console.log(`   🔗 الرابط: https://www.remostore.net/vendor/orders/${order.id}`);
      console.log(`   📊 الحالة: ${order.status}`);
      console.log(`   👤 العميل: ${order.customer?.name || 'غير محدد'}`);
      console.log(`   📞 الهاتف: ${order.customer?.phone || 'غير محدد'}`);
      console.log(`   ${order.bustaShipmentId ? '✅ مرسل لبوسطة' : '⏳ لم يرسل لبوسطة بعد'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findHomeDeliveryOrders();
