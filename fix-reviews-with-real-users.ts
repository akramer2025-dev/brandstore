import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// أسماء مصرية متنوعة
const egyptianUsers = [
  { name: 'محمد أحمد', email: 'mohamed.ahmed@example.com' },
  { name: 'أحمد محمود', email: 'ahmed.mahmoud@example.com' },
  { name: 'فاطمة حسن', email: 'fatma.hassan@example.com' },
  { name: 'مريم علي', email: 'mariam.ali@example.com' },
  { name: 'عمر خالد', email: 'omar.khaled@example.com' },
  { name: 'نور الدين', email: 'nour.eldin@example.com' },
  { name: 'ياسمين محمد', email: 'yasmin.mohamed@example.com' },
  { name: 'سارة إبراهيم', email: 'sara.ibrahim@example.com' },
  { name: 'خالد يوسف', email: 'khaled.youssef@example.com' },
  { name: 'هدى عبدالرحمن', email: 'hoda.abdelrahman@example.com' },
  { name: 'عبدالله سعيد', email: 'abdullah.said@example.com' },
  { name: 'منى فتحي', email: 'mona.fathy@example.com' },
  { name: 'ريم حسين', email: 'reem.hussein@example.com' },
  { name: 'طارق عادل', email: 'tarek.adel@example.com' },
  { name: 'دينا صلاح', email: 'dina.salah@example.com' },
  { name: 'كريم وليد', email: 'karim.walid@example.com' },
  { name: 'نهى محمود', email: 'noha.mahmoud@example.com' },
  { name: 'يوسف محمد', email: 'youssef.mohamed@example.com' },
  { name: 'هبة محمود', email: 'heba.mahmoud@example.com' },
  { name: 'عادل صلاح', email: 'adel.salah@example.com' },
  { name: 'شيماء أحمد', email: 'shimaa.ahmed@example.com' },
  { name: 'وليد محمد', email: 'walid.mohamed@example.com' },
  { name: 'سامي حسن', email: 'sami.hassan@example.com' },
  { name: 'ندى أحمد', email: 'nada.ahmed@example.com' },
  { name: 'حسام الدين', email: 'hossam.eldin@example.com' },
  { name: 'إسلام محمد', email: 'eslam.mohamed@example.com' },
  { name: 'رانيا حسن', email: 'rania.hassan@example.com' },
  { name: 'محمود علي', email: 'mahmoud.ali@example.com' },
  { name: 'لمياء سعيد', email: 'lamia.said@example.com' },
  { name: 'تامر حسني', email: 'tamer.hosny@example.com' },
];

// تعليقات متنوعة ومصرية
const egyptianComments = [
  'المنتج ممتاز جداً والجودة عالية، يستاهل كل قرش!',
  'ماشاء الله تبارك الله، المنتج والخدمة في القمة!',
  'تجربة رائعة من الطلب للتوصيل، شكراً جداً!',
  'المقاس مظبوط 100% والخامة ناعمة جداً!',
  'التعامل راقي جداً وخدمة عملاء ممتازة!',
  'المنتج فاق توقعاتي بكتير! جودة وخامة وتوصيل سريع!',
  'ربنا يبارك في شغلكم، المنتج والتعامل في القمة!',
  'وصل بسرعة البرق والتغليف محترم جداً!',
  'القيمة مقابل السعر ممتازة جداً، يستحق التجربة!',
  'ماشاء الله الخامة فاخرة والتفصيل دقيق جداً!',
  'المنتج جميل جداً وجودة عالية، يستاهل كل النجوم!',
  'راضي جداً عن المنتج والخدمة، حاطلب تاني أكيد!',
  'تجربة تسوق رائعة، المنتج أجمل من الصور كمان!',
  'كل حاجة تمام! المنتج والتوصيل والتعامل كله ممتاز!',
  'تجربة ناجحة بكل المقاييس! شكراً وإلى الأمام!',
  'المنتج ممتاز جداً! رشحته لكل صحابي وعائلتي!',
  'الخامة جميلة والسعر مناسب جداً، متشكرين!',
  'المنتج في المستوى وفوق التوقعات بصراحة!',
  'تسليم سريع ومنتج ممتاز، ألف شكر!',
  'جودة عالية جداً والسعر حلو، أكيد هرجع أطلب تاني!',
];

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomComment(): string {
  return egyptianComments[getRandomInt(0, egyptianComments.length - 1)];
}

function getRandomRating(): number {
  const rand = Math.random();
  if (rand < 0.7) return 5; // 70% خمس نجوم
  if (rand < 0.9) return 4; // 20% أربع نجوم
  return 3; // 10% ثلاث نجوم
}

// دالة لإنشاء تاريخ عشوائي في آخر 60 يوم
function getRandomDate(): Date {
  const now = new Date();
  const daysAgo = getRandomInt(1, 60); // آخر شهرين
  const hoursAgo = getRandomInt(0, 23);
  const minutesAgo = getRandomInt(0, 59);
  
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(date.getMinutes() - minutesAgo);
  
  return date;
}

async function main() {
  try {
    console.log('🗑️  مسح التقييمات القديمة...\n');
    
    // مسح كل التقييمات القديمة
    await prisma.review.deleteMany({});
    console.log('✅ تم مسح التقييمات القديمة\n');

    console.log('👥 إنشاء مستخدمين جدد بأسماء مصرية...\n');
    
    // إنشاء المستخدمين
    const createdUsers = [];
    for (const userData of egyptianUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        createdUsers.push(existingUser);
        console.log(`   ⏭️  ${userData.name} موجود بالفعل`);
      } else {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: 'CUSTOMER',
          },
        });
        createdUsers.push(user);
        console.log(`   ✅ تم إنشاء: ${userData.name}`);
      }
    }

    console.log(`\n✅ تم إنشاء/التحقق من ${createdUsers.length} مستخدم\n`);

    console.log('📦 جاري جلب المنتجات...\n');

    // جلب كل المنتجات
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        nameAr: true,
      },
    });

    if (products.length === 0) {
      console.log('⚠️ لا توجد منتجات في قاعدة البيانات!');
      return;
    }

    console.log(`✅ تم العثور على ${products.length} منتج\n`);

    let totalReviews = 0;

    // إضافة تقييمات لكل منتج
    for (const product of products) {
      const reviewsCount = getRandomInt(3, 6); // من 3 إلى 6 تقييمات لكل منتج
      const usedUserIds = new Set<string>();

      console.log(`📝 إضافة ${reviewsCount} تقييم للمنتج: ${product.nameAr || product.name}`);

      for (let i = 0; i < reviewsCount; i++) {
        // اختيار مستخدم عشوائي (بدون تكرار للمنتج الواحد)
        let randomUser = createdUsers[getRandomInt(0, createdUsers.length - 1)];
        let attempts = 0;
        while (usedUserIds.has(randomUser.id) && attempts < 50) {
          randomUser = createdUsers[getRandomInt(0, createdUsers.length - 1)];
          attempts++;
        }
        usedUserIds.add(randomUser.id);

        const rating = getRandomRating();
        const comment = getRandomComment();
        const createdAt = getRandomDate();

        await prisma.review.create({
          data: {
            productId: product.id,
            userId: randomUser.id,
            rating,
            comment,
            isApproved: true,
            pointsAwarded: 5,
            createdAt,
            updatedAt: createdAt,
          },
        });

        const daysAgo = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`   ✅ ${randomUser.name}: ${rating}⭐ - منذ ${daysAgo} يوم - "${comment.substring(0, 40)}..."`);
        totalReviews++;
      }

      console.log('');
    }

    console.log(`\n🎉 تم إضافة ${totalReviews} تقييم بنجاح!`);
    console.log(`📊 لـ ${products.length} منتج`);
    console.log(`👥 من ${createdUsers.length} عميل مختلف`);
    console.log(`📅 بتواريخ متنوعة (آخر 60 يوم)\n`);

    // عرض إحصائيات
    const avgRating = await prisma.review.aggregate({
      _avg: { rating: true },
    });
    console.log(`⭐ متوسط التقييم: ${avgRating._avg.rating?.toFixed(2)}\n`);

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
