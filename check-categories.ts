import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCategories() {
  try {
    const categories = await prisma.category.findMany();
    console.log('✅ عدد الأصناف الموجودة:', categories.length);
    
    if (categories.length > 0) {
      console.log('📋 الأصناف:');
      categories.forEach(cat => {
        console.log(`  - ${cat.name} (ID: ${cat.id})`);
      });
    } else {
      console.log('✅ لا توجد أصناف في قاعدة البيانات');
    }
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
