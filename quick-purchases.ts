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
    select: {
      nameAr: true,
      supplierCost: true,
      productionCost: true,
      stock: true
    }
  });

  let total = 0;
  owned.forEach(p => {
    const cost = p.supplierCost || p.productionCost || 0;
    const value = cost * (p.stock || 0);
    total += value;
    if (value > 0) {
      console.log(`${p.nameAr}: ${p.stock} × ${cost} = ${value} ج`);
    }
  });
  
  console.log(`\nالإجمالي: ${total} ج`);
  
  await prisma.$disconnect();
})();
