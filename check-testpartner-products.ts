import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTestPartnerProducts() {
  try {
    const vendor = await prisma.vendor.findFirst({
      where: {
        user: {
          email: 'testpartner@example.com',
        },
      },
      include: {
        products: {
          select: {
            id: true,
            nameAr: true,
            price: true,
            stock: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!vendor) {
      console.log('❌ الحساب غير موجود');
      return;
    }

    console.log('\n🏪 متجر "أم وليد" (testpartner@example.com)');
    console.log('═'.repeat(80));
    console.log(`📦 عدد المنتجات: ${vendor.products.length}\n`);

    if (vendor.products.length === 0) {
      console.log('⚠️ لا توجد منتجات');
    } else {
      vendor.products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.nameAr}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   السعر: ${product.price} جنيه`);
        console.log(`   المخزون: ${product.stock}`);
        console.log(`   تاريخ الإضافة: ${product.createdAt.toLocaleString('ar-EG')}`);
        console.log('-'.repeat(80));
      });
    }

    console.log('\n💡 هل تريد:');
    console.log('   1. مسح كل المنتجات من الحساب التجريبي');
    console.log('   2. مسح الحساب بالكامل');
    console.log('   3. إبقاء الحساب كما هو للتجارب');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTestPartnerProducts();
