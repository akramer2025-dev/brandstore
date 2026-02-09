import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function restorePasswords() {
  try {
    const password = 'Aa123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    // تحديث nada@gmail.com
    await prisma.user.update({
      where: { email: 'nada@gmail.com' },
      data: { password: hashedPassword }
    });

    // تحديث nada@vendor.com
    await prisma.user.update({
      where: { email: 'nada@vendor.com' },
      data: { password: hashedPassword }
    });

    console.log('✅ تم إرجاع كلمة المرور للحسابين');
    console.log('');
    console.log('📧 nada@gmail.com → Password: Aa123456');
    console.log('📧 nada@vendor.com → Password: Aa123456');
    console.log('');
    console.log('✅ تم الإرجاع بنجاح!');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restorePasswords();
