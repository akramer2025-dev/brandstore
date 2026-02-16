const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function check() {
  try {
    console.log('🔍 فحص نظام التقسيط...\n');
    
    // 1. SystemSettings
    const settings = await prisma.systemSettings.findMany();
    const installmentSetting = settings.find(s => s.key === 'payment_method_installment');
    console.log('📋 الإعدادات:');
    console.log(`   ${installmentSetting?.value === 'true' ? '✅' : '❌'} التقسيط: ${installmentSetting?.value || 'غير موجود'}`);
    
    // 2. Products
    const productsCount = await prisma.product.count({
      where: { allowInstallment: true }
    });
    console.log(`\n📦 المنتجات:`);
    console.log(`   ${productsCount > 0 ? '✅' : '❌'} منتجات مع تقسيط: ${productsCount}`);
    
    const samples = await prisma.product.findMany({
      where: { allowInstallment: true },
      select: { name: true, price: true },
      take: 3
    });
    samples.forEach(p => {
      console.log(`      - ${p.name}: ${p.price} ج`);
    });
    
    // 3. Plans
    const plans = await prisma.installmentPlan.count();
    console.log(`\n💳 خطط التقسيط في الطلبات: ${plans}`);
    
    console.log('\n' + '═'.repeat(60));
    if (installmentSetting?.value === 'true' && productsCount > 0) {
      console.log('✅ النظام سليم في Database!');
      console.log('📋 الإعداد مفعل: ✅');
      console.log(`📦 ${productsCount} منتج قابل للتقسيط: ✅`);
      console.log('\n❓ إذا لم يظهر التقسيط:');
      console.log('   1. افتح المتصفح DevTools (F12)');
      console.log('   2. شوف console.log بحثاً عن:');
      console.log('      - [INSTALLMENT CHECK]');
      console.log('      - [RENDER CHECK]');
      console.log('   3. امسح الكاش: Ctrl + Shift + R');
    } else {
      console.log('❌ المشكلة في Database:');
      if (installmentSetting?.value !== 'true') console.log('   → فعل payment_method_installment');
      if (productsCount === 0) console.log('   → فعل allowInstallment على المنتجات');
    }
    console.log('═'.repeat(60));
    
  } catch (err) {
    console.error('❌ خطأ:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
