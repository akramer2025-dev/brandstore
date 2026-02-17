import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyInstallment() {
  try {
    console.log('🔍 التحقق من حالة التقسيط...\n');
    
    const products = await prisma.product.findMany({
      where: {
        allowInstallment: true
      },
      take: 10,
      select: {
        id: true,
        name: true,
        price: true,
        allowInstallment: true,
        isVisible: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('✅ منتجات مع التقسيط مفعل:\n');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   💰 السعر: ${product.price} ج`);
      console.log(`   🏦 التقسيط: ${product.allowInstallment ? '✅ مفعل' : '❌ معطل'}`);
      console.log(`   👁️  ظاهر: ${product.isVisible ? 'نعم' : 'لا'}\n`);
    });
    
    const count = await prisma.product.count({
      where: { allowInstallment: true }
    });
    
    console.log(`📊 إجمالي المنتجات المفعل عليها التقسيط: ${count}\n`);
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyInstallment();
