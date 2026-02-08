const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrderDetails() {
  try {
    const order = await prisma.order.findUnique({
      where: { id: 'cmlck5ubz0002lg04yp0rb2ks' },
      include: {
        customer: true
      }
    });

    if (!order) {
      console.log('❌ الطلب غير موجود');
      return;
    }

    console.log('\n=== 📦 تفاصيل الطلب ===\n');
    console.log('رقم الطلب:', order.orderNumber);
    console.log('الحالة:', order.status);
    console.log('طريقة التوصيل:', order.deliveryMethod);
    console.log('\n=== 👤 بيانات العميل ===\n');
    console.log('الاسم:', order.customer?.name || '❌ غير متوفر');
    console.log('الإيميل:', order.customer?.email || '❌ غير متوفر');
    console.log('\n=== 📍 بيانات التوصيل ===\n');
    console.log('التليفون:', order.deliveryPhone || '❌ غير متوفر');
    console.log('العنوان:', order.deliveryAddress || '❌ غير متوفر');
    console.log('المحافظة:', order.governorate || '❌ غير متوفر');
    console.log('المدينة:', order.city || '❌ غير متوفر');
    console.log('\n=== 💰 المبلغ ===\n');
    console.log('المبلغ النهائي:', order.finalAmount);
    
    console.log('\n=== ✅ البيانات المطلوبة لبوسطة ===\n');
    const missingData = [];
    if (!order.customer?.name) missingData.push('❌ اسم العميل');
    if (!order.deliveryPhone) missingData.push('❌ رقم التليفون');
    if (!order.deliveryAddress) missingData.push('❌ العنوان');
    
    if (missingData.length > 0) {
      console.log('⚠️  بيانات ناقصة:');
      missingData.forEach(d => console.log('  ' + d));
    } else {
      console.log('✅ كل البيانات متوفرة!');
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrderDetails();
