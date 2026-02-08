const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrder() {
  try {
    const order = await prisma.order.findUnique({
      where: { id: 'cmlck5ubz0002lg04yp0rb2ks' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        deliveryMethod: true,
        bustaShipmentId: true,
        bustaStatus: true
      }
    });

    if (!order) {
      console.log('❌ الطلب مش موجود');
      return;
    }

    console.log('\n=== 📦 حالة الطلب ===\n');
    console.log('رقم الطلب:', order.orderNumber);
    console.log('الحالة:', order.status);
    console.log('طريقة التوصيل:', order.deliveryMethod);
    console.log('رقم شحنة بوسطة:', order.bustaShipmentId || 'لا يوجد');
    console.log('حالة بوسطة:', order.bustaStatus || 'لا يوجد');
    
    console.log('\n=== 🎯 شروط ظهور الزر ===\n');
    console.log('1️⃣ الحالة ACCEPTED أو PROCESSING:', (order.status === 'ACCEPTED' || order.status === 'PROCESSING') ? '✅' : '❌');
    console.log('2️⃣ طريقة التوصيل HOME_DELIVERY:', order.deliveryMethod === 'HOME_DELIVERY' ? '✅' : '❌');
    
    if ((order.status === 'ACCEPTED' || order.status === 'PROCESSING') && order.deliveryMethod === 'HOME_DELIVERY') {
      console.log('\n✅ الزر المفروض يظهر!\n');
    } else {
      console.log('\n❌ الزر مش هيظهر لأن الشروط مش متحققة\n');
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrder();
