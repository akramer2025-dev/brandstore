const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProduct() {
  try {
    console.log('🔍 جاري البحث عن منتج "باليت آيشادو لارين"...\n');

    const product = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'باليت'
        }
      },
      select: {
        id: true,
        name: true,
        price: true,
        allowInstallment: true,
        isVisible: true,
        isActive: true
      }
    });

    if (product) {
      console.log('✅ تم العثور على المنتج:\n');
      console.log(`المنتج: ${product.name}`);
      console.log(`السعر: ${product.price} ج`);
      console.log(`مرئي: ${product.isVisible ? '✅ نعم' : '❌ لا'}`);
      console.log(`نشط: ${product.isActive ? '✅ نعم' : '❌ لا'}`);
      console.log(`التقسيط: ${product.allowInstallment ? '✅ مفعّل' : '❌ غير مفعّل'}`);
      
      if (!product.allowInstallment) {
        console.log('\n🔄 جاري تفعيل التقسيط على هذا المنتج...');
        
        await prisma.product.update({
          where: { id: product.id },
          data: { allowInstallment: true }
        });
        
        console.log('✅ تم تفعيل التقسيط بنجاح!');
      }
    } else {
      console.log('❌ لم يتم العثور على المنتج');
      
      // البحث بطريقة أخرى
      const allProducts = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: 'آيشادو' } },
            { name: { contains: 'لارين' } },
            { name: { contains: 'باليت' } }
          ]
        },
        select: {
          id: true,
          name: true,
          price: true,
          allowInstallment: true
        },
        take: 10
      });
      
      console.log(`\n📦 تم العثور على ${allProducts.length} منتج مشابه:`);
      allProducts.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} - ${p.allowInstallment ? '✅' : '❌'} التقسيط`);
      });
    }

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProduct();
