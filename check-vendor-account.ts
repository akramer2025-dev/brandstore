const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVendorAccount() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'vendor@test.com' },
      include: {
        vendor: true
      }
    });

    if (user) {
      console.log('\n✅ الحساب موجود!\n');
      console.log('📧 Email:', user.email);
      console.log('👤 Name:', user.name);
      console.log('🎭 Role:', user.role);
      console.log('🔑 Has Password:', user.password ? 'نعم ✅' : 'لا ❌');
      console.log('🏪 Vendor:', user.vendor ? 'نعم ✅' : 'لا ❌');
      if (user.vendor) {
        console.log('🏪 Business Name:', user.vendor.businessNameAr);
      }
    } else {
      console.log('\n❌ الحساب غير موجود!\n');
      
      // Let's check all vendors
      const allVendors = await prisma.user.findMany({
        where: { role: 'VENDOR' },
        include: { vendor: true },
        take: 5
      });
      
      if (allVendors.length > 0) {
        console.log('📋 حسابات الـ Vendor الموجودة:\n');
        allVendors.forEach((v, i) => {
          console.log(`${i + 1}. Email: ${v.email}`);
          console.log(`   Name: ${v.name}`);
          console.log(`   Business: ${v.vendor?.businessNameAr || 'N/A'}`);
          console.log('');
        });
      } else {
        console.log('❌ مفيش أي حسابات Vendor في النظام!');
      }
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVendorAccount();
