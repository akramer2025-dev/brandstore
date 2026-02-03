import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء تعبئة قاعدة البيانات...');

  // حذف البيانات القديمة
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // إنشاء المستخدمين
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const admin = await prisma.user.create({
    data: {
      name: 'المدير',
      email: 'admin@bs.com',
      password: hashedPassword,
      phone: '01000000001',
      role: 'ADMIN',
    },
  });

  const vendor = await prisma.user.create({
    data: {
      name: 'البائع',
      email: 'vendor@bs.com',
      password: hashedPassword,
      phone: '01000000002',
      role: 'VENDOR',
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'العميل',
      email: 'customer@bs.com',
      password: hashedPassword,
      phone: '01000000003',
      role: 'CUSTOMER',
    },
  });

  console.log('✅ تم إنشاء المستخدمين');

  // إنشاء الفئات
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'T-Shirts',
        nameAr: 'تيشيرتات',
        description: 'تيشيرتات عالية الجودة',
        image: '/images/categories/tshirts.jpg',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pants',
        nameAr: 'بناطيل',
        description: 'بناطيل مريحة وأنيقة',
        image: '/images/categories/pants.jpg',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Jackets',
        nameAr: 'جواكت',
        description: 'جواكت للشتاء',
        image: '/images/categories/jackets.jpg',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Shoes',
        nameAr: 'أحذية',
        description: 'أحذية رياضية وكلاسيكية',
        image: '/images/categories/shoes.jpg',
      },
    }),
  ]);

  console.log('✅ تم إنشاء الفئات');

  // إنشاء المنتجات
  const products = [];
  
  for (let i = 0; i < 20; i++) {
    const category = categories[i % categories.length];
    const product = await prisma.product.create({
      data: {
        name: `Product ${i + 1}`,
        nameAr: `منتج ${i + 1}`,
        description: `وصف تفصيلي للمنتج رقم ${i + 1}`,
        price: 100 + (i * 50),
        stock: 10 + (i * 2),
        categoryId: category.id,
        images: `/products/product-${(i % 5) + 1}.jpg,/products/product-${(i % 5) + 1}-2.jpg`,
        isFlashDeal: i % 4 === 0,
        flashDealEndsAt: i % 4 === 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
      },
    });
    products.push(product);
  }

  console.log('✅ تم إنشاء المنتجات');

  console.log('\n✨ تم إكمال تعبئة قاعدة البيانات بنجاح!');
  console.log(`📊 الإحصائيات:`);
  console.log(`   - المستخدمين: 3`);
  console.log(`   - الفئات: ${categories.length}`);
  console.log(`   - المنتجات: ${products.length}`);
  console.log('\n🔐 بيانات الدخول:');
  console.log('   المدير: admin@bs.com / 123456');
  console.log('   البائع: vendor@bs.com / 123456');
  console.log('   العميل: customer@bs.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ خطأ في تعبئة البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
