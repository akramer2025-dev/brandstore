import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNadaProducts() {
  try {
    console.log('\n🔍 جاري فحص منتجات ندى...\n');

    // البحث عن ندى
    const nadaUser = await prisma.user.findUnique({
      where: { email: 'nada@gmail.com' },
      include: {
        vendor: {
          include: {
            products: {
              where: {
                isActive: true
              },
              select: {
                id: true,
                name: true,
                nameAr: true,
                price: true,
                originalPrice: true,
                supplierCost: true,
                productionCost: true,
                stock: true,
                productSource: true,
                supplierName: true,
                isSupplierPaid: true,
                createdAt: true,
              }
            }
          }
        }
      }
    });

    if (!nadaUser) {
      console.log('❌ لم يتم العثور على حساب ندى');
      return;
    }

    if (!nadaUser.vendor) {
      console.log('❌ ندى ليس لديها حساب vendor');
      return;
    }

    console.log('✅ تم العثور على حساب ندى');
    console.log(`   📧 الإيميل: ${nadaUser.email}`);
    console.log(`   👤 الاسم: ${nadaUser.name}`);
    console.log(`   🏪 المتجر: ${nadaUser.vendor.storeName}\n`);

    const products = nadaUser.vendor.products;
    console.log(`📦 إجمالي المنتجات النشطة: ${products.length}\n`);

    // تصنيف المنتجات
    const ownedProducts = products.filter(p => p.productSource === 'OWNED');
    const consignmentProducts = products.filter(p => p.productSource === 'CONSIGNMENT');
    const dropshipProducts = products.filter(p => p.productSource === 'DROPSHIP');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // المنتجات المملوكة
    if (ownedProducts.length > 0) {
      console.log(`💰 المنتجات المملوكة (${ownedProducts.length} منتج):`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      let totalOwnedValue = 0;
      let totalOwnedStock = 0;

      ownedProducts.forEach((product, index) => {
        const costPrice = product.supplierCost || product.productionCost || 0;
        const totalValue = costPrice * product.stock;
        totalOwnedValue += totalValue;
        totalOwnedStock += product.stock;

        console.log(`${index + 1}. ${product.nameAr || product.name}`);
        console.log(`   💵 سعر البيع: ${product.price} ج`);
        console.log(`   🏷️  تكلفة المنتج: ${costPrice} ج`);
        console.log(`   📦 المخزون: ${product.stock} قطعة`);
        console.log(`   💰 القيمة الإجمالية: ${totalValue.toFixed(0)} ج`);
        console.log(`   🔖 المصدر: مملوك (OWNED)`);
        console.log(`   📅 تاريخ الإضافة: ${new Date(product.createdAt).toLocaleDateString('ar-EG')}`);
        console.log('');
      });

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📊 ملخص المنتجات المملوكة:`);
      console.log(`   🔢 عدد المنتجات: ${ownedProducts.length}`);
      console.log(`   📦 إجمالي القطع: ${totalOwnedStock}`);
      console.log(`   💰 القيمة الإجمالية: ${totalOwnedValue.toFixed(0)} ج`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log('ℹ️  لا توجد منتجات مملوكة\n');
    }

    // المنتجات بالأمانة
    if (consignmentProducts.length > 0) {
      console.log(`🤝 المنتجات بالأمانة (${consignmentProducts.length} منتج):`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      consignmentProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.nameAr || product.name}`);
        console.log(`   💵 سعر البيع: ${product.price} ج`);
        console.log(`   📦 المخزون: ${product.stock} قطعة`);
        console.log(`   👤 المورد: ${product.supplierName || 'غير محدد'}`);
        console.log(`   💸 مدفوع للمورد: ${product.isSupplierPaid ? '✅ نعم' : '❌ لا'}`);
        console.log('');
      });
    }

    // Dropship
    if (dropshipProducts.length > 0) {
      console.log(`📮 منتجات Dropship (${dropshipProducts.length} منتج):`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      dropshipProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.nameAr || product.name}`);
        console.log(`   💵 سعر البيع: ${product.price} ج`);
        console.log(`   📦 المخزون: ${product.stock} قطعة`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNadaProducts();
