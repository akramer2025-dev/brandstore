import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 جاري فحص قاعدة البيانات...\n');
    
    // اتصال بقاعدة البيانات
    await prisma.$connect();
    console.log('✅ الاتصال بقاعدة البيانات ناجح');
    
    // فحص عدد المنتجات
    const productsCount = await prisma.product.count();
    console.log(`📦 عدد المنتجات: ${productsCount}`);
    
    // فحص عدد الطلبات
    const ordersCount = await prisma.order.count();
    console.log(`🛒 عدد الطلبات: ${ordersCount}`);
    
    // فحص عدد المستخدمين
    const usersCount = await prisma.user.count();
    console.log(`👥 عدد المستخدمين: ${usersCount}`);
    
    console.log('\n✅ قاعدة البيانات تعمل بشكل ممتاز!\n');
    
  } catch (error: any) {
    console.log('\n❌ خطأ في الاتصال بقاعدة البيانات:');
    console.log(error.message);
    console.log('\n🔧 تحقق من:');
    console.log('  1. DATABASE_URL في ملف .env');
    console.log('  2. اتصال الإنترنت');
    console.log('  3. Neon Database متاح ومش موقوف\n');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
