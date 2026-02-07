import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicateCoupons() {
  try {
    console.log('🧹 جاري تنظيف الكوبونات المكررة...\n');

    // جلب جميع المستخدمين
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
      },
    });

    let totalCleaned = 0;
    let usersAffected = 0;

    for (const user of users) {
      // جلب كوبونات المستخدم
      const userCoupons = await prisma.coupon.findMany({
        where: {
          userId: user.id,
          isActive: true,
          usedCount: 0,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (userCoupons.length > 1) {
        usersAffected++;
        console.log(`👤 ${user.name || user.username || user.id}:`);
        console.log(`   📋 عدد الكوبونات: ${userCoupons.length}`);

        // الاحتفاظ بأحدث كوبون فقط
        const keepCoupon = userCoupons[0];
        const deleteCoupons = userCoupons.slice(1);

        console.log(`   ✅ الاحتفاظ بـ: ${keepCoupon.code} (${keepCoupon.discount} جنيه)`);

        // حذف الكوبونات الزائدة
        for (const coupon of deleteCoupons) {
          await prisma.coupon.delete({
            where: { id: coupon.id },
          });
          console.log(`   🗑️  حذف: ${coupon.code} (${coupon.discount} جنيه)`);
          totalCleaned++;
        }

        console.log('');
      }
    }

    if (totalCleaned === 0) {
      console.log('✅ لا توجد كوبونات مكررة!\n');
    } else {
      console.log(`\n✅ تم تنظيف ${totalCleaned} كوبون مكرر من ${usersAffected} مستخدم\n`);
    }

    // إحصائيات نهائية
    const activeCoupons = await prisma.coupon.count({
      where: {
        isActive: true,
        usedCount: 0,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    console.log(`📊 إجمالي الكوبونات النشطة المتبقية: ${activeCoupons}\n`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateCoupons();
