import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllVendors() {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
            role: true
          }
        }
      }
    });

    console.log(`\n📊 عدد الشركاء: ${vendors.length}\n`);

    vendors.forEach((v, i) => {
      console.log(`${i + 1}. ${v.user?.name || 'بدون اسم'}`);
      console.log(`   Email: ${v.user?.email}`);
      console.log(`   Role: ${v.user?.role}`);
      console.log(`   Vendor ID: ${v.id}`);
      console.log(`   رأس المال: ${v.initialCapital} ج`);
      console.log(`   رصيد: ${v.capitalBalance} ج`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllVendors();
