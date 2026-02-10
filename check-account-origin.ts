import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAccountOrigin() {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: 'amalelsayed943@gmail.com'
      },
      include: {
        accounts: true, // OAuth accounts
        vendor: true
      }
    });

    if (!user) {
      console.log('❌ لم يتم العثور على المستخدم');
      return;
    }

    console.log('🔍 تحليل أصل الحساب:\n');
    console.log('👤 بيانات المستخدم:');
    console.log(`   الاسم: ${user.name}`);
    console.log(`   البريد: ${user.email}`);
    console.log(`   الدور: ${user.role}`);
    console.log(`   تاريخ الإنشاء: ${user.createdAt.toLocaleString('ar-EG')}`);
    console.log(`   آخر تحديث: ${user.updatedAt.toLocaleString('ar-EG')}\n`);

    // التحقق من OAuth accounts
    if (user.accounts && user.accounts.length > 0) {
      console.log('✅ تم إنشاء الحساب عن طريق OAuth (Google/GitHub)\n');
      console.log('📱 تفاصيل OAuth:\n');
      
      user.accounts.forEach((account, index) => {
        console.log(`${index + 1}. Provider: ${account.provider.toUpperCase()}`);
        console.log(`   Provider Account ID: ${account.providerAccountId}`);
        console.log(`   Type: ${account.type}`);
        console.log(`   Email: ${account.email || 'غير متوفر'}`);
        console.log('');
      });

      if (user.accounts.some(acc => acc.provider === 'google')) {
        console.log('🔵 الحساب تم إنشاؤه عن طريق: Google Sign-In ✅\n');
      } else if (user.accounts.some(acc => acc.provider === 'github')) {
        console.log('⚫ الحساب تم إنشاؤه عن طريق: GitHub Sign-In ✅\n');
      }
    } else {
      console.log('📝 الحساب تم إنشاؤه عن طريق: التسجيل العادي (Email + Password)\n');
    }

    // التحقق من الباسورد
    if (user.password) {
      console.log('🔑 الحساب لديه باسورد محلي: نعم');
      console.log('   (تم إضافة باسورد افتراضي أو تم تغييره لاحقاً)\n');
    } else {
      console.log('🔑 الحساب لديه باسورد محلي: لا');
      console.log('   (يعتمد فقط على OAuth للدخول)\n');
    }

    // معلومات الـ Vendor
    if (user.vendor) {
      console.log('✅ لديه Vendor Account:');
      console.log(`   Vendor ID: ${user.vendor.id}`);
      console.log(`   اسم المتجر: ${user.vendor.storeName || 'غير محدد'}`);
      console.log(`   رأس المال: ${user.vendor.capitalBalance?.toLocaleString() || 0} ج`);
      console.log(`   تاريخ الإنشاء: ${user.vendor.createdAt.toLocaleString('ar-EG')}\n`);
    }

    // استنتاج كيفية الإنشاء
    console.log('📊 الاستنتاج:\n');
    
    if (user.accounts && user.accounts.length > 0) {
      const googleAccount = user.accounts.find(acc => acc.provider === 'google');
      if (googleAccount) {
        console.log('✅ الحساب تم إنشاؤه تلقائياً عند تسجيل الدخول بـ Google');
        console.log('   1. المستخدم ضغط على "تسجيل دخول بـ Google" 🔵');
        console.log('   2. Google أرسل البيانات (الاسم + البريد)');
        console.log('   3. النظام أنشأ حساب جديد تلقائياً');
        console.log('   4. تم تعيين دور "VENDOR" للحساب');
        console.log('   5. تم إنشاء Vendor Account تلقائياً\n');
      }
    } else {
      console.log('⚠️ الحساب تم إنشاؤه يدوياً (ليس من OAuth)');
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAccountOrigin();
