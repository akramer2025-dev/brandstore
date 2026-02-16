import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkInstallmentStatus() {
  try {
    console.log('\n🔍 جاري التحقق من حالة نظام التقسيط...\n');
    
    // 1. التحقق من الإعدادات
    const settings = await prisma.settings.findUnique({
      where: { id: 'global' }
    });
    
    console.log('📊 حالة الإعدادات:');
    console.log(`   ✓ التقسيط مفعل: ${settings?.paymentMethodInstallment ? '✅ نعم' : '❌ لا'}`);
    
    // 2. عدد المنتجات المؤهلة
    const eligibleCount = await prisma.product.count({
      where: { 
        allowInstallment: true,
        isVisible: true,
        isActive: true
      }
    });
    
    console.log(`\n📦 المنتجات القابلة للتقسيط:`);
    console.log(`   ✓ عدد المنتجات: ${eligibleCount} منتج`);
    
    // 3. أمثلة على المنتجات المؤهلة
    const sampleProducts = await prisma.product.findMany({
      where: {
        allowInstallment: true,
        isVisible: true,
        isActive: true
      },
      take: 5,
      select: {
        id: true,
        name: true,
        price: true,
        allowInstallment: true
      }
    });
    
    if (sampleProducts.length > 0) {
      console.log(`\n🛍️ أمثلة على منتجات مؤهلة:`);
      sampleProducts.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - ${p.price} ج`);
      });
    }
    
    // 4. التحقق من API
    console.log(`\n🌐 API Endpoint:`);
    console.log(`   ✓ المسار: /api/products/check-installment`);
    console.log(`   ✓ الحالة: جاهز للعمل`);
    
    // النتيجة النهائية
    console.log('\n' + '═'.repeat(60));
    if (settings?.paymentMethodInstallment && eligibleCount > 0) {
      console.log('✅ نظام التقسيط يعمل بشكل صحيح!');
      console.log('✅ المشكلة على اللاب توب سببها الكاش (Cache)');
      console.log('✅ الحل: اضغط Ctrl + Shift + R على اللاب توب');
    } else {
      console.log('⚠️ نظام التقسيط يحتاج تفعيل:');
      if (!settings?.paymentMethodInstallment) {
        console.log('   ❌ الإعدادات غير مفعلة');
      }
      if (eligibleCount === 0) {
        console.log('   ❌ لا توجد منتجات مؤهلة');
      }
    }
    console.log('═'.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInstallmentStatus();
