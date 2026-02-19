import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('👥 إنشاء شريك تجريبي مع صلاحية البيع بالجملة...\n');

    // أولاً: نحتاج vendor (متجر)
    let vendor = await prisma.vendor.findFirst();

    if (!vendor) {
      console.log('📦 إنشاء متجر تجريبي...\n');
      vendor = await prisma.vendor.create({
        data: {
          name: 'متجر ريمو',
          description: 'متجر إلكتروني متكامل',
          domain: 'remostore.net',
          logo: '',
          primaryColor: '#6366f1',
          isActive: true,
        },
      });
      console.log(`✅ تم إنشاء المتجر: ${vendor.name}\n`);
    }

    // ثانياً: إنشاء PartnerCapital (رأس مال الشريك)
    let partner = await prisma.partnerCapital.findFirst({
      where: { vendorId: vendor.id },
    });

    if (!partner) {
      console.log('💰 إنشاء رأس مال شريك تجريبي...\n');
      partner = await prisma.partnerCapital.create({
        data: {
          vendorId: vendor.id,
          partnerName: 'أحمد محمود - شريك تجاري',
          partnerType: 'PARTNER',
          capitalAmount: 50000,
          initialAmount: 50000,
          currentAmount: 50000,
          capitalPercent: 30, // 30% من رأس المال
          isActive: true,
          notes: 'شريك تجاري - صلاحية البيع بالجملة',
        },
      });
      console.log(`✅ تم إنشاء الشريك: ${partner.partnerName}`);
      console.log(`   رأس المال: ${partner.capitalAmount} جنيه`);
      console.log(`   نسبة المساهمة: ${partner.capitalPercent}%\n`);
    }

    // ثالثاً: إنشاء حساب مستخدم للشريك
    const partnerEmail = 'partner@remostore.net';
    let partnerUser = await prisma.user.findUnique({
      where: { email: partnerEmail },
    });

    if (!partnerUser) {
      const hashedPassword = await bcrypt.hash('partner123', 10);
      
      partnerUser = await prisma.user.create({
        data: {
          email: partnerEmail,
          name: 'أحمد محمود',
          password: hashedPassword,
          role: 'CUSTOMER',
          partnerId: partner.id,
          partnerStaffPermissions: {
            canSellWholesale: true,
            wholesaleMinQuantity: 6,
            canViewReports: true,
            canManageInventory: false,
          },
        },
      });

      console.log('✅ تم إنشاء حساب الشريك:');
      console.log(`   البريد الإلكتروني: ${partnerEmail}`);
      console.log(`   كلمة المرور: partner123`);
      console.log(`   الصلاحيات:`);
      console.log(`   ✓ البيع بسعر الجملة (خصم 20%)`);
      console.log(`   ✓ الحد الأدنى: 6 قطع`);
      console.log(`   ✓ مشاهدة التقارير\n`);
    } else {
      // تحديث الصلاحيات للمستخدم الموجود
      await prisma.user.update({
        where: { id: partnerUser.id },
        data: {
          partnerId: partner.id,
          partnerStaffPermissions: {
            canSellWholesale: true,
            wholesaleMinQuantity: 6,
            canViewReports: true,
            canManageInventory: false,
          },
        },
      });
      console.log('✅ تم تحديث صلاحيات الشريك الموجود\n');
    }

    // عرض ملخص نظام البيع بالجملة
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 نظام البيع بالجملة - ملخص');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const totalProducts = await prisma.product.count({
      where: {
        wholesalePrice: { not: null },
      },
    });

    const avgDiscount = await prisma.product.aggregate({
      where: {
        wholesalePrice: { not: null },
        price: { gt: 0 },
      },
      _avg: {
        price: true,
        wholesalePrice: true,
      },
    });

    const avgPrice = avgDiscount._avg.price || 0;
    const avgWholesale = avgDiscount._avg.wholesalePrice || 0;
    const avgSavings = avgPrice - avgWholesale;
    const discountPercent = avgPrice > 0 ? ((avgSavings / avgPrice) * 100).toFixed(0) : 0;

    console.log(`📦 المنتجات المتاحة للبيع بالجملة: ${totalProducts} منتج`);
    console.log(`💰 متوسط السعر العادي: ${avgPrice.toFixed(2)} جنيه`);
    console.log(`💵 متوسط سعر الجملة: ${avgWholesale.toFixed(2)} جنيه`);
    console.log(`💎 متوسط الخصم: ${discountPercent}% (${avgSavings.toFixed(2)} جنيه)\n`);

    // مثال على منتجات
    const sampleProducts = await prisma.product.findMany({
      where: {
        price: { gt: 0 },
        wholesalePrice: { not: null },
      },
      select: {
        nameAr: true,
        name: true,
        price: true,
        wholesalePrice: true,
      },
      take: 5,
    });

    console.log('📝 أمثلة على المنتجات:\n');
    sampleProducts.forEach((product, index) => {
      const savings = product.price - (product.wholesalePrice || 0);
      const profit = savings * 10; // ربح على 10 قطع
      console.log(`${index + 1}. ${product.nameAr || product.name}`);
      console.log(`   سعر القطعة: ${product.price} جنيه`);
      console.log(`   سعر الجملة: ${product.wholesalePrice} جنيه`);
      console.log(`   ربحك على 10 قطع: ${profit.toFixed(2)} جنيه\n`);
    });

    console.log('\n💡 كيفية الاستخدام:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('1️⃣  سجل الدخول بحساب الشريك:');
    console.log(`   📧 ${partnerEmail}`);
    console.log(`   🔐 partner123\n`);
    console.log('2️⃣  اختر المنتجات المطلوبة');
    console.log('3️⃣  اطلب 6 قطع أو أكثر من كل منتج');
    console.log('4️⃣  ستحصل تلقائياً على سعر الجملة');
    console.log('5️⃣  بيع المنتجات بالسعر العادي');
    console.log('6️⃣  احصل على الربح (الفرق بين السعرين)\n');

    console.log('🎉 النظام جاهز للعمل!\n');

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
