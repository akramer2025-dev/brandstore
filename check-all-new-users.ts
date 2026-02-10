import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllNewUsers() {
  console.log('🔍 التحقق من كل المستخدمين الجدد اليوم...\n');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: today
        }
      },
      include: {
        vendor: true,
        accounts: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`👥 المستخدمين الجدد اليوم: ${newUsers.length}\n`);

    newUsers.forEach(user => {
      console.log(`👤 ${user.name}`);
      console.log(`   📧 ${user.email}`);
      console.log(`   🎭 الدور: ${user.role}`);
      console.log(`   📅 وقت الإنشاء: ${user.createdAt.toLocaleString('ar-EG')}`);
      console.log(`   🔐 طريقة التسجيل: ${user.accounts?.length > 0 ? user.accounts[0].provider.toUpperCase() : 'Email/Password'}`);
      console.log(`   💼 عنده Vendor Account: ${user.vendor ? 'نعم ✅' : 'لا ❌'}`);
      
      if (user.vendor) {
        console.log(`      Vendor ID: ${user.vendor.id}`);
        console.log(`      رأس المال: ${user.vendor.capitalBalance?.toLocaleString() || 0} ج`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllNewUsers();
