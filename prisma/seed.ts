import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء تعبئة قاعدة البيانات...');

  // إنشاء فئات
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'cat1' },
      update: {},
      create: {
        id: 'cat1',
        name: 'Shirts',
        nameAr: 'قمصان',
        description: 'قمصان رجالية ونسائية',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat2' },
      update: {},
      create: {
        id: 'cat2',
        name: 'Pants',
        nameAr: 'بناطيل',
        description: 'بناطيل وجينز',
        image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400',
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat3' },
      update: {},
      create: {
        id: 'cat3',
        name: 'Dresses',
        nameAr: 'فساتين',
        description: 'فساتين سهرة ويومية',
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat4' },
      update: {},
      create: {
        id: 'cat4',
        name: 'Kids',
        nameAr: 'أطفال',
        description: 'ملابس أطفال',
        image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400',
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat5' },
      update: {},
      create: {
        id: 'cat5',
        name: 'Youth',
        nameAr: 'شباب',
        description: 'ملابس شبابية عصرية',
        image: 'https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=400',
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat6' },
      update: {},
      create: {
        id: 'cat6',
        name: 'Girls',
        nameAr: 'بنات',
        description: 'ملابس بنات وفتيات',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat7' },
      update: {},
      create: {
        id: 'cat7',
        name: 'Makeup',
        nameAr: 'ميك اب',
        description: 'مستحضرات تجميل',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat8' },
      update: {},
      create: {
        id: 'cat8',
        name: 'Shoes',
        nameAr: 'أحذية',
        description: 'أحذية رجالية ونسائية',
        image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400',
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat9' },
      update: {},
      create: {
        id: 'cat9',
        name: 'Office Supplies',
        nameAr: 'أدوات مكتبية',
        description: 'أدوات وقرطاسية مكتبية',
        image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400',
      },
    }),
    // ترنجات
    prisma.category.upsert({
      where: { id: 'cat10' },
      update: {},
      create: {
        id: 'cat10',
        name: 'Tracksuits - Men',
        nameAr: 'ترنجات - شباب',
        description: 'ترنجات رياضية للشباب',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat11' },
      update: {},
      create: {
        id: 'cat11',
        name: 'Tracksuits - Women',
        nameAr: 'ترنجات - بنات',
        description: 'ترنجات رياضية للبنات',
        image: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=400',
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat12' },
      update: {},
      create: {
        id: 'cat12',
        name: 'Tracksuits - Kids',
        nameAr: 'ترنجات - أطفال',
        description: 'ترنجات رياضية للأطفال',
        image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400',
      },
    }),
    // ملابس داخلية
    prisma.category.upsert({
      where: { id: 'cat13' },
      update: {},
      create: {
        id: 'cat13',
        name: 'Underwear - Men',
        nameAr: 'ملابس داخلية - شباب',
        description: 'ملابس داخلية للشباب',
        image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400',
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat14' },
      update: {},
      create: {
        id: 'cat14',
        name: 'Underwear - Women',
        nameAr: 'ملابس داخلية - بنات',
        description: 'ملابس داخلية للبنات',
        image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400',
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat15' },
      update: {},
      create: {
        id: 'cat15',
        name: 'Underwear - Kids',
        nameAr: 'ملابس داخلية - أطفال',
        description: 'ملابس داخلية للأطفال',
        image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400',
      },
    }),
    // صيدلية
    prisma.category.upsert({
      where: { id: 'cat16' },
      update: {},
      create: {
        id: 'cat16',
        name: 'Pharmacy',
        nameAr: 'صيدلية',
        description: 'منتجات العناية الصحية والأدوية',
        image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400',
      },
    }),
  ]);

  console.log('✅ تم إنشاء', categories.length, 'فئة');

  // إنشاء منتجات
  const products = await Promise.all([
    // قمصان
    prisma.product.upsert({
      where: { id: 'prod1' },
      update: {},
      create: {
        id: 'prod1',
        name: 'Classic White Shirt',
        nameAr: 'قميص أبيض كلاسيكي',
        description: 'High quality white shirt for formal occasions',
        descriptionAr: 'قميص أبيض عالي الجودة مصنوع من القطن الممتاز للمناسبات الرسمية',
        price: 199,
        originalPrice: 299,
        stock: 15,
        categoryId: 'cat1',
        images: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
        isFlashDeal: true,
        flashDealEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 أيام
        badge: 'خصم',
        soldCount: 156,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod2' },
      update: {},
      create: {
        id: 'prod2',
        name: 'Blue Casual Shirt',
        nameAr: 'قميص كاجوال أزرق',
        description: 'Comfortable casual shirt for everyday wear',
        descriptionAr: 'قميص كاجوال أزرق مريح للاستخدام اليومي بتصميم عصري',
        price: 249,
        originalPrice: 349,
        stock: 8,
        categoryId: 'cat1',
        images: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600',
        isFlashDeal: true,
        flashDealEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 أيام
        badge: 'محدود',
        soldCount: 98,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod3' },
      update: {},
      create: {
        id: 'prod3',
        name: 'Black Polo Shirt',
        nameAr: 'قميص بولو أسود',
        description: 'Elegant black polo shirt',
        descriptionAr: 'قميص بولو أسود أنيق مناسب لجميع المناسبات',
        price: 279,
        stock: 35,
        categoryId: 'cat1',
        images: 'https://images.unsplash.com/photo-1598032895397-b9202c0acdf0?w=600',
      },
    }),
    
    // بناطيل
    prisma.product.upsert({
      where: { id: 'prod4' },
      update: {},
      create: {
        id: 'prod4',
        name: 'Blue Jeans',
        nameAr: 'بنطال جينز أزرق',
        description: 'Comfortable blue denim jeans',
        descriptionAr: 'بنطال جينز أزرق مريح بقصة عصرية وجودة عالية',
        price: 299,
        originalPrice: 499,
        stock: 12,
        categoryId: 'cat2',
        images: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600',
        isFlashDeal: true,
        flashDealEndsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 أيام
        badge: 'خصم',
        soldCount: 234,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod5' },
      update: {},
      create: {
        id: 'prod5',
        name: 'Black Chinos',
        nameAr: 'بنطال تشينو أسود',
        description: 'Stylish black chino pants',
        descriptionAr: 'بنطال تشينو أسود أنيق مثالي للعمل والمناسبات',
        price: 349,
        stock: 25,
        categoryId: 'cat2',
        images: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod6' },
      update: {},
      create: {
        id: 'prod6',
        name: 'Beige Cargo Pants',
        nameAr: 'بنطال كارجو بيج',
        description: 'Trendy cargo pants with multiple pockets',
        descriptionAr: 'بنطال كارجو بيج عصري بجيوب متعددة وتصميم عملي',
        price: 329,
        stock: 28,
        categoryId: 'cat2',
        images: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600',
      },
    }),
    
    // فساتين
    prisma.product.upsert({
      where: { id: 'prod7' },
      update: {},
      create: {
        id: 'prod7',
        name: 'Evening Dress',
        nameAr: 'فستان سهرة أنيق',
        description: 'Elegant evening dress for special occasions',
        descriptionAr: 'فستان سهرة أنيق للمناسبات الخاصة بتصميم راقي',
        price: 799,
        stock: 15,
        categoryId: 'cat3',
        images: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod8' },
      update: {},
      create: {
        id: 'prod8',
        name: 'Summer Dress',
        nameAr: 'فستان صيفي مريح',
        description: 'Light and comfortable summer dress',
        descriptionAr: 'فستان صيفي خفيف ومريح بألوان زاهية',
        price: 449,
        stock: 22,
        categoryId: 'cat3',
        images: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod9' },
      update: {},
      create: {
        id: 'prod9',
        name: 'Cocktail Dress',
        nameAr: 'فستان كوكتيل',
        description: 'Chic cocktail dress for parties',
        descriptionAr: 'فستان كوكتيل شيك للحفلات والمناسبات الاجتماعية',
        price: 649,
        stock: 18,
        categoryId: 'cat3',
        images: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod10' },
      update: {},
      create: {
        id: 'prod10',
        name: 'Maxi Dress',
        nameAr: 'فستان ماكسي طويل',
        description: 'Beautiful long maxi dress',
        descriptionAr: 'فستان ماكسي طويل جميل بطبعات عصرية',
        price: 549,
        stock: 20,
        categoryId: 'cat3',
        images: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600',
      },
    }),

    // أطفال
    prisma.product.upsert({
      where: { id: 'prod11' },
      update: {},
      create: {
        id: 'prod11',
        name: 'Kids T-Shirt',
        nameAr: 'تيشيرت أطفال كيوت',
        description: 'Cute kids t-shirt with cartoon characters',
        descriptionAr: 'تيشيرت أطفال جميل مع رسومات كارتونية محببة',
        price: 149,
        stock: 60,
        categoryId: 'cat4',
        images: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod12' },
      update: {},
      create: {
        id: 'prod12',
        name: 'Kids Shorts',
        nameAr: 'شورت أطفال صيفي',
        description: 'Comfortable summer shorts for kids',
        descriptionAr: 'شورت صيفي مريح للأطفال بألوان زاهية',
        price: 129,
        stock: 55,
        categoryId: 'cat4',
        images: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600',
      },
    }),

    // شباب
    prisma.product.upsert({
      where: { id: 'prod13' },
      update: {},
      create: {
        id: 'prod13',
        name: 'Youth Hoodie',
        nameAr: 'هودي شبابي عصري',
        description: 'Trendy hoodie for youth',
        descriptionAr: 'هودي شبابي عصري بتصميم مميز وراحة عالية',
        price: 399,
        stock: 45,
        categoryId: 'cat5',
        images: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod14' },
      update: {},
      create: {
        id: 'prod14',
        name: 'Bomber Jacket',
        nameAr: 'جاكيت بومبر شبابي',
        description: 'Stylish bomber jacket',
        descriptionAr: 'جاكيت بومبر أنيق بتصميم كاجوال عصري',
        price: 599,
        stock: 30,
        categoryId: 'cat5',
        images: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
      },
    }),

    // بنات
    prisma.product.upsert({
      where: { id: 'prod15' },
      update: {},
      create: {
        id: 'prod15',
        name: 'Girls Blouse',
        nameAr: 'بلوزة بنات أنيقة',
        description: 'Elegant blouse for girls',
        descriptionAr: 'بلوزة أنيقة للبنات بألوان جميلة وتصميم راقي',
        price: 249,
        stock: 40,
        categoryId: 'cat6',
        images: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod16' },
      update: {},
      create: {
        id: 'prod16',
        name: 'Girls Skirt',
        nameAr: 'تنورة بنات كيوت',
        description: 'Cute skirt for girls',
        descriptionAr: 'تنورة جميلة للبنات بتصميم كيوت وعصري',
        price: 199,
        stock: 38,
        categoryId: 'cat6',
        images: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600',
      },
    }),

    // ميك اب
    prisma.product.upsert({
      where: { id: 'prod17' },
      update: {},
      create: {
        id: 'prod17',
        name: 'Lipstick Set',
        nameAr: 'طقم أحمر شفاه',
        description: 'Premium lipstick set with 5 colors',
        descriptionAr: 'طقم أحمر شفاه فاخر يحتوي على 5 ألوان رائعة',
        price: 349,
        stock: 50,
        categoryId: 'cat7',
        images: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600',
      },
    }),

    // ترنجات - شباب
    prisma.product.upsert({
      where: { id: 'prod61' },
      update: {},
      create: {
        id: 'prod61',
        name: 'Sports Tracksuit - Black',
        nameAr: 'دفتر ملاحظات A4',
        description: 'High quality A4 notebook with 100 pages',
        descriptionAr: 'دفتر ملاحظات عالي الجودة مقاس A4 بـ 100 صفحة',
        price: 45,
        stock: 150,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600,https://images.unsplash.com/photo-1506729623306-b5a934d88b53?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod35' },
      update: {},
      create: {
        id: 'prod35',
        name: 'Pens Set',
        nameAr: 'طقم أقلام جل',
        description: 'Set of 10 colorful gel pens',
        descriptionAr: 'طقم من 10 أقلام جل ملونة بجودة عالية',
        price: 65,
        stock: 200,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600,https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod36' },
      update: {},
      create: {
        id: 'prod36',
        name: 'File Organizer',
        nameAr: 'منظم ملفات مكتبي',
        description: 'Desk file organizer with multiple compartments',
        descriptionAr: 'منظم ملفات مكتبي بعدة أقسام لترتيب المكتب',
        price: 120,
        stock: 80,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1555421689-d68471e189f2?w=600,https://images.unsplash.com/photo-1544716278-e513176f20b5?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod37' },
      update: {},
      create: {
        id: 'prod37',
        name: 'Sticky Notes Pack',
        nameAr: 'ملاحظات لاصقة',
        description: 'Colorful sticky notes pack',
        descriptionAr: 'طقم ملاحظات لاصقة ملونة بأحجام متعددة',
        price: 35,
        stock: 300,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1598608562722-bcf6c2f6c00c?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod38' },
      update: {},
      create: {
        id: 'prod38',
        name: 'Calculator',
        nameAr: 'آلة حاسبة علمية',
        description: 'Scientific calculator for students',
        descriptionAr: 'آلة حاسبة علمية احترافية للطلاب والمحاسبين',
        price: 250,
        stock: 60,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod39' },
      update: {},
      create: {
        id: 'prod39',
        name: 'Stapler Set',
        nameAr: 'دباسة مكتبية',
        description: 'Heavy duty stapler with 1000 staples',
        descriptionAr: 'دباسة مكتبية قوية مع 1000 دبوس',
        price: 85,
        stock: 120,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod40' },
      update: {},
      create: {
        id: 'prod40',
        name: 'Desk Lamp',
        nameAr: 'مصباح مكتب LED',
        description: 'LED desk lamp with adjustable brightness',
        descriptionAr: 'مصباح مكتب LED بإضاءة قابلة للتعديل',
        price: 350,
        stock: 45,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600,https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod41' },
      update: {},
      create: {
        id: 'prod41',
        name: 'Scissors Professional',
        nameAr: 'مقص مكتبي احترافي',
        description: 'Professional stainless steel scissors',
        descriptionAr: 'مقص مكتبي احترافي من الستانلس ستيل',
        price: 55,
        stock: 180,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600',
      },
    }),

    // كتب دراسية
    prisma.product.upsert({
      where: { id: 'prod42' },
      update: {},
      create: {
        id: 'prod42',
        name: 'Primary School Books Set - Grade 1',
        nameAr: 'كتب الصف الأول الابتدائي',
        description: 'Complete set of textbooks for Grade 1',
        descriptionAr: 'مجموعة كاملة من الكتب الدراسية للصف الأول الابتدائي - عربي وحساب وعلوم',
        price: 280,
        stock: 120,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod43' },
      update: {},
      create: {
        id: 'prod43',
        name: 'Primary School Books Set - Grade 3',
        nameAr: 'كتب الصف الثالث الابتدائي',
        description: 'Complete set of textbooks for Grade 3',
        descriptionAr: 'مجموعة كاملة من الكتب الدراسية للصف الثالث الابتدائي - جميع المواد',
        price: 320,
        stock: 95,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod44' },
      update: {},
      create: {
        id: 'prod44',
        name: 'Primary School Books Set - Grade 6',
        nameAr: 'كتب الصف السادس الابتدائي',
        description: 'Complete set of textbooks for Grade 6',
        descriptionAr: 'مجموعة كاملة من الكتب الدراسية للصف السادس الابتدائي - شهادة ابتدائية',
        price: 350,
        stock: 85,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod45' },
      update: {},
      create: {
        id: 'prod45',
        name: 'Middle School Books Set - Grade 1',
        nameAr: 'كتب الصف الأول الإعدادي',
        description: 'Complete set of textbooks for Middle School Grade 1',
        descriptionAr: 'مجموعة كاملة من الكتب الدراسية للصف الأول الإعدادي - جميع المواد',
        price: 380,
        stock: 75,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod46' },
      update: {},
      create: {
        id: 'prod46',
        name: 'Middle School Books Set - Grade 3',
        nameAr: 'كتب الصف الثالث الإعدادي',
        description: 'Complete set of textbooks for Middle School Grade 3',
        descriptionAr: 'مجموعة كاملة من الكتب الدراسية للصف الثالث الإعدادي - شهادة إعدادية',
        price: 400,
        stock: 70,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod47' },
      update: {},
      create: {
        id: 'prod47',
        name: 'High School Books Set - Grade 1',
        nameAr: 'كتب الصف الأول الثانوي',
        description: 'Complete set of textbooks for High School Grade 1',
        descriptionAr: 'مجموعة كاملة من الكتب الدراسية للصف الأول الثانوي - جميع المواد',
        price: 450,
        stock: 60,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod48' },
      update: {},
      create: {
        id: 'prod48',
        name: 'High School Books Set - Grade 3',
        nameAr: 'كتب الصف الثالث الثانوي',
        description: 'Complete set of textbooks for High School Grade 3',
        descriptionAr: 'مجموعة كاملة من الكتب الدراسية للصف الثالث الثانوي - ثانوية عامة',
        price: 500,
        stock: 55,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600',
      },
    }),

    // أقلام متنوعة
    prisma.product.upsert({
      where: { id: 'prod49' },
      update: {},
      create: {
        id: 'prod49',
        name: 'Blue Pens Pack',
        nameAr: 'أقلام جاف زرقاء - عبوة 12 قلم',
        description: 'Pack of 12 blue ballpoint pens',
        descriptionAr: 'عبوة 12 قلم جاف أزرق عالي الجودة للكتابة اليومية',
        price: 35,
        stock: 250,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod50' },
      update: {},
      create: {
        id: 'prod50',
        name: 'Colored Pencils Set',
        nameAr: 'أقلام رصاص ملونة - 24 لون',
        description: 'Set of 24 colored pencils',
        descriptionAr: 'طقم أقلام رصاص ملونة 24 لون للرسم والتلوين',
        price: 85,
        stock: 180,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod51' },
      update: {},
      create: {
        id: 'prod51',
        name: 'Highlighter Markers Set',
        nameAr: 'أقلام تحديد فسفورية - 6 ألوان',
        description: 'Set of 6 fluorescent highlighter markers',
        descriptionAr: 'طقم 6 أقلام تحديد فسفورية بألوان زاهية للتمييز',
        price: 45,
        stock: 200,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600',
      },
    }),

    // كشاكيل وكراريس
    prisma.product.upsert({
      where: { id: 'prod52' },
      update: {},
      create: {
        id: 'prod52',
        name: 'Spiral Notebook A5',
        nameAr: 'كشكول سلك A5 - 100 ورقة',
        description: 'A5 spiral notebook with 100 sheets',
        descriptionAr: 'كشكول سلك مقاس A5 بـ 100 ورقة مسطرة عالية الجودة',
        price: 30,
        stock: 300,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod53' },
      update: {},
      create: {
        id: 'prod53',
        name: 'Spiral Notebook A4',
        nameAr: 'كشكول سلك A4 - 200 ورقة',
        description: 'A4 spiral notebook with 200 sheets',
        descriptionAr: 'كشكول سلك كبير مقاس A4 بـ 200 ورقة للجامعة والثانوية',
        price: 55,
        stock: 250,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod54' },
      update: {},
      create: {
        id: 'prod54',
        name: 'Exercise Books Pack',
        nameAr: 'كراسات تمرين - عبوة 5 كراسات',
        description: 'Pack of 5 exercise books',
        descriptionAr: 'عبوة 5 كراسات تمرين مسطرة 60 ورقة للمدرسة',
        price: 40,
        stock: 280,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod55' },
      update: {},
      create: {
        id: 'prod55',
        name: 'Drawing Books Pack',
        nameAr: 'كراسات رسم - عبوة 3 كراسات',
        description: 'Pack of 3 drawing books',
        descriptionAr: 'عبوة 3 كراسات رسم بورق أبيض سميك 40 ورقة',
        price: 50,
        stock: 220,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600',
      },
    }),

    // مسطرة وبراية
    prisma.product.upsert({
      where: { id: 'prod56' },
      update: {},
      create: {
        id: 'prod56',
        name: 'Plastic Ruler 30cm',
        nameAr: 'مسطرة بلاستيك 30 سم',
        description: 'Transparent plastic ruler 30cm',
        descriptionAr: 'مسطرة بلاستيك شفافة 30 سم بقياسات دقيقة',
        price: 8,
        stock: 400,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod57' },
      update: {},
      create: {
        id: 'prod57',
        name: 'Geometry Set',
        nameAr: 'أدوات هندسية - طقم كامل',
        description: 'Complete geometry set with compass and protractor',
        descriptionAr: 'طقم أدوات هندسية كامل يشمل فرجار ومنقلة ومثلثات ومسطرة',
        price: 65,
        stock: 150,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod58' },
      update: {},
      create: {
        id: 'prod58',
        name: 'Pencil Sharpener',
        nameAr: 'براية معدنية - قطعتين',
        description: 'Metal pencil sharpener - 2 pieces',
        descriptionAr: 'براية معدنية عالية الجودة بفتحتين - عبوة قطعتين',
        price: 12,
        stock: 350,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod59' },
      update: {},
      create: {
        id: 'prod59',
        name: 'Electric Pencil Sharpener',
        nameAr: 'براية كهربائية',
        description: 'Automatic electric pencil sharpener',
        descriptionAr: 'براية كهربائية أوتوماتيكية سريعة وآمنة للطلاب',
        price: 120,
        stock: 80,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=600',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod60' },
      update: {},
      create: {
        id: 'prod60',
        name: 'Eraser Set',
        nameAr: 'ممحاة - عبوة 4 قطع',
        description: 'Pack of 4 high-quality erasers',
        descriptionAr: 'عبوة 4 ممحاة عالية الجودة لا تترك أثر',
        price: 15,
        stock: 320,
        categoryId: 'cat9',
        images: 'https://images.unsplash.com/photo-1587842258454-253e51d1bb93?w=600',
      },
    }),

    // ترنجات - شباب
    prisma.product.upsert({
      where: { id: 'prod61' },
      update: {},
      create: {
        id: 'prod61',
        name: 'Sports Tracksuit - Black',
        nameAr: 'ترنج رياضي أسود - شباب',
        description: 'High-quality sports tracksuit for men',
        descriptionAr: 'ترنج رياضي عالي الجودة من القطن المخلوط للشباب باللون الأسود',
        price: 399,
        originalPrice: 599,
        stock: 45,
        categoryId: 'cat10',
        images: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600',
        isFlashDeal: true,
        flashDealEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        badge: 'خصم',
        soldCount: 234,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod62' },
      update: {},
      create: {
        id: 'prod62',
        name: 'Adidas Style Tracksuit',
        nameAr: 'ترنج رياضي بخطوط - شباب',
        description: 'Sports tracksuit with stripes',
        descriptionAr: 'ترنج رياضي بتصميم الخطوط الجانبية للشباب مريح وعملي',
        price: 449,
        originalPrice: 650,
        stock: 38,
        categoryId: 'cat10',
        images: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
        badge: 'الأكثر مبيعاً',
        soldCount: 412,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod63' },
      update: {},
      create: {
        id: 'prod63',
        name: 'Nike Style Training Set',
        nameAr: 'طقم تدريب رياضي - شباب',
        description: 'Professional training tracksuit',
        descriptionAr: 'طقم تدريب رياضي احترافي بجودة عالية للشباب',
        price: 549,
        stock: 52,
        categoryId: 'cat10',
        images: 'https://images.unsplash.com/photo-1624378515195-6bbdb73dff1a?w=600',
        soldCount: 156,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod64' },
      update: {},
      create: {
        id: 'prod64',
        name: 'Casual Jogger Set',
        nameAr: 'ترنج جوجر كاجوال - شباب',
        description: 'Casual jogger tracksuit for daily wear',
        descriptionAr: 'ترنج جوجر كاجوال للاستخدام اليومي مريح وأنيق',
        price: 349,
        stock: 67,
        categoryId: 'cat10',
        images: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600',
        badge: 'جديد',
        soldCount: 89,
      },
    }),

    // ترنجات - بنات
    prisma.product.upsert({
      where: { id: 'prod65' },
      update: {},
      create: {
        id: 'prod65',
        name: 'Women Sports Set - Pink',
        nameAr: 'طقم رياضي وردي - بنات',
        description: 'Stylish pink sports tracksuit for women',
        descriptionAr: 'طقم رياضي أنيق باللون الوردي للبنات بجودة ممتازة',
        price: 379,
        originalPrice: 550,
        stock: 42,
        categoryId: 'cat11',
        images: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600',
        isFlashDeal: true,
        flashDealEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        badge: 'خصم',
        soldCount: 287,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod66' },
      update: {},
      create: {
        id: 'prod66',
        name: 'Yoga & Fitness Set',
        nameAr: 'طقم يوغا وفتنس - بنات',
        description: 'Comfortable yoga and fitness tracksuit',
        descriptionAr: 'طقم يوغا وفتنس مريح بقماش مرن ومسامي للبنات',
        price: 429,
        stock: 56,
        categoryId: 'cat11',
        images: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600',
        badge: 'الأكثر مبيعاً',
        soldCount: 398,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod67' },
      update: {},
      create: {
        id: 'prod67',
        name: 'Casual Velvet Set',
        nameAr: 'طقم قطيفة كاجوال - بنات',
        description: 'Soft velvet casual tracksuit',
        descriptionAr: 'طقم قطيفة ناعم للاستخدام الكاجوال مريح جداً',
        price: 499,
        stock: 34,
        categoryId: 'cat11',
        images: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
        badge: 'جديد',
        soldCount: 145,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod68' },
      update: {},
      create: {
        id: 'prod68',
        name: 'Running Training Set',
        nameAr: 'طقم جري وتمرين - بنات',
        description: 'Professional running and training set',
        descriptionAr: 'طقم جري وتمرين احترافي بتصميم رياضي عصري',
        price: 459,
        stock: 48,
        categoryId: 'cat11',
        images: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',
        soldCount: 178,
      },
    }),

    // ترنجات - أطفال
    prisma.product.upsert({
      where: { id: 'prod69' },
      update: {},
      create: {
        id: 'prod69',
        name: 'Kids Tracksuit - Blue',
        nameAr: 'ترنج أطفال أزرق',
        description: 'Comfortable tracksuit for kids',
        descriptionAr: 'ترنج أطفال مريح باللون الأزرق بجودة عالية',
        price: 249,
        originalPrice: 350,
        stock: 78,
        categoryId: 'cat12',
        images: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600',
        badge: 'خصم',
        soldCount: 456,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod70' },
      update: {},
      create: {
        id: 'prod70',
        name: 'Kids Sports Set - Pink',
        nameAr: 'طقم رياضي أطفال وردي',
        description: 'Cute pink sports set for kids',
        descriptionAr: 'طقم رياضي لطيف للأطفال باللون الوردي',
        price: 269,
        stock: 65,
        categoryId: 'cat12',
        images: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600',
        badge: 'الأكثر مبيعاً',
        soldCount: 521,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod71' },
      update: {},
      create: {
        id: 'prod71',
        name: 'Kids Casual Set',
        nameAr: 'طقم كاجوال أطفال',
        description: 'Casual comfortable set for kids',
        descriptionAr: 'طقم كاجوال مريح للأطفال للاستخدام اليومي',
        price: 229,
        stock: 92,
        categoryId: 'cat12',
        images: 'https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=600',
        soldCount: 334,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod72' },
      update: {},
      create: {
        id: 'prod72',
        name: 'Kids School Sports Set',
        nameAr: 'طقم رياضة مدرسية أطفال',
        description: 'Perfect for school sports activities',
        descriptionAr: 'مثالي للأنشطة الرياضية المدرسية',
        price: 279,
        stock: 84,
        categoryId: 'cat12',
        images: 'https://images.unsplash.com/photo-1514090458221-65c3ba468e51?w=600',
        badge: 'جديد',
        soldCount: 267,
      },
    }),

    // ملابس داخلية - شباب
    prisma.product.upsert({
      where: { id: 'prod73' },
      update: {},
      create: {
        id: 'prod73',
        name: 'Men Boxer Shorts 3-Pack',
        nameAr: 'بوكسر شباب - عبوة 3 قطع',
        description: 'Comfortable boxer shorts 3-pack',
        descriptionAr: 'بوكسر مريح للشباب قطن 100% عبوة 3 قطع',
        price: 149,
        originalPrice: 220,
        stock: 156,
        categoryId: 'cat13',
        images: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600',
        isFlashDeal: true,
        flashDealEndsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        badge: 'خصم',
        soldCount: 678,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod74' },
      update: {},
      create: {
        id: 'prod74',
        name: 'Men Brief 5-Pack',
        nameAr: 'سليب شباب - عبوة 5 قطع',
        description: 'Classic brief 5-pack',
        descriptionAr: 'سليب كلاسيك للشباب قطن ممتاز عبوة 5 قطع',
        price: 179,
        stock: 234,
        categoryId: 'cat13',
        images: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600',
        badge: 'الأكثر مبيعاً',
        soldCount: 892,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod75' },
      update: {},
      create: {
        id: 'prod75',
        name: 'Men Tank Top 3-Pack',
        nameAr: 'فانلة داخلية - عبوة 3 قطع',
        description: 'Cotton tank top 3-pack',
        descriptionAr: 'فانلة داخلية قطن للشباب عبوة 3 قطع',
        price: 129,
        stock: 189,
        categoryId: 'cat13',
        images: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600',
        soldCount: 445,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod76' },
      update: {},
      create: {
        id: 'prod76',
        name: 'Men Sports Underwear 2-Pack',
        nameAr: 'ملابس داخلية رياضية - عبوة 2',
        description: 'Sports underwear with breathable fabric',
        descriptionAr: 'ملابس داخلية رياضية بقماش مسامي مريح',
        price: 169,
        stock: 145,
        categoryId: 'cat13',
        images: 'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=600',
        badge: 'جديد',
        soldCount: 234,
      },
    }),

    // ملابس داخلية - بنات
    prisma.product.upsert({
      where: { id: 'prod77' },
      update: {},
      create: {
        id: 'prod77',
        name: 'Women Bra & Panty Set',
        nameAr: 'طقم داخلي - بنات',
        description: 'Comfortable bra and panty set',
        descriptionAr: 'طقم داخلي مريح بتصميم أنيق',
        price: 199,
        originalPrice: 299,
        stock: 124,
        categoryId: 'cat14',
        images: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600',
        badge: 'خصم',
        soldCount: 567,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod78' },
      update: {},
      create: {
        id: 'prod78',
        name: 'Women Panties 5-Pack',
        nameAr: 'كيلوت بنات - عبوة 5 قطع',
        description: 'Cotton panties 5-pack',
        descriptionAr: 'كيلوت قطن للبنات عبوة 5 قطع مريحة',
        price: 149,
        stock: 245,
        categoryId: 'cat14',
        images: 'https://images.unsplash.com/photo-1596783342791-cba70d3d707d?w=600',
        badge: 'الأكثر مبيعاً',
        soldCount: 923,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod79' },
      update: {},
      create: {
        id: 'prod79',
        name: 'Sports Bra Set',
        nameAr: 'ستيان رياضي',
        description: 'Comfortable sports bra',
        descriptionAr: 'ستيان رياضي مريح بدعم ممتاز',
        price: 229,
        stock: 167,
        categoryId: 'cat14',
        images: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600',
        soldCount: 445,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod80' },
      update: {},
      create: {
        id: 'prod80',
        name: 'Lace Lingerie Set',
        nameAr: 'طقم لانجري دانتيل',
        description: 'Elegant lace lingerie set',
        descriptionAr: 'طقم لانجري أنيق بتفاصيل دانتيل',
        price: 299,
        originalPrice: 450,
        stock: 89,
        categoryId: 'cat14',
        images: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600',
        isFlashDeal: true,
        flashDealEndsAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        badge: 'خصم',
        soldCount: 312,
      },
    }),

    // ملابس داخلية - أطفال
    prisma.product.upsert({
      where: { id: 'prod81' },
      update: {},
      create: {
        id: 'prod81',
        name: 'Kids Underwear 5-Pack - Boys',
        nameAr: 'ملابس داخلية أطفال - أولاد 5 قطع',
        description: 'Comfortable underwear for boys',
        descriptionAr: 'ملابس داخلية مريحة للأولاد قطن 100%',
        price: 99,
        stock: 345,
        categoryId: 'cat15',
        images: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600',
        badge: 'الأكثر مبيعاً',
        soldCount: 1234,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod82' },
      update: {},
      create: {
        id: 'prod82',
        name: 'Kids Underwear 5-Pack - Girls',
        nameAr: 'ملابس داخلية أطفال - بنات 5 قطع',
        description: 'Comfortable underwear for girls',
        descriptionAr: 'ملابس داخلية مريحة للبنات قطن ناعم',
        price: 99,
        stock: 387,
        categoryId: 'cat15',
        images: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600',
        badge: 'الأكثر مبيعاً',
        soldCount: 1156,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod83' },
      update: {},
      create: {
        id: 'prod83',
        name: 'Kids Vest 3-Pack',
        nameAr: 'فانلة أطفال - عبوة 3 قطع',
        description: 'Cotton vest 3-pack for kids',
        descriptionAr: 'فانلة قطن للأطفال عبوة 3 قطع',
        price: 89,
        stock: 423,
        categoryId: 'cat15',
        images: 'https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=600',
        soldCount: 876,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod84' },
      update: {},
      create: {
        id: 'prod84',
        name: 'Baby Bodysuit 4-Pack',
        nameAr: 'بودي سوت للأطفال - 4 قطع',
        description: 'Soft bodysuit for babies and toddlers',
        descriptionAr: 'بودي سوت ناعم للرضع والأطفال الصغار',
        price: 119,
        originalPrice: 180,
        stock: 267,
        categoryId: 'cat15',
        images: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600',
        badge: 'خصم',
        soldCount: 645,
      },
    }),
    // منتجات الصيدلية
    prisma.product.upsert({
      where: { id: 'prod85' },
      update: {},
      create: {
        id: 'prod85',
        name: 'Vitamin C 1000mg - 60 Tablets',
        nameAr: 'فيتامين سي 1000 ملجم - 60 قرص',
        description: 'High potency vitamin C for immunity support',
        descriptionAr: 'فيتامين سي عالي التركيز لدعم المناعة والصحة العامة',
        price: 89,
        originalPrice: 120,
        stock: 450,
        categoryId: 'cat16',
        images: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600',
        badge: 'أفضل مبيعاً',
        soldCount: 892,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod86' },
      update: {},
      create: {
        id: 'prod86',
        name: 'Omega 3 Fish Oil - 90 Capsules',
        nameAr: 'أوميجا 3 زيت السمك - 90 كبسولة',
        description: 'Essential fatty acids for heart and brain health',
        descriptionAr: 'أحماض دهنية أساسية لصحة القلب والدماغ',
        price: 149,
        originalPrice: 200,
        stock: 320,
        categoryId: 'cat16',
        images: 'https://images.unsplash.com/photo-1505944357-a4a32c56f830?w=600',
        badge: null,
        soldCount: 567,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod87' },
      update: {},
      create: {
        id: 'prod87',
        name: 'Multivitamin Complex',
        nameAr: 'مالتي فيتامين كومبليكس',
        description: 'Complete daily vitamin and mineral supplement',
        descriptionAr: 'مكمل غذائي متكامل من الفيتامينات والمعادن اليومية',
        price: 129,
        originalPrice: 170,
        stock: 380,
        categoryId: 'cat16',
        images: 'https://images.unsplash.com/photo-1550572017-4245a45d5b6c?w=600',
        badge: 'خصم',
        soldCount: 723,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod88' },
      update: {},
      create: {
        id: 'prod88',
        name: 'Calcium + Vitamin D3',
        nameAr: 'كالسيوم + فيتامين د3',
        description: 'Bone health support supplement',
        descriptionAr: 'مكمل غذائي لدعم صحة العظام والأسنان',
        price: 99,
        originalPrice: 140,
        stock: 290,
        categoryId: 'cat16',
        images: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600',
        badge: null,
        soldCount: 445,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod89' },
      update: {},
      create: {
        id: 'prod89',
        name: 'Probiotic 10 Billion CFU',
        nameAr: 'بروبيوتيك 10 مليار وحدة',
        description: 'Digestive health and gut balance',
        descriptionAr: 'لصحة الجهاز الهضمي وتوازن البكتيريا النافعة',
        price: 169,
        originalPrice: 220,
        stock: 210,
        categoryId: 'cat16',
        images: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600',
        badge: 'جديد',
        soldCount: 334,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod90' },
      update: {},
      create: {
        id: 'prod90',
        name: 'Collagen Peptides Powder',
        nameAr: 'بودرة الكولاجين',
        description: 'Skin, hair, and nail support supplement',
        descriptionAr: 'مكمل غذائي لدعم صحة البشرة والشعر والأظافر',
        price: 189,
        originalPrice: 250,
        stock: 195,
        categoryId: 'cat16',
        images: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
        badge: 'أفضل مبيعاً',
        soldCount: 678,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod91' },
      update: {},
      create: {
        id: 'prod91',
        name: 'Pain Relief Gel',
        nameAr: 'جل مسكن للألم',
        description: 'Fast-acting topical pain relief',
        descriptionAr: 'جل موضعي سريع المفعول لتسكين الألم والالتهابات',
        price: 45,
        originalPrice: 65,
        stock: 520,
        categoryId: 'cat16',
        images: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600',
        badge: null,
        soldCount: 901,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod92' },
      update: {},
      create: {
        id: 'prod92',
        name: 'First Aid Kit Complete',
        nameAr: 'حقيبة إسعافات أولية كاملة',
        description: 'Complete emergency medical supplies kit',
        descriptionAr: 'حقيبة إسعافات أولية شاملة لجميع الطوارئ',
        price: 229,
        originalPrice: 300,
        stock: 145,
        categoryId: 'cat16',
        images: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600',
        badge: 'خصم',
        soldCount: 267,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod93' },
      update: {},
      create: {
        id: 'prod93',
        name: 'Digital Thermometer',
        nameAr: 'ترمومتر رقمي',
        description: 'Fast and accurate temperature measurement',
        descriptionAr: 'ترمومتر رقمي سريع ودقيق لقياس درجة الحرارة',
        price: 79,
        originalPrice: 110,
        stock: 340,
        categoryId: 'cat16',
        images: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600',
        badge: null,
        soldCount: 512,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod94' },
      update: {},
      create: {
        id: 'prod94',
        name: 'Blood Pressure Monitor',
        nameAr: 'جهاز قياس ضغط الدم',
        description: 'Automatic digital blood pressure monitor',
        descriptionAr: 'جهاز رقمي أوتوماتيكي لقياس ضغط الدم',
        price: 349,
        originalPrice: 450,
        stock: 125,
        categoryId: 'cat16',
        images: 'https://images.unsplash.com/photo-1615486364975-2a8dfc165e37?w=600',
        badge: 'أفضل مبيعاً',
        soldCount: 389,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod95' },
      update: {},
      create: {
        id: 'prod95',
        name: 'Hand Sanitizer 500ml',
        nameAr: 'معقم اليدين 500 مل',
        description: '75% alcohol hand sanitizer gel',
        descriptionAr: 'جل معقم لليدين بتركيز كحول 75٪',
        price: 35,
        originalPrice: 50,
        stock: 680,
        categoryId: 'cat16',
        images: 'https://images.unsplash.com/photo-1584744982387-b6e39f8b4034?w=600',
        badge: null,
        soldCount: 1245,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod96' },
      update: {},
      create: {
        id: 'prod96',
        name: 'Face Masks 50-Pack',
        nameAr: 'كمامات طبية - 50 قطعة',
        description: '3-layer disposable medical face masks',
        descriptionAr: 'كمامات طبية يمكن التخلص منها - 3 طبقات',
        price: 59,
        originalPrice: 85,
        stock: 890,
        categoryId: 'cat16',
        images: 'https://images.unsplash.com/photo-1584634428459-16e0bf3df440?w=600',
        badge: 'خصم',
        soldCount: 1567,
      },
    }),
  ]);

  console.log('✅ تم إنشاء', products.length, 'منتج');

  // إنشاء عملاء للتقييمات
  const customers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'customer1@example.com' },
      update: {},
      create: {
        email: 'customer1@example.com',
        username: 'أحمد محمد',
        name: 'أحمد محمد',
        password: await bcrypt.hash('customer123', 10),
        role: 'CUSTOMER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'customer2@example.com' },
      update: {},
      create: {
        email: 'customer2@example.com',
        username: 'فاطمة علي',
        name: 'فاطمة علي',
        password: await bcrypt.hash('customer123', 10),
        role: 'CUSTOMER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'customer3@example.com' },
      update: {},
      create: {
        email: 'customer3@example.com',
        username: 'محمود حسن',
        name: 'محمود حسن',
        password: await bcrypt.hash('customer123', 10),
        role: 'CUSTOMER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'customer4@example.com' },
      update: {},
      create: {
        email: 'customer4@example.com',
        username: 'نور الدين',
        name: 'نور الدين',
        password: await bcrypt.hash('customer123', 10),
        role: 'CUSTOMER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'customer5@example.com' },
      update: {},
      create: {
        email: 'customer5@example.com',
        username: 'سارة أحمد',
        name: 'سارة أحمد',
        password: await bcrypt.hash('customer123', 10),
        role: 'CUSTOMER',
      },
    }),
  ]);

  console.log('✅ تم إنشاء', customers.length, 'عميل للتقييمات');

  // إنشاء تقييمات للمنتجات
  const reviews = await Promise.all([
    // تقييمات القمصان
    prisma.review.create({
      data: {
        userId: customers[0].id,
        productId: 'prod1',
        rating: 5,
        comment: 'قميص رائع جداً! الجودة ممتازة والقماش ناعم جداً. أنصح بشرائه',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[1].id,
        productId: 'prod1',
        rating: 4,
        comment: 'جميل ومريح، لكن المقاس أكبر قليلاً من المتوقع',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[2].id,
        productId: 'prod2',
        rating: 5,
        comment: 'اللون جميل جداً والخامة ممتازة. سعره مناسب',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[3].id,
        productId: 'prod2',
        rating: 4,
        comment: 'منتج جيد لكن التوصيل تأخر قليلاً',
        isApproved: true,
      },
    }),

    // تقييمات البناطيل
    prisma.review.create({
      data: {
        userId: customers[0].id,
        productId: 'prod3',
        rating: 5,
        comment: 'جينز ممتاز! مريح جداً ويناسب جميع المناسبات',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[4].id,
        productId: 'prod3',
        rating: 5,
        comment: 'أفضل جينز اشتريته! الجودة عالية والسعر معقول',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[1].id,
        productId: 'prod4',
        rating: 4,
        comment: 'بنطلون كلاسيكي أنيق، مناسب للعمل',
        isApproved: true,
      },
    }),

    // تقييمات الفساتين
    prisma.review.create({
      data: {
        userId: customers[1].id,
        productId: 'prod5',
        rating: 5,
        comment: 'فستان رائع! التصميم جميل جداً ومريح',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[4].id,
        productId: 'prod5',
        rating: 5,
        comment: 'حلو جداً! لبسته في فرح وكان الكل يسألني عنه',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[0].id,
        productId: 'prod6',
        rating: 4,
        comment: 'فستان جميل لكن القماش رقيق شوية',
        isApproved: true,
      },
    }),

    // تقييمات ملابس الأطفال
    prisma.review.create({
      data: {
        userId: customers[2].id,
        productId: 'prod7',
        rating: 5,
        comment: 'ابني عجبه جداً! جودة ممتازة ومقاس مظبوط',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[3].id,
        productId: 'prod8',
        rating: 5,
        comment: 'فستان بنتي جميل وناعم، والسعر كويس',
        isApproved: true,
      },
    }),

    // تقييمات ملابس الشباب
    prisma.review.create({
      data: {
        userId: customers[0].id,
        productId: 'prod9',
        rating: 5,
        comment: 'تيشيرت عصري وجودة عالية! مريح جداً',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[2].id,
        productId: 'prod10',
        rating: 4,
        comment: 'جاكيت حلو بس اللون مختلف شوية عن الصورة',
        isApproved: true,
      },
    }),

    // تقييمات ملابس البنات
    prisma.review.create({
      data: {
        userId: customers[1].id,
        productId: 'prod11',
        rating: 5,
        comment: 'بلوزة جميلة جداً! القماش ناعم والتطريز رائع',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[4].id,
        productId: 'prod12',
        rating: 5,
        comment: 'جيبة جميلة ومناسبة لكل المناسبات',
        isApproved: true,
      },
    }),

    // تقييمات الميك اب
    prisma.review.create({
      data: {
        userId: customers[1].id,
        productId: 'prod13',
        rating: 5,
        comment: 'باليت رهيبة! الألوان ثابتة وسهلة الدمج',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[4].id,
        productId: 'prod13',
        rating: 5,
        comment: 'أفضل باليت جربتها! الألوان جميلة جداً',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[0].id,
        productId: 'prod14',
        rating: 4,
        comment: 'روج ممتاز لكن يحتاج تجديد كل كام ساعة',
        isApproved: true,
      },
    }),

    // تقييمات الأحذية
    prisma.review.create({
      data: {
        userId: customers[2].id,
        productId: 'prod19',
        rating: 5,
        comment: 'حذاء مريح جداً! ألبسه كل يوم',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[3].id,
        productId: 'prod20',
        rating: 4,
        comment: 'حذاء أنيق ومناسب للمناسبات الرسمية',
        isApproved: true,
      },
    }),

    // تقييمات الأدوات المكتبية
    prisma.review.create({
      data: {
        userId: customers[0].id,
        productId: 'prod34',
        rating: 5,
        comment: 'دفتر ممتاز! الورق جودة عالية ومناسب للكتابة',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[2].id,
        productId: 'prod34',
        rating: 5,
        comment: 'جودة رائعة والسعر مناسب جداً',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[1].id,
        productId: 'prod35',
        rating: 5,
        comment: 'الأقلام رائعة! الحبر ينساب بسلاسة والألوان زاهية',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[3].id,
        productId: 'prod36',
        rating: 4,
        comment: 'منظم عملي وجودة جيدة، ساعدني أرتب مكتبي',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[4].id,
        productId: 'prod37',
        rating: 5,
        comment: 'ملاحظات لاصقة مفيدة جداً! الألوان حلوة',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[0].id,
        productId: 'prod38',
        rating: 5,
        comment: 'آلة حاسبة ممتازة وسهلة الاستخدام',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[2].id,
        productId: 'prod39',
        rating: 4,
        comment: 'دباسة قوية وتعمل بشكل جيد',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[1].id,
        productId: 'prod40',
        rating: 5,
        comment: 'مصباح رائع! الإضاءة قوية ويمكن التحكم فيها',
        isApproved: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: customers[3].id,
        productId: 'prod41',
        rating: 5,
        comment: 'مقص حاد وعملي، جودة ممتازة',
        isApproved: true,
      },
    }),
  ]);

  console.log('✅ تم إنشاء', reviews.length, 'تقييم للمنتجات');

  // إنشاء قماش تجريبي
  const fabric = await prisma.fabric.create({
    data: {
      name: 'Premium Cotton',
      nameAr: 'قطن فاخر',
      type: 'قطن',
      color: 'أبيض',
      purchasePrice: 1000,
      totalLength: 100,
      availableLength: 100,
      usedLength: 0,
      supplier: 'شركة الأقمشة الفاخرة',
    },
  });

  console.log('✅ تم إنشاء قماش:', fabric.nameAr);

  // إنشاء حسابات الشركاء
  const partnersPassword = await bcrypt.hash('Aazxc', 10);

  // 1. صاحب محل (Store Owner)
  const storeOwner = await prisma.user.upsert({
    where: { email: 'store@partner.com' },
    update: {},
    create: {
      email: 'store@partner.com',
      username: 'store_owner',
      name: 'أحمد صاحب المحل',
      password: partnersPassword,
      role: 'VENDOR',
      vendor: {
        create: {
          businessName: 'Ahmad Store',
          businessNameAr: 'محل أحمد',
          businessType: 'store',
          storeName: 'Ahmad Fashion Store',
          storeNameAr: 'محل أحمد للأزياء',
          phone: '01111111111',
          city: 'القاهرة',
          category: 'ملابس',
          yearsOfExperience: 5,
          bankName: 'البنك الأهلي المصري',
          accountNumber: '123456789',
          isApproved: true,
          commissionRate: 15,
        },
      },
    },
  });

  console.log('✅ تم إنشاء صاحب محل:', storeOwner.email);

  // 2. صاحب مصنع (Factory Owner)
  const factoryOwner = await prisma.user.upsert({
    where: { email: 'factory@partner.com' },
    update: {},
    create: {
      email: 'factory@partner.com',
      username: 'factory_owner',
      name: 'محمد صاحب المصنع',
      password: partnersPassword,
      role: 'MANUFACTURER',
      vendor: {
        create: {
          businessName: 'Mohamed Factory',
          businessNameAr: 'مصنع محمد',
          businessType: 'factory',
          storeName: 'Mohamed Textile Factory',
          storeNameAr: 'مصنع محمد للمنسوجات',
          phone: '01222222222',
          city: 'الإسكندرية',
          category: 'ملابس',
          yearsOfExperience: 10,
          bankName: 'بنك مصر',
          accountNumber: '987654321',
          isApproved: true,
          commissionRate: 10,
        },
      },
    },
  });

  console.log('✅ تم إنشاء صاحب مصنع:', factoryOwner.email);

  // 3. مندوب توصيل (Delivery Driver)
  const deliveryDriver = await prisma.user.upsert({
    where: { email: 'delivery@partner.com' },
    update: {},
    create: {
      email: 'delivery@partner.com',
      username: 'delivery_driver',
      name: 'علي المندوب',
      password: partnersPassword,
      role: 'DELIVERY_STAFF',
      deliveryStaff: {
        create: {
          name: 'علي المندوب',
          phone: '01333333333',
          email: 'delivery@partner.com',
          password: partnersPassword,
          city: 'الجيزة',
          vehicleType: 'دراجة نارية',
          vehicleNumber: 'ABC 1234',
          bankName: 'البنك الأهلي المصري',
          accountNumber: '555666777',
          isApproved: true,
          isAvailable: true,
        },
      },
    },
  });

  console.log('✅ تم إنشاء مندوب توصيل:', deliveryDriver.email);

  // 4. مكتبة أدوات مدرسية (Stationery Store)
  const stationeryOwner = await prisma.user.upsert({
    where: { email: 'stationery@partner.com' },
    update: {},
    create: {
      email: 'stationery@partner.com',
      username: 'stationery_owner',
      name: 'فاطمة صاحبة المكتبة',
      password: partnersPassword,
      role: 'VENDOR',
      vendor: {
        create: {
          businessName: 'Fatma Stationery',
          businessNameAr: 'مكتبة فاطمة',
          businessType: 'stationery',
          storeName: 'Fatma School Supplies',
          storeNameAr: 'مكتبة فاطمة للأدوات المدرسية',
          phone: '01444444444',
          city: 'المنصورة',
          category: 'أدوات مدرسية',
          yearsOfExperience: 7,
          bankName: 'بنك القاهرة',
          accountNumber: '111222333',
          isApproved: true,
          commissionRate: 15,
        },
      },
    },
  });

  console.log('✅ تم إنشاء صاحبة مكتبة:', stationeryOwner.email);

  // 5. صيدلية (Pharmacy)
  const pharmacyOwner = await prisma.user.upsert({
    where: { email: 'pharmacy@partner.com' },
    update: {},
    create: {
      email: 'pharmacy@partner.com',
      username: 'pharmacy_owner',
      name: 'د. سارة الصيدلانية',
      password: partnersPassword,
      role: 'VENDOR',
      vendor: {
        create: {
          businessName: 'Sara Pharmacy',
          businessNameAr: 'صيدلية سارة',
          businessType: 'pharmacy',
          storeName: 'Sara Health Pharmacy',
          storeNameAr: 'صيدلية سارة الصحية',
          phone: '01555555555',
          city: 'طنطا',
          category: 'أدوية ومستحضرات',
          yearsOfExperience: 8,
          bankName: 'البنك التجاري الدولي',
          accountNumber: '444555666',
          isApproved: true,
          commissionRate: 15,
        },
      },
    },
  });

  console.log('✅ تم إنشاء صاحبة صيدلية:', pharmacyOwner.email);

  // 6. محل عام (General Store)
  const generalStoreOwner = await prisma.user.upsert({
    where: { email: 'general@partner.com' },
    update: {},
    create: {
      email: 'general@partner.com',
      username: 'general_owner',
      name: 'خالد صاحب المحل العام',
      password: partnersPassword,
      role: 'VENDOR',
      vendor: {
        create: {
          businessName: 'Khaled General Store',
          businessNameAr: 'محل خالد العام',
          businessType: 'general',
          storeName: 'Khaled Multi Store',
          storeNameAr: 'محل خالد المتنوع',
          phone: '01666666666',
          city: 'الزقازيق',
          category: 'أخرى',
          yearsOfExperience: 12,
          bankName: 'بنك الإسكندرية',
          accountNumber: '777888999',
          isApproved: true,
          commissionRate: 15,
        },
      },
    },
  });

  console.log('✅ تم إنشاء صاحب محل عام:', generalStoreOwner.email);

  // ربط المنتجات بصاحب المحل أحمد
  console.log('🔗 ربط المنتجات بأصحاب المحلات...');
  
  // البحث عن Vendor المرتبط بصاحب المحل
  const storeVendor = await prisma.vendor.findFirst({
    where: { 
      user: {
        email: 'store@partner.com'
      }
    }
  });

  if (storeVendor) {
    await prisma.product.updateMany({
      where: {
        id: {
          in: ['prod1', 'prod2', 'prod3', 'prod4', 'prod5', 'prod6', 'prod7', 'prod8']
        }
      },
      data: {
        vendorId: storeVendor.id
      }
    });

    console.log('✅ تم ربط 8 منتجات بأحمد صاحب المحل');
  }

  // ربط المنتجات المكتبية بصاحبة المكتبة
  const stationeryVendor = await prisma.vendor.findFirst({
    where: { 
      user: {
        email: 'stationery@partner.com'
      }
    }
  });

  if (stationeryVendor) {
    await prisma.product.updateMany({
      where: {
        id: {
          in: [
            'prod34', 'prod35', 'prod36', 'prod37', 'prod38', 'prod39', 'prod40', 'prod41',
            'prod42', 'prod43', 'prod44', 'prod45', 'prod46', 'prod47', 'prod48',
            'prod49', 'prod50', 'prod51', 'prod52', 'prod53', 'prod54', 'prod55',
            'prod56', 'prod57', 'prod58', 'prod59', 'prod60'
          ]
        }
      },
      data: {
        vendorId: stationeryVendor.id
      }
    });

    console.log('✅ تم ربط 27 منتج مكتبي بصاحبة المكتبة');
  }

  // إنشاء عملاء إضافيين
  console.log('👥 إنشاء عملاء إضافيين...');
  
  const customer1 = await prisma.user.upsert({
    where: { email: 'customer1@example.com' },
    update: {},
    create: {
      email: 'customer1@example.com',
      username: 'customer1',
      name: 'محمد أحمد',
      password: await bcrypt.hash('customer123', 10),
      role: 'CUSTOMER',
    }
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'customer2@example.com' },
    update: {},
    create: {
      email: 'customer2@example.com',
      username: 'customer2',
      name: 'فاطمة علي',
      password: await bcrypt.hash('customer123', 10),
      role: 'CUSTOMER',
    }
  });

  const customer3 = await prisma.user.upsert({
    where: { email: 'customer3@example.com' },
    update: {},
    create: {
      email: 'customer3@example.com',
      username: 'customer3',
      name: 'أحمد حسن',
      password: await bcrypt.hash('customer123', 10),
      role: 'CUSTOMER',
    }
  });

  console.log('✅ تم إنشاء 3 عملاء جدد');

  // إنشاء أوردرات مترابطة
  console.log('📦 إنشاء أوردرات مترابطة...');

  // إنشاء المنتجات
  const product1 = await prisma.product.findUnique({ where: { id: 'prod1' } });
  const product2 = await prisma.product.findUnique({ where: { id: 'prod2' } });
  const product3 = await prisma.product.findUnique({ where: { id: 'prod3' } });
  const product4 = await prisma.product.findUnique({ where: { id: 'prod4' } });

  if (product1 && product2 && product3 && product4 && deliveryStaffRecord) {
    // Order 1 - مكتمل
    const order1 = await prisma.order.create({
      data: {
        customerId: customer1.id,
        totalAmount: product1.price * 2 + product2.price * 1,
        finalAmount: product1.price * 2 + product2.price * 1 + 30,
        status: 'DELIVERED',
        paymentMethod: 'CASH_ON_DELIVERY',
        deliveryFee: 30,
        deliveryAddress: 'القاهرة - مدينة نصر - شارع عباس العقاد',
        deliveryPhone: '01012345671',
        deliveryStaffId: deliveryStaffRecord.id,
        items: {
          create: [
            {
              productId: product1.id,
              quantity: 2,
              price: product1.price,
            },
            {
              productId: product2.id,
              quantity: 1,
              price: product2.price,
            }
          ]
        }
      }
    });

    // Order 2 - قيد التوصيل
    const order2 = await prisma.order.create({
      data: {
        customerId: customer2.id,
        totalAmount: product3.price * 1 + product4.price * 2,
        finalAmount: product3.price * 1 + product4.price * 2 + 30,
        status: 'OUT_FOR_DELIVERY',
        paymentMethod: 'CASH_ON_DELIVERY',
        deliveryFee: 30,
        deliveryAddress: 'الجيزة - المهندسين - شارع جامعة الدول',
        deliveryPhone: '01012345672',
        deliveryStaffId: deliveryStaffRecord.id,
        items: {
          create: [
            {
              productId: product3.id,
              quantity: 1,
              price: product3.price,
            },
            {
              productId: product4.id,
              quantity: 2,
              price: product4.price,
            }
          ]
        }
      }
    });

    // Order 3 - قيد التحضير
    const order3 = await prisma.order.create({
      data: {
        customerId: customer3.id,
        totalAmount: product1.price * 3 + product3.price * 1,
        finalAmount: product1.price * 3 + product3.price * 1 + 30,
        status: 'PREPARING',
        paymentMethod: 'CASH_ON_DELIVERY',
        deliveryFee: 30,
        deliveryAddress: 'الإسكندرية - سيدي جابر - شارع فؤاد',
        deliveryPhone: '01012345673',
        items: {
          create: [
            {
              productId: product1.id,
              quantity: 3,
              price: product1.price,
            },
            {
              productId: product3.id,
              quantity: 1,
              price: product3.price,
            }
          ]
        }
      }
    });

    // Order 4 - معلق
    const order4 = await prisma.order.create({
      data: {
        customerId: customer1.id,
        totalAmount: product2.price * 2 + product4.price * 1,
        finalAmount: product2.price * 2 + product4.price * 1 + 30,
        status: 'PENDING',
        paymentMethod: 'CASH_ON_DELIVERY',
        deliveryFee: 30,
        deliveryAddress: 'القاهرة - التجمع الخامس - الحي الأول',
        deliveryPhone: '01012345671',
        items: {
          create: [
            {
              productId: product2.id,
              quantity: 2,
              price: product2.price,
            },
            {
              productId: product4.id,
              quantity: 1,
              price: product4.price,
            }
          ]
        }
      }
    });

    // Order 5 - تم التأكيد
    const order5 = await prisma.order.create({
      data: {
        customerId: customer2.id,
        totalAmount: product1.price * 1 + product2.price * 1 + product3.price * 1,
        finalAmount: product1.price * 1 + product2.price * 1 + product3.price * 1 + 30,
        status: 'CONFIRMED',
        paymentMethod: 'CASH_ON_DELIVERY',
        deliveryFee: 30,
        deliveryAddress: 'الجيزة - الهرم - شارع الهرم الرئيسي',
        deliveryPhone: '01012345672',
        items: {
          create: [
            {
              productId: product1.id,
              quantity: 1,
              price: product1.price,
            },
            {
              productId: product2.id,
              quantity: 1,
              price: product2.price,
            },
            {
              productId: product3.id,
              quantity: 1,
              price: product3.price,
            }
          ]
        }
      }
    });

    console.log('✅ تم إنشاء 5 أوردرات مترابطة');

    // تحديث عدد المبيعات للمنتجات
    await prisma.product.update({
      where: { id: 'prod1' },
      data: { soldCount: { increment: 7 } }
    });
    await prisma.product.update({
      where: { id: 'prod2' },
      data: { soldCount: { increment: 4 } }
    });
    await prisma.product.update({
      where: { id: 'prod3' },
      data: { soldCount: { increment: 3 } }
    });
    await prisma.product.update({
      where: { id: 'prod4' },
      data: { soldCount: { increment: 3 } }
    });

    console.log('✅ تم تحديث عدد المبيعات للمنتجات');
  }

  // إضافة مدفوعات للشريك
  if (storeVendor) {
    console.log('💰 إنشاء مدفوعات للشريك...');

    await prisma.vendorPayout.create({
      data: {
        vendorId: storeVendor.id,
        amount: 1500,
        status: 'COMPLETED',
        method: 'bank_transfer',
        reference: 'TRF-2026-001',
        notes: 'تحويل بنكي - البنك الأهلي',
        paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // منذ 5 أيام
      }
    });

    await prisma.vendorPayout.create({
      data: {
        vendorId: storeVendor.id,
        amount: 2000,
        status: 'COMPLETED',
        method: 'bank_transfer',
        reference: 'TRF-2026-002',
        notes: 'تحويل بنكي - البنك الأهلي',
        paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // منذ 10 أيام
      }
    });

    await prisma.vendorPayout.create({
      data: {
        vendorId: storeVendor.id,
        amount: 1200,
        status: 'PENDING',
        method: 'bank_transfer',
        notes: 'طلب سحب جديد',
      }
    });

    console.log('✅ تم إنشاء 3 مدفوعات للشريك');
  }

  // إضافة إعدادات الموقع
  console.log('\n⚙️ إضافة إعدادات الموقع...');
  
  await prisma.siteSetting.createMany({
    data: [
      // إعدادات عامة
      {
        key: 'site_name',
        value: 'متجر شامل',
        type: 'text',
        category: 'general',
        description: 'اسم الموقع'
      },
      {
        key: 'site_name_en',
        value: 'Comprehensive Store',
        type: 'text',
        category: 'general',
        description: 'Site name in English'
      },
      {
        key: 'site_description',
        value: 'منصة تسوق متكاملة توفر جميع احتياجاتك من الملابس والأدوات المكتبية وغيرها',
        type: 'text',
        category: 'general',
        description: 'وصف الموقع'
      },
      {
        key: 'contact_email',
        value: 'info@store.com',
        type: 'text',
        category: 'general',
        description: 'البريد الإلكتروني للتواصل'
      },
      {
        key: 'contact_phone',
        value: '+20 123 456 7890',
        type: 'text',
        category: 'general',
        description: 'رقم الهاتف للتواصل'
      },
      {
        key: 'contact_whatsapp',
        value: '+201234567890',
        type: 'text',
        category: 'general',
        description: 'رقم الواتساب'
      },
      {
        key: 'address',
        value: 'القاهرة، مصر',
        type: 'text',
        category: 'general',
        description: 'العنوان'
      },
      // إعدادات المظهر
      {
        key: 'primary_color',
        value: '#3b82f6',
        type: 'text',
        category: 'appearance',
        description: 'اللون الرئيسي'
      },
      {
        key: 'show_slider',
        value: 'true',
        type: 'boolean',
        category: 'appearance',
        description: 'إظهار السلايدر في الصفحة الرئيسية'
      },
      {
        key: 'products_per_page',
        value: '12',
        type: 'number',
        category: 'appearance',
        description: 'عدد المنتجات في الصفحة'
      },
      // إعدادات SEO
      {
        key: 'meta_title',
        value: 'متجر شامل - تسوق أونلاين',
        type: 'text',
        category: 'seo',
        description: 'عنوان الميتا'
      },
      {
        key: 'meta_description',
        value: 'تسوق من مجموعة واسعة من المنتجات بأسعار مميزة وتوصيل سريع',
        type: 'text',
        category: 'seo',
        description: 'وصف الميتا'
      },
      {
        key: 'meta_keywords',
        value: 'تسوق، شراء، ملابس، أدوات مكتبية، توصيل',
        type: 'text',
        category: 'seo',
        description: 'كلمات مفتاحية'
      },
      // إعدادات وسائل التواصل
      {
        key: 'facebook_url',
        value: 'https://facebook.com',
        type: 'text',
        category: 'social',
        description: 'رابط الفيسبوك'
      },
      {
        key: 'instagram_url',
        value: 'https://instagram.com',
        type: 'text',
        category: 'social',
        description: 'رابط الإنستغرام'
      },
      {
        key: 'twitter_url',
        value: 'https://twitter.com',
        type: 'text',
        category: 'social',
        description: 'رابط تويتر'
      }
    ]
  });
  
  console.log('✅ تم إضافة إعدادات الموقع');

  // إضافة صور السلايدر
  console.log('\n🖼️ إضافة صور السلايدر...');
  
  await prisma.sliderImage.createMany({
    data: [
      {
        title: 'عروض الصيف الكبرى',
        titleAr: 'عروض الصيف الكبرى',
        subtitle: 'خصومات تصل إلى 50% على جميع المنتجات',
        subtitleAr: 'خصومات تصل إلى 50% على جميع المنتجات',
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200',
        link: '/products?category=cat1',
        buttonText: 'تسوق الآن',
        buttonTextAr: 'تسوق الآن',
        order: 1,
        isActive: true
      },
      {
        title: 'مستلزمات المدرسة',
        titleAr: 'مستلزمات المدرسة',
        subtitle: 'كل ما تحتاجه من أدوات مكتبية وكتب دراسية',
        subtitleAr: 'كل ما تحتاجه من أدوات مكتبية وكتب دراسية',
        imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200',
        link: '/products?category=cat9',
        buttonText: 'اكتشف المزيد',
        buttonTextAr: 'اكتشف المزيد',
        order: 2,
        isActive: true
      },
      {
        title: 'أحدث صيحات الموضة',
        titleAr: 'أحدث صيحات الموضة',
        subtitle: 'تشكيلة واسعة من الملابس العصرية',
        subtitleAr: 'تشكيلة واسعة من الملابس العصرية',
        imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
        link: '/products',
        buttonText: 'تصفح الآن',
        buttonTextAr: 'تصفح الآن',
        order: 3,
        isActive: true
      },
      {
        title: 'توصيل مجاني',
        titleAr: 'توصيل مجاني',
        subtitle: 'على جميع الطلبات فوق 500 جنيه',
        subtitleAr: 'على جميع الطلبات فوق 500 جنيه',
        imageUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=1200',
        link: '/products',
        buttonText: 'ابدأ التسوق',
        buttonTextAr: 'ابدأ التسوق',
        order: 4,
        isActive: true
      },
      {
        title: 'وصل حديثًا',
        titleAr: 'وصل حديثًا',
        subtitle: 'تشكيلة جديدة من المنتجات العصرية',
        subtitleAr: 'تشكيلة جديدة من المنتجات العصرية',
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
        link: '/products',
        buttonText: 'اكتشف الجديد',
        buttonTextAr: 'اكتشف الجديد',
        order: 5,
        isActive: true
      },
      {
        title: 'عروض خاصة للطلاب',
        titleAr: 'عروض خاصة للطلاب',
        subtitle: 'خصم إضافي 20% على الأدوات المكتبية',
        subtitleAr: 'خصم إضافي 20% على الأدوات المكتبية',
        imageUrl: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=1200',
        link: '/products?category=cat9',
        buttonText: 'احصل على الخصم',
        buttonTextAr: 'احصل على الخصم',
        order: 6,
        isActive: true
      },
      {
        title: 'جودة عالية بأسعار مناسبة',
        titleAr: 'جودة عالية بأسعار مناسبة',
        subtitle: 'منتجات أصلية بضمان الجودة',
        subtitleAr: 'منتجات أصلية بضمان الجودة',
        imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200',
        link: '/products',
        buttonText: 'تسوق بثقة',
        buttonTextAr: 'تسوق بثقة',
        order: 7,
        isActive: true
      },
      {
        title: 'تخفيضات نهاية الموسم',
        titleAr: 'تخفيضات نهاية الموسم',
        subtitle: 'خصومات تصل إلى 70% على مجموعة مختارة',
        subtitleAr: 'خصومات تصل إلى 70% على مجموعة مختارة',
        imageUrl: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200',
        link: '/products',
        buttonText: 'تسوق التخفيضات',
        buttonTextAr: 'تسوق التخفيضات',
        order: 8,
        isActive: true
      },
      {
        title: 'هدايا مميزة',
        titleAr: 'هدايا مميزة',
        subtitle: 'أفكار هدايا رائعة لكل المناسبات',
        subtitleAr: 'أفكار هدايا رائعة لكل المناسبات',
        imageUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1200',
        link: '/products',
        buttonText: 'اختر هديتك',
        buttonTextAr: 'اختر هديتك',
        order: 9,
        isActive: true
      }
    ]
  });
  
  console.log('✅ تم إضافة 9 صور للسلايدر');

  console.log('🎉 تمت تعبئة قاعدة البيانات بنجاح!');
  console.log('\n🤝 حسابات الشركاء (كلمة المرور: Aazxc):');
  console.log('1. صاحب محل: store@partner.com');
  console.log('2. صاحب مصنع: factory@partner.com');
  console.log('3. مندوب توصيل: delivery@partner.com');
  console.log('4. صاحبة مكتبة: stationery@partner.com');
  console.log('5. صاحبة صيدلية: pharmacy@partner.com');
  console.log('6. صاحب محل عام: general@partner.com');
}

main()
  .catch((e) => {
    console.error('❌ خطأ في تعبئة البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
