import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  const nada = await prisma.user.findUnique({
    where: { email: 'nada@gmail.com' },
    include: { vendor: true }
  });

  const owned = await prisma.product.findMany({
    where: {
      vendorId: nada!.vendor!.id,
      productSource: 'OWNED'
    },
    select: { soldCount: true, price: true }
  });

  const totalSales = owned.reduce((sum, p) => sum + (p.soldCount || 0) * p.price, 0);
  
  console.log(`${totalSales} ج`);
  console.log(`${nada!.vendor!.capitalBalance} ج`);
  
  await prisma.$disconnect();
})();
