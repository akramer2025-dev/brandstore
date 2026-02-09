import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  const nada = await prisma.user.findUnique({
    where: { email: 'nada@gmail.com' },
    include: { vendor: true }
  });

  const vendorId = nada!.vendor!.id;

  // معاملات PURCHASE للبضاعة المملوكة (Product)
  const ownedPurchases = await prisma.capitalTransaction.findMany({
    where: {
      vendorId,
      type: 'PURCHASE',
      NOT: {
        descriptionAr: { contains: 'خارج النظام' }
      }
    },
    select: {
      amount: true,
      descriptionAr: true,
      createdAt: true
    }
  });

  console.log('\n📊 معاملات PURCHASE للبضاعة المملوكة:\n');
  
  if (ownedPurchases.length > 0) {
    let total = 0;
    ownedPurchases.forEach(p => {
      total += p.amount;
      console.log(`${p.amount} ج - ${p.descriptionAr}`);
      console.log(`   📅 ${new Date(p.createdAt).toLocaleDateString('ar-EG')}\n`);
    });
    console.log(`إجمالي: ${total} ج\n`);
  } else {
    console.log('❌ لا توجد معاملات PURCHASE للبضاعة المملوكة!\n');
    console.log('⚠️  المشكلة: البضاعة المملوكة تم إضافتها بدون خصم من رأس المال!\n');
  }

  // البضاعة المملوكة الفعلية
  const ownedProducts = await prisma.product.findMany({
    where: { vendorId, productSource: 'OWNED' },
    select: {
      nameAr: true,
      supplierCost: true,
      productionCost: true,
      stock: true
    }
  });

  console.log('📦 البضاعة المملوكة الفعلية:\n');
  
  let totalOwned = 0;
  ownedProducts.forEach(p => {
    const cost = p.supplierCost || p.productionCost || 0;
    const value = cost * (p.stock || 0);
    totalOwned += value;
    console.log(`${p.nameAr}: ${p.stock} × ${cost} = ${value} ج`);
  });

  console.log(`\nإجمالي: ${totalOwned} ج\n`);

  if (ownedPurchases.length === 0 && totalOwned > 0) {
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('💡 الحل: نخصم قيمة البضاعة المملوكة من رأس المال\n');

    const currentCapital = nada!.vendor!.capitalBalance!;
    const correctedCapital = currentCapital - totalOwned;

    console.log(`رأس المال الحالي:    ${currentCapital} ج`);
    console.log(`- البضاعة المملوكة:  ${totalOwned} ج`);
    console.log(`─────────────────────────────`);
    console.log(`= رأس المال المصحح:  ${correctedCapital.toFixed(2)} ج\n`);

    await prisma.vendor.update({
      where: { id: vendorId },
      data: { capitalBalance: correctedCapital }
    });

    await prisma.capitalTransaction.create({
      data: {
        vendorId,
        type: 'PURCHASE',
        amount: totalOwned,
        balanceBefore: currentCapital,
        balanceAfter: correctedCapital,
        description: `تصحيح: شراء بضاعة مملوكة - ${ownedProducts.length} منتج`,
        descriptionAr: `تصحيح: شراء بضاعة مملوكة - ${ownedProducts.length} منتج`,
      },
    });

    console.log('✅ تم التصحيح!\n');
  }

  await prisma.$disconnect();
})();
