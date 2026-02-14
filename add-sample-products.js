const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking existing products...');
  
  const existingProducts = await prisma.product.count();
  console.log(`📦 Found ${existingProducts} products in database`);

  if (existingProducts > 0) {
    console.log('✅ Database already has products!');
    
    // Show first 5 products
    const products = await prisma.product.findMany({
      take: 5,
      include: { category: true }
    });
    
    console.log('\n📋 First 5 products:');
    products.forEach(p => {
      console.log(`  - ${p.nameAr} (${p.price} جنيه) - Stock: ${p.stock}`);
    });
    
    return;
  }

  console.log('\n⚠️  No products found! Adding sample products...');

  // Get or create a category
  let category = await prisma.category.findFirst();
  
  if (!category) {
    console.log('📁 Creating sample category...');
    category = await prisma.category.create({
      data: {
        name: 'General',
        nameAr: 'عام',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        description: 'General products category'
      }
    });
  }

  console.log(`📁 Using category: ${category.nameAr}`);

  // Add sample products
  const sampleProducts = [
    {
      name: 'Summer Dress',
      nameAr: 'فستان صيفي',
      descriptionAr: 'فستان صيفي جميل ومريح',
      price: 299,
      originalPrice: 399,
      stock: 50,
      images: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400,https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400',
      categoryId: category.id,
      badge: 'NEW'
    },
    {
      name: 'Classic T-Shirt',
      nameAr: 'تيشيرت كلاسيك',
      descriptionAr: 'تيشيرت قطن عالي الجودة',
      price: 149,
      originalPrice: 199,
      stock: 100,
      images: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400,https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400',
      categoryId: category.id,
      badge: 'SALE'
    },
    {
      name: 'Elegant Blouse',
      nameAr: 'بلوزة أنيقة',
      descriptionAr: 'بلوزة عصرية مناسبة لجميع المناسبات',
      price: 249,
      originalPrice: 349,
      stock: 75,
      images: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400,https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400',
      categoryId: category.id,
      badge: 'HOT'
    },
    {
      name: 'Casual Jeans',
      nameAr: 'جينز كاجوال',
      descriptionAr: 'جينز مريح للارتداء اليومي',
      price: 399,
      originalPrice: 499,
      stock: 60,
      images: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400,https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400',
      categoryId: category.id
    },
    {
      name: 'Sport Jacket',
      nameAr: 'جاكيت رياضي',
      descriptionAr: 'جاكيت رياضي عملي وأنيق',
      price: 549,
      originalPrice: 699,
      stock: 40,
      images: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400,https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=400',
      categoryId: category.id,
      badge: 'LIMITED'
    }
  ];

  console.log('\n➕ Adding products...');
  
  for (const product of sampleProducts) {
    await prisma.product.create({ data: product });
    console.log(`  ✓ Added: ${product.nameAr}`);
  }

  console.log('\n✅ Successfully added all sample products!');
  console.log('🔄 Refresh your browser to see the products.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
