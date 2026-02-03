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

  // إنشاء Vendor record
  const vendorRecord = await prisma.vendor.create({
    data: {
      userId: vendor.id,
      storeName: 'متجر البائع',
      storeNameAr: 'متجر البائع',
      capitalBalance: 50000, // رأس مال ابتدائي
      commissionRate: 5,
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
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pants',
        nameAr: 'بناطيل',
        description: 'بناطيل مريحة وأنيقة',
        image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Jackets',
        nameAr: 'جواكت',
        description: 'جواكت للشتاء',
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Shoes',
        nameAr: 'أحذية',
        description: 'أحذية رياضية وكلاسيكية',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      },
    }),
  ]);

  console.log('✅ تم إنشاء الفئات');

  // إنشاء المنتجات
  const products = [];
  
  // صور مختلفة للمنتجات
  const productImages = [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600,https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600',
    'https://images.unsplash.com/photo-1503341960582-b45751874cf0?w=600,https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600,https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600,https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600,https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600',
    'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=600,https://images.unsplash.com/photo-1620799140188-3b2a7c2e0e12?w=600',
    'https://images.unsplash.com/photo-1525450824786-227cbef70703?w=600,https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600',
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600,https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=600',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600,https://images.unsplash.com/photo-1571455786673-9d9d6c194f90?w=600',
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600,https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600',
  ];
  
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
        vendorId: vendorRecord.id, // ربط المنتج بالتاجر
        images: productImages[i % productImages.length],
        isFlashDeal: i % 4 === 0,
        flashDealEndsAt: i % 4 === 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
        productionCost: 50 + (i * 20), // سعر الشراء
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
