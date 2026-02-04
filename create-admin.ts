import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔧 بدء إنشاء حساب المدير...');

    // التحقق من وجود المستخدم
    const existingUser = await prisma.user.findUnique({
      where: { email: 'akram@gmail.com' },
    });

    if (existingUser) {
      console.log('⚠️  المستخدم موجود بالفعل. سيتم تحديث كلمة المرور...');
      
      // تحديث كلمة المرور
      const hashedPassword = await bcrypt.hash('Aazxc', 10);
      
      await prisma.user.update({
        where: { email: 'akram@gmail.com' },
        data: {
          password: hashedPassword,
          role: 'ADMIN', // تغيير الدور لمدير
        },
      });

      console.log('✅ تم تحديث كلمة المرور والدور بنجاح');
    } else {
      // إنشاء مستخدم جديد
      const hashedPassword = await bcrypt.hash('Aazxc', 10);

      const admin = await prisma.user.create({
        data: {
          name: 'Akram',
          email: 'akram@gmail.com',
          password: hashedPassword,
          role: 'ADMIN', // مدير النظام
          phone: '01000000000',
        },
      });

      console.log('✅ تم إنشاء حساب المدير بنجاح!');
    }

    console.log('\n📧 البريد الإلكتروني: akram@gmail.com');
    console.log('🔑 كلمة المرور: Aazxc');
    console.log('👤 الدور: ADMIN (مدير النظام)\n');

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
