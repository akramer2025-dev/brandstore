import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkPassword() {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: 'amalelsayed943@gmail.com'
      }
    });

    if (!user) {
      console.log('❌ لم يتم العثور على المستخدم');
      return;
    }

    console.log('👤 بيانات الحساب:');
    console.log(`   الاسم: ${user.name}`);
    console.log(`   البريد: ${user.email}`);
    console.log(`   الدور: ${user.role}\n`);

    // التحقق من الباسورد الافتراضي
    const defaultPassword = 'Aa123456';
    const isDefaultPassword = await bcrypt.compare(defaultPassword, user.password);

    if (isDefaultPassword) {
      console.log('✅ الباسورد الحالي: Aa123456 (الباسورد الافتراضي)');
    } else {
      console.log('⚠️ الباسورد ليس الافتراضي (تم تغييره من قبل)');
      console.log('💡 استخدم "نسيت كلمة المرور" أو اتصل بالمسؤول');
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPassword();
