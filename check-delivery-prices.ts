import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDeliveryPrices() {
  console.log('🚚 فحص أسعار الشحن في القاعدة...\n');

  try {
    const zones = await prisma.deliveryZone.findMany({
      orderBy: { governorate: 'asc' }
    });

    if (zones.length === 0) {
      console.log('❌ لا توجد أسعار شحن في القاعدة!');
      console.log('\n💡 لإضافة الأسعار، شغل أحد الأوامر التالية:');
      console.log('   npx tsx add-delivery-prices.ts');
      console.log('   npx tsx update-delivery-prices-bosta.ts');
      return;
    }

    console.log(`✅ وجدنا ${zones.length} محافظة مع أسعار الشحن:\n`);

    // تقسيم حسب السعر
    const zones78 = zones.filter(z => z.deliveryFee === 78);
    const zones84 = zones.filter(z => z.deliveryFee === 84);
    const zones90 = zones.filter(z => z.deliveryFee === 90);
    const zones103 = zones.filter(z => z.deliveryFee === 103);
    const zones118 = zones.filter(z => z.deliveryFee >= 118);

    if (zones78.length > 0) {
      console.log('📍 Zone 1 (78 ج.م):');
      zones78.forEach(z => console.log(`   ${z.governorate}`));
      console.log('');
    }

    if (zones84.length > 0) {
      console.log('📍 Zone 2 (84 ج.م):');
      zones84.forEach(z => console.log(`   ${z.governorate}`));
      console.log('');
    }

    if (zones90.length > 0) {
      console.log('📍 Zone 3 (90 ج.م):');
      zones90.forEach(z => console.log(`   ${z.governorate}`));
      console.log('');
    }

    if (zones103.length > 0) {
      console.log('📍 Zone 4 (103 ج.م):');
      zones103.forEach(z => console.log(`   ${z.governorate}`));
      console.log('');
    }

    if (zones118.length > 0) {
      console.log('📍 Zone 5+ (118+ ج.م):');
      zones118.forEach(z => console.log(`   ${z.governorate}: ${z.deliveryFee} ج.م`));
      console.log('');
    }

    console.log('\n📊 ملخص الأسعار:');
    console.log(`   - أرخص سعر: ${Math.min(...zones.map(z => z.deliveryFee))} ج.م`);
    console.log(`   - أعلى سعر: ${Math.max(...zones.map(z => z.deliveryFee))} ج.م`);
    console.log(`   - المحافظات النشطة: ${zones.filter(z => z.isActive).length}/${zones.length}`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDeliveryPrices();
