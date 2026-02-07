import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  try {
    console.log('\n🎯 إضافة موظف تسويق جديد\n');
    console.log('═'.repeat(50));

    // جمع البيانات
    const name = await question('\n👤 الاسم: ');
    const email = await question('📧 البريد الإلكتروني: ');
    const password = await question('🔒 كلمة المرور: ');
    const phone = await question('📱 رقم الهاتف: ');
    const commissionStr = await question('💰 نسبة العمولة (مثال: 5 للـ 5%): ');
    
    const commissionRate = parseFloat(commissionStr);
    
    if (isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
      console.log('\n❌ نسبة العمولة غير صحيحة!');
      rl.close();
      return;
    }

    console.log('\n🔄 جاري الإنشاء...\n');

    // التحقق من وجود المستخدم
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log(`❌ البريد ${email} مستخدم بالفعل!`);
      rl.close();
      return;
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'MARKETING_STAFF',
      },
    });
    console.log(`✅ تم إنشاء المستخدم: ${user.id}`);

    // إنشاء موظف التسويق
    const staff = await prisma.marketingStaff.create({
      data: {
        userId: user.id,
        phone,
        commissionRate,
        totalCommission: 0,
        paidCommission: 0,
        pendingCommission: 0,
      },
    });
    console.log(`✅ تم إنشاء موظف التسويق: ${staff.id}`);

    // إنشاء طريقة دفع افتراضية
    await prisma.marketingPaymentMethod.create({
      data: {
        marketingStaffId: staff.id,
        type: 'INSTAPAY',
        details: phone,
        isDefault: true,
      },
    });
    console.log('✅ تم إنشاء طريقة الدفع (InstaPay)');

    console.log('\n' + '═'.repeat(50));
    console.log('\n✨ تم الإنشاء بنجاح!\n');
    console.log('📝 معلومات تسجيل الدخول:');
    console.log(`   البريد الإلكتروني: ${email}`);
    console.log(`   كلمة المرور: ${password}`);
    console.log(`   رقم الهاتف: ${phone}`);
    console.log(`   نسبة العمولة: ${commissionRate}%`);
    console.log('\n🔗 الروابط المهمة:');
    console.log('   لوحة التحكم: /marketing-staff');
    console.log('   إضافة منتج: /marketing-staff/add-product');
    console.log('\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

main();
