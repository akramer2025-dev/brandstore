import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function addUsers() {
  console.log('🚀 بدء إضافة المستخدمين...\n');

  // 1. akram - Admin/Developer
  const akramPassword = await bcrypt.hash('Aazxc', 10);
  const akram = await prisma.user.upsert({
    where: { email: 'akram@store.com' },
    update: {},
    create: {
      name: 'أكرم',
      email: 'akram@store.com',
      password: akramPassword,
      role: UserRole.ADMIN,
      phone: '01000000001',
      address: 'القاهرة',
    },
  });
  console.log('✅ تم إضافة المطور: akram@store.com (كلمة المرور: Aazxc)');

  // 2. nada - Vendor
  const nadaPassword = await bcrypt.hash('Aa123456', 10);
  const nada = await prisma.user.upsert({
    where: { email: 'nada@vendor.com' },
    update: {},
    create: {
      name: 'ندى',
      email: 'nada@vendor.com',
      password: nadaPassword,
      role: UserRole.VENDOR,
      phone: '01000000002',
      address: 'القاهرة',
    },
  });

  // Create vendor profile for nada
  await prisma.vendor.upsert({
    where: { userId: nada.id },
    update: {},
    create: {
      userId: nada.id,
      storeName: 'متجر ندى',
      storeDescription: 'متجر متنوع',
      commissionRate: 10,
      isApproved: true,
    },
  });
  console.log('✅ تم إضافة التاجرة: nada@vendor.com (كلمة المرور: Aa123456)');

  // 3. radwa - Vendor
  const radwaPassword = await bcrypt.hash('Aa123456', 10);
  const radwa = await prisma.user.upsert({
    where: { email: 'radwa@vendor.com' },
    update: {},
    create: {
      name: 'رضوى',
      email: 'radwa@vendor.com',
      password: radwaPassword,
      role: UserRole.VENDOR,
      phone: '01000000003',
      address: 'الجيزة',
    },
  });

  // Create vendor profile for radwa
  await prisma.vendor.upsert({
    where: { userId: radwa.id },
    update: {},
    create: {
      userId: radwa.id,
      storeName: 'متجر رضوى',
      storeDescription: 'متجر متنوع',
      commissionRate: 10,
      isApproved: true,
    },
  });
  console.log('✅ تم إضافة التاجرة: radwa@vendor.com (كلمة المرور: Aa123456)');

  console.log('\n✨ تم إضافة جميع المستخدمين بنجاح!');
  console.log('\n📋 ملخص الحسابات:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. المطور/Admin:');
  console.log('   البريد: akram@store.com');
  console.log('   كلمة المرور: Aazxc');
  console.log('\n2. التاجرة الأولى:');
  console.log('   البريد: nada@vendor.com');
  console.log('   كلمة المرور: Aa123456');
  console.log('\n3. التاجرة الثانية:');
  console.log('   البريد: radwa@vendor.com');
  console.log('   كلمة المرور: Aa123456');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

addUsers()
  .catch((e) => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
