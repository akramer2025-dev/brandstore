const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetNadaPassword() {
  try {
    const email = 'nada@gmail.com';
    const newPassword = 'Nada@2026'; // كلمة مرور جديدة قوية

    console.log('\n🔐 إعادة تعيين كلمة المرور...\n');
    console.log('📧 Email:', email);
    console.log('🔑 كلمة المرور الجديدة:', newPassword);
    console.log('═══════════════════════════════════════════════════════\n');

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { password: hashedPassword }
    });

    console.log('✅ تم تحديث كلمة المرور بنجاح!\n');
    console.log('معلومات الدخول الجديدة:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📧 الإيميل: nada@gmail.com');
    console.log('🔑 كلمة المرور: Nada@2026');
    console.log('═══════════════════════════════════════════════════════\n');

    // Test the new password
    console.log('🔍 اختبار كلمة المرور الجديدة...');
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (user && user.password) {
      const isValid = await bcrypt.compare(newPassword, user.password);
      if (isValid) {
        console.log('✅ تم التحقق من كلمة المرور الجديدة بنجاح!\n');
      } else {
        console.log('❌ خطأ في التحقق من كلمة المرور!\n');
      }
    }

    console.log('💡 جرب تسجيل الدخول الآن على الموقع:\n');
    console.log('   1. افتح صفحة تسجيل الدخول');
    console.log('   2. اكتب: nada@gmail.com');
    console.log('   3. كلمة المرور: Nada@2026');
    console.log('   4. اضغط Enter\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetNadaPassword();
