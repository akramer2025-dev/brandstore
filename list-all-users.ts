const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAllUsers() {
  try {
    console.log('\n🔍 جاري البحث عن جميع المستخدمين...\n');
    
    const allUsers = await prisma.user.findMany({
      include: {
        vendor: true,
        partner: true,
        deliveryStaff: true,
        marketingStaff: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (allUsers.length === 0) {
      console.log('❌ لا يوجد مستخدمين في النظام!\n');
      return;
    }

    console.log(`✅ تم العثور على ${allUsers.length} مستخدم:\n`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Group by role
    const admins = allUsers.filter(u => u.role === 'ADMIN');
    const vendors = allUsers.filter(u => u.role === 'VENDOR');
    const staff = allUsers.filter(u => u.role === 'STAFF' || u.role === 'DELIVERY_STAFF' || u.role === 'MARKETING_STAFF');
    const customers = allUsers.filter(u => u.role === 'CUSTOMER');

    if (admins.length > 0) {
      console.log('👑 المسؤولين (ADMIN):');
      console.log('─────────────────────────────────────────────────────');
      admins.forEach((u, i) => {
        console.log(`${i + 1}. 📧 Email: ${u.email}`);
        console.log(`   👤 Name: ${u.name || 'N/A'}`);
        console.log(`   📱 Phone: ${u.phone || 'N/A'}`);
        console.log(`   🔑 Has Password: ${u.password ? 'نعم ✅' : 'لا ❌'}`);
        console.log('');
      });
    }

    if (vendors.length > 0) {
      console.log('\n🏪 التجار (VENDOR):');
      console.log('─────────────────────────────────────────────────────');
      vendors.forEach((u, i) => {
        console.log(`${i + 1}. 📧 Email: ${u.email}`);
        console.log(`   👤 Name: ${u.name || 'N/A'}`);
        console.log(`   🏢 Business: ${u.vendor?.businessNameAr || 'N/A'}`);
        console.log(`   📱 Phone: ${u.phone || 'N/A'}`);
        console.log(`   🔑 Has Password: ${u.password ? 'نعم ✅' : 'لا ❌'}`);
        console.log('');
      });
    }

    if (staff.length > 0) {
      console.log('\n👥 الموظفين (STAFF):');
      console.log('─────────────────────────────────────────────────────');
      staff.forEach((u, i) => {
        const roleEmoji = u.role === 'DELIVERY_STAFF' ? '🚚' : u.role === 'MARKETING_STAFF' ? '📢' : '👤';
        console.log(`${i + 1}. 📧 Email: ${u.email}`);
        console.log(`   ${roleEmoji} Role: ${u.role}`);
        console.log(`   👤 Name: ${u.name || 'N/A'}`);
        console.log(`   📱 Phone: ${u.phone || 'N/A'}`);
        console.log(`   🔑 Has Password: ${u.password ? 'نعم ✅' : 'لا ❌'}`);
        console.log('');
      });
    }

    if (customers.length > 0) {
      console.log(`\n👤 العملاء (CUSTOMER): ${customers.length} عميل`);
      console.log('─────────────────────────────────────────────────────');
      // Show only first 5 customers
      const firstCustomers = customers.slice(0, 5);
      firstCustomers.forEach((u, i) => {
        console.log(`${i + 1}. 📧 Email: ${u.email}`);
        console.log(`   👤 Name: ${u.name || 'N/A'}`);
        console.log(`   📱 Phone: ${u.phone || 'N/A'}`);
        console.log('');
      });
      
      if (customers.length > 5) {
        console.log(`   ... و ${customers.length - 5} عميل آخر\n`);
      }
    }

    console.log('═══════════════════════════════════════════════════════\n');
    
    // Summary
    console.log('📊 الإحصائيات:');
    console.log(`   👑 مسؤولين: ${admins.length}`);
    console.log(`   🏪 تجار: ${vendors.length}`);
    console.log(`   👥 موظفين: ${staff.length}`);
    console.log(`   👤 عملاء: ${customers.length}`);
    console.log(`   📈 الإجمالي: ${allUsers.length}\n`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAllUsers();
