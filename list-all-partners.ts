import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listPartners() {
  try {
    const vendors = await prisma.vendor.findMany({
      select: {
        id: true,
        userId: true,
        storeNameAr: true,
        storeName: true,
        businessNameAr: true,
        businessName: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`\n📊 عدد الشركاء: ${vendors.length}\n`);
    console.log('═'.repeat(100));

    vendors.forEach((vendor, index) => {
      console.log(`\n${index + 1}. ID: ${vendor.id}`);
      console.log(`   👤 اسم المستخدم: ${vendor.user?.name || 'غير متوفر'}`);
      console.log(`   📧 البريد: ${vendor.user?.email || 'غير متوفر'}`);
      console.log(`   🏪 اسم المتجر بالعربي: ${vendor.storeNameAr || '❌ فارغ'}`);
      console.log(`   🏪 اسم المتجر: ${vendor.storeName || '❌ فارغ'}`);
      console.log(`   🏢 اسم النشاط بالعربي: ${vendor.businessNameAr || '❌ فارغ'}`);
      console.log(`   🏢 اسم النشاط: ${vendor.businessName || '❌ فارغ'}`);
      console.log(`   📦 عدد المنتجات: ${vendor._count.products}`);
      console.log('-'.repeat(100));
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listPartners();
