const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function testLogin() {
  try {
    const email = 'nada@gmail.com';
    const password = '123456';

    console.log('\n🔐 محاولة تسجيل الدخول...\n');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('═══════════════════════════════════════════════════════\n');

    // Step 1: Find user
    console.log('1️⃣ البحث عن المستخدم في قاعدة البيانات...');
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: {
        vendor: true
      }
    });

    if (!user) {
      console.log('   ❌ المستخدم غير موجود!\n');
      return;
    }
    console.log('   ✅ تم العثور على المستخدم\n');

    // Step 2: Check password exists
    console.log('2️⃣ فحص وجود كلمة المرور...');
    if (!user.password) {
      console.log('   ❌ لا توجد كلمة مرور (قد يكون OAuth)\n');
      return;
    }
    console.log('   ✅ كلمة المرور موجودة\n');

    // Step 3: Verify password
    console.log('3️⃣ التحقق من كلمة المرور...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('   ❌ كلمة المرور غير صحيحة!\n');
      
      // Try to find what the actual password might be
      console.log('🔍 جاري اختبار كلمات مرور أخرى...\n');
      const testPasswords = [
        '123456',
        '12345678',
        'password',
        'password123',
        'Nada@123',
        'nada123',
        'Nada123',
        'nada@123',
        '123456789',
        'nada',
        'Nada',
        'NADA',
        'nada@gmail.com'
      ];

      for (const testPw of testPasswords) {
        const match = await bcrypt.compare(testPw, user.password);
        if (match) {
          console.log(`   ✅ كلمة المرور الصحيحة: "${testPw}"\n`);
          break;
        }
      }
      return;
    }
    console.log('   ✅ كلمة المرور صحيحة!\n');

    // Step 4: Check email verification
    console.log('4️⃣ فحص تأكيد البريد الإلكتروني...');
    console.log('   emailVerified:', user.emailVerified || 'null');
    if (!user.emailVerified) {
      console.log('   ⚠️  البريد الإلكتروني غير مؤكد (قد يسبب مشاكل)\n');
    } else {
      console.log('   ✅ البريد الإلكتروني مؤكد\n');
    }

    // Step 5: Display user info
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ تسجيل الدخول نجح!\n');
    console.log('معلومات المستخدم:');
    console.log('  👤 Name:', user.name);
    console.log('  📧 Email:', user.email);
    console.log('  🎭 Role:', user.role);
    console.log('  📱 Phone:', user.phone || 'N/A');
    console.log('  🏪 Vendor:', user.vendor ? 'نعم ✅' : 'لا ❌');
    console.log('  📅 Created:', user.createdAt);
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('💡 إذا كان التسجيل هنا ناجح ولكن فشل في الموقع:');
    console.log('   - تأكد من كتابة الإيميل بدون مسافات');
    console.log('   - تأكد من أن Caps Lock مقفول');
    console.log('   - جرب مسح الكاش والكوكيز من المتصفح');
    console.log('   - جرب متصفح آخر\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
