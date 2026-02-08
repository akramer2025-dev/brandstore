const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVendors() {
  try {
    // البحث عن حسابات Vendor
    const vendors = await prisma.user.findMany({
      where: { role: 'VENDOR' },
      include: {
        vendor: true
      },
      take: 10
    });

    console.log('\n=== 🏪 حسابات الـ Vendor الموجودة ===\n');
    
    if (vendors.length === 0) {
      console.log('❌ لا توجد حسابات vendor في قاعدة البيانات!');
      console.log('\n💡 الحل: نحتاج إنشاء حساب vendor جديد على production\n');
      return;
    }

    vendors.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'بدون اسم'}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   📱 Phone: ${user.phone || 'غير متوفر'}`);
      console.log(`   🏪 Store: ${user.vendor?.storeName || user.vendor?.businessName || 'غير متوفر'}`);
      console.log(`   ✅ Approved: ${user.vendor?.isApproved ? 'نعم' : 'لا'}`);
      console.log(`   🆔 User ID: ${user.id}`);
      console.log('');
    });

    console.log('---\n');
    console.log('💡 عشان تجرب على الموقع الرسمي:');
    console.log('   1. سجل دخول بأحد الحسابات أعلاه');
    console.log('   2. أو أنشئ حساب vendor جديد\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVendors();
