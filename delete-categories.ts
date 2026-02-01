import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllCategories() {
  try {
    console.log('🗑️ جاري حذف جميع الأصناف...');

    const result = await prisma.category.deleteMany({});

    console.log(`✅ تم حذف ${result.count} صنف بنجاح`);
  } catch (error) {
    console.error('❌ خطأ في حذف الأصناف:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllCategories();
