import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  const nada = await prisma.user.findUnique({
    where: { email: 'nada@gmail.com' },
    include: { vendor: true }
  });

  const offlineProducts = await prisma.offlineProduct.findMany({
    where: { vendorId: nada!.vendor!.id },
    select: {
      productName: true,
      purchasePrice: true,
      quantity: true,
      soldQuantity: true
    }
  });

  let total = 0;
  offlineProducts.forEach(p => {
    const stock = (p.quantity || 0) - (p.soldQuantity || 0);
    const value = p.purchasePrice * stock;
    total += value;
    if (value > 0) {
      console.log(`${p.productName}: ${stock} × ${p.purchasePrice} = ${value} ج`);
    }
  });
  
  console.log(`\n${total} ج`);
  
  await prisma.$disconnect();
})();
