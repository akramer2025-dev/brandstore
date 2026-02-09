import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  const nada = await prisma.user.findUnique({
    where: { email: 'nada@gmail.com' },
    include: { vendor: true }
  });

  const vendorId = nada!.vendor!.id;

  // فحص البضاعة المباعة
  const offlineProducts = await prisma.offlineProduct.findMany({
    where: { vendorId },
    select: {
      productName: true,
      purchasePrice: true,
      sellingPrice: true,
      quantity: true,
      soldQuantity: true,
    }
  });

  console.log('📊 البضاعة الخارجية المباعة:\n');
  
  let totalSoldCost = 0;
  let totalSoldRevenue = 0;
  
  offlineProducts.forEach(p => {
    if (p.soldQuantity && p.soldQuantity > 0) {
      const cost = p.soldQuantity * p.purchasePrice;
      const revenue = p.soldQuantity * p.sellingPrice;
      const profit = revenue - cost;
      
      totalSoldCost += cost;
      totalSoldRevenue += revenue;
      
      console.log(`${p.productName || 'بدون اسم'}:`);
      console.log(`   المباع: ${p.soldQuantity} من ${p.quantity}`);
      console.log(`   التكلفة: ${cost} ج`);
      console.log(`   الإيراد: ${revenue} ج`);
      console.log(`   الربح: ${profit} ج\n`);
    }
  });

  console.log('═══════════════════════════════════════\n');
  console.log(`إجمالي تكلفة المباع:  ${totalSoldCost} ج`);
  console.log(`إجمالي إيراد المباع:  ${totalSoldRevenue} ج`);
  console.log(`إجمالي الربح:         ${totalSoldRevenue - totalSoldCost} ج\n`);

  // سندات القبض من المحلات
  const receipts = await prisma.offlineSupplierPayment.findMany({
    where: {
      supplier: { vendorId },
      type: 'RECEIPT'
    },
    select: {
      amount: true,
      supplier: {
        select: { name: true }
      },
      createdAt: true
    }
  });

  console.log('📝 سندات القبض من المحلات:\n');
  
  if (receipts.length > 0) {
    let totalReceipts = 0;
    receipts.forEach(r => {
      totalReceipts += r.amount;
      console.log(`${r.supplier.name}: ${r.amount} ج`);
      console.log(`   📅 ${new Date(r.createdAt).toLocaleDateString('ar-EG')}\n`);
    });
    console.log(`إجمالي سندات القبض: ${totalReceipts} ج\n`);
  } else {
    console.log('❌ لا توجد سندات قبض!\n');
    console.log('⚠️  المشكلة: البضاعة اتباعت بس ما استلمناش الفلوس!\n');
  }

  await prisma.$disconnect();
})();
