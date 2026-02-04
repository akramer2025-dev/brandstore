import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🖼️ تحديث صور السلايدر...');

  // حذف جميع الصور القديمة
  await prisma.sliderImage.deleteMany({});

  // إضافة صور جديدة للملابس فقط مع التركيز على ريمو ستور
  await prisma.sliderImage.createMany({
    data: [
      {
        title: 'Remostore Collection',
        titleAr: 'تشكيلة ريمو ستور الحصرية',
        subtitle: 'ملابس عصرية مصنوعة بجودة عالية في مصانعنا',
        subtitleAr: 'ملابس عصرية مصنوعة بجودة عالية في مصانعنا',
        imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200',
        link: '/products',
        buttonText: 'تسوق الآن',
        buttonTextAr: 'تسوق الآن',
        order: 1,
        isActive: true
      },
      {
        title: 'Men\'s Fashion',
        titleAr: 'أزياء رجالية من ريمو ستور',
        subtitle: 'قمصان وبناطيل بتصميمات حديثة - صناعة محلية',
        subtitleAr: 'قمصان وبناطيل بتصميمات حديثة - صناعة محلية',
        imageUrl: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1200',
        link: '/products?category=cat5',
        buttonText: 'اكتشف المزيد',
        buttonTextAr: 'اكتشف المزيد',
        order: 2,
        isActive: true
      },
      {
        title: 'Women\'s Collection',
        titleAr: 'تشكيلة السيدات من ريمو ستور',
        subtitle: 'فساتين وملابس نسائية بأحدث الموضات',
        subtitleAr: 'فساتين وملابس نسائية بأحدث الموضات',
        imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
        link: '/products?category=cat3',
        buttonText: 'تسوقي الآن',
        buttonTextAr: 'تسوقي الآن',
        order: 3,
        isActive: true
      },
      {
        title: 'Kids Fashion',
        titleAr: 'ملابس الأطفال - ريمو ستور',
        subtitle: 'ملابس مريحة وآمنة لأطفالك - مصنوعة بعناية',
        subtitleAr: 'ملابس مريحة وآمنة لأطفالك - مصنوعة بعناية',
        imageUrl: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=1200',
        link: '/products?category=cat4',
        buttonText: 'تسوق للأطفال',
        buttonTextAr: 'تسوق للأطفال',
        order: 4,
        isActive: true
      },
      {
        title: 'Sports & Casual',
        titleAr: 'ملابس رياضية وكاجوال',
        subtitle: 'تشكيلة واسعة من الملابس الرياضية والكاجوال',
        subtitleAr: 'تشكيلة واسعة من الملابس الرياضية والكاجوال',
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200',
        link: '/products?category=cat10',
        buttonText: 'تسوق الرياضية',
        buttonTextAr: 'تسوق الرياضية',
        order: 5,
        isActive: true
      },
      {
        title: 'Made in Egypt',
        titleAr: 'صُنع في مصر - ريمو ستور',
        subtitle: 'جودة عالمية بأيادي مصرية - فخر الصناعة المحلية',
        subtitleAr: 'جودة عالمية بأيادي مصرية - فخر الصناعة المحلية',
        imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200',
        link: '/products',
        buttonText: 'اكتشف المجموعة',
        buttonTextAr: 'اكتشف المجموعة',
        order: 6,
        isActive: true
      },
      {
        title: 'New Arrivals',
        titleAr: 'وصل حديثاً من مصنع ريمو ستور',
        subtitle: 'أحدث الإصدارات من مصانعنا مباشرة إليك',
        subtitleAr: 'أحدث الإصدارات من مصانعنا مباشرة إليك',
        imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200',
        link: '/products',
        buttonText: 'اكتشف الجديد',
        buttonTextAr: 'اكتشف الجديد',
        order: 7,
        isActive: true
      },
      {
        title: 'Quality Guarantee',
        titleAr: 'ضمان الجودة - ريمو ستور',
        subtitle: 'مصنوع بأفضل الخامات في مصانعنا المتطورة',
        subtitleAr: 'مصنوع بأفضل الخامات في مصانعنا المتطورة',
        imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200',
        link: '/products',
        buttonText: 'ابدأ التسوق',
        buttonTextAr: 'ابدأ التسوق',
        order: 8,
        isActive: true
      },
      {
        title: 'Shirts Collection',
        titleAr: 'تشكيلة القمصان - ريمو ستور',
        subtitle: 'قمصان بتصاميم عصرية وأقمشة فاخرة',
        subtitleAr: 'قمصان بتصاميم عصرية وأقمشة فاخرة',
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1200',
        link: '/products?category=cat1',
        buttonText: 'تسوق القمصان',
        buttonTextAr: 'تسوق القمصان',
        order: 9,
        isActive: true
      }
    ]
  });

  const count = await prisma.sliderImage.count();
  console.log(`✅ تم إضافة ${count} صورة سلايدر جديدة للملابس`);
  console.log('🏭 جميع الصور تعكس منتجات ريمو ستور المصنعة محلياً');
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
