import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function urgentCheckAmlProducts() {
  console.log('🚨 تشخيص عاجل لمشكلة منتجات aml...\n');

  try {
    // 1. جلب بيانات aml
    const amlUser = await prisma.user.findFirst({
      where: {
        email: 'amlelsayed@gmail.com'
      }
    });

    if (!amlUser) {
      console.log('❌ لم يتم العثور على المستخدم!');
      return;
    }

    console.log('👤 بيانات المستخدم:');
    console.log(`   الاسم: ${amlUser.name}`);
    console.log(`   البريد: ${amlUser.email}`);
    console.log(`   User ID: ${amlUser.id}\n`);

    // 2. جلب vendor account
    const vendor = await prisma.vendor.findUnique({
      where: { userId: amlUser.id }
    });

    if (!vendor) {
      console.log('❌ لا يوجد vendor account!');
      return;
    }

    console.log('✅ Vendor Account:');
    console.log(`   Vendor ID: ${vendor.id}\n`);

    // 3. البحث عن المنتجات بكل الطرق الممكنة
    console.log('🔍 البحث عن المنتجات...\n');

    // الطريقة 1: بـ vendorId
    const productsByVendorId = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      include: { category: true }
    });

    console.log(`📦 المنتجات بـ vendorId (${vendor.id}): ${productsByVendorId.length}`);
    if (productsByVendorId.length > 0) {
      productsByVendorId.forEach(p => {
        console.log(`   - ${p.nameAr || p.name} | نشط: ${p.isActive} | ظاهر: ${p.isVisible}`);
      });
    }
    console.log('');

    // الطريقة 2: البحث في كل المنتجات عن اسم "aml"
    const allProducts = await prisma.product.findMany({
      include: {
        vendor: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const amlProducts = allProducts.filter(p => 
      p.vendor?.user?.email === 'amlelsayed@gmail.com' ||
      p.vendor?.user?.name?.toLowerCase().includes('aml')
    );

    console.log(`📦 المنتجات بالبحث في كل المنتجات: ${amlProducts.length}`);
    if (amlProducts.length > 0) {
      amlProducts.forEach(p => {
        console.log(`   - ${p.nameAr || p.name}`);
        console.log(`     Vendor ID في المنتج: ${p.vendorId}`);
        console.log(`     Vendor ID الصحيح: ${vendor.id}`);
        console.log(`     متطابق: ${p.vendorId === vendor.id ? '✅' : '❌'}`);
        console.log(`     نشط: ${p.isActive} | ظاهر: ${p.isVisible}`);
        console.log(`     تاريخ: ${p.createdAt.toLocaleString('ar-EG')}\n`);
      });
    }
    console.log('');

    // 4. البحث عن آخر منتج تم إضافته في النظام
    const latestProducts = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        vendor: {
          include: {
            user: true
          }
        }
      }
    });

    console.log('📊 آخر 3 منتجات تم إضافتها في النظام بأكمله:\n');
    latestProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.nameAr || p.name}`);
      console.log(`   الشريك: ${p.vendor?.user?.name || 'غير معروف'}`);
      console.log(`   Vendor ID: ${p.vendorId}`);
      console.log(`   التاريخ: ${p.createdAt.toLocaleString('ar-EG')}\n`);
    });

    // 5. التحقق من وجود orders
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              vendorId: vendor.id
            }
          }
        }
      }
    });

    console.log(`📋 عدد الطلبات: ${orders.length}\n`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

urgentCheckAmlProducts();
