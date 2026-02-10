import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetTolinePassword() {
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

    console.log('🔄 جاري إعادة ضبط الباسورد...\n');

    const defaultPassword = 'Aa123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword
      }
    });

    console.log('✅ تم إعادة ضبط الباسورد بنجاح!\n');
    console.log('📧 البريد: amalelsayed943@gmail.com');
    console.log('🔑 الباسورد الجديد: Aa123456\n');
    console.log('💡 يمكن تسجيل الدخول الآن باستخدام هذا الباسورد');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetTolinePassword();
