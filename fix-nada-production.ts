const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// استخدام Production Database URL مباشرة
const DATABASE_URL = "postgresql://neondb_owner:npg_maJHy8UkQ9qP@ep-lucky-frost-ahx6zz7q.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function fixNadaPassword() {
  try {
    console.log('\n🔧 إصلاح حساب nada@gmail.com على Production Database\n');
    console.log('🗄️  Database: Neon PostgreSQL (Production)');
    console.log('═══════════════════════════════════════════════════════\n');

    const email = 'nada@gmail.com';
    
    // 1. Check if user exists
    console.log('1️⃣ البحث عن الحساب...');
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: {
        vendor: true
      }
    });

    if (!user) {
      console.log('   ❌ الحساب غير موجود في قاعدة البيانات!\n');
      return;
    }
    console.log('   ✅ تم العثور على الحساب');
    console.log('   👤 Name:', user.name);
    console.log('   🎭 Role:', user.role);
    console.log('   📅 Created:', user.createdAt);
    console.log('');

    // 2. Generate new password
    console.log('2️⃣ إنشاء كلمة مرور جديدة...');
    const simplePassword = 'nada123'; // كلمة مرور بسيطة وسهلة
    const hashedPassword = await bcrypt.hash(simplePassword, 10);
    console.log('   ✅ تم إنشاء كلمة المرور: nada123');
    console.log('');

    // 3. Update password
    console.log('3️⃣ حفظ كلمة المرور الجديدة...');
    await prisma.user.update({
      where: { email: email },
      data: { 
        password: hashedPassword,
        emailVerified: user.emailVerified || new Date() // تأكد من أن البريد مؤكد
      }
    });
    console.log('   ✅ تم حفظ كلمة المرور بنجاح');
    console.log('');

    // 4. Verify the new password
    console.log('4️⃣ التحقق من كلمة المرور الجديدة...');
    const updatedUser = await prisma.user.findUnique({
      where: { email: email }
    });
    
    if (updatedUser && updatedUser.password) {
      const isValid = await bcrypt.compare(simplePassword, updatedUser.password);
      if (isValid) {
        console.log('   ✅ كلمة المرور صحيحة ومحفوظة!\n');
      } else {
        console.log('   ❌ خطأ في التحقق!\n');
        return;
      }
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ اكتمل الإصلاح بنجاح!\n');
    console.log('🔐 معلومات الدخول الجديدة:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📧 الإيميل: nada@gmail.com');
    console.log('🔑 كلمة المرور: nada123');
    console.log('🌐 الموقع: www.remostore.net/auth/login');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📝 خطوات تسجيل الدخول:');
    console.log('   1. افتح: www.remostore.net/auth/login');
    console.log('   2. الإيميل: nada@gmail.com');
    console.log('   3. الباسوورد: nada123');
    console.log('   4. (كل الحروف صغيرة small letters)\n');

    console.log('💡 نصيحة: امسح الكوكيز والكاش من المتصفح أو استخدم Incognito Mode\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixNadaPassword();
