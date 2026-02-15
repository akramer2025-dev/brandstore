const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixInstallmentProducts() {
  try {
    console.log('🔧 جاري إصلاح المنتجات...\n');

    // 1. تفعيل جميع المنتجات غير النشطة
    console.log('📦 1. تفعيل المنتجات غير النشطة:');
    const activatedProducts = await prisma.product.updateMany({
      where: {
        isActive: false,
        isVisible: true
      },
      data: {
        isActive: true
      }
    });
    console.log(`   ✅ تم تفعيل ${activatedProducts.count} منتج\n`);

    // 2. تفعيل التقسيط على جميع المنتجات المرئية والنشطة
    console.log('💳 2. تفعيل التقسيط على جميع المنتجات:');
    const installmentEnabled = await prisma.product.updateMany({
      where: {
        isActive: true,
        isVisible: true,
        price: {
          gte: 100 // المنتجات أكثر من 100 جنيه
        }
      },
      data: {
        allowInstallment: true
      }
    });
    console.log(`   ✅ تم تفعيل التقسيط على ${installmentEnabled.count} منتج\n`);

    // 3. عرض المنتجات القابلة للتقسيط
    console.log('📊 3. المنتجات القابلة للتقسيط الآن:');
    const products = await prisma.product.findMany({
      where: {
        allowInstallment: true,
        isActive: true,
        isVisible: true
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true
      },
      take: 20
    });

    console.log(`   إجمالي: ${products.length} منتج\n`);
    
    products.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name}`);
      console.log(`      💰 السعر: ${p.price} ج | 📦 المخزون: ${p.stock}`);
      console.log(`      💳 القسط الشهري: ${(p.price / 4).toFixed(2)} ج × 4\n`);
    });

    console.log('✨ تم التحديث بنجاح!');
    console.log('\n🎯 الخطوات التالية:');
    console.log('   1. اعمل Refresh لصفحة الدفع (Ctrl+Shift+R)');
    console.log('   2. امسح السلة وضيف منتج جديد');
    console.log('   3. روح على http://localhost:3000/checkout');
    console.log('   4. لازم يظهر خيار "🏦 التقسيط على 4 دفعات"');

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixInstallmentProducts();
