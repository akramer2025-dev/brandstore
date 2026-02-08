import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const deliveryZones = [
  // Zone 1 - القاهرة والجيزة
  { governorate: 'القاهرة', deliveryFee: 78, minOrderValue: 0, isActive: true },
  { governorate: 'الجيزة', deliveryFee: 78, minOrderValue: 0, isActive: true },
  
  // Zone 2 - الإسكندرية
  { governorate: 'الإسكندرية', deliveryFee: 84, minOrderValue: 0, isActive: true },
  
  // Zone 3 - الدلتا ومدن القناة
  { governorate: 'القليوبية', deliveryFee: 90, minOrderValue: 0, isActive: true },
  { governorate: 'الشرقية', deliveryFee: 90, minOrderValue: 0, isActive: true },
  { governorate: 'الدقهلية', deliveryFee: 90, minOrderValue: 0, isActive: true },
  { governorate: 'المنوفية', deliveryFee: 90, minOrderValue: 0, isActive: true },
  { governorate: 'الغربية', deliveryFee: 90, minOrderValue: 0, isActive: true },
  { governorate: 'كفر الشيخ', deliveryFee: 90, minOrderValue: 0, isActive: true },
  { governorate: 'دمياط', deliveryFee: 90, minOrderValue: 0, isActive: true },
  { governorate: 'البحيرة', deliveryFee: 90, minOrderValue: 0, isActive: true },
  { governorate: 'الإسماعيلية', deliveryFee: 90, minOrderValue: 0, isActive: true },
  { governorate: 'بورسعيد', deliveryFee: 90, minOrderValue: 0, isActive: true },
  { governorate: 'السويس', deliveryFee: 90, minOrderValue: 0, isActive: true },
  
  // Zone 4 - محافظات الصعيد (الفيوم لسوهاج)
  { governorate: 'الفيوم', deliveryFee: 103, minOrderValue: 0, isActive: true },
  { governorate: 'بني سويف', deliveryFee: 103, minOrderValue: 0, isActive: true },
  { governorate: 'المنيا', deliveryFee: 103, minOrderValue: 0, isActive: true },
  { governorate: 'أسيوط', deliveryFee: 103, minOrderValue: 0, isActive: true },
  { governorate: 'سوهاج', deliveryFee: 103, minOrderValue: 0, isActive: true },
  
  // Zone 5 - محافظات الصعيد البعيدة والبحر الأحمر
  { governorate: 'قنا', deliveryFee: 118, minOrderValue: 0, isActive: true },
  { governorate: 'الأقصر', deliveryFee: 118, minOrderValue: 0, isActive: true },
  { governorate: 'أسوان', deliveryFee: 118, minOrderValue: 0, isActive: true },
  { governorate: 'البحر الأحمر', deliveryFee: 118, minOrderValue: 0, isActive: true },
  { governorate: 'مرسى مطروح', deliveryFee: 118, minOrderValue: 0, isActive: true },
  
  // Zone 6 - الساحل الشمالي
  { governorate: 'الساحل الشمالي', deliveryFee: 121, minOrderValue: 0, isActive: true },
  
  // Zone 7 - شرم الشيخ والوادي الجديد وسيناء
  { governorate: 'جنوب سيناء', deliveryFee: 135, minOrderValue: 0, isActive: true },
  { governorate: 'شمال سيناء', deliveryFee: 135, minOrderValue: 0, isActive: true },
  { governorate: 'الوادي الجديد', deliveryFee: 135, minOrderValue: 0, isActive: true },
];

async function updateDeliveryZonesPrices() {
  console.log('🚀 بدء تحديث أسعار التوصيل حسب أسعار بوسطة...');

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

    console.log('\n🎉 تم تحديث جميع أسعار التوصيل بنجاح!');
    console.log(`📊 إجمالي المحافظات: ${deliveryZones.length}`);
    
    // عرض ملخص الأسعار حسب Zones
    console.log('\n📋 ملخص الأسعار (حسب بوسطة):');
    console.log(`- Zone 1 (القاهرة والجيزة): 78 ج.م`);
    console.log(`- Zone 2 (الإسكندرية): 84 ج.م`);
    console.log(`- Zone 3 (الدلتا والقناة): 90 ج.م`);
    console.log(`- Zone 4 (محافظات الصعيد الأولى): 103 ج.م`);
    console.log(`- Zone 5 (محافظات الصعيد البعيدة): 118 ج.م`);
    console.log(`- Zone 6 (الساحل الشمالي): 121 ج.م`);
    console.log(`- Zone 7 (شرم وسيناء والوادي): 135 ج.م`);

  } catch (error) {
    console.error('❌ خطأ في تحديث أسعار التوصيل:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDeliveryZonesPrices();
