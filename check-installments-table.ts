import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkInstallments() {
  try {
    console.log('🔍 جاري التحقق من جدول الأقساط...\n');

    // عد الاتفاقيات
    const count = await prisma.installmentAgreement.count();
    console.log(`📊 عدد الاتفاقيات: ${count}\n`);

    // جلب آخر 5 اتفاقيات
    const agreements = await prisma.installmentAgreement.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (agreements.length > 0) {
      console.log('✅ آخر الاتفاقيات:');
      agreements.forEach((agreement, index) => {
        console.log(`\n${index + 1}. رقم الاتفاقية: ${agreement.agreementNumber}`);
        console.log(`   العميل: ${agreement.user?.name || 'غير محدد'}`);
        console.log(`   الحالة: ${agreement.status}`);
        console.log(`   المبلغ الإجمالي: ${agreement.totalAmount} جنيه`);
        console.log(`   عدد الأقساط: ${agreement.numberOfInstallments}`);
      });
    } else {
      console.log('⚠️  لا توجد اتفاقيات في قاعدة البيانات');
      console.log('\n💡 يمكنك إنشاء اتفاقية تجريبية من لوحة التحكم');
    }

  } catch (error) {
    console.error('❌ خطأ في التحقق من الجدول:', error);
    console.error('\nالتفاصيل:', (error as Error).message);
  } finally {
    await prisma.$disconnect();
  }
}

checkInstallments();
