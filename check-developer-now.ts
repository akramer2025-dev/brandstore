import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDeveloper() {
  console.log('🔍 فحص حساب المطور...\n');

  try {
    // البحث عن حساب المطور (ADMIN)
    const developer = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'akramer2025@gmail.com' },
          { phone: '01555512778' }
        ]
      }
    });

    if (developer) {
      console.log('✅ حساب المطور موجود:');
      console.log('ID:', developer.id);
      console.log('Name:', developer.name);
      console.log('Email:', developer.email);
      console.log('Phone:', developer.phone);
      console.log('Role:', developer.role);
      console.log('Active:', developer.isActive);
      console.log('Created:', developer.createdAt);
      console.log('Password Hash:', developer.password ? 'موجود' : '❌ مفقود');
    } else {
      console.log('❌ حساب المطور غير موجود في القاعدة!');
      console.log('\n🔍 البحث عن أي admin...');
      
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true
        }
      });

      console.log(`\nوجدنا ${admins.length} admin:`);
      admins.forEach((admin, i) => {
        console.log(`\n${i + 1}. ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Phone: ${admin.phone}`);
      });
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDeveloper();
