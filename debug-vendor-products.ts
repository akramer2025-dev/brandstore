import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugVendorProducts() {
  console.log('🔍 تشخيص مشكلة عدم ظهور المنتجات...\n');

  try {
    // جلب كل الشركاء
    const vendors = await prisma.vendor.findMany({
      include: {
        user: true
      }
    });

    console.log(`👥 عدد الشركاء: ${vendors.length}\n`);

    // جلب آخر 5 منتجات
    const latestProducts = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        vendor: {
          include: {
            user: true
          }
        }
      }
    });

    console.log('📦 آخر 5 منتجات نشطة:\n');
    
    latestProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.nameAr || product.name}`);
      console.log(`   🆔 Product ID: ${product.id}`);
      console.log(`   👤 Vendor ID المسجل: ${product.vendorId}`);
      console.log(`   👤 اسم الشريك: ${product.vendor?.user?.name || 'غير معروف'}`);
      console.log(`   📅 تاريخ الإضافة: ${product.createdAt.toLocaleString('ar-EG')}\n`);
    });

    // التحقق من كل شريك
    console.log('🔍 التحقق من منتجات كل شريك:\n');
    
    for (const vendor of vendors) {
      const productCount = await prisma.product.count({
        where: {
          vendorId: vendor.id,
          isActive: true
        }
      });

      console.log(`👤 ${vendor.user.name} (Vendor ID: ${vendor.id})`);
      console.log(`   User ID: ${vendor.userId}`);
      console.log(`   📦 عدد المنتجات النشطة: ${productCount}`);
      
      if (productCount > 0) {
        const products = await prisma.product.findMany({
          where: {
            vendorId: vendor.id,
            isActive: true
          },
          select: {
            id: true,
            nameAr: true,
            name: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 3
        });

        products.forEach(p => {
          console.log(`      - ${p.nameAr || p.name} (${p.createdAt.toLocaleString('ar-EG')})`);
        });
      }
      console.log('');
    }

    // التحقق من وجود منتجات يتيمة (بدون vendor صحيح)
    const orphanProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { vendorId: null },
          { vendor: null }
        ]
      }
    });

    if (orphanProducts.length > 0) {
      console.log(`⚠️ تحذير: يوجد ${orphanProducts.length} منتج يتيم (بدون vendor صحيح)!\n`);
      orphanProducts.forEach(p => {
        console.log(`   - ${p.nameAr || p.name} (Vendor ID: ${p.vendorId})`);
      });
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugVendorProducts();
