import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTolineProducts() {
  console.log('🔍 جاري التحقق من منتجات تولين...\n');

  // جلب بيانات تولين بـ query مبسط
  const tolineUser = await prisma.user.findFirst({
    where: {
      name: { contains: 'تولين' }
    }
  });

  if (!tolineUser) {
    console.log('❌ لم يتم العثور على المستخدم "تولين"');
    await prisma.$disconnect();
    return;
  }

  const toline = await prisma.vendor.findUnique({
    where: {
      userId: tolineUser.id
    }
  });

  if (!toline) {
    console.log('❌ لم يتم العثور على الشريك "تولين"');
    await prisma.$disconnect();
    return;
  }

  console.log('👤 بيانات الشريك:');
  console.log(`   الاسم: ${tolineUser.name}`);
  console.log(`   User ID: ${toline.userId}`);
  console.log(`   Vendor ID: ${toline.id}`);
  console.log(`   رأس المال: ${toline.capitalBalance?.toLocaleString() || 0} ج\n`);

  // جلب كل المنتجات (حتى المحذوفة)
  const allProducts = await prisma.product.findMany({
    where: {
      vendorId: toline.id
    },
    include: {
      category: true
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`📦 إجمالي المنتجات: ${allProducts.length}`);
  console.log(`✅ المنتجات النشطة: ${allProducts.filter(p => p.isActive).length}`);
  console.log(`❌ المنتجات المحذوفة: ${allProducts.filter(p => !p.isActive).length}`);
  console.log(`👁️ المنتجات الظاهرة: ${allProducts.filter(p => p.isVisible).length}\n`);

  if (allProducts.length === 0) {
    console.log('⚠️ لا توجد منتجات لهذا الشريك!');
  } else {
    console.log('📋 قائمة المنتجات:\n');
    
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.nameAr || product.name}`);
      console.log(`   🆔 ID: ${product.id}`);
      console.log(`   📂 الفئة: ${product.category?.nameAr || 'بدون فئة'}`);
      console.log(`   💰 السعر: ${product.price.toLocaleString()} ج`);
      console.log(`   📦 المخزون: ${product.stock}`);
      console.log(`   ✅ نشط: ${product.isActive ? 'نعم ✅' : 'لا ❌'}`);
      console.log(`   👁️ ظاهر: ${product.isVisible ? 'نعم ✅' : 'لا ❌'}`);
      console.log(`   📅 تاريخ الإضافة: ${product.createdAt.toLocaleString('ar-EG')}`);
      console.log(`   🖼️ الصور: ${product.images?.split(',').length || 0} صورة`);
      
      // التحقق من الشروط
      const shouldAppearInVendorPage = product.isActive;
      const shouldAppearInStore = product.isActive && product.isVisible;
      
      console.log(`   🔍 يظهر في صفحة الشريك: ${shouldAppearInVendorPage ? 'نعم ✅' : 'لا ❌'}`);
      console.log(`   🔍 يظهر في المتجر: ${shouldAppearInStore ? 'نعم ✅' : 'لا ❌'}\n`);
    });
  }

  await prisma.$disconnect();
}

checkTolineProducts().catch(console.error);
