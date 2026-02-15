const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function enableInstallmentPaymentMethod() {
  try {
    console.log('🔄 جاري تفعيل طريقة دفع التقسيط...\n');

    // تحديث أو إنشاء إعداد التقسيط
    const setting = await prisma.systemSettings.upsert({
      where: {
        key: 'payment_method_installment'
      },
      update: {
        value: 'true'
      },
      create: {
        key: 'payment_method_installment',
        value: 'true',
        description: 'تفعيل طريقة دفع التقسيط على 4 دفعات'
      }
    });

    console.log('✅ تم تفعيل طريقة دفع التقسيط بنجاح!\n');
    console.log('الإعداد:', setting);
    
    // عرض جميع إعدادات طرق الدفع الحالية
    const paymentSettings = await prisma.systemSettings.findMany({
      where: {
        key: {
          startsWith: 'payment_method_'
        }
      }
    });
    
    console.log('\n📊 جميع طرق الدفع المفعّلة:');
    paymentSettings.forEach(s => {
      const isEnabled = s.value !== 'false';
      console.log(`${isEnabled ? '✅' : '❌'} ${s.key}: ${s.value}`);
    });
    
    console.log('\n✨ تم بنجاح! جرب دلوقتي تروح صفحة الدفع وهيظهر خيار التقسيط');

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

enableInstallmentPaymentMethod();
