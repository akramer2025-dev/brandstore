const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupAllPaymentMethods() {
  try {
    console.log('🔄 جاري إعداد جميع طرق الدفع...\n');

    const paymentMethods = [
      {
        key: 'payment_method_cash_on_delivery',
        value: 'true',
        description: 'الدفع عند الاستلام'
      },
      {
        key: 'payment_method_bank_transfer',
        value: 'true',
        description: 'تحويل بنكي'
      },
      {
        key: 'payment_method_e_wallet',
        value: 'true',
        description: 'محافظ إلكترونية (فودافون كاش، اتصالات كاش، وي باي)'
      },
      {
        key: 'payment_method_google_pay',
        value: 'true',
        description: 'Google Pay'
      },
      {
        key: 'payment_method_installment',
        value: 'true',
        description: 'التقسيط على 4 دفعات'
      },
      {
        key: 'delivery_method_home_delivery',
        value: 'true',
        description: 'التوصيل للمنزل'
      },
      {
        key: 'delivery_method_store_pickup',
        value: 'true',
        description: 'الاستلام من المتجر'
      }
    ];

    for (const method of paymentMethods) {
      await prisma.systemSettings.upsert({
        where: { key: method.key },
        update: { value: method.value },
        create: method
      });
    }

    console.log('✅ تم إعداد جميع طرق الدفع والتوصيل بنجاح!\n');
    
    // عرض جميع الإعدادات
    const allSettings = await prisma.systemSettings.findMany({
      where: {
        OR: [
          { key: { startsWith: 'payment_method_' } },
          { key: { startsWith: 'delivery_method_' } }
        ]
      },
      orderBy: { key: 'asc' }
    });
    
    console.log('📊 جميع الإعدادات:');
    allSettings.forEach(s => {
      const isEnabled = s.value !== 'false';
      console.log(`${isEnabled ? '✅' : '❌'} ${s.description || s.key}`);
    });
    
    console.log('\n✨ تم بنجاح! اعمل Refresh لصفحة الدفع وهتظهر كل الخيارات');

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAllPaymentMethods();
