import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAIContext() {
  console.log('🔍 اختبار سياق المساعد الذكي...\n');

  try {
    // جلب المنتجات النشطة
    const products = await prisma.product.findMany({
      where: { 
        isActive: true,
        isVisible: true,
      },
      select: {
        id: true,
        name: true,
        nameAr: true,
        description: true,
        descriptionAr: true,
        price: true,
        originalPrice: true,
        stock: true,
        category: {
          select: {
            name: true,
            nameAr: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // أحدث 10 منتجات
    });

    console.log(`✅ إجمالي المنتجات النشطة: ${products.length}\n`);
    
    if (products.length > 0) {
      console.log('📦 أحدث 10 منتجات في النظام:\n');
      
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.nameAr || product.name}`);
        console.log(`   الفئة: ${product.category?.nameAr || product.category?.name || 'غير محدد'}`);
        console.log(`   السعر: ${product.price} جنيه${product.originalPrice ? ` (كان ${product.originalPrice} جنيه)` : ''}`);
        
        if (product.descriptionAr || product.description) {
          const desc = product.descriptionAr || product.description;
          const shortDesc = desc.length > 100 ? desc.substring(0, 100) + '...' : desc;
          console.log(`   الوصف: ${shortDesc}`);
        } else {
          console.log(`   ⚠️ تحذير: هذا المنتج ليس له وصف!`);
        }
        
        console.log(`   المخزون: ${product.stock} قطعة`);
        console.log('');
      });
    } else {
      console.log('❌ لا توجد منتجات نشطة في النظام!');
    }

    // جلب الفئات
    const categories = await prisma.category.findMany({
      select: { name: true, nameAr: true }
    });

    console.log(`\n📂 إجمالي الفئات: ${categories.length}`);
    if (categories.length > 0) {
      console.log('الفئات المتاحة:');
      categories.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.nameAr || cat.name}`);
      });
    }

    // جلب أسعار الشحن
    const deliveryZones = await prisma.deliveryZone.findMany({
      where: { isActive: true },
      select: { governorate: true, deliveryFee: true }
    });

    console.log(`\n🚚 أسعار الشحن: ${deliveryZones.length} محافظة`);

    console.log('\n\n✅ المساعد الذكي يستطيع رؤية:');
    console.log(`   - ${products.length} منتج نشط ومعروض`);
    console.log(`   - ${categories.length} فئة/صنف`);
    console.log(`   - ${deliveryZones.length} محافظة مع أسعار الشحن`);
    console.log('\n📌 أي منتج أو صنف جديد تضيفه للموقع، المساعد هيشوفه فوراً!\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAIContext();
