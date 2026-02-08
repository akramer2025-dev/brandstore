const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function checkNadaAccount() {
  try {
    console.log('\n🔍 جاري فحص حساب nada@gmail.com...\n');
    
    const user = await prisma.user.findUnique({
      where: { email: 'nada@gmail.com' },
      include: {
        vendor: true,
        partner: true
      }
    });

    if (!user) {
      console.log('❌ الحساب غير موجود!\n');
      return;
    }

    console.log('✅ تم العثور على الحساب:\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name || 'N/A');
    console.log('🎭 Role:', user.role);
    console.log('📱 Phone:', user.phone || 'N/A');
    console.log('🔑 Has Password:', user.password ? 'نعم ✅' : 'لا ❌');
    console.log('📅 Created:', user.createdAt);
    console.log('🔄 Updated:', user.updatedAt);
    
    if (user.vendor) {
      console.log('🏪 Vendor Profile:', 'موجود ✅');
      console.log('   Business Name:', user.vendor.businessNameAr || 'N/A');
    } else {
      console.log('🏪 Vendor Profile:', 'غير موجود ❌');
    }

    if (user.partner) {
      console.log('🤝 Partner Profile:', 'موجود ✅');
    } else {
      console.log('🤝 Partner Profile:', 'غير موجود ❌');
    }
    
    console.log('═══════════════════════════════════════════════════════\n');

    if (user.password) {
      console.log('🔐 فحص كلمة المرور...\n');
      
      // Test common passwords
      const testPasswords = [
        'password123',
        'Nada@123',
        'nada123',
        '123456',
        '12345678',
        'password',
        'Nada123',
        'nada@123'
      ];

      let found = false;
      for (const testPw of testPasswords) {
        const isMatch = await bcrypt.compare(testPw, user.password);
        if (isMatch) {
          console.log(`✅ كلمة المرور الحالية: ${testPw}\n`);
          found = true;
          break;
        }
      }

      if (!found) {
        console.log('⚠️  كلمة المرور غير معروفة من الكلمات الشائعة.\n');
      }

      // Offer to reset password
      console.log('💡 هل تريد إعادة تعيين كلمة المرور؟');
      console.log('   يمكنك تشغيل: npx tsx reset-nada-password.ts\n');

    } else {
      console.log('❌ لا توجد كلمة مرور! الحساب قد يكون تم إنشاؤه عبر OAuth\n');
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNadaAccount();
