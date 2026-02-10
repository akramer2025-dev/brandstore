import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAmlAccount() {
  console.log('🔍 التحقق من حساب aml...\n');

  try {
    // البحث عن المستخدم
    const user = await prisma.user.findFirst({
      where: {
        email: 'amlelsayed@gmail.com'
      }
    });

    if (!user) {
      console.log('❌ لم يتم العثور على المستخدم بهذا البريد!');
      console.log('💡 جاري البحث بالاسم "aml"...\n');
      
      const userByName = await prisma.user.findFirst({
        where: {
          name: { contains: 'aml', mode: 'insensitive' }
        }
      });

      if (!userByName) {
        console.log('❌ لم يتم العثور على المستخدم!');
        return;
      }

      console.log('✅ تم العثور على المستخدم:');
      console.log(`   الاسم: ${userByName.name}`);
      console.log(`   البريد: ${userByName.email}`);
      console.log(`   User ID: ${userByName.id}\n`);
      
      await checkUserProducts(userByName.id, userByName.name);
    } else {
      console.log('✅ تم العثور على المستخدم:');
      console.log(`   الاسم: ${user.name}`);
      console.log(`   البريد: ${user.email}`);
      console.log(`   الدور: ${user.role}`);
      console.log(`   User ID: ${user.id}\n`);
      
      await checkUserProducts(user.id, user.name);
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function checkUserProducts(userId: string, userName: string) {
  // جلب vendor account
  const vendor = await prisma.vendor.findUnique({
    where: { userId }
  });

  if (!vendor) {
    console.log(`⚠️ ${userName} ليس لديه vendor account!`);
    return;
  }

  console.log('✅ Vendor Account موجود:');
  console.log(`   Vendor ID: ${vendor.id}`);
  console.log(`   رأس المال: ${vendor.capitalBalance?.toLocaleString() || 0} ج\n`);

  // جلب كل المنتجات (النشطة والمحذوفة)
  const allProducts = await prisma.product.findMany({
    where: { vendorId: vendor.id },
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  const activeProducts = allProducts.filter(p => p.isActive);
  const deletedProducts = allProducts.filter(p => !p.isActive);

  console.log(`📊 إحصائيات المنتجات:`);
  console.log(`   📦 إجمالي المنتجات: ${allProducts.length}`);
  console.log(`   ✅ المنتجات النشطة: ${activeProducts.length}`);
  console.log(`   ❌ المنتجات المحذوفة: ${deletedProducts.length}\n`);

  if (allProducts.length === 0) {
    console.log('⚠️ لا توجد أي منتجات لهذا الشريك (لم يتم إضافة أي منتجات من قبل)!\n');
  } else {
    if (activeProducts.length > 0) {
      console.log('✅ المنتجات النشطة:\n');
      activeProducts.forEach((p, i) => {
        console.log(`${i + 1}. ${p.nameAr || p.name}`);
        console.log(`   السعر: ${p.price} ج | المخزون: ${p.stock}`);
        console.log(`   تاريخ الإضافة: ${p.createdAt.toLocaleString('ar-EG')}\n`);
      });
    }

    if (deletedProducts.length > 0) {
      console.log('❌ المنتجات المحذوفة:\n');
      deletedProducts.forEach((p, i) => {
        console.log(`${i + 1}. ${p.nameAr || p.name}`);
        console.log(`   السعر: ${p.price} ج | المخزون: ${p.stock}`);
        console.log(`   تاريخ الحذف/التعطيل: ${p.updatedAt.toLocaleString('ar-EG')}\n`);
      });
    }
  }

  // التحقق من المعاملات
  const transactions = await prisma.capitalTransaction.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  if (transactions.length > 0) {
    console.log('💰 آخر 5 معاملات:\n');
    transactions.forEach((tx, i) => {
      console.log(`${i + 1}. ${tx.type}: ${tx.amount.toLocaleString()} ج`);
      console.log(`   ${tx.descriptionAr || tx.description}`);
      console.log(`   التاريخ: ${tx.createdAt.toLocaleString('ar-EG')}\n`);
    });
  } else {
    console.log('💰 لا توجد معاملات مالية\n');
  }
}

checkAmlAccount();
