import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDeveloper() {
  console.log('🔐 إنشاء حساب المطور...\n');

  try {
    // حذف أي حساب قديم بنفس البيانات
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: 'akramer2025@gmail.com' },
          { phone: '01555512778' }
        ]
      }
    });

    // كلمة المرور: Aa123456
    const hashedPassword = await bcrypt.hash('Aa123456', 10);

    const developer = await prisma.user.create({
      data: {
        name: 'Ahmed Kramer',
        email: 'akramer2025@gmail.com',
        phone: '01555512778',
        password: hashedPassword,
        role: 'ADMIN',
      }
    });

    console.log('✅ تم إنشاء حساب المطور بنجاح!');
    console.log('\n📧 Email: akramer2025@gmail.com');
    console.log('📱 Phone: 01555512778'); 
    console.log('🔑 Password: Aa123456');
    console.log('\n✅ يمكنك الدخول الآن!');

  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createDeveloper();
