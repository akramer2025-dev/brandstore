const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkInstallmentSystem() {
  try {
    console.log('🔍 جاري فحص نظام التقسيط بالكامل...\n');

    // 1. فحص إعدادات النظام
    console.log('📊 1. فحص إعدادات طرق الدفع:');
    const paymentSettings = await prisma.systemSettings.findMany({
      where: {
        OR: [
          { key: { startsWith: 'payment_method_' } },
          { key: { startsWith: 'delivery_method_' } }
        ]
      }
    });

    paymentSettings.forEach(s => {
      const isEnabled = s.value !== 'false';
      console.log(`   ${isEnabled ? '✅' : '❌'} ${s.key}: ${s.value}`);
    });

    const installmentSetting = paymentSettings.find(s => s.key === 'payment_method_installment');
    if (!installmentSetting) {
      console.log('   ⚠️  إعداد التقسيط غير موجود في قاعدة البيانات!');
    } else if (installmentSetting.value === 'false') {
      console.log('   ⚠️  إعداد التقسيط موجود لكن غير مفعّل!');
    }

    // 2. فحص المنتجات القابلة للتقسيط
    console.log('\n📦 2. فحص المنتجات القابلة للتقسيط:');
    const installmentProducts = await prisma.product.findMany({
      where: {
        allowInstallment: true
      },
      take: 10,
      select: {
        id: true,
        name: true,
        price: true,
        isVisible: true,
        isActive: true
      }
    });

    console.log(`   إجمالي المنتجات القابلة للتقسيط: ${installmentProducts.length}`);
    
    if (installmentProducts.length === 0) {
      console.log('   ⚠️  لا توجد منتجات مفعّل عليها التقسيط!');
    } else {
      console.log('\n   أمثلة:');
      installmentProducts.slice(0, 5).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name}`);
        console.log(`      السعر: ${p.price} ج`);
        console.log(`      مرئي: ${p.isVisible ? '✅' : '❌'}`);
        console.log(`      نشط: ${p.isActive ? '✅' : '❌'}`);
      });
    }

    // 3. فحص الاتفاقيات الموجودة
    console.log('\n📄 3. فحص اتفاقيات التقسيط:');
    const agreementsCount = await prisma.installmentAgreement.count();
    console.log(`   إجمالي الاتفاقيات: ${agreementsCount}`);

    // 4. التحقق من وجود جدول SystemSettings
    console.log('\n🗄️  4. التحقق من قاعدة البيانات:');
    try {
      const allSettings = await prisma.systemSettings.findMany();
      console.log(`   ✅ جدول SystemSettings يعمل بشكل صحيح (${allSettings.length} إعداد)`);
    } catch (error) {
      console.log('   ❌ مشكلة في جدول SystemSettings:', error.message);
    }

    // 5. الملخص والتوصيات
    console.log('\n' + '='.repeat(60));
    console.log('📋 الملخص:');
    console.log('='.repeat(60));

    const issues = [];
    
    if (!installmentSetting) {
      issues.push('❌ إعداد التقسيط غير موجود في قاعدة البيانات');
    } else if (installmentSetting.value === 'false') {
      issues.push('❌ إعداد التقسيط غير مفعّل');
    }

    if (installmentProducts.length === 0) {
      issues.push('❌ لا توجد منتجات مفعّل عليها التقسيط');
    }

    if (issues.length > 0) {
      console.log('\n⚠️  المشاكل المكتشفة:');
      issues.forEach(issue => console.log('   ' + issue));
      
      console.log('\n🔧 الحلول:');
      if (!installmentSetting || installmentSetting.value === 'false') {
        console.log('   1. شغّل: node setup-payment-methods.js');
      }
      if (installmentProducts.length === 0) {
        console.log('   2. شغّل: node enable-installment-on-products.js');
      }
    } else {
      console.log('\n✅ النظام يعمل بشكل صحيح!');
      console.log('\nإذا لم يظهر التقسيط في صفحة الدفع:');
      console.log('   1. تأكد إن في منتجات في السلة');
      console.log('   2. اعمل Refresh لصفحة الدفع (F5)');
      console.log('   3. افتح Console في المتصفح (F12) وشوف الأخطاء');
      console.log('   4. تأكد إن رسالة "✅ المنتجات القابلة للتقسيط" ظاهرة في Console');
    }

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInstallmentSystem();
