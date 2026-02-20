import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // البحث عن فئة الملابس
  const clothingCategory = await prisma.category.findFirst({
    where: {
      OR: [
        { nameAr: { contains: 'ملابس' } },
        { nameAr: { contains: 'تيشيرت' } },
      ]
    }
  });

  if (!clothingCategory) {
    console.log('❌ لم يتم العثور على فئة الملابس');
    return;
  }

  console.log(`✅ تم العثور على فئة: ${clothingCategory.nameAr}`);

  // التحقق من وجود الفئات الفرعية مسبقاً
  const existingSubcategories = await prisma.category.findMany({
    where: {
      parentId: clothingCategory.id
    }
  });

  if (existingSubcategories.length > 0) {
    console.log('⚠️  الفئات الفرعية موجودة بالفعل:');
    existingSubcategories.forEach(cat => console.log(`  - ${cat.nameAr}`));
    return;
  }

  // إنشاء الفئات الفرعية
  const subcategories = [
    {
      name: 'Men Clothing',
      nameAr: 'ملابس رجالي',
      description: 'ملابس للرجال',
      image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891',
      parentId: clothingCategory.id
    },
    {
      name: 'Women Clothing',
      nameAr: 'ملابس نسائي',
      description: 'ملابس للنساء',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b',
      parentId: clothingCategory.id
    },
    {
      name: 'Kids Clothing',
      nameAr: 'ملابس أطفال',
      description: 'ملابس للأطفال',
      image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2',
      parentId: clothingCategory.id
    }
  ];

  // إضافة الفئات
  for (const cat of subcategories) {
    const created = await prisma.category.create({
      data: cat
    });
    console.log(`✅ تم إنشاء: ${created.nameAr}`);
  }

  console.log('\n🎉 تم إنشاء جميع الفئات الفرعية بنجاح!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
