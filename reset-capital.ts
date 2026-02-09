import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  console.log('🔄 إعادة ضبط رأس المال بالكامل\n');
  console.log('═══════════════════════════════════════════════════════\n');

  const nada = await prisma.user.findUnique({
    where: { email: 'nada@gmail.com' },
    include: { vendor: true }
  });

  const vendorId = nada!.vendor!.id;
  const initialCapital = 7500;

  // حذف جميع المعاملات المشبوهة
  console.log('🗑️  حذف المعاملات الخاطئة...\n');

  // حذف DEPOSIT الخاطئة
  await prisma.capitalTransaction.deleteMany({
    where: {
      vendorId,
      OR: [
        { descriptionAr: 'مسح جميع البضائع والبدء من جديد - استرجاع 353 ج' },
        { descriptionAr: 'إيداع رأس مال' },
        { descriptionAr: 'تصحيح رأس المال - بضاعة خارجية محذوفة' },
      ]
    }
  });

  // حذف WITHDRAWAL الخاطئة
  await prisma.capitalTransaction.deleteMany({
    where: {
      vendorId,
      type: 'WITHDRAWAL'
    }
  });

  console.log('✅ تم حذف المعاملات الخاطئة\n');

  // حساب رأس المال الصحيح من المعاملات المتبقية
  const remainingTransactions = await prisma.capitalTransaction.findMany({
    where: { vendorId },
    orderBy: { createdAt: 'asc' },
    select: {
      type: true,
      amount: true,
      descriptionAr: true
    }
  });

  let calculatedCapital = initialCapital;

  console.log('📜 المعاملات المتبقية:\n');
  
  remainingTransactions.forEach(t => {
    if (t.type === 'PURCHASE' || t.type === 'PAYMENT_TO_SUPPLIER') {
      calculatedCapital -= t.amount;
      console.log(`   -${t.amount} ج (${t.type})`);
    } else {
      calculatedCapital += t.amount;
      console.log(`   +${t.amount} ج (${t.type})`);
    }
  });

  console.log(`\n💰 رأس المال المحسوب: ${calculatedCapital.toFixed(2)} ج\n`);

  // تحديث رأس المال
  await prisma.vendor.update({
    where: { id: vendorId },
    data: { capitalBalance: calculatedCapital }
  });

  console.log('✅ تم تحديث رأس المال\n');

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
  console.log(`💰 الفعلي:                ${calculatedCapital.toFixed(2)} ج\n`);

  if (Math.abs(calculatedCapital - expectedCapital) < 0.01) {
    console.log('✅ رأس المال صحيح 100%!\n');
  } else {
    console.log(`📊 الفرق: ${(calculatedCapital - expectedCapital).toFixed(2)} ج\n`);
  }

  await prisma.$disconnect();
})();
