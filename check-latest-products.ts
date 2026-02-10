import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLatestProducts() {
  console.log('🔍 جاري التحقق من آخر المنتجات المضافة...\n');

  // جلب آخر 10 منتجات
  const latestProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      vendor: {
        include: {
          user: true
        }
      },
      category: true
    }
  });

  console.log(`📦 عدد المنتجات الكلي: ${await prisma.product.count()}`);
  console.log(`✅ المنتجات النشطة: ${await prisma.product.count({ where: { isActive: true } })}`);
  console.log(`👁️ المنتجات الظاهرة: ${await prisma.product.count({ where: { isVisible: true } })}`);
  console.log(`🔥 النشطة والظاهرة: ${await prisma.product.count({ where: { isActive: true, isVisible: true } })}\n`);

  console.log('📋 آخر 10 منتجات تم إضافتها:\n');
  
  latestProducts.forEach((product, index) => {
    console.log(`\n${index + 1}. ${product.nameAr || product.name}`);
    console.log(`   🆔 ID: ${product.id}`);
    console.log(`   👤 الشريك: ${product.vendor?.user?.name || 'غير معروف'} (ID: ${product.vendorId})`);
    console.log(`   📂 الفئة: ${product.category?.nameAr || product.category?.name || 'بدون فئة'}`);
    console.log(`   💰 السعر: ${product.price.toLocaleString()} ج`);
    console.log(`   📦 المخزون: ${product.stock}`);
    console.log(`   ✅ نشط: ${product.isActive ? 'نعم ✅' : 'لا ❌'}`);
    console.log(`   👁️ ظاهر: ${product.isVisible ? 'نعم ✅' : 'لا ❌'}`);
    console.log(`   📅 تاريخ الإضافة: ${product.createdAt.toLocaleString('ar-EG')}`);
    console.log(`   🖼️ الصور: ${product.images?.split(',').length || 0} صورة`);
  });

  // إحصائيات الشركاء
  console.log('\n\n📊 إحصائيات المنتجات حسب الشريك:\n');
  
  const vendors = await prisma.vendor.findMany({
    include: {
      user: true,
      _count: {
        select: {
          products: {
            where: { isActive: true }
          }
        }
      }
    }
  });

  vendors.forEach(vendor => {
    if (vendor._count.products > 0) {
      console.log(`👤 ${vendor.user.name}: ${vendor._count.products} منتج`);
    }
  });

  await prisma.$disconnect();
}

checkLatestProducts().catch(console.error);
