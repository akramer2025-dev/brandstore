import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  const nada = await prisma.user.findUnique({
    where: { email: 'nada@gmail.com' },
    include: { vendor: true }
  });

  // 1. البضاعة المملوكة (Product OWNED)
  const ownedProducts = await prisma.product.findMany({
    where: {
      vendorId: nada!.vendor!.id,
      productSource: 'OWNED'
    },
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

  // 2. البضاعة الخارجية (عند المحلات)
  const offlineProducts = await prisma.offlineProduct.findMany({
    where: { vendorId: nada!.vendor!.id },
    select: {
      purchasePrice: true,
      quantity: true,
      soldQuantity: true
    }
  });

  const offlineValue = offlineProducts.reduce((sum, p) => {
    const stock = (p.quantity || 0) - (p.soldQuantity || 0);
    return sum + (p.purchasePrice * stock);
  }, 0);

  const initialCapital = nada!.vendor!.initialCapital!;
  const currentCapital = nada!.vendor!.capitalBalance!;

  console.log('رأس المال الأولي:           ' + initialCapital + ' ج');
  console.log('- بضاعة مملوكة (Product):   ' + ownedValue + ' ج');
  console.log('- بضاعة خارجية (عند محلات): ' + offlineValue + ' ج');
  console.log('────────────────────────────────');
  const expected = initialCapital - ownedValue - offlineValue;
  console.log('= المتوقع:                   ' + expected.toFixed(2) + ' ج');
  console.log('');
  console.log('الفعلي (DB):                 ' + currentCapital + ' ج');
  console.log('الفرق:                       ' + (currentCapital - expected).toFixed(2) + ' ج');
  
  await prisma.$disconnect();
})();
