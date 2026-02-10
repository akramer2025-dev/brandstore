import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTolineTransactions() {
  console.log('🔍 فحص حساب تولين...\n');

  try {
    const user = await prisma.user.findUnique({
      where: { email: 'amalelsayed943@gmail.com' },
      include: {
        vendor: {
          include: {
            products: true,
            expenses: {
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    });

    if (!user) {
      console.log('❌ المستخدم غير موجود');
      return;
    }

    console.log(`👤 ${user.name}`);
    console.log(`📧 ${user.email}`);
    console.log(`🎭 الدور: ${user.role}`);
    console.log(`📅 تاريخ التسجيل: ${user.createdAt.toLocaleString('ar-EG')}\n`);

    if (user.vendor) {
      const { vendor } = user;
      console.log(`💼 بيانات الشريك:`);
      console.log(`   Vendor ID: ${vendor.id}`);
      console.log(`   💵 رأس المال الأولي: ${vendor.initialCapital} ج`);
      console.log(`   💰 رأس المال الحالي: ${vendor.capitalBalance} ج`);
      console.log(`   📉 المخصوم: ${(vendor.initialCapital - vendor.capitalBalance).toFixed(2)} ج\n`);

      console.log(`📦 المنتجات: ${vendor.products.length}`);
      if (vendor.products.length > 0) {
        vendor.products.forEach(p => {
          console.log(`   - ${p.name}`);
          console.log(`     السعر: ${p.price} ج | التكلفة: ${p.cost || 0} ج | المخزون: ${p.stock}`);
        });
      }
      console.log('');

      console.log(`💸 المعاملات (المصروفات): ${vendor.expenses.length}`);
      if (vendor.expenses.length > 0) {
        vendor.expenses.forEach(t => {
          console.log(`   💰 ${t.amount.toFixed(2)} ج - ${t.description}`);
          console.log(`      التاريخ: ${t.createdAt.toLocaleString('ar-EG')}`);
        });
      }
    } else {
      console.log('❌ لا يوجد حساب شريك');
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTolineTransactions();
