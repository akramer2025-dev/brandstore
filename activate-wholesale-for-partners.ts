import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('👥 تفعيل صلاحية البيع بالجملة للشركاء...\n');

    // جلب جميع موظفي الشركاء
    const partnerStaff = await prisma.user.findMany({
      where: {
        partnerId: { not: null }, // المستخدمين المرتبطين بشركاء
      },
      include: {
        partner: {
          select: {
            partnerName: true,
            isActive: true,
          },
        },
      },
    });

    if (partnerStaff.length === 0) {
      console.log('⚠️ لا توجد حسابات شركاء في النظام!\n');
      console.log('💡 لإنشاء شريك جديد:');
      console.log('   1. افتح لوحة التحكم');
      console.log('   2. اذهب إلى "إدارة الشركاء"');
      console.log('   3. أضف شريك جديد\n');
      return;
    }

    console.log(`✅ تم العثور على ${partnerStaff.length} موظف شريك\n`);

    let updated = 0;

    for (const staff of partnerStaff) {
      // جلب الصلاحيات الحالية أو إنشاء جديدة
      const currentPermissions = (staff.partnerStaffPermissions as any) || {};

      // إضافة صلاحية البيع بالجملة
      const newPermissions = {
        ...currentPermissions,
        canSellWholesale: true, // صلاحية البيع بسعر الدستة
        wholesaleMinQuantity: 6, // الحد الأدنى للبيع بالجملة
      };

      await prisma.user.update({
        where: { id: staff.id },
        data: {
          partnerStaffPermissions: newPermissions,
        },
      });

      console.log(`✅ ${staff.name || staff.email}:`);
      console.log(`   الشريك: ${staff.partner?.partnerName}`);
      console.log(`   صلاحية البيع بالجملة: مفعّلة ✓`);
      console.log(`   الحد الأدنى: 6 قطع\n`);

      updated++;
    }

    console.log(`\n🎉 تم تفعيل صلاحية البيع بالجملة لـ ${updated} موظف شريك!`);

    // عرض ملخص الصلاحيات
    console.log('\n📋 ملخص نظام البيع بالجملة:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ العملاء العاديين:');
    console.log('   - يشترون بالسعر العادي (سعر القطعة)');
    console.log('   - يمكنهم شراء أي كمية\n');
    console.log('💼 موظفي الشركاء:');
    console.log('   - يشترون بسعر الجملة (خصم 20%)');
    console.log('   - الحد الأدنى: 6 قطع من كل منتج');
    console.log('   - الربح: 20% على كل عملية بيع\n');
    console.log('📊 مثال على الأسعار:');
    
    // جلب منتج عشوائي كمثال
    const sampleProduct = await prisma.product.findFirst({
      where: {
        price: { gt: 0 },
        wholesalePrice: { not: null },
      },
    });

    if (sampleProduct) {
      console.log(`   منتج: ${sampleProduct.nameAr || sampleProduct.name}`);
      console.log(`   سعر القطعة للعملاء: ${sampleProduct.price} جنيه`);
      console.log(`   سعر الجملة للشركاء: ${sampleProduct.wholesalePrice} جنيه`);
      console.log(`   الوفر للشريك: ${(sampleProduct.price - (sampleProduct.wholesalePrice || 0)).toFixed(2)} جنيه/قطعة`);
      console.log(`   ربح الشريك على 10 قطع: ${((sampleProduct.price - (sampleProduct.wholesalePrice || 0)) * 10).toFixed(2)} جنيه\n`);
    }

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
