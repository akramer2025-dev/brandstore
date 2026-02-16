import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkInstallmentStatus() {
  try {
    console.log('\n🔍 جاري التحقق من حالة نظام التقسيط...\n');
    
    // 1. التحقق من الإعدادات
    const allSettings = await prisma.checkoutSettings.findMany();
    const installmentSetting = allSettings.find(s => s.key === 'payment_method_installment');
    const isInstallmentEnabled = installmentSetting?.value === 'true';
    
    console.log('📊 حالة الإعدادات:');
    console.log(`   ${isInstallmentEnabled ? '✅' : '❌'} التقسيط مفعل: ${isInstallmentEnabled ? 'نعم' : 'لا'}`);
    
    // 2. عدد المنتجات المؤهلة
    const eligibleCount = await prisma.product.count({
      where: { 
        installmentAvailable: true,
        isVisible: true,
        isActive: true
      }
    });
    
    console.log(`\n📦 المنتجات القابلة للتقسيط:`);
    console.log(`   ${eligibleCount > 0 ? '✅' : '❌'} عدد المنتجات: ${eligibleCount} منتج`);
    
    // 3. أمثلة على المنتجات المؤهلة
    const sampleProducts = await prisma.product.findMany({
      where: {
        installmentAvailable: true,
        isVisible: true,
        isActive: true
      },
      take: 5,
      select: {
        id: true,
        name: true,
        price: true,
        installmentAvailable: true
      }
    });
    
    if (sampleProducts.length > 0) {
      console.log(`\n🛍️ أمثلة على منتجات مؤهلة:`);
      sampleProducts.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - ${p.price} ج`);
      });
    }
    
    // 4. التحقق من خطط التقسيط
    const plans = await prisma.installmentPlan.findMany({
      where: { isActive: true }
    });
    console.log(`\n💳 خطط التقسيط النشطة: ${plans.length}`);
    plans.forEach(p => {
      console.log(`   ✓ ${p.name}: ${p.numberOfInstallments} أقساط`);
    });
    
    // النتيجة النهائية
    console.log('\n' + '═'.repeat(60));
    if (isInstallmentEnabled && eligibleCount > 0 && plans.length > 0) {
      console.log('✅ نظام التقسيط يعمل بشكل صحيح!');
      console.log('💡 إذا لم يظهر على الموبايل/اللاب توب:');
      console.log('   1. تأكد من وجود منتجات في السلة');
      console.log('   2. اضغط Ctrl + Shift + R لمسح الكاش');
      console.log('   3. تحقق من console في المتصفح');
    } else {
      console.log('⚠️ نظام التقسيط يحتاج تفعيل:');
      if (!isInstallmentEnabled) {
        console.log('   ❌ الإعدادات غير مفعلة في CheckoutSettings');
      }
      if (eligibleCount === 0) {
        console.log('   ❌ لا توجد منتجات مفعل عليها installmentAvailable');
      }
      if (plans.length === 0) {
        console.log('   ❌ لا توجد خطط تقسيط نشطة');
      }
    }
    console.log('═'.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInstallmentStatus();
