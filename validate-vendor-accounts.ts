import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateVendorAccounts() {
  console.log('🔍 التحقق من consistency الـ VENDOR accounts...\n');

  try {
    // 1. جلب كل الـ VENDOR users
    const vendorUsers = await prisma.user.findMany({
      where: { role: 'VENDOR' },
      include: { vendor: true }
    });

    console.log(`👥 إجمالي VENDOR users: ${vendorUsers.length}\n`);

    const usersWithoutVendorAccount: any[] = [];
    const usersWithVendorAccount: any[] = [];

    vendorUsers.forEach(user => {
      if (!user.vendor) {
        usersWithoutVendorAccount.push(user);
      } else {
        usersWithVendorAccount.push(user);
      }
    });

    console.log(`✅ Users مع vendor account: ${usersWithVendorAccount.length}`);
    usersWithVendorAccount.forEach(u => {
      console.log(`   - ${u.name} (${u.email})`);
    });

    console.log(`\n❌ Users بدون vendor account: ${usersWithoutVendorAccount.length}`);
    if (usersWithoutVendorAccount.length > 0) {
      console.log('   ⚠️  هؤلاء المستخدمين role بتاعهم VENDOR لكن مفيش vendor account!');
      usersWithoutVendorAccount.forEach(u => {
        console.log(`   - ${u.name} (${u.email}) - ID: ${u.id}`);
      });
    }

    // 2. جلب كل vendor accounts بدون user
    const vendorsWithoutUser = await prisma.vendor.findMany({
      where: {
        user: null
      }
    });

    console.log(`\n🏪 Vendor accounts بدون user: ${vendorsWithoutUser.length}`);
    if (vendorsWithoutUser.length > 0) {
      console.log('   ⚠️  هذه الـ vendor accounts مش مربوطة بـ user!');
      vendorsWithoutUser.forEach(v => {
        console.log(`   - Vendor ID: ${v.id}`);
      });
    }

    console.log('\n📋 النتيجة:');
    if (usersWithoutVendorAccount.length === 0 && vendorsWithoutUser.length === 0) {
      console.log('✅ الـ database consistent - كل VENDOR user عنده vendor account');
    } else {
      console.log('❌ فيه مشاكل في الـ consistency - يجب مراجعة الحسابات');
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

validateVendorAccounts();
