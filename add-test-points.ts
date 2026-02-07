import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestPoints() {
  try {
    console.log('⭐ إضافة نقاط اختبارية للمستخدمين...\n');

    // جلب بعض المستخدمين للاختبار
    const users = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
      },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
      },
    });

    if (users.length === 0) {
      console.log('❌ لا يوجد مستخدمين');
      return;
    }

    console.log(`👥 عدد المستخدمين: ${users.length}\n`);

    for (const user of users) {
      // إضافة نقاط عشوائية بين 50-200
      const pointsToAdd = Math.floor(Math.random() * 151) + 50;
      
      // تحديث النقاط
      await prisma.user.update({
        where: { id: user.id },
        data: { points: user.points + pointsToAdd },
      });

      // إنشاء سجل للنقاط
      await prisma.pointTransaction.create({
        data: {
          userId: user.id,
          points: pointsToAdd,
          type: 'EARNED',
          description: `مكافأة ترحيبية - ${pointsToAdd} نقطة`,
        },
      });

      console.log(`✅ ${user.name || user.email}:`);
      console.log(`   📊 النقاط قبل: ${user.points}`);
      console.log(`   ⭐ تمت الإضافة: ${pointsToAdd} نقطة`);
      console.log(`   💰 النقاط بعد: ${user.points + pointsToAdd}\n`);
    }

    console.log('✅ تمت إضافة النقاط بنجاح!\n');

    // إحصائيات
    const totalPoints = await prisma.user.aggregate({
      _sum: { points: true },
      _avg: { points: true },
      where: { role: 'CUSTOMER' },
    });

    console.log('📊 إحصائيات النقاط:');
    console.log(`   • إجمالي النقاط: ${totalPoints._sum.points || 0}`);
    console.log(`   • متوسط النقاط: ${Math.round(totalPoints._avg.points || 0)}`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestPoints();
