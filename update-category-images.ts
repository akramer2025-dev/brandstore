import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCategoryImages() {
  console.log('🔄 جاري تحديث صور الفئات...\n');

  // صور مناسبة لكل فئة
  const categoryImages: Record<string, string> = {
    // ملابس
    'ملابس': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800', // ملابس على علاقات
    'تيشيرتات': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', // تيشيرتات
    'بناطيل': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800', // بناطيل
    'جواكت': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', // جواكت
    
    // براندات
    'شي إن': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800', // ملابس نسائية عصرية
    'ترينديول': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800', // ملابس تركية
    
    // أحذية
    'أحذية': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', // أحذية رياضية
    
    // إكسسوارات
    'اكسسورارت': 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800', // ساعة وإكسسوارات
    'إكسسوارات': 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800', // ساعة وإكسسوارات
    'حقائب': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800', // حقائب يد
    
    // مستحضرات تجميل
    'مستحضرات تجميل': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800', // مستحضرات تجميل
    'عطور': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800', // عطور فاخرة
    'مكياج': 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800', // مكياج
    
    // ذهب ومجوهرات
    'ذهب وفضه': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800', // مجوهرات ذهبية
    'مجوهرات': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800', // مجوهرات
    
    // عام
    'عام': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800', // متجر عام
    'General': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800', // متجر عام
  };

  try {
    // جلب جميع الفئات
    const categories = await prisma.category.findMany();
    
    console.log(`✅ تم العثور على ${categories.length} فئة\n`);

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const category of categories) {
      const categoryName = category.nameAr || category.name;
      console.log(`📁 معالجة: ${categoryName}`);

      // البحث عن صورة مناسبة
      let imageUrl = null;
      
      // البحث بالاسم العربي أولاً
      if (categoryImages[categoryName]) {
        imageUrl = categoryImages[categoryName];
      } else {
        // البحث بالكلمات المفتاحية
        for (const [key, value] of Object.entries(categoryImages)) {
          if (categoryName.includes(key) || key.includes(categoryName)) {
            imageUrl = value;
            break;
          }
        }
      }

      if (imageUrl) {
        await prisma.category.update({
          where: { id: category.id },
          data: { image: imageUrl }
        });
        console.log(`   ✅ تم تحديث الصورة: ${imageUrl.substring(0, 50)}...`);
        updatedCount++;
      } else {
        console.log(`   ⚠️  لم يتم العثور على صورة مناسبة`);
        notFoundCount++;
      }
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 النتائج:`);
    console.log(`   ✅ تم التحديث: ${updatedCount} فئة`);
    console.log(`   ⚠️  لم يتم العثور على صورة: ${notFoundCount} فئة`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    console.log('✨ تم إكمال التحديث بنجاح!');
    
  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCategoryImages();
