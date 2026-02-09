import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  console.log('\n🔧 إصلاح نهائي لرأس المال\n');
  console.log('═══════════════════════════════════════════════════════\n');

  const nada = await prisma.user.findUnique({
    where: { email: 'nada@gmail.com' },
    include: { vendor: true }
  });

  const vendorId = nada!.vendor!.id;
  const currentCapital = nada!.vendor!.capitalBalance!;

  console.log(`💰 رأس المال الحالي: ${currentCapital} ج\n`);

  // حذف التصحيح الزائد (1882.5)
  const correction = await prisma.capitalTransaction.findFirst({
    where: {
      vendorId,
      type: 'DEPOSIT',
      amount: 1882.5,
      descriptionAr: 'تصحيح رأس المال - بضاعة خارجية محذوفة'
    }
  });

  if (correction) {
    console.log('❌ حذف تصحيح زائد: 1882.5 ج\n');
    
    await prisma.capitalTransaction.delete({
      where: { id: correction.id }
    });

    const updatedCapital = currentCapital - 1882.5;

    await prisma.vendor.update({
      where: { id: vendorId },
      data: { capitalBalance: updatedCapital }
    });

    console.log(`✅ رأس المال المصحح: ${updatedCapital} ج\n`);
  }

  // حساب الحالة النهائية
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

  const finalCapital = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { capitalBalance: true, initialCapital: true }
  });

  const expectedCapital = finalCapital!.initialCapital! - ownedValue - offlineStockValue - offlineSoldValue;

  console.log('═══════════════════════════════════════════════════════');
  console.log('              ✅ النتيجة النهائية');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`رأس المال الأولي:       ${finalCapital!.initialCapital} ج`);
  console.log(`- بضاعة مملوكة:          ${ownedValue} ج`);
  console.log(`- بضاعة خارجية (مخزن):   ${offlineStockValue} ج`);
  console.log(`- بضاعة مباعة (معلقة):   ${offlineSoldValue} ج`);
  console.log(`───────────────────────────────────────`);
  console.log(`= المتوقع:               ${expectedCapital.toFixed(2)} ج\n`);
  console.log(`💰 الفعلي:                ${finalCapital!.capitalBalance} ج\n`);

  if (Math.abs(finalCapital!.capitalBalance! - expectedCapital) < 0.01) {
    console.log('✅ رأس المال صحيح 100%!\n');
  } else {
    console.log(`⚠️  الفرق: ${(finalCapital!.capitalBalance! - expectedCapital).toFixed(2)} ج\n`);
  }

  await prisma.$disconnect();
})();
