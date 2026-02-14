const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSliderImages() {
  console.log('🚀 بدء إضافة صور السلايدر...');

  try {
    // حذف الصور القديمة
    await prisma.sliderImage.deleteMany({});
    console.log('✅ تم حذف الصور القديمة');

    // إضافة صور جديدة
    const sliderImages = [
      {
        title: 'Summer Collection 2026',
        titleAr: 'تشكيلة ملابس صيف 2026',
        subtitle: 'Latest fashion trends at affordable prices',
        subtitleAr: 'أحدث صيحات الموضة بأسعار مناسبة',
        imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920',
        link: '/products',
        buttonText: 'Shop Now',
        buttonTextAr: 'تسوق الآن',
        order: 1,
        isActive: true,
      },
      {
        title: 'Exclusive Sports Wear Deals',
        titleAr: 'عروض حصرية على الملابس الرياضية',
        subtitle: 'Discounts up to 50%',
        subtitleAr: 'خصومات تصل إلى 50%',
        imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920',
        link: '/flash-deals',
        buttonText: 'View Deals',
        buttonTextAr: 'شاهد العروض',
        order: 2,
        isActive: true,
      },
      {
        title: 'Elegant Winter Jackets',
        titleAr: 'جاكيتات شتوية أنيقة',
        subtitle: 'Warmth and elegance in one piece',
        subtitleAr: 'دفء وأناقة في قطعة واحدة',
        imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920',
        link: '/products',
        buttonText: 'Discover More',
        buttonTextAr: 'اكتشف المزيد',
        order: 3,
        isActive: true,
      },
      {
        title: 'Trendy Shoes for Every Occasion',
        titleAr: 'أحذية عصرية لكل المناسبات',
        subtitle: 'Unmatched comfort and quality',
        subtitleAr: 'راحة وجودة لا مثيل لها',
        imageUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1920',
        link: '/products',
        buttonText: 'Shop Shoes',
        buttonTextAr: 'تسوق الأحذية',
        order: 4,
        isActive: true,
      },
    ];

    for (const image of sliderImages) {
      await prisma.sliderImage.create({
        data: image,
      });
    }

    console.log(`✅ تم إضافة ${sliderImages.length} صور للسلايدر`);
    console.log('🎉 تم الانتهاء بنجاح!');
  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSliderImages();
