import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCapital() {
  try {
    // البحث عن حساب البائع
    const vendor = await prisma.vendor.findFirst({
      select: {
        id: true,
        capitalBalance: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!vendor) {
      console.log('❌ لم يتم العثور على حساب بائع');
      return;
    }

    console.log('📊 معلومات الحساب الحالي:');
    console.log('   الاسم:', vendor.user.name);
    console.log('   البريد:', vendor.user.email);
    console.log('   رأس المال الحالي:', vendor.capitalBalance, 'جنيه');

    // التحقق من المنتجات الأوفلاين
    const offlineProducts = await prisma.offlineProduct.findMany({
      where: { vendorId: vendor.id },
    });

    const suppliers = await prisma.offlineSupplier.findMany({
      where: { vendorId: vendor.id },
    });

    console.log('\n📦 البيانات الحالية:');
    console.log('   عدد المنتجات:', offlineProducts.length);
    console.log('   عدد الموردين:', suppliers.length);

    // تعديل رأس المال إلى 7500
    const oldBalance = vendor.capitalBalance;
    const newBalance = 7500;

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendor.id },
      data: { capitalBalance: newBalance },
    });

    // تسجيل المعاملة
    await prisma.capitalTransaction.create({
      data: {
        vendorId: vendor.id,
        type: 'DEPOSIT',
        amount: newBalance - oldBalance,
        balanceBefore: oldBalance,
        balanceAfter: newBalance,
        description: `تعديل رأس المال إلى 7500 جنيه`,
        descriptionAr: `تعديل رأس المال إلى 7500 جنيه`,
      },
    });

    console.log('\n✅ تم تعديل رأس المال بنجاح!');
    console.log('   الرصيد السابق:', oldBalance, 'جنيه');
    console.log('   الرصيد الجديد:', newBalance, 'جنيه');
    console.log('   الفرق:', newBalance - oldBalance, 'جنيه');

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCapital();
