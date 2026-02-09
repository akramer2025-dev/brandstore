import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  const nada = await prisma.user.findUnique({
    where: { email: 'nada@gmail.com' },
    include: { vendor: true }
  });

  const vendorId = nada!.vendor!.id;
  const currentCapital = nada!.vendor!.capitalBalance!;

  // معاملات PURCHASE للبضاعة الخارجية
  const purchases = await prisma.capitalTransaction.findMany({
    where: {
      vendorId,
      type: 'PURCHASE',
      descriptionAr: { contains: 'بضاعة خارج النظام' }
    },
    select: { amount: true }
  });

  const totalPurchases = purchases.reduce((sum, p) => sum + p.amount, 0);

  // البضاعة الموجودة فعلاً
  const offlineProducts = await prisma.offlineProduct.findMany({
    where: { vendorId },
    select: {
      purchasePrice: true,
      quantity: true,
      soldQuantity: true
    }
  });

  const totalInStock = offlineProducts.reduce((sum, p) => {
    return sum + (p.purchasePrice * p.quantity);
  }, 0);

  console.log('\n📊 مقارنة المعاملات بالبضاعة:\n');
  console.log(`💰 معاملات PURCHASE:     ${totalPurchases} ج`);
  console.log(`📦 البضاعة الفعلية:      ${totalInStock} ج`);
  console.log(`🗑️  المحذوف:              ${(totalPurchases - totalInStock).toFixed(2)} ج\n`);

  const deletedAmount = totalPurchases - totalInStock;

  if (deletedAmount > 0) {
    console.log('⚠️  المشكلة: فيه بضاعة اتحذفت بس معاملاتها لسه موجودة!\n');
    console.log(`💡 الحل: هنشيل ${deletedAmount.toFixed(2)} ج من معاملات PURCHASE القديمة\n`);

    // المفروض نحذف معاملات PURCHASE للبضاعة المحذوفة
    // لكن ما نعرفش مين بالظبط
    // فهنعمل حساب عكسي ونضيف الفرق برجع

    const correctedCapital = currentCapital + deletedAmount;

    console.log(`رأس المال الحالي:    ${currentCapital} ج`);
    console.log(`+ استرجاع محذوف:      ${deletedAmount.toFixed(2)} ج`);
    console.log(`─────────────────────────────`);
    console.log(`= رأس المال المصحح:  ${correctedCapital.toFixed(2)} ج\n`);

    await prisma.vendor.update({
      where: { id: vendorId },
      data: { capitalBalance: correctedCapital }
    });

    await prisma.capitalTransaction.create({
      data: {
        vendorId,
        type: 'DEPOSIT',
        amount: deletedAmount,
        balanceBefore: currentCapital,
        balanceAfter: correctedCapital,
        description: 'تصحيح: استرجاع تكلفة بضاعة محذوفة قديمة',
        descriptionAr: 'تصحيح: استرجاع تكلفة بضاعة محذوفة قديمة',
      },
    });

    console.log('✅ تم التصحيح!\n');

    // التحقق النهائي
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

    const offlineStockValue = offlineProducts.reduce((sum, p) => {
      const stock = (p.quantity || 0) - (p.soldQuantity || 0);
      return sum + (p.purchasePrice * stock);
    }, 0);

    const offlineSoldValue = offlineProducts.reduce((sum, p) => {
      return sum + (p.purchasePrice * (p.soldQuantity || 0));
    }, 0);

    const initialCapital = 7500;
    const expectedCapital = initialCapital - ownedValue - offlineStockValue - offlineSoldValue;

    console.log('═══════════════════════════════════════════════════════');
    console.log('              ✅ النتيجة النهائية');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`رأس المال الأولي:       ${initialCapital} ج`);
    console.log(`- بضاعة مملوكة:          ${ownedValue} ج`);
    console.log(`- بضاعة خارجية (مخزن):   ${offlineStockValue} ج`);
    console.log(`- بضاعة مباعة (معلقة):   ${offlineSoldValue} ج`);
    console.log(`───────────────────────────────────────`);
    console.log(`= المتوقع:               ${expectedCapital.toFixed(2)} ج\n`);
    console.log(`💰 الفعلي:                ${correctedCapital.toFixed(2)} ج\n`);

    if (Math.abs(correctedCapital - expectedCapital) < 0.01) {
      console.log('✅ رأس المال صحيح 100%!\n');
    } else {
      console.log(`📊 الفرق: ${(correctedCapital - expectedCapital).toFixed(2)} ج\n`);
    }
  }

  await prisma.$disconnect();
})();
