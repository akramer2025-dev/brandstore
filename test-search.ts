import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSearch() {
  try {
    console.log('🔍 Testing Search...\n');
    
    // البحث في المنتجات
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'تيشيرت', mode: 'insensitive' } },
          { nameAr: { contains: 'تيشيرت', mode: 'insensitive' } },
        ],
        isActive: true,
        isVisible: true,
      },
      take: 5,
      select: {
        id: true,
        name: true,
        nameAr: true,
        isActive: true,
        isVisible: true,
        stock: true,
      },
    });

    console.log(`📦 Products Found: ${products.length}`);
    products.forEach(p => {
      console.log(`  - ${p.name} | Active: ${p.isActive} | Visible: ${p.isVisible} | Stock: ${p.stock}`);
    });

    // البحث في المتاجر
    const vendors = await prisma.vendor.findMany({
      where: {
        OR: [
          { storeName: { contains: 'متجر', mode: 'insensitive' } },
        ],
        isApproved: true,
        isActive: true,
      },
      take: 5,
      select: {
        id: true,
        storeName: true,
        isApproved: true,
        isActive: true,
      },
    });

    console.log(`\n🏪 Vendors Found: ${vendors.length}`);
    vendors.forEach(v => {
      console.log(`  - ${v.storeName} | Approved: ${v.isApproved} | Active: ${v.isActive}`);
    });

    // إحصائيات عامة
    const totalProducts = await prisma.product.count({
      where: {
        isActive: true,
        isVisible: true,
      },
    });

    const totalVendors = await prisma.vendor.count({
      where: {
        isApproved: true,
        isActive: true,
      },
    });

    console.log(`\n📊 Total Active Products: ${totalProducts}`);
    console.log(`📊 Total Active Vendors: ${totalVendors}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSearch();
