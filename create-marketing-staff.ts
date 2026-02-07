import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 إنشاء موظف تسويق تجريبي...');

  try {
    // حذف المستخدم إذا كان موجوداً
    const existingUser = await prisma.user.findUnique({
      where: { email: 'marketing@test.com' },
    });

    if (existingUser) {
      console.log('⚠️ المستخدم موجود بالفعل. سيتم حذفه أولاً...');
      await prisma.user.delete({
        where: { id: existingUser.id },
      });
    }

    // إنشاء مستخدم جديد
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'أحمد محمد - موظف تسويق',
        email: 'marketing@test.com',
        phone: '01012345678',
        password: hashedPassword,
        role: 'MARKETING_STAFF',
      },
    });

    console.log('✅ تم إنشاء المستخدم:', user.id);

    // إنشاء سجل موظف التسويق
    const marketingStaff = await prisma.marketingStaff.create({
      data: {
        userId: user.id,
        name: 'أحمد محمد',
        phone: '01012345678',
        email: 'marketing@test.com',
        commissionRate: 5, // 5% عمولة
        isApproved: true,
        // بيانات الدفع (مثال)
        bankName: 'البنك الأهلي المصري',
        accountNumber: '123456789012',
        accountHolderName: 'أحمد محمد علي',
        iban: 'EG380019000123456789012345678',
        instaPay: '01012345678',
        vodafoneCash: '01012345678',
      },
    });

    console.log('✅ تم إنشاء موظف التسويق:', marketingStaff.id);

    // معلومات تسجيل الدخول
    console.log('\n📝 معلومات تسجيل الدخول:');
    console.log('البريد الإلكتروني: marketing@test.com');
    console.log('كلمة المرور: 123456');
    console.log('\n🔗 رابط لوحة التحكم: /marketing-staff');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
