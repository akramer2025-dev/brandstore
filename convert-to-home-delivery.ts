const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function convertToHomeDelivery() {
  try {
    const orderId = 'cmlck5ubz0002lg04yp0rb2ks';
    
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryMethod: 'HOME_DELIVERY',
        status: 'CONFIRMED'
      },
      select: {
        orderNumber: true,
        status: true,
        deliveryMethod: true
      }
    });

    console.log('\n✅ تم تحويل الطلب بنجاح!\n');
    console.log('رقم الطلب:', updated.orderNumber);
    console.log('الحالة الجديدة:', updated.status);
    console.log('طريقة التوصيل:', updated.deliveryMethod);
    console.log('\n🔗 الرابط:', `https://www.remostore.net/vendor/orders/${orderId}`);
    console.log('\n✨ دلوقتي زر بوسطة هيظهر!');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

convertToHomeDelivery();
