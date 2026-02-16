const { PrismaClient } = require('@prisma/client');

async function activateInstallmentSystem() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 جاري تفعيل نظام التقسيط...\n');
    
    // 1️⃣ تفعيل التقسيط في إعدادات الموقع
    console.log('📋 الخطوة 1: تفعيل التقسيط في الإعدادات العامة...');
    const settings = await prisma.settings.upsert({
      where: { id: 'global' },
      update: {
        paymentMethodInstallment: true,
      },
      create: {
        id: 'global',
        paymentMethodInstallment: true,
        paymentMethodCashOnDelivery: true,
        paymentMethodWePayWallet: true,
        paymentMethodGooglePay: true,
      }
    });
    console.log('✅ تم تفعيل التقسيط في الإعدادات\n');
    
    // 2️⃣ تفعيل التقسيط على المنتجات المؤهلة (السعر > 100 جنيه)
    console.log('📋 الخطوة 2: تفعيل التقسيط على المنتجات المؤهلة...');
    
    const eligibleProducts = await prisma.product.findMany({
      where: {
        price: {
          gte: 100
        },
        allowInstallment: false
      },
      select: {
        id: true,
        name: true,
        price: true
      }
    });
    
    console.log(`📦 وجدت ${eligibleProducts.length} منتج مؤهل للتقسيط`);
    
    if (eligibleProducts.length > 0) {
      await prisma.product.updateMany({
        where: {
          price: {
            gte: 100
          }
        },
        data: {
          allowInstallment: true
        }
      });
      
      console.log('✅ تم تفعيل التقسيط على المنتجات المؤهلة\n');
      
      // عرض بعض المنتجات كمثال
      console.log('📋 أمثلة على المنتجات المفعَّل عليها التقسيط:');
      eligibleProducts.slice(0, 5).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ${product.price} ج`);
      });
      console.log('');
    }
    
    // 3️⃣ التحقق النهائي
    console.log('📊 الخطوة 3: التحقق من التفعيل...');
    
    const currentSettings = await prisma.settings.findUnique({
      where: { id: 'global' }
    });
    
    const productsWithInstallment = await prisma.product.count({
      where: { allowInstallment: true }
    });
    
    console.log('\n✅ ══════════════════════════════════════');
    console.log('✅ تم تفعيل نظام التقسيط بنجاح!');
    console.log('✅ ══════════════════════════════════════\n');
    
    console.log('📊 الإحصائيات النهائية:');
    console.log(`   • التقسيط في الإعدادات: ${currentSettings?.paymentMethodInstallment ? 'مفعَّل ✅' : 'غير مفعَّل ❌'}`);
    console.log(`   • عدد المنتجات المفعَّل عليها التقسيط: ${productsWithInstallment}`);
    console.log(`   • نظام الدفع: 4 دفعات متساوية (25% لكل دفعة)`);
    console.log(`   • الحد الأدنى: 100 جنيه`);
    console.log(`   • رقم WE Pay: 01555512778\n`);
    
    console.log('🎯 الخطوات التالية:');
    console.log('   1. افتح صفحة الدفع في الموقع');
    console.log('   2. اختر منتج بسعر أكثر من 100 جنيه');
    console.log('   3. سترى خيار "التقسيط على 4 دفعات" ✅\n');
    
  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

activateInstallmentSystem();
