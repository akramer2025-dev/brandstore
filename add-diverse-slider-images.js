const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addSliderImages() {
  try {
    console.log('🎨 جاري إضافة صور السلايدر المتنوعة...\n');

    // حذف الصور القديمة
    await prisma.sliderImage.deleteMany({});
    console.log('✅ تم حذف الصور القديمة\n');

    // صور السلايدر المتنوعة
    const sliderImages = [
      {
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1920&h=600&fit=crop&q=90',
        title: 'Latest Smartphones 📱',
        titleAr: 'أحدث الموبايلات والهواتف الذكية 📱',
        subtitle: 'Modern technology at best prices',
        subtitleAr: 'موبايلات بأحدث التقنيات وأفضل الأسعار',
        buttonText: 'Shop Phones',
        buttonTextAr: 'تسوق الموبايلات',
        link: '/products?search=موبايل',
        order: 1,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1920&h=600&fit=crop&q=90',
        title: 'Laptops & Computers 💻',
        titleAr: 'لاب توب وأجهزة كمبيوتر 💻',
        subtitle: 'Professional devices for work, study & gaming',
        subtitleAr: 'أجهزة احترافية للعمل والدراسة والألعاب',
        buttonText: 'Explore Laptops',
        buttonTextAr: 'استكشف اللاب توبات',
        link: '/products?search=لاب%20توب',
        order: 2,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=600&fit=crop&q=90',
        title: 'Motorcycles & Accessories 🏍️',
        titleAr: 'موتوسيكلات وإكسسواراتها 🏍️',
        subtitle: 'Powerful bikes and travel essentials',
        subtitleAr: 'أقوى الموتوسيكلات ومستلزمات الرحلات',
        buttonText: 'View Motorcycles',
        buttonTextAr: 'شاهد الموتوسيكلات',
        link: '/products?search=موتوسيكل',
        order: 3,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1920&h=600&fit=crop&q=90',
        title: 'Cars & Accessories 🚗',
        titleAr: 'سيارات ومستلزماتها 🚗',
        subtitle: 'Everything you need for your car',
        subtitleAr: 'كل ما تحتاجه لسيارتك من إكسسوارات وقطع غيار',
        buttonText: 'Shop Car Accessories',
        buttonTextAr: 'تسوق مستلزمات السيارات',
        link: '/products?search=سيارة',
        order: 4,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=1920&h=600&fit=crop&q=90',
        title: 'Toys & Entertainment 🎮',
        titleAr: 'ألعاب وترفيه للأطفال 🎮',
        subtitle: 'Educational and fun toys for all ages',
        subtitleAr: 'ألعاب تعليمية ومسلية لجميع الأعمار',
        buttonText: 'Discover Toys',
        buttonTextAr: 'اكتشف الألعاب',
        link: '/products?search=ألعاب',
        order: 5,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1920&h=600&fit=crop&q=90',
        title: 'Kitchen Tools & Appliances 🍳',
        titleAr: 'أدوات الطبخ والمطبخ 🍳',
        subtitle: 'Modern and practical kitchen tools',
        subtitleAr: 'أجهزة وأدوات مطبخ عصرية وعملية',
        buttonText: 'Shop Kitchen',
        buttonTextAr: 'تسوق أدوات المطبخ',
        link: '/products?search=مطبخ',
        order: 6,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1589937236987-52f20c9c6163?w=1920&h=600&fit=crop&q=90',
        title: 'Ramadan Decorations 🌙',
        titleAr: 'زينة وفوانيس رمضان 🌙',
        subtitle: 'Beautiful lanterns and decorations for Ramadan',
        subtitleAr: 'أجمل الفوانيس والزينة لشهر رمضان المبارك',
        buttonText: 'Get Ready for Ramadan',
        buttonTextAr: 'استعد لرمضان',
        link: '/products?search=رمضان',
        order: 7,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1920&h=600&fit=crop&q=90',
        title: 'Electronics & Gadgets ⚡',
        titleAr: 'منتجات إلكترونية متنوعة ⚡',
        subtitle: 'Latest electronic devices and technology',
        subtitleAr: 'أحدث الأجهزة الإلكترونية والتقنية',
        buttonText: 'Browse Electronics',
        buttonTextAr: 'تصفح الإلكترونيات',
        link: '/products?search=إلكترونيات',
        order: 8,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=600&fit=crop&q=90',
        title: 'Fashion & Accessories 👗',
        titleAr: 'أزياء وإكسسوارات 👗',
        subtitle: 'Latest fashion trends and modern styles',
        subtitleAr: 'أحدث صيحات الموضة والأزياء العصرية',
        buttonText: 'Shop Fashion',
        buttonTextAr: 'تسوق الأزياء',
        link: '/products?search=ملابس',
        order: 9,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=600&fit=crop&q=90',
        title: 'Furniture & Home Decor 🛋️',
        titleAr: 'أثاث وديكور منزلي 🛋️',
        subtitle: 'Modern furniture and elegant decorations for your home',
        subtitleAr: 'أثاث عصري وديكورات أنيقة لمنزلك',
        buttonText: 'Discover Furniture',
        buttonTextAr: 'اكتشف الأثاث',
        link: '/products?search=أثاث',
        order: 10,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&h=600&fit=crop&q=90',
        title: 'Headphones & Audio 🎧',
        titleAr: 'سماعات وأجهزة صوتية 🎧',
        subtitle: 'Best sound quality with our premium headphones',
        subtitleAr: 'أفضل جودة صوت مع سماعاتنا المميزة',
        buttonText: 'Listen in High Quality',
        buttonTextAr: 'استمع بجودة عالية',
        link: '/products?search=سماعات',
        order: 11,
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&h=600&fit=crop&q=90',
        title: 'Sports & Casual Shoes 👟',
        titleAr: 'أحذية رياضية وكاجوال 👟',
        subtitle: 'Comfortable and stylish shoes for everyone',
        subtitleAr: 'أحذية مريحة وأنيقة للجميع',
        buttonText: 'Choose Your Shoes',
        buttonTextAr: 'اختر حذاءك',
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
      console.log(`✅ تم إضافة: ${image.title}`);
    }

    console.log(`\n🎉 تم إضافة ${sliderImages.length} صورة سلايدر متنوعة بنجاح!\n`);
    console.log('📋 الفئات التي تم تغطيتها:');
    console.log('   📱 موبايلات');
    console.log('   💻 لاب توب');
    console.log('   🏍️  موتوسيكلات');
    console.log('   🚗 سيارات');
    console.log('   🎮 ألعاب');
    console.log('   🍳 أدوات مطبخ');
    console.log('   🌙 زينة رمضان');
    console.log('   ⚡ إلكترونيات');
    console.log('   👗 أزياء');
    console.log('   🛋️  أثاث');
    console.log('   🎧 سماعات');
    console.log('   👟 أحذية');
    console.log('\n✨ الموقع الآن يشبه علي بابا وعلي اكسبريس! ✨\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSliderImages();
