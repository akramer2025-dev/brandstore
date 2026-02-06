import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 جاري إنشاء حسابات الشركاء...\n');

  // Partner 1: Radwa
  const radwaPassword = await bcrypt.hash('Aa123456', 10);
  
  try {
    // حذف الحساب لو موجود
    await prisma.user.deleteMany({
      where: { email: 'radwa@gmail.com' }
    });

    const radwaUser = await prisma.user.create({
      data: {
        email: 'radwa@gmail.com',
        name: 'Radwa',
        username: 'radwa',
        phone: '01000000001',
        password: radwaPassword,
        role: 'VENDOR',
        emailVerified: new Date(),
      }
    });

    const vendor = await prisma.vendor.create({
      data: {
        userId: radwaUser.id,
        storeName: 'متجر رضوى',
        businessType: 'PARTNER',
      }
    });

    await prisma.partnerCapital.create({
      data: {
        vendorId: vendor.id,
        partnerName: 'Radwa',
        partnerType: 'OWNER',
        capitalAmount: 0,
        capitalPercent: 100,
        initialAmount: 0,
        currentAmount: 0,
      }
    });

    console.log('✅ تم إنشاء حساب رضوى بنجاح!');
    console.log(`   📧 Email: radwa@gmail.com`);
    console.log(`   🔑 Password: Aa123456\n`);
  } catch (error) {
    console.error('❌ خطأ في إنشاء حساب رضوى:', error);
  }

  // Partner 2: Nada
  const nadaPassword = await bcrypt.hash('Aa123456', 10);
  
  try {
    // حذف الحساب لو موجود
    await prisma.user.deleteMany({
      where: { email: 'nada@gmail.com' }
    });

    const nadaUser = await prisma.user.create({
      data: {
        email: 'nada@gmail.com',
        name: 'Nada',
        username: 'nada',
        phone: '01000000002',
        password: nadaPassword,
        role: 'VENDOR',
        emailVerified: new Date(),
      }
    });

    const vendor2 = await prisma.vendor.create({
      data: {
        userId: nadaUser.id,
        storeName: 'متجر ندى',
        businessType: 'PARTNER',
      }
    });

    await prisma.partnerCapital.create({
      data: {
        vendorId: vendor2.id,
        partnerName: 'Nada',
        partnerType: 'OWNER',
        capitalAmount: 0,
        capitalPercent: 100,
        initialAmount: 0,
        currentAmount: 0,
      }
    });

    console.log('✅ تم إنشاء حساب ندى بنجاح!');
    console.log(`   📧 Email: nada@gmail.com`);
    console.log(`   🔑 Password: Aa123456\n`);
  } catch (error) {
    console.error('❌ خطأ في إنشاء حساب ندى:', error);
  }

  console.log('\n🎉 تم إنشاء جميع الحسابات بنجاح!');
  console.log('\n📋 ملخص الحسابات:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1️⃣  رضوى');
  console.log('   📧 radwa@gmail.com');
  console.log('   🔑 Aa123456');
  console.log('');
  console.log('2️⃣  ندى');
  console.log('   📧 nada@gmail.com');
  console.log('   🔑 Aa123456');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
