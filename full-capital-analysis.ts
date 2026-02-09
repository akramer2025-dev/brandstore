import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  const nada = await prisma.user.findUnique({
    where: { email: 'nada@gmail.com' },
    include: { vendor: true }
  });

  const vendorId = nada!.vendor!.id;
  const initialCapital = nada!.vendor!.initialCapital!;
  const currentCapital = nada!.vendor!.capitalBalance!;

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('         📊 التحليل الشامل لرأس المال');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log(`💵 رأس المال الأولي:      ${initialCapital} ج\n`);

  // 1. بضاعة مملوكة (Product OWNED)
  const ownedProducts = await prisma.product.findMany({
    where: { vendorId, productSource: 'OWNED' },
    select: {
      supplierCost: true,
      productionCost: true,
      stock: true
    }
  });

  const ownedValue = ownedProducts.reduce((sum, p) => {
    const cost = p.supplierCost || p.productionCost || 0;
    return sum + (cost * (p.stock || 0));
  }, 0);

  console.log(`📦 بضاعة مملوكة (مخزن):   ${ownedValue} ج`);

  // 2. بضاعة خارجية (في المخزن عند المحل)
  const offlineProducts = await prisma.offlineProduct.findMany({
    where: { vendorId },
    select: {
      purchasePrice: true,
      quantity: true,
      soldQuantity: true
    }
  });

  const offlineStockValue = offlineProducts.reduce((sum, p) => {
    const stock = (p.quantity || 0) - (p.soldQuantity || 0);
    return sum + (p.purchasePrice * stock);
  }, 0);

  const offlineSoldValue = offlineProducts.reduce((sum, p) => {
    return sum + (p.purchasePrice * (p.soldQuantity || 0));
  }, 0);

  console.log(`🏪 بضاعة خارجية (مخزن):   ${offlineStockValue} ج`);
  console.log(`💸 بضاعة مباعة (معلقة):   ${offlineSoldValue} ج`);
  console.log(`   (لم يتم استلام المبلغ بعد)\n`);

  console.log('─────────────────────────────────────────────');

  const expectedCapital = initialCapital - ownedValue - offlineStockValue - offlineSoldValue;

  console.log(`\n🧮 رأس المال المتوقع:`);
  console.log(`   ${initialCapital} - ${ownedValue} - ${offlineStockValue} - ${offlineSoldValue}`);
  console.log(`   = ${expectedCapital.toFixed(2)} ج\n`);

  console.log(`💰 رأس المال الفعلي:      ${currentCapital} ج\n`);

  const difference = currentCapital - expectedCapital;
  console.log(`📊 الفرق:                  ${difference.toFixed(2)} ج\n`);

  if (Math.abs(difference) > 0.01) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('                🔍 تحليل الفرق');
    console.log('═══════════════════════════════════════════════════════\n');

    // فحص كل المعاملات
    const allTransactions = await prisma.capitalTransaction.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'asc' },
      select: {
        type: true,
        amount: true,
        descriptionAr: true,
      }
    });

    const summary: Record<string, number> = {};
    allTransactions.forEach(t => {
      if (!summary[t.type]) summary[t.type] = 0;
      summary[t.type] += t.amount;
    });

    console.log('📜 ملخص المعاملات:\n');
    Object.entries(summary).forEach(([type, amount]) => {
      const sign = ['PURCHASE', 'WITHDRAWAL', 'PAYMENT_TO_SUPPLIER'].includes(type) ? '-' : '+';
      console.log(`   ${type}: ${sign}${Math.abs(amount).toFixed(2)} ج`);
    });

    console.log('\n');
  }

  await prisma.$disconnect();
})();
