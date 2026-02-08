const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addDeliveryAddress() {
  try {
    const updated = await prisma.order.update({
      where: { id: 'cmlck5ubz0002lg04yp0rb2ks' },
      data: {
        deliveryAddress: '15 شارع التحرير، الدور الثالث، شقة 5، مدينة نصر',
        governorate: 'القاهرة',
      }
    });

    console.log('\n✅ تم تحديث بيانات التوصيل بنجاح!\n');
    console.log('رقم الطلب:', updated.orderNumber);
    console.log('العنوان:', updated.deliveryAddress);
    console.log('المحافظة:', updated.governorate);
    console.log('\n🚀 دلوقتي جرب زر "إرسال لبوسطة" مرة تانية!');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDeliveryAddress();
