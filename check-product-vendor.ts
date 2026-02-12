import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProduct() {
  try {
    const productId = 'cmlin5y310003l1049pq5za7o';
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        vendor: {
          select: {
            id: true,
            userId: true,
            storeNameAr: true,
            storeName: true,
            businessName: true,
            businessNameAr: true,
            logo: true,
            rating: true,
          },
        },
      },
    });

    if (!product) {
      console.log('❌ المنتج غير موجود');
      return;
    }

    console.log('\n📦 معلومات المنتج:');
    console.log('ID:', product.id);
    console.log('الاسم:', product.nameAr);
    console.log('البائع ID:', product.vendorId);
    
    console.log('\n🏪 معلومات البائع:');
    if (product.vendor) {
      console.log('ID:', product.vendor.id);
      console.log('User ID:', product.vendor.userId);
      console.log('اسم المتجر بالعربي (storeNameAr):', product.vendor.storeNameAr || '❌ فارغ');
      console.log('اسم المتجر (storeName):', product.vendor.storeName || '❌ فارغ');
      console.log('اسم النشاط بالعربي (businessNameAr):', product.vendor.businessNameAr || '❌ فارغ');
      console.log('اسم النشاط (businessName):', product.vendor.businessName || '❌ فارغ');
      console.log('Logo:', product.vendor.logo || 'لا يوجد');
      console.log('Rating:', product.vendor.rating);
      
      if (!product.vendor.storeNameAr) {
        console.log('\n⚠️ المشكلة: storeNameAr فارغ!');
        console.log('الحل: تحديث اسم المتجر بالعربي للبائع');
      }
    } else {
      console.log('❌ المنتج ليس له بائع (vendor = null)');
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProduct();
