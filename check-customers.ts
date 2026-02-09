import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCustomers() {
  console.log('🔍 فحص العملاء في الداتابيز...\n');

  // إجمالي العملاء
  const totalCustomers = await prisma.user.count({
    where: { role: 'CUSTOMER' }
  });

  console.log(`📊 إجمالي العملاء: ${totalCustomers}\n`);

  // أول 10 عملاء
  const first10 = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      name: true,
      email: true,
      phone: true,
      createdAt: true,
    }
  });

  console.log('👥 آخر 10 عملاء مسجلين:\n');
  first10.forEach((customer, i) => {
    console.log(`${i + 1}. الاسم: ${customer.name || 'غير محدد'}`);
    console.log(`   الإيميل: ${customer.email}`);
    console.log(`   الموبايل: ${customer.phone || 'غير محدد'}`);
    console.log(`   تاريخ التسجيل: ${customer.createdAt.toLocaleDateString('ar-EG')}`);
    console.log('');
  });

  // تحليل الإيميلات
  const emailPatterns = await prisma.user.findMany({
    where: { 
      role: 'CUSTOMER',
      email: {
        contains: 'test'
      }
    },
    select: { email: true }
  });

  console.log(`\n🧪 عملاء بإيميلات تجريبية (test): ${emailPatterns.length}`);

  // عملاء بطلبات حقيقية
  const customersWithOrders = await prisma.user.count({
    where: {
      role: 'CUSTOMER',
      orders: {
        some: {}
      }
    }
  });

  console.log(`🛒 عملاء لهم طلبات: ${customersWithOrders}`);
  console.log(`👻 عملاء بدون طلبات: ${totalCustomers - customersWithOrders}`);

  // منصات التسجيل
  const googleUsers = await prisma.account.count({
    where: { provider: 'google' }
  });

  const credentialsUsers = totalCustomers - googleUsers;

  console.log(`\n📱 طرق التسجيل:`);
  console.log(`   Google OAuth: ${googleUsers}`);
  console.log(`   Email/Password: ${credentialsUsers}`);

  await prisma.$disconnect();
}

checkCustomers()
  .catch((e) => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  });
