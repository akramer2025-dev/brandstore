import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteVendorAccount() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'akram@gmail.com' },
      include: { vendor: true },
    });

    if (!user) {
      console.log('❌ المستخدم غير موجود');
      return;
    }

    if (user.vendor) {
      await prisma.vendor.delete({
        where: { id: user.vendor.id },
      });
      console.log('✅ تم حذف حساب الشريك');
    } else {
      console.log('ℹ️  لا يوجد حساب شريك مرتبط');
    }

    console.log('✅ الحساب الآن: ADMIN فقط');
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteVendorAccount();
