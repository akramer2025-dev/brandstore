import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 إنشاء موظف تسويق Shein...');

  try {
    // المستخدم الموجود أو الجديد
    const email = 'shein.staff@brandstore.com';
    const phone = '01234567890';
    
    // حذف الموظف القديم إن وجد
    const existingStaff = await prisma.marketingStaff.findFirst({
      where: {
        OR: [
          { phone },
          { email },
        ],
      },
    });

    if (existingStaff) {
      console.log('⚠️ الموظف موجود بالفعل. سيتم حذفه أولاً...');
      await prisma.marketingStaff.delete({
        where: { id: existingStaff.id },
      });
      await prisma.user.delete({
        where: { id: existingStaff.userId },
      });
    }

    // إنشاء مستخدم جديد
    const hashedPassword = await bcrypt.hash('Shein@123', 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'موظف تسويق Shein',
        email,
        phone,
        password: hashedPassword,
        role: 'MARKETING_STAFF',
      },
    });

    console.log('✅ تم إنشاء المستخدم:', user.id);

    // إنشاء سجل موظف التسويق
    const marketingStaff = await prisma.marketingStaff.create({
      data: {
        userId: user.id,
        name: 'موظف Shein',
        phone,
        email,
        commissionRate: 5, // 5% عمولة
        isApproved: true,
        // بيانات الدفع (يمكن تحديثها لاحقاً)
        bankName: 'سيتم التحديث',
        accountNumber: '',
        instaPay: phone,
      },
    });

    console.log('✅ تم إنشاء موظف التسويق:', marketingStaff.id);

    // معلومات تسجيل الدخول
    console.log('\n📝 معلومات تسجيل الدخول:');
    console.log('البريد الإلكتروني: shein.staff@brandstore.com');
    console.log('كلمة المرور: Shein@123');
    console.log('رقم الهاتف: 01234567890');
    console.log('\n🔗 رابط لوحة التحكم: /marketing-staff');
    console.log('🛍️ إضافة منتجات Shein: /marketing-staff/add-product');
    console.log('💡 اختر مصدر الاستيراد: SHEIN');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
