import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  const nada = await prisma.user.findUnique({
    where: { email: 'nada@gmail.com' },
    include: { vendor: true }
  });

  // البحث عن مورد ضياء
  const diyaaSupplier = await prisma.offlineSupplier.findFirst({
    where: {
      vendorId: nada!.vendor!.id,
      name: { contains: 'ضياء' }
    }
  });

  if (!diyaaSupplier) {
    console.log('0 ج');
    await prisma.$disconnect();
    return;
  }

  // البضاعة اللي عند ضياء
  const products = await prisma.offlineProduct.findMany({
    where: {
      vendorId: nada!.vendor!.id,
      supplierId: diyaaSupplier.id
    },
    select: {
      productName: true,
      purchasePrice: true,
      quantity: true,
      soldQuantity: true
    }
  });

  let total = 0;
  products.forEach(p => {
    const stock = (p.quantity || 0) - (p.soldQuantity || 0);
    const value = p.purchasePrice * stock;
    total += value;
  });
  
  console.log(`${total} ج`);
  
  await prisma.$disconnect();
})();
