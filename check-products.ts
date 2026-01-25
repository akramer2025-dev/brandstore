import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  console.log(`📊 إجمالي المنتجات: ${count} منتج`);
  
  const prod17 = await prisma.product.findUnique({ where: { id: 'prod17' } });
  console.log(`prod17: ${prod17 ? '❌ موجود' : '✅ تم الحذف'}`);
  
  console.log('\n📝 قائمة المنتجات:');
  const products = await prisma.product.findMany({
    select: { id: true, nameAr: true, category: { select: { nameAr: true } } },
    orderBy: { id: 'asc' }
  });
  
  products.forEach(p => console.log(`- ${p.id}: ${p.nameAr} (${p.category.nameAr})`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
