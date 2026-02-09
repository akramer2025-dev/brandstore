import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStats() {
  try {
    const vendor = await prisma.vendor.findFirst({
      select: {
        id: true,
        capitalBalance: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!vendor) {
      console.log('❌ لم يتم العثور على حساب بائع');
      return;
    }

    console.log('✅ معلومات الحساب:');
    console.log('   الاسم:', vendor.user.name);
    console.log('   رأس المال الحالي:', vendor.capitalBalance, 'جنيه');
    console.log('');

    // جلب البضائع
    const offlineProducts = await prisma.offlineProduct.findMany({
      where: { vendorId: vendor.id },
    });

    console.log('📦 البضائع الأوفلاين:');
    console.log('   عدد البضائع:', offlineProducts.length);
    console.log('');

    if (offlineProducts.length > 0) {
      const stats = offlineProducts.reduce((acc, product) => {
        const remainingQuantity = product.quantity - product.soldQuantity;
        const remainingCost = product.purchasePrice * remainingQuantity;
        const remainingRevenue = product.sellingPrice * remainingQuantity;
        const soldRevenue = product.sellingPrice * product.soldQuantity;
        
        return {
          totalCost: acc.totalCost + (product.purchasePrice * product.quantity),
          totalRemainingRevenue: acc.totalRemainingRevenue + remainingRevenue,
          totalSoldRevenue: acc.totalSoldRevenue + soldRevenue,
          totalProfit: acc.totalProfit + product.profit,
          totalQuantity: acc.totalQuantity + product.quantity,
          totalSoldQuantity: acc.totalSoldQuantity + product.soldQuantity,
          totalRemainingQuantity: acc.totalRemainingQuantity + remainingQuantity,
        };
      }, { 
        totalCost: 0, 
        totalRemainingRevenue: 0, 
        totalSoldRevenue: 0,
        totalProfit: 0, 
        totalQuantity: 0,
        totalSoldQuantity: 0,
        totalRemainingQuantity: 0,
      });

      console.log('📊 الإحصائيات:');
      console.log('   إجمالي التكلفة:', stats.totalCost, 'ج');
      console.log('   إجمالي المبيعات المحصلة:', stats.totalSoldRevenue, 'ج');
      console.log('   إجمالي المتوقعة:', stats.totalRemainingRevenue, 'ج');
      console.log('   الكمية الكلية:', stats.totalQuantity);
      console.log('   الكمية المباعة:', stats.totalSoldQuantity);
      console.log('   الكمية المتبقية:', stats.totalRemainingQuantity);
      console.log('');

      console.log('💰 حسابات رأس المال:');
      console.log('   رأس المال الحالي:', vendor.capitalBalance, 'ج');
      console.log('   + إجمالي التكلفة:', stats.totalCost, 'ج');
      console.log('   - المبيعات المحصلة:', stats.totalSoldRevenue, 'ج');
      console.log('   ─────────────────────────────');
      console.log('   = رأس المال الأولي:', vendor.capitalBalance + stats.totalCost - stats.totalSoldRevenue, 'ج');
      console.log('');
      console.log('   رأس المال المتوقع بعد بيع كل المتبقي:');
      console.log('   ', vendor.capitalBalance, '+', stats.totalRemainingRevenue, '=', vendor.capitalBalance + stats.totalRemainingRevenue, 'ج');
    }

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStats();
