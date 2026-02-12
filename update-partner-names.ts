import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePartnerNames() {
  try {
    console.log('🔄 جاري تحديث أسماء المتاجر...\n');

    // 1. تحديث الشركاء اللي مش عندهم اسم متجر
    const vendorsWithoutStoreName = await prisma.vendor.findMany({
      where: {
        OR: [
          { storeNameAr: null },
          { storeNameAr: '' },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`📝 عدد الشركاء بدون اسم متجر: ${vendorsWithoutStoreName.length}\n`);

    for (const vendor of vendorsWithoutStoreName) {
      const storeName = vendor.businessNameAr || vendor.user?.name || 'متجر الشريك';
      
      await prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          storeNameAr: `متجر ${storeName}`,
          storeName: `متجر ${storeName}`,
        },
      });

      console.log(`✅ تم تحديث: ${vendor.id} → متجر ${storeName}`);
    }

    // 2. تحديث "شريك تجريبي" إلى اسم أفضل
    const testPartner = await prisma.vendor.findFirst({
      where: {
        user: {
          email: 'testpartner@example.com',
        },
      },
      include: {
        user: true,
      },
    });

    if (testPartner && testPartner.user) {
      // نحدّث اسم المستخدم واسم المتجر
      await prisma.user.update({
        where: { id: testPartner.userId },
        data: {
          name: 'أم وليد للملابس',
        },
      });

      await prisma.vendor.update({
        where: { id: testPartner.id },
        data: {
          storeNameAr: 'متجر أم وليد',
          storeName: 'Om Waleed Store',
          businessNameAr: 'أم وليد للملابس',
          businessName: 'Om Waleed Fashion',
        },
      });

      console.log(`\n✅ تم تحديث "شريك تجريبي" → "متجر أم وليد"`);
    }

    console.log('\n✨ تم الانتهاء من التحديثات!');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePartnerNames();
