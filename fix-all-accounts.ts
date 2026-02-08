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

async function fixAllAccounts() {
  try {
    console.log('\n🔧 إصلاح جميع الحسابات على Production Database\n');
    console.log('═══════════════════════════════════════════════════════\n');

    // تحديد الحسابات المهمة مع باسوورد بسيط
    const accountsToFix = [
      // Admin Accounts
      { email: 'akram@gmail.com', password: 'akram123', role: 'ADMIN' },
      { email: 'akram@store.com', password: 'akram123', role: 'ADMIN' },
      { email: 'admin@bs.com', password: 'admin123', role: 'ADMIN' },
      
      // Main Vendor Accounts
      { email: 'vendor@test.com', password: 'vendor123', role: 'VENDOR' },
      { email: 'Yousef@gmail.com', password: 'yousef123', role: 'VENDOR' },
      { email: 'TokaIbrahim1035@gmail.com', password: 'toka123', role: 'VENDOR' },
      { email: 'nano@gmail.com', password: 'nano123', role: 'VENDOR' },
      { email: 'na2699512@gmail.com', password: 'nawal123', role: 'VENDOR' },
      { email: 'nesma@gmail.com', password: 'nesma123', role: 'VENDOR' },
      { email: 'mohamed.mostafa@gmail.com', password: 'mohamed123', role: 'VENDOR' },
      { email: 'missereem@gmail.com', password: 'reem123', role: 'VENDOR' },
      { email: 'nada@gmail.com', password: 'nada123', role: 'VENDOR' },
      { email: 'radwa@gmail.com', password: 'radwa123', role: 'VENDOR' },
      { email: 'radwasaeed21@gmail.com', password: 'radwa123', role: 'VENDOR' },
      { email: 'toka@gmail.com', password: 'toka123', role: 'VENDOR' },
      { email: 'radwa@vendor.com', password: 'radwa123', role: 'VENDOR' },
      { email: 'nada@vendor.com', password: 'nada123', role: 'VENDOR' },
      { email: 'vendor@bs.com', password: 'vendor123', role: 'VENDOR' },
      
      // Marketing Staff
      { email: 'playmaker@brandstore.com', password: 'playmaker123', role: 'MARKETING_STAFF' },
      { email: 'mediabuyer@brandstore.com', password: 'mediabuyer123', role: 'MARKETING_STAFF' },
      { email: 'shein.staff@brandstore.com', password: 'shein123', role: 'MARKETING_STAFF' },
      { email: 'marketing@test.com', password: 'marketing123', role: 'MARKETING_STAFF' },
    ];

    console.log(`📋 سيتم تحديث ${accountsToFix.length} حساب\n`);

    let successCount = 0;
    let failCount = 0;
    const credentials = [];

    for (const account of accountsToFix) {
      try {
        // Check if user exists
        const user = await prisma.user.findUnique({
          where: { email: account.email }
        });

        if (!user) {
          console.log(`⚠️  ${account.email} - غير موجود`);
          failCount++;
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(account.password, 10);

        // Update user
        await prisma.user.update({
          where: { email: account.email },
          data: { 
            password: hashedPassword,
            emailVerified: user.emailVerified || new Date()
          }
        });

        console.log(`✅ ${account.email} - تم التحديث`);
        successCount++;

        // Save credentials
        credentials.push({
          email: account.email,
          password: account.password,
          role: account.role,
          name: user.name
        });

      } catch (error) {
        console.log(`❌ ${account.email} - فشل: ${error.message}`);
        failCount++;
      }
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`✅ نجح: ${successCount} حساب`);
    console.log(`❌ فشل: ${failCount} حساب`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Display credentials grouped by role
    console.log('\n🔐 معلومات الدخول الجديدة:\n');
    
    const admins = credentials.filter(c => c.role === 'ADMIN');
    const vendors = credentials.filter(c => c.role === 'VENDOR');
    const staff = credentials.filter(c => c.role === 'MARKETING_STAFF');

    if (admins.length > 0) {
      console.log('👑 المسؤولين (ADMIN):');
      console.log('─────────────────────────────────────────────────────');
      admins.forEach(c => {
        console.log(`📧 ${c.email}`);
        console.log(`🔑 ${c.password}`);
        console.log('');
      });
    }

    if (vendors.length > 0) {
      console.log('🏪 التجار (VENDOR):');
      console.log('─────────────────────────────────────────────────────');
      vendors.forEach(c => {
        console.log(`📧 ${c.email} - ${c.name || 'N/A'}`);
        console.log(`🔑 ${c.password}`);
        console.log('');
      });
    }

    if (staff.length > 0) {
      console.log('📢 موظفي التسويق (MARKETING_STAFF):');
      console.log('─────────────────────────────────────────────────────');
      staff.forEach(c => {
        console.log(`📧 ${c.email} - ${c.name || 'N/A'}`);
        console.log(`🔑 ${c.password}`);
        console.log('');
      });
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('💡 ملاحظات:');
    console.log('   - كل الباسوورد بسيط (اسم + 123)');
    console.log('   - كل الحروف صغيرة (small letters)');
    console.log('   - الموقع: www.remostore.net/auth/login');
    console.log('   - امسح الكوكيز والكاش قبل تسجيل الدخول\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllAccounts();
