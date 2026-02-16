const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSliderImages() {
  try {
    console.log('🎨 جاري تحديث صور السلايدر بصور احترافية عالية الجودة...\n');

    // حذف الصور القديمة
    await prisma.sliderImage.deleteMany({});
    console.log('✅ تم حذف الصور القديمة\n');

    // صور السلايدر المحسّنة - صور واضحة واحترافية
    const sliderImages = [
      {
        imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=1920&h=600&fit=crop&q=95',
        title: 'Latest Smartphones 📱',
        titleAr: 'أحدث الموبايلات 📱',
        subtitle: 'Premium devices at best prices',
        subtitleAr: 'جودة عالية وأسعار مميزة',
        buttonText: 'Shop Now',
        buttonTextAr: 'تسوق الآن',
        link: '/products?search=موبايل',
        order: 1,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1920&h=600&fit=crop&q=95',
        title: 'Laptops & Computers 💻',
        titleAr: 'لاب توب احترافي 💻',
        subtitle: 'Professional computing power',
        subtitleAr: 'قوة وأداء احترافي',
        buttonText: 'Discover',
        buttonTextAr: 'اكتشف المزيد',
        link: '/products?search=لاب%20توب',
        order: 2,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1920&h=600&fit=crop&q=95',
        title: 'Motorcycles 🏍️',
        titleAr: 'موتوسيكلات 🏍️',
        subtitle: 'Power and freedom on wheels',
        subtitleAr: 'قوة وحرية على العجلات',
        buttonText: 'View More',
        buttonTextAr: 'شاهد المزيد',
        link: '/products?search=موتوسيكل',
        order: 3,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&h=600&fit=crop&q=95',
        title: 'Cars & Accessories 🚗',
        titleAr: 'سيارات وإكسسوارات 🚗',
        subtitle: 'Everything for your car',
        subtitleAr: 'كل ما تحتاجه لسيارتك',
        buttonText: 'Shop Now',
        buttonTextAr: 'تسوق الآن',
        link: '/products?search=سيارة',
        order: 4,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1920&h=600&fit=crop&q=95',
        title: 'Toys & Games 🎮',
        titleAr: 'ألعاب وترفيه 🎮',
        subtitle: 'Fun for all ages',
        subtitleAr: 'متعة لجميع الأعمار',
        buttonText: 'Explore',
        buttonTextAr: 'اكتشف',
        link: '/products?search=ألعاب',
        order: 5,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1920&h=600&fit=crop&q=95',
        title: 'Kitchen Appliances 🍳',
        titleAr: 'أدوات المطبخ 🍳',
        subtitle: 'Modern kitchen solutions',
        subtitleAr: 'حلول عصرية للمطبخ',
        buttonText: 'Shop Kitchen',
        buttonTextAr: 'تسوق المطبخ',
        link: '/products?search=مطبخ',
        order: 6,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=1920&h=600&fit=crop&q=95',
        title: 'Ramadan Decorations 🌙',
        titleAr: 'زينة رمضان 🌙',
        subtitle: 'Beautiful Ramadan decorations',
        subtitleAr: 'زينة رمضانية مميزة',
        buttonText: 'Get Ready',
        buttonTextAr: 'جهز منزلك',
        link: '/products?search=رمضان',
        order: 7,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1920&h=600&fit=crop&q=95',
        title: 'Electronics ⚡',
        titleAr: 'إلكترونيات ⚡',
        subtitle: 'Latest tech gadgets',
        subtitleAr: 'أحدث التقنيات',
        buttonText: 'Browse',
        buttonTextAr: 'تصفح',
        link: '/products?search=إلكترونيات',
        order: 8,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=600&fit=crop&q=95',
        title: 'Fashion & Style 👗',
        titleAr: 'أزياء عصرية 👗',
        subtitle: 'Latest fashion trends',
        subtitleAr: 'أحدث صيحات الموضة',
        buttonText: 'Shop Fashion',
        buttonTextAr: 'تسوق الأزياء',
        link: '/products?search=ملابس',
        order: 9,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&h=600&fit=crop&q=95',
        title: 'Furniture 🛋️',
        titleAr: 'أثاث منزلي 🛋️',
        subtitle: 'Modern home furniture',
        subtitleAr: 'أثاث عصري لمنزلك',
        buttonText: 'Discover',
        buttonTextAr: 'اكتشف',
        link: '/products?search=أثاث',
        order: 10,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1920&h=600&fit=crop&q=95',
        title: 'Headphones 🎧',
        titleAr: 'سماعات صوتية 🎧',
        subtitle: 'Premium sound quality',
        subtitleAr: 'جودة صوت مميزة',
        buttonText: 'Listen',
        buttonTextAr: 'استمع',
        link: '/products?search=سماعات',
        order: 11,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1920&h=600&fit=crop&q=95',
        title: 'Shoes 👟',
        titleAr: 'أحذية رياضية 👟',
        subtitle: 'Comfort and style',
        subtitleAr: 'راحة وأناقة',
        buttonText: 'Choose',
        buttonTextAr: 'اختر',
        link: '/products?search=أحذية',
        order: 12,
        isActive: true,
      },
    ];

    // إضافة الصور
    for (const image of sliderImages) {
      await prisma.sliderImage.create({
        data: image,
      });
      console.log(`✅ تم إضافة: ${image.titleAr}`);
    }

    console.log(`\n🎉 تم تحديث ${sliderImages.length} صورة سلايدر بنجاح!\n`);
    console.log('✨ الصور الآن أكثر وضوحاً واحترافية! ✨');
    console.log('📱 النصوص محسّنة للموبايل');
    console.log('🏍️  صورة الموتوسيكل محسّنة');
    console.log('🌙 صورة زينة رمضان محسّنة\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSliderImages();
