import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCategories() {
  try {
    const categories = await prisma.category.findMany();
    console.log('✅ عدد الأصناف الموجودة:', categories.length);
    
    if (categories.length > 0) {
      console.log('📋 الأصناف:\n');
      categories.forEach(cat => {
        const nameDisplay = cat.nameAr ? `${cat.nameAr} (${cat.name})` : cat.name;
        const hasImage = cat.image ? '🖼️' : '❌';
        console.log(`  ${hasImage} ${nameDisplay}`);
        if (cat.image) {
          console.log(`     📸 ${cat.image.substring(0, 70)}...`);
        }
        console.log('');
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
