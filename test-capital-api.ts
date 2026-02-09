import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCapitalAPI() {
  try {
    // جلب بيانات ندى
    const nada = await prisma.vendor.findFirst({
      where: {
        user: {
          email: 'nada@gmail.com'
        }
      },
      select: {
        id: true,
        initialCapital: true,
        capitalBalance: true
      }
    });

    if (!nada) {
      console.log('❌ لم يتم العثور على حساب ندى');
      return;
    }

    console.log('✅ بيانات الحساب:');
    console.log('ID:', nada.id);
    console.log('رأس المال الأولي:', nada.initialCapital);
    console.log('رأس المال الحالي:', nada.capitalBalance);
    console.log('');

    // حساب بضاعة مملوكة
    const ownedProducts = await prisma.product.findMany({
      where: {
        vendorId: nada.id,
        productSource: 'OWNED'
      },
      select: {
        name: true,
        productionCost: true,
        stock: true
      }
    });

    console.log('📦 بضاعة مملوكة (OWNED):');
    let ownedTotal = 0;
    ownedProducts.forEach(p => {
      const cost = (p.productionCost || 0) * p.stock;
      ownedTotal += cost;
      console.log(`  - ${p.name}: ${p.productionCost} × ${p.stock} = ${cost} ج`);
    });
    console.log(`إجمالي بضاعة مملوكة: ${ownedTotal} ج`);
    console.log('');

    // حساب بضاعة خارجية
    const offlineProducts = await prisma.offlineProduct.findMany({
      where: {
        vendorId: nada.id
      },
      select: {
        productName: true,
        purchasePrice: true,
        quantity: true,
        soldQuantity: true
      }
    });

    console.log('🏪 بضاعة خارجية (Offline):');
    let offlineStockTotal = 0;
    let offlineSoldTotal = 0;
    
    offlineProducts.forEach(p => {
      const remaining = p.quantity - p.soldQuantity;
      const stockCost = p.purchasePrice * remaining;
      const soldCost = p.purchasePrice * p.soldQuantity;
      
      offlineStockTotal += stockCost;
      offlineSoldTotal += soldCost;
      
      console.log(`  - ${p.productName || 'بدون اسم'}:`);
      console.log(`    كمية: ${p.quantity}, مباع: ${p.soldQuantity}, متبقي: ${remaining}`);
      console.log(`    سعر الشراء: ${p.purchasePrice} ج`);
      console.log(`    تكلفة المخزن: ${stockCost} ج`);
      console.log(`    تكلفة المباع (معلق): ${soldCost} ج`);
    });
    
    console.log(`\nإجمالي بضاعة خارجية (مخزن): ${offlineStockTotal} ج`);
    console.log(`إجمالي مبيعات معلقة: ${offlineSoldTotal} ج`);
    console.log('');
    
    console.log('📊 الملخص النهائي:');
    console.log(`رأس المال الأولي: ${nada.initialCapital} ج`);
    console.log(`بضاعة مملوكة: ${ownedTotal} ج`);
    console.log(`بضاعة خارجية (مخزن): ${offlineStockTotal} ج`);
    console.log(`مبيعات معلقة: ${offlineSoldTotal} ج`);
    console.log(`رأس المال المتاح: ${nada.capitalBalance} ج`);
    console.log(`\nالمتوقع: ${nada.initialCapital} - ${ownedTotal} - ${offlineStockTotal} - ${offlineSoldTotal} = ${nada.initialCapital - ownedTotal - offlineStockTotal - offlineSoldTotal} ج`);
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCapitalAPI();
