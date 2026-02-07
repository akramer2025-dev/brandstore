import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserCoupons() {
  try {
    console.log('🔍 فحص كوبونات المستخدمين...\n');
    
    // جلب جميع المستخدمين
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    console.log(`✅ عدد المستخدمين: ${users.length}\n`);

    for (const user of users) {
      console.log(`👤 المستخدم: ${user.name || user.email}`);
      console.log(`   ID: ${user.id}`);

      // جلب كوبونات المستخدم
      const coupons = await prisma.coupon.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log(`   📋 عدد الكوبونات: ${coupons.length}`);

      if (coupons.length > 0) {
        coupons.forEach((coupon, index) => {
          const isExpired = coupon.expiresAt && coupon.expiresAt < new Date();
          const remainingUses = coupon.maxUses - coupon.usedCount;
          const isAvailable = coupon.isActive && !isExpired && remainingUses > 0;
          
          console.log(`\n   ${index + 1}. كوبون ID: ${coupon.id}`);
          console.log(`      💰 الخصم: ${coupon.discount} جنيه`);
          console.log(`      🛒 الحد الأدنى للشراء: ${coupon.minPurchase} جنيه`);
          console.log(`      🔢 الاستخدامات: ${coupon.usedCount}/${coupon.maxUses}`);
          console.log(`      📅 انتهاء الصلاحية: ${coupon.expiresAt?.toLocaleDateString('ar-EG') || 'بدون تاريخ'}`);
          console.log(`      ✅ نشط: ${coupon.isActive ? 'نعم' : 'لا'}`);
          console.log(`      🎯 متاح للاستخدام: ${isAvailable ? 'نعم ✅' : 'لا ❌'}`);
          
          if (isExpired) {
            console.log(`      ⚠️  منتهي الصلاحية`);
          }
          if (remainingUses === 0) {
            console.log(`      ⚠️  تم استخدامه بالكامل`);
          }
          if (!coupon.isActive) {
            console.log(`      ⚠️  غير نشط`);
          }
        });
      }

      console.log('\n' + '━'.repeat(60) + '\n');
    }

    // إحصائيات عامة
    const allCoupons = await prisma.coupon.findMany();
    const activeCoupons = allCoupons.filter(c => 
      c.isActive && 
      (!c.expiresAt || c.expiresAt > new Date()) &&
      c.usedCount < c.maxUses
    );

    console.log('📊 إحصائيات عامة:');
    console.log(`   إجمالي الكوبونات: ${allCoupons.length}`);
    console.log(`   الكوبونات المتاحة: ${activeCoupons.length}`);
    console.log(`   الكوبونات المستخدمة بالكامل: ${allCoupons.filter(c => c.usedCount >= c.maxUses).length}`);
    console.log(`   الكوبونات المنتهية: ${allCoupons.filter(c => c.expiresAt && c.expiresAt < new Date()).length}`);
    console.log(`   الكوبونات غير النشطة: ${allCoupons.filter(c => !c.isActive).length}`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserCoupons();
