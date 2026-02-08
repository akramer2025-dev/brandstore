const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const DATABASE_URL = "postgresql://neondb_owner:npg_maJHy8UkQ9qP@ep-lucky-frost-ahx6zz7q.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function restoreOldPasswords() {
  try {
    console.log('\n🔄 إرجاع كلمات المرور القديمة...\n');
    console.log('═══════════════════════════════════════════════════════\n');

    // الباسوورد القديم كان Aa123456
    const defaultPassword = 'Aa123456';
    
    // جلب كل المستخدمين اللي عندهم password
    const users = await prisma.user.findMany({
      where: {
        password: { not: null }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    console.log(`📋 سيتم إرجاع ${users.length} حساب للباسوورد القديم (Aa123456)\n`);

    // Hash الباسوورد القديم
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        });

        console.log(`✅ ${user.email} - تم الإرجاع`);
        successCount++;

      } catch (error) {
        console.log(`❌ ${user.email} - فشل`);
        failCount++;
      }
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`✅ نجح: ${successCount} حساب`);
    console.log(`❌ فشل: ${failCount} حساب`);
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('🔐 الباسوورد القديم لكل الحسابات:\n');
    console.log('   🔑 كلمة المرور: Aa123456');
    console.log('   (A كبير + a صغير + 123456)\n');

    console.log('💡 ملاحظة:');
    console.log('   - كل المستخدمين يستخدمون نفس الباسوورد: Aa123456');
    console.log('   - يمكن للمستخدمين تغييره من إعدادات الحساب لاحقاً\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreOldPasswords();
