import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  const nada = await prisma.user.findUnique({
    where: { email: 'nada@gmail.com' },
    include: { vendor: true }
  });

  const deposits = await prisma.capitalTransaction.findMany({
    where: {
      vendorId: nada!.vendor!.id,
      type: 'DEPOSIT'
    },
    orderBy: { createdAt: 'asc' },
    select: {
      amount: true,
      descriptionAr: true,
      createdAt: true
    }
  });

  console.log('\n💰 جميع معاملات DEPOSIT:\n');
  
  let total = 0;
  deposits.forEach((d, i) => {
    total += d.amount;
    console.log(`${i + 1}. ${d.amount} ج - ${d.descriptionAr}`);
    console.log(`   📅 ${new Date(d.createdAt).toLocaleString('ar-EG')}\n`);
  });

  console.log(`إجمالي: ${total} ج\n`);

  await prisma.$disconnect();
})();
