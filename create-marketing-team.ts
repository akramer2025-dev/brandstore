import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 إنشاء حسابات الفريق التسويقي...\n');

  try {
    // ========================
    // حذف الحسابات القديمة
    // ========================
    console.log('🗑️ حذف الحسابات القديمة...');
    
    // حذف MarketingStaff القديم
    const oldStaff = await prisma.marketingStaff.findMany({
      where: {
        OR: [
          { email: 'mediabuyer@brandstore.com' },
          { email: 'playmaker@brandstore.com' },
          { phone: '01234567890' },
          { phone: '01098765432' },
        ],
      },
    });

    for (const staff of oldStaff) {
      await prisma.marketingStaff.delete({ where: { id: staff.id } });
    }

    // حذف Users القديمة
    const oldUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: 'mediabuyer@brandstore.com' },
          { email: 'playmaker@brandstore.com' },
        ],
      },
    });

    for (const user of oldUsers) {
      await prisma.user.delete({ where: { id: user.id } });
    }

    console.log('✅ تم حذف الحسابات القديمة\n');

    // ========================
    // 1. Media Buyer Account
    // ========================
    console.log('📊 إنشاء حساب Media Buyer...');

    const mediaBuyerPassword = await bcrypt.hash('MediaBuyer2026!', 10);
    
    const mediaBuyerUser = await prisma.user.create({
      data: {
        name: 'محمد أحمد - Media Buyer',
        email: 'mediabuyer@brandstore.com',
        phone: '01234567890',
        password: mediaBuyerPassword,
        role: 'MARKETING_STAFF',
      },
    });

    const mediaBuyer = await prisma.marketingStaff.create({
      data: {
        userId: mediaBuyerUser.id,
        name: 'محمد أحمد',
        phone: '01234567890',
        email: 'mediabuyer@brandstore.com',
        commissionRate: 5, // 5% عمولة أساسية
        isApproved: true,
        // بيانات الدفع
        bankName: 'البنك الأهلي المصري',
        accountNumber: '1234567890123456',
        accountHolderName: 'محمد أحمد علي',
        iban: 'EG380019001234567890123456',
        instaPay: '01234567890',
        vodafoneCash: '01234567890',
      },
    });

    console.log('✅ تم إنشاء Media Buyer:', mediaBuyer.id);

    // ========================
    // 2. Playmaker Account
    // ========================
    console.log('\n🎨 إنشاء حساب Playmaker...');

    const playmakerPassword = await bcrypt.hash('Playmaker2026!', 10);
    
    const playmakerUser = await prisma.user.create({
      data: {
        name: 'سارة محمود - Playmaker',
        email: 'playmaker@brandstore.com',
        phone: '01098765432',
        password: playmakerPassword,
        role: 'MARKETING_STAFF',
      },
    });

    const playmaker = await prisma.marketingStaff.create({
      data: {
        userId: playmakerUser.id,
        name: 'سارة محمود',
        phone: '01098765432',
        email: 'playmaker@brandstore.com',
        commissionRate: 5, // 5% عمولة أساسية
        isApproved: true,
        // بيانات الدفع
        bankName: 'بنك مصر',
        accountNumber: '9876543210987654',
        accountHolderName: 'سارة محمود حسن',
        iban: 'EG210013009876543210987654',
        instaPay: '01098765432',
        etisalatCash: '01098765432',
      },
    });

    console.log('✅ تم إنشاء Playmaker:', playmaker.id);

    // ========================
    // 3. طباعة بيانات الدخول
    // ========================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 بيانات تسجيل الدخول للفريق التسويقي');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('👤 Media Buyer (مدير الإعلانات)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 البريد الإلكتروني: mediabuyer@brandstore.com');
    console.log('🔑 كلمة المرور: MediaBuyer2026!');
    console.log('👔 الدور: MARKETING_STAFF');
    console.log('📱 الهاتف: 01234567890');
    console.log('💰 نسبة العمولة: 5%');
    console.log('🔗 لوحة التحكم: /marketing-staff');
    console.log('📊 Media Buyer Dashboard: /admin/media-buyer (يحتاج صلاحيات ADMIN)');

    console.log('\n👤 Playmaker (صانع المحتوى)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 البريد الإلكتروني: playmaker@brandstore.com');
    console.log('🔑 كلمة المرور: Playmaker2026!');
    console.log('👔 الدور: MARKETING_STAFF');
    console.log('📱 الهاتف: 01098765432');
    console.log('💰 نسبة العمولة: 5%');
    console.log('🔗 لوحة التحكم: /marketing-staff');
    console.log('✨ Marketing AI: /vendor/products (زر "تسويق المنتج")');

    console.log('\n👤 المطور (Admin)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 البريد الإلكتروني: akram@gmail.com');
    console.log('🔑 كلمة المرور: Aazxc123');
    console.log('👔 الدور: ADMIN');
    console.log('🔗 لوحة التحكم: /admin');
    console.log('📊 Media Buyer AI: /admin/media-buyer');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ الأدوار والصلاحيات');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 Media Buyer - المسؤوليات:');
    console.log('  1. إدارة الحملات الإعلانية (Facebook, Instagram, Google)');
    console.log('  2. تحليل الأداء باستخدام AI');
    console.log('  3. تحسين ROAS وتقليل CPA');
    console.log('  4. A/B Testing للإعلانات');
    console.log('  5. Scaling الحملات الناجحة');
    console.log('  6. إدارة الميزانيات الإعلانية');

    console.log('\n🎨 Playmaker - المسؤوليات:');
    console.log('  1. إنشاء تصاميم إعلانية جذابة');
    console.log('  2. كتابة نصوص تسويقية بالذكاء الاصطناعي');
    console.log('  3. إنتاج محتوى فيديو وصور');
    console.log('  4. تصوير المنتجات بشكل احترافي');
    console.log('  5. إنشاء Mockups للمنتجات');
    console.log('  6. إدارة محتوى السوشيال ميديا');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 نظام العمولات');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('Media Buyer:');
    console.log('  • 5% عمولة أساسية من المبيعات');
    console.log('  • +1% بونص إذا ROAS > 4x');
    console.log('  • +500 ج إذا CPA < 100 ج');
    console.log('  • +2% على الحملات +10,000 ج');

    console.log('\nPlaymaker:');
    console.log('  • 5% عمولة أساسية من المبيعات');
    console.log('  • +1000 ج لكل محتوى +10K مشاهدة');
    console.log('  • +2% إذا معدل التحويل > 5%');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 الخطوات التالية');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('1. ✅ Media Buyer يدخل على: /marketing-staff');
    console.log('2. ✅ Playmaker يدخل على: /marketing-staff');
    console.log('3. ✅ المطور يدخل على: /admin/media-buyer');
    console.log('4. 📝 راجع الخطة الكاملة في: MARKETING_ACTIVATION_PLAN.md');
    console.log('5. 🎓 ابدأ التدريب حسب الخطة');
    console.log('6. 🚀 أطلق الحملات!\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
