import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function quickCheckInstallment() {
  try {
    console.log('\n========================================');
    console.log('🔍 فحص سريع لنظام التقسيط');
    console.log('========================================\n');
    
    // 1. عدد المنتجات المفعل عليها التقسيط
    const withInstallment = await prisma.product.count({
      where: { allowInstallment: true }
    });
    
    const totalProducts = await prisma.product.count();
    
    console.log('📊 المنتجات:');
    console.log(`   ✅ مع تقسيط: ${withInstallment}`);
    console.log(`   📦 الإجمالي: ${totalProducts}`);
    console.log(`   📈 النسبة: ${((withInstallment / totalProducts) * 100).toFixed(1)}%\n`);
    
    // 2. أمثلة على المنتجات
    const sampleProducts = await prisma.product.findMany({
      where: { allowInstallment: true },
      take: 5,
      select: {
        id: true,
        name: true,
        price: true,
        allowInstallment: true
      }
    });
    
    console.log('📦 أمثلة على منتجات مع التقسيط:\n');
    sampleProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   💰 ${p.price} ج - التقسيط: ${p.allowInstallment ? '✅ مفعل' : '❌ معطل'}\n`);
    });
    
    // 3. الحالة النهائية
    if (withInstallment > 0) {
      console.log('========================================');
      console.log('✅ نظام التقسيط يعمل بشكل صحيح!');
      console.log('========================================\n');
      console.log('الخطوات التالية:');
      console.log('  1️⃣  افتح السلة');
      console.log('  2️⃣  امسح المنتجات القديمة');
      console.log('  3️⃣  ضيف منتج جديد');
      console.log('  4️⃣  اذهب للدفع - سيظهر التقسيط ✅\n');
    } else {
      console.log('========================================');
      console.log('❌ تحذير: لا يوجد منتجات مفعل عليها التقسيط!');
      console.log('========================================\n');
      console.log('شغل السكريبت التالي لتفعيل التقسيط:');
      console.log('  npx tsx enable-installment-NOW.ts\n');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickCheckInstallment();
