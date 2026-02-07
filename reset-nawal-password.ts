import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetNawalPassword() {
  try {
    console.log('🔐 إعادة تعيين كلمة المرور للشريك Nawal...\n');

    const newPassword = 'Aa123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
      where: {
        email: 'na2699512@gmail.com'
      },
      data: {
        password: hashedPassword
      }
    });

    console.log('✅ تم تحديث كلمة المرور بنجاح!');
    console.log('\n📋 معلومات تسجيل الدخول:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 الاسم:', user.name);
    console.log('📧 البريد الإلكتروني:', user.email);
    console.log('🔑 كلمة المرور:', newPassword);
    console.log('🎭 الدور:', user.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✨ يمكن الآن تسجيل الدخول باستخدام هذه البيانات!');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetNawalPassword();
