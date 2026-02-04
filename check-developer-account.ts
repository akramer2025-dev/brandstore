import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 فحص حساب المطور...\n');

  try {
    // البحث عن الحساب
    const user = await prisma.user.findUnique({
      where: { email: 'akram@gmail.com' }
    });

    if (!user) {
      console.log('❌ الحساب غير موجود!');
      console.log('\n📝 سأنشئ حساب جديد...\n');
      
      // إنشاء حساب جديد
      const hashedPassword = await bcrypt.hash('Aazxc123', 10);
      
      const newUser = await prisma.user.create({
        data: {
          email: 'akram@gmail.com',
          name: 'Akram',
          username: 'akram',
          role: 'ADMIN',
          password: hashedPassword,
        }
      });

      console.log('✅ تم إنشاء الحساب بنجاح!\n');
      console.log('📧 البريد الإلكتروني: akram@gmail.com');
      console.log('🔑 كلمة المرور: Aazxc123');
      console.log('👤 الدور:', newUser.role);
      console.log('🆔 ID:', newUser.id);
      
    } else {
      console.log('✅ الحساب موجود!');
      console.log('📧 البريد الإلكتروني:', user.email);
      console.log('👤 الاسم:', user.name);
      console.log('🔑 اسم المستخدم:', user.username);
      console.log('👔 الدور:', user.role);
      console.log('🆔 ID:', user.id);
      console.log('📅 تاريخ الإنشاء:', user.createdAt);
      
      console.log('\n🔄 تحديث كلمة المرور...');
      
      // تحديث كلمة المرور
      const hashedPassword = await bcrypt.hash('Aazxc123', 10);
      
      await prisma.user.update({
        where: { email: 'akram@gmail.com' },
        data: { password: hashedPassword }
      });

      console.log('✅ تم تحديث كلمة المرور بنجاح!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 بيانات الدخول الجديدة:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 البريد: akram@gmail.com');
      console.log('🔑 كلمة المرور: Aazxc123');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
