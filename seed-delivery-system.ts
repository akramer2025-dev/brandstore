import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDeliverySystem() {
  console.log('🚀 بدء إضافة بيانات نظام التوصيل...\n');

  try {
    // 1. إضافة مناطق التوصيل
    console.log('📍 إضافة مناطق التوصيل...');
    
    const deliveryZones = [
      { governorate: 'القاهرة', deliveryFee: 125, minOrderValue: 0 },
      { governorate: 'الجيزة', deliveryFee: 150, minOrderValue: 0 },
      { governorate: 'الإسكندرية', deliveryFee: 200, minOrderValue: 500 },
      { governorate: 'الشرقية', deliveryFee: 180, minOrderValue: 0 },
      { governorate: 'الدقهلية', deliveryFee: 180, minOrderValue: 0 },
      { governorate: 'القليوبية', deliveryFee: 140, minOrderValue: 0 },
      { governorate: 'المنوفية', deliveryFee: 160, minOrderValue: 0 },
      { governorate: 'البحيرة', deliveryFee: 170, minOrderValue: 0 },
      { governorate: 'الغربية', deliveryFee: 170, minOrderValue: 0 },
      { governorate: 'أسيوط', deliveryFee: 220, minOrderValue: 700 },
      { governorate: 'سوهاج', deliveryFee: 230, minOrderValue: 700 },
      { governorate: 'قنا', deliveryFee: 240, minOrderValue: 800 },
      { governorate: 'الأقصر', deliveryFee: 250, minOrderValue: 800 },
      { governorate: 'أسوان', deliveryFee: 260, minOrderValue: 900 },
    ];

    for (const zone of deliveryZones) {
      await prisma.deliveryZone.upsert({
        where: { governorate: zone.governorate },
        update: zone,
        create: zone,
      });
      console.log(`  ✅ ${zone.governorate}: ${zone.deliveryFee} ج.م`);
    }

    console.log(`\n✅ تم إضافة ${deliveryZones.length} منطقة توصيل\n`);

    // 2. إضافة إعدادات النظام
    console.log('⚙️ إضافة إعدادات النظام...');
    
    const settings = [
      {
        key: 'min_down_payment_percent',
        value: '30',
        description: 'نسبة الدفع المقدم للاستلام من المتجر (من 0 إلى 100)'
      },
      {
        key: 'default_delivery_fee',
        value: '125',
        description: 'رسوم التوصيل الافتراضية (إذا لم تحدد المحافظة)'
      },
      {
        key: 'allow_store_pickup',
        value: 'true',
        description: 'السماح بخيار الاستلام من المتجر'
      },
      {
        key: 'store_pickup_locations',
        value: JSON.stringify([
          '15 شارع الملك فيصل، الجيزة',
          '32 شارع الهرم، الهرم',
          'مول سيتي ستارز، القاهرة'
        ]),
        description: 'مواقع استلام الطلبات (JSON array)'
      },
    ];

    for (const setting of settings) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: { value: setting.value, description: setting.description },
        create: setting,
      });
      console.log(`  ✅ ${setting.key}: ${setting.value}`);
    }

    console.log(`\n✅ تم إضافة ${settings.length} إعداد\n`);

    console.log('🎉 تم إكمال seed بنجاح!');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDeliverySystem();
