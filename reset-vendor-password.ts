const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetVendorPassword() {
  try {
    const email = 'nada@gmail.com';
    const newPassword = '123456';
    
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // تحديث كلمة المرور
    const updated = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    console.log('\n✅ تم تحديث كلمة المرور بنجاح!\n');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', newPassword);
    console.log('👤 User:', updated.name);
    console.log('');
    console.log('---');
    console.log('🌐 رابط تسجيل الدخول:');
    console.log('   https://www.remostore.net/auth/signin');
    console.log('');
    console.log('📦 رابط الطلب الجاهز:');
    console.log('   https://www.remostore.net/vendor/orders/cmlck5ubz0002lg04yp0rb2ks');
    console.log('');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetVendorPassword();
