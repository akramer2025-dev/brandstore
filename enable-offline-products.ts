import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enableOfflineProducts() {
  try {
    console.log('🔧 تفعيل صلاحية البضاعة الخارجية...\n');

    const emails = ['nada@gmail.com', 'radwa@gmail.com'];

    for (const email of emails) {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { vendor: true },
      });

      if (!user) {
        console.log(`❌ المستخدم ${email} غير موجود`);
        continue;
      }

      if (!user.vendor) {
        console.log(`❌ ${email} ليس لديه حساب شريك`);
        continue;
      }

      await prisma.vendor.update({
        where: { id: user.vendor.id },
        data: { canAddOfflineProducts: true },
      });

      console.log(`✅ تم تفعيل صلاحية البضاعة الخارجية لـ ${email}`);
    }

    console.log('\n✅ تم تفعيل الصلاحية بنجاح!');
  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

enableOfflineProducts();
