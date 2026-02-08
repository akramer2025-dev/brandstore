import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const deliveryZones = [
  // القاهرة والجيزة - أرخص الأسعار
  { governorate: 'القاهرة', deliveryFee: 25, minOrderValue: 0, isActive: true },
  { governorate: 'الجيزة', deliveryFee: 25, minOrderValue: 0, isActive: true },
  
  // الإسكندرية
  { governorate: 'الإسكندرية', deliveryFee: 40, minOrderValue: 0, isActive: true },
  
  // محافظات الدلتا - أسعار متوسطة
  { governorate: 'القليوبية', deliveryFee: 35, minOrderValue: 0, isActive: true },
  { governorate: 'الشرقية', deliveryFee: 50, minOrderValue: 0, isActive: true },
  { governorate: 'الدقهلية', deliveryFee: 55, minOrderValue: 0, isActive: true },
  { governorate: 'المنوفية', deliveryFee: 50, minOrderValue: 0, isActive: true },
  { governorate: 'الغربية', deliveryFee: 50, minOrderValue: 0, isActive: true },
  { governorate: 'كفر الشيخ', deliveryFee: 60, minOrderValue: 0, isActive: true },
  { governorate: 'دمياط', deliveryFee: 60, minOrderValue: 0, isActive: true },
  { governorate: 'البحيرة', deliveryFee: 55, minOrderValue: 0, isActive: true },
  { governorate: 'الإسماعيلية', deliveryFee: 50, minOrderValue: 0, isActive: true },
  { governorate: 'بورسعيد', deliveryFee: 55, minOrderValue: 0, isActive: true },
  { governorate: 'السويس', deliveryFee: 50, minOrderValue: 0, isActive: true },
  
  // محافظات القناة
  { governorate: 'شمال سيناء', deliveryFee: 100, minOrderValue: 0, isActive: true },
  { governorate: 'جنوب سيناء', deliveryFee: 100, minOrderValue: 0, isActive: true },
  
  // محافظات الصعيد - أسعار أعلى
  { governorate: 'الفيوم', deliveryFee: 60, minOrderValue: 0, isActive: true },
  { governorate: 'بني سويف', deliveryFee: 60, minOrderValue: 0, isActive: true },
  { governorate: 'المنيا', deliveryFee: 70, minOrderValue: 0, isActive: true },
  { governorate: 'أسيوط', deliveryFee: 75, minOrderValue: 0, isActive: true },
  { governorate: 'سوهاج', deliveryFee: 80, minOrderValue: 0, isActive: true },
  { governorate: 'قنا', deliveryFee: 85, minOrderValue: 0, isActive: true },
  { governorate: 'الأقصر', deliveryFee: 90, minOrderValue: 0, isActive: true },
  { governorate: 'أسوان', deliveryFee: 100, minOrderValue: 0, isActive: true },
  
  // البحر الأحمر
  { governorate: 'البحر الأحمر', deliveryFee: 90, minOrderValue: 0, isActive: true },
  { governorate: 'مرسى مطروح', deliveryFee: 100, minOrderValue: 0, isActive: true },
  { governorate: 'الوادي الجديد', deliveryFee: 110, minOrderValue: 0, isActive: true },
];

async function addDeliveryZonesPrices() {
  console.log('🚀 بدء إضافة أسعار التوصيل للمحافظات...');

  try {
    // حذف الأسعار القديمة أولاً
    await prisma.deliveryZone.deleteMany({});
    console.log('✅ تم حذف الأسعار القديمة');

    // إضافة الأسعار الجديدة
    for (const zone of deliveryZones) {
      await prisma.deliveryZone.create({
        data: zone
      });
      console.log(`✅ تمت إضافة: ${zone.governorate} - ${zone.deliveryFee} ج.م`);
    }

    console.log('\n🎉 تم إضافة جميع أسعار التوصيل بنجاح!');
    console.log(`📊 إجمالي المحافظات: ${deliveryZones.length}`);
    
    // عرض ملخص الأسعار
    console.log('\n📋 ملخص الأسعار:');
    console.log(`- القاهرة والجيزة: 25 ج.م`);
    console.log(`- الإسكندرية: 40 ج.م`);
    console.log(`- محافظات الدلتا: 35-60 ج.م`);
    console.log(`- محافظات الصعيد: 60-100 ج.م`);
    console.log(`- محافظات نائية: 90-110 ج.م`);

  } catch (error) {
    console.error('❌ خطأ في إضافة أسعار التوصيل:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDeliveryZonesPrices();
