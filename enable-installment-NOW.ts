import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enableInstallmentNOW() {
  try {
    console.log('🚀 تفعيل التقسيط على جميع المنتجات...\n');
    
    // تفعيل التقسيط على كل المنتجات
    const result = await prisma.product.updateMany({
      where: {
        // كل المنتجات بدون شرط
      },
      data: {
        allowInstallment: true
      }
    });
    
    console.log(`✅ تم تفعيل التقسيط على ${result.count} منتج!\n`);
    
    // عرض الإحصائيات
    const totalProducts = await prisma.product.count();
    const withInstallment = await prisma.product.count({
      where: { allowInstallment: true }
    });
    
    console.log('📊 الإحصائيات النهائية:');
    console.log(`   ✅ منتجات مع تقسيط: ${withInstallment}`);
    console.log(`   📦 إجمالي المنتجات: ${totalProducts}`);
    console.log(`   📈 النسبة: ${((withInstallment / totalProducts) * 100).toFixed(1)}%`);
    
    console.log('\n🎉 تم بنجاح!\n');
    console.log('الآن:');
    console.log('  1️⃣  افتح السلة');
    console.log('  2️⃣  امسح المنتجات');
    console.log('  3️⃣  ضيفها من جديد');
    console.log('  4️⃣  اذهب للدفع - سيظهر التقسيط! ✅');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

enableInstallmentNOW();
