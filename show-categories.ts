const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showCategories() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        nameAr: true,
        image: true
      }
    });

    console.log('\n=== 📂 الفئات الموجودة ===\n');
    categories.forEach((cat) => {
      console.log(`• ${cat.nameAr} (${cat.name}) - ID: ${cat.id}`);
      if (cat.image) console.log(`  → صورة: ${cat.image}`);
    });
    console.log('\n');
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showCategories();
