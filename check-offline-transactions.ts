import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  const nada = await prisma.user.findUnique({
    where: { email: 'nada@gmail.com' },
    include: { vendor: true }
  });

  // البضاعة الخارجية
  const offlineProducts = await prisma.offlineProduct.findMany({
    where: { vendorId: nada!.vendor!.id },
    select: {
      id: true,
      productName: true,
      purchasePrice: true,
      quantity: true,
      createdAt: true
    }
  });

  console.log('📦 البضاعة الخارجية (' + offlineProducts.length + '):\n');
  
  let totalCost = 0;
  for (const p of offlineProducts) {
    const cost = p.purchasePrice * p.quantity;
    totalCost += cost;
    console.log(p.productName + ': ' + p.quantity + ' × ' + p.purchasePrice + ' = ' + cost + ' ج');
    console.log('   📅 تاريخ: ' + new Date(p.createdAt).toLocaleDateString('ar-EG'));
  }
  
  console.log('\n💰 إجمالي التكلفة: ' + totalCost + ' ج\n');
  console.log('─────────────────────────────────\n');

  // معاملات PURCHASE للبضاعة الخارجية
  const purchaseTransactions = await prisma.capitalTransaction.findMany({
    where: {
      vendorId: nada!.vendor!.id,
      type: 'PURCHASE',
      descriptionAr: { contains: 'بضاعة خارج النظام' }
    },
    select: {
      amount: true,
      descriptionAr: true,
      createdAt: true
    }
  });

  console.log('📜 معاملات PURCHASE للبضاعة الخارجية (' + purchaseTransactions.length + '):\n');
  
  if (purchaseTransactions.length > 0) {
    let totalRecorded = 0;
    purchaseTransactions.forEach(t => {
      totalRecorded += t.amount;
      console.log(t.amount + ' ج - ' + t.descriptionAr);
      console.log('   📅 ' + new Date(t.createdAt).toLocaleDateString('ar-EG') + '\n');
    });
    console.log('💵 إجمالي المسجل: ' + totalRecorded + ' ج\n');
    console.log('📊 الفرق: ' + (totalCost - totalRecorded) + ' ج\n');
  } else {
    console.log('❌ لا توجد معاملات مسجلة!\n');
    console.log('⚠️  المشكلة: البضاعة تم إضافتها بدون خصم من رأس المال\n');
  }
  
  await prisma.$disconnect();
})();
