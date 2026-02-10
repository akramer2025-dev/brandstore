import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateDeveloperEmail() {
  console.log('🔄 تحديث إيميل المطور...\n');

  try {
    // البحث عن الحساب القديم
    const oldAccount = await prisma.user.findUnique({
      where: { email: 'akramer2025@gmail.com' }
    });

    if (oldAccount) {
      // تحديث الإيميل
      const updated = await prisma.user.update({
        where: { email: 'akramer2025@gmail.com' },
        data: {
          email: 'remostore.egy@gmail.com',
        }
      });

      console.log('✅ تم تحديث الإيميل بنجاح!');
      console.log('\n📧 الإيميل الجديد: remostore.egy@gmail.com');
      console.log('📱 Phone: 01555512778');
      console.log('🔑 Password: Aa123456');
      console.log('\n✅ يمكنك الدخول الآن بالإيميل الجديد!');
    } else {
      console.log('❌ الحساب القديم غير موجود!');
    }

  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateDeveloperEmail();
