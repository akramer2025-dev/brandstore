const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function enableInstallmentForAll() {
  try {
    console.log('🔧 تفعيل التقسيط على كل المنتجات المناسبة...\n');
    
    // تفعيل التقسيط على كل المنتجات ≥ 100 ج
    const result = await prisma.product.updateMany({
      where: {
        price: { gte: 100 },
        allowInstallment: false
      },
      data: {
        allowInstallment: true
      }
    });
    
    console.log(`✅ تم تفعيل التقسيط على ${result.count} منتج!\n`);
    
    // عرض إحصائيات
    const totalWithInstallment = await prisma.product.count({
      where: { allowInstallment: true }
    });
    
    const totalProducts = await prisma.product.count();
    
    console.log('📊 الإحصائيات:');
    console.log(`   ✅ منتجات مع تقسيط: ${totalWithInstallment}`);
    console.log(`   📦 إجمالي المنتجات: ${totalProducts}`);
    console.log(`   📈 النسبة: ${((totalWithInstallment / totalProducts) * 100).toFixed(1)}%`);
    
    console.log('\n🎉 تم التفعيل بنجاح!\n');
    console.log('📱 على الموبايل:');
    console.log('   1. افتح السلة');
    console.log('   2. امسح المنتج');
    console.log('   3. ضيفه من جديد');
    console.log('   4. روح checkout - هيظهر التقسيط! ✅');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

enableInstallmentForAll();
