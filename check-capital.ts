import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCapital() {
  try {
    const vendor = await prisma.vendor.findFirst({
      select: {
        id: true,
        capitalBalance: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!vendor) {
      console.log('❌ لم يتم العثور على حساب بائع');
      return;
    }

    console.log('✅ معلومات الحساب:');
    console.log('   الاسم:', vendor.user.name);
    console.log('   البريد:', vendor.user.email);
    console.log('   رأس المال الحالي:', vendor.capitalBalance, 'جنيه');

    // جلب آخر 5 معاملات
    const transactions = await prisma.capitalTransaction.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log('\n📊 آخر 5 معاملات:');
    if (transactions.length === 0) {
      console.log('   لا توجد معاملات');
    } else {
      transactions.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.descriptionAr || t.description}`);
        console.log(`      النوع: ${t.type}`);
        console.log(`      المبلغ: ${t.amount} جنيه`);
        console.log(`      قبل: ${t.balanceBefore} ج | بعد: ${t.balanceAfter} ج`);
        console.log(`      التاريخ: ${t.createdAt.toLocaleString('ar-EG')}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCapital();
