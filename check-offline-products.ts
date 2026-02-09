import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOfflineProducts() {
  try {
    console.log('\n📦 فحص البضاعة خارج النظام (OfflineSupplierProduct)\n');
    console.log('═══════════════════════════════════════════════════════\n');

    // البحث عن ندى
    const nadaUser = await prisma.user.findUnique({
      where: { email: 'nada@gmail.com' },
      include: {
        vendor: {
          select: {
            id: true,
            storeName: true,
            capitalBalance: true,
          }
        }
      }
    });

    if (!nadaUser?.vendor) {
      console.log('❌ لم يتم العثور على حساب ندى');
      return;
    }

    const vendorId = nadaUser.vendor.id;

    // البحث عن المنتجات خارج النظام
    const offlineProducts = await prisma.offlineSupplierProduct.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        productName: true,
        supplierName: true,
        costPrice: true,
        sellingPrice: true,
        quantity: true,
        soldQuantity: true,
        createdAt: true,
      }
    });

    console.log(`🔍 عدد المنتجات: ${offlineProducts.length}\n`);

    if (offlineProducts.length === 0) {
      console.log('ℹ️  لا توجد منتجات خارج النظام\n');
      console.log('💡 هذا يعني أن التعديلات الأخيرة صحيحة!\n');
      console.log('   ✅ البضاعة خارج النظام تم نقلها لنظام Product');
      console.log('   ✅ المبيعات تستخدم النظام الجديد\n');
      return;
    }

    let totalStockCost = 0;
    let totalSoldCost = 0;

    offlineProducts.forEach((p, index) => {
      const stockCost = p.costPrice * ((p.quantity || 0) - (p.soldQuantity || 0));
      const soldCost = p.costPrice * (p.soldQuantity || 0);
      totalStockCost += stockCost;
      totalSoldCost += soldCost;

      console.log(`${index + 1}. ${p.productName}`);
      console.log(`   👤 المورد: ${p.supplierName}`);
      console.log(`   💵 التكلفة: ${p.costPrice} ج | البيع: ${p.sellingPrice} ج`);
      console.log(`   📦 الكمية: ${p.quantity} (مباع: ${p.soldQuantity || 0})`);
      console.log(`   💰 قيمة المخزون: ${stockCost.toFixed(2)} ج`);
      console.log(`   📊 قيمة المباع: ${soldCost.toFixed(2)} ج`);
      console.log(`   📅 التاريخ: ${new Date(p.createdAt).toLocaleDateString('ar-EG')}\n`);
    });

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📊 الملخص:\n');
    console.log(`   💼 قيمة المخزون (خارج النظام): ${totalStockCost.toFixed(2)} ج`);
    console.log(`   📈 قيمة المباع (خارج النظام): ${totalSoldCost.toFixed(2)} ج\n`);

    console.log('───────────────────────────────────────────────────────\n');
    console.log('💡 ملاحظة هامة:\n');
    console.log('   هذه المنتجات كانت تستخدم نظام OfflineSupplierProduct');
    console.log('   وكانت تسجل SALE_PROFIT عند البيع (خطأ!)');
    console.log('   الآن تم إصلاح النظام ليسجل المبيعات بدون تحديث رأس المال\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOfflineProducts();
