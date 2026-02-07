import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCouponCheck() {
  try {
    console.log('🔍 فحص المستخدمين الذين لديهم كوبونات نشطة...\n');

    // جلب جميع المستخدمين
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
      },
    });

    console.log(`👥 إجمالي المستخدمين: ${users.length}\n`);

    for (const user of users) {
      // فحص كوبونات كل مستخدم
      const coupons = await prisma.coupon.findMany({
        where: {
          userId: user.id,
          isActive: true,
          usedCount: 0,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (coupons.length > 0) {
        console.log(`👤 ${user.name || user.username || user.email}:`);
        console.log(`   📧 Email: ${user.email || 'لا يوجد'}`);
        console.log(`   🎫 عدد الكوبونات: ${coupons.length}`);
        
        coupons.forEach(coupon => {
          console.log(`   ├─ ${coupon.code}: ${coupon.discount} جنيه (حد أدنى: ${coupon.minPurchase})`);
          const daysLeft = Math.ceil((coupon.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          console.log(`   └─ صالح لمدة ${daysLeft} يوم`);
        });
        
        console.log('');
      }
    }

    // إحصائيات نهائية
    const totalActiveCoupons = await prisma.coupon.count({
      where: {
        isActive: true,
        usedCount: 0,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    console.log(`\n📊 إجمالي الكوبونات النشطة في النظام: ${totalActiveCoupons}`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCouponCheck();
