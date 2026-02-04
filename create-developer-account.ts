import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 إنشاء حساب المطور...\n');

  try {
    // التحقق من وجود الحساب
    const existingUser = await prisma.user.findUnique({
      where: { email: 'akram@gmail.com' }
    });

    if (existingUser) {
      console.log('⚠️ الحساب موجود بالفعل!');
      console.log('البريد الإلكتروني:', existingUser.email);
      console.log('الدور:', existingUser.role);
      return;
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash('Aazxc', 10);

    // إنشاء حساب المطور
    const developer = await prisma.user.create({
      data: {
        email: 'akram@gmail.com',
        name: 'Akram',
        username: 'akram',
        role: 'ADMIN',
        password: hashedPassword,
      }
    });

    console.log('✅ تم إنشاء حساب المطور بنجاح!\n');
    console.log('📧 البريد الإلكتروني: akram@gmail.com');
    console.log('🔑 كلمة المرور: Aazxc');
    console.log('👤 الدور: ADMIN');
    console.log('🆔 ID:', developer.id);

  } catch (error) {
    console.error('❌ خطأ في إنشاء الحساب:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
