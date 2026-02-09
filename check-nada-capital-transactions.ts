import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNadaCapitalTransactions() {
  try {
    console.log('\n💰 فحص معاملات رأس المال لندى\n');

    // البحث عن ندى
    const nadaUser = await prisma.user.findUnique({
      where: { email: 'nada@gmail.com' },
      include: {
        vendor: {
          select: {
            id: true,
            storeName: true,
            initialCapital: true,
            capitalBalance: true,
          }
        }
      }
    });

    if (!nadaUser?.vendor) {
      console.log('❌ لم يتم العثور على حساب ندى');
      return;
    }

    const vendor = nadaUser.vendor;
    
    console.log('✅ بيانات ندى:');
    console.log(`   👤 الاسم: ${nadaUser.name}`);
    console.log(`   🏪 المتجر: ${vendor.storeName}`);
    console.log(`   💵 رأس المال الأولي: ${vendor.initialCapital} ج`);
    console.log(`   💰 رأس المال الحالي: ${vendor.capitalBalance} ج`);
    console.log(`   📉 الفرق (المخصوم): ${(vendor.initialCapital - vendor.capitalBalance).toFixed(2)} ج\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1. فحص CapitalTransaction
    const capitalTransactions = await prisma.capitalTransaction.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        type: true,
        amount: true,
        balanceBefore: true,
        balanceAfter: true,
        description: true,
        createdAt: true,
      }
    });

    console.log(`📋 معاملات رأس المال (CapitalTransaction): ${capitalTransactions.length}\n`);
    
    if (capitalTransactions.length > 0) {
      capitalTransactions.forEach((t, index) => {
        console.log(`${index + 1}. ${t.type}`);
        console.log(`   💵 المبلغ: ${t.amount} ج`);
        console.log(`   📊 الرصيد قبل: ${t.balanceBefore} ج`);
        console.log(`   📊 الرصيد بعد: ${t.balanceAfter} ج`);
        console.log(`   📝 الوصف: ${t.description || 'لا يوجد'}`);
        console.log(`   📅 التاريخ: ${new Date(t.createdAt).toLocaleString('ar-EG')}`);
        console.log('');
      });
    } else {
      console.log('   ℹ️  لا توجد معاملات\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 2. فحص VendorExpense
    const expenses = await prisma.vendorExpense.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        createdAt: true,
      }
    });

    console.log(`💸 مصاريف المتجر (VendorExpense): ${expenses.length}\n`);
    
    if (expenses.length > 0) {
      let totalExpenses = 0;
      expenses.forEach((e, index) => {
        totalExpenses += e.amount;
        console.log(`${index + 1}. ${e.type}`);
        console.log(`   💵 المبلغ: ${e.amount} ج`);
        console.log(`   📝 الوصف: ${e.description || 'لا يوجد'}`);
        console.log(`   📅 التاريخ: ${new Date(e.createdAt).toLocaleString('ar-EG')}`);
        console.log('');
      });
      console.log(`   📊 إجمالي المصاريف: ${totalExpenses} ج\n`);
    } else {
      console.log('   ℹ️  لا توجد مصاريف\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 3. فحص OfflineProduct
    const offlineProducts = await prisma.offlineProduct.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        productName: true,
        description: true,
        purchasePrice: true,
        quantity: true,
        soldQuantity: true,
        offlineSupplier: {
          select: {
            name: true,
          }
        },
        createdAt: true,
      }
    });

    console.log(`📦 البضاعة خارج النظام (للوسطاء): ${offlineProducts.length}\n`);
    
    if (offlineProducts.length > 0) {
      let totalOfflineCost = 0;
      offlineProducts.forEach((p, index) => {
        const cost = p.purchasePrice * p.quantity;
        totalOfflineCost += cost;
        console.log(`${index + 1}. ${p.productName || p.description}`);
        console.log(`   👤 الوسيط: ${p.offlineSupplier?.name || 'غير محدد'}`);
        console.log(`   💵 سعر الشراء: ${p.purchasePrice} ج`);
        console.log(`   📦 الكمية: ${p.quantity} قطعة`);
        console.log(`   🔢 مباع: ${p.soldQuantity} قطعة`);
        console.log(`   💰 التكلفة الإجمالية: ${cost} ج`);
        console.log(`   📅 التاريخ: ${new Date(p.createdAt).toLocaleString('ar-EG')}`);
        console.log('');
      });
      console.log(`   📊 إجمالي تكلفة البضاعة للوسطاء: ${totalOfflineCost} ج\n`);
    } else {
      console.log('   ℹ️  لا توجد بضاعة للوسطاء\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 4. فحص المنتجات المملوكة
    const ownedProducts = await prisma.product.findMany({
      where: {
        vendorId: vendor.id,
        productSource: 'OWNED',
        isActive: true,
      },
      select: {
        id: true,
        nameAr: true,
        name: true,
        supplierCost: true,
        productionCost: true,
        stock: true,
        createdAt: true,
      }
    });

    console.log(`🛍️ المنتجات المملوكة (في المتجر): ${ownedProducts.length}\n`);
    
    if (ownedProducts.length > 0) {
      let totalOwnedCost = 0;
      ownedProducts.forEach((p, index) => {
        const cost = (p.supplierCost || p.productionCost || 0) * p.stock;
        totalOwnedCost += cost;
        console.log(`${index + 1}. ${p.nameAr || p.name}`);
        console.log(`   💵 تكلفة القطعة: ${p.supplierCost || p.productionCost || 0} ج`);
        console.log(`   📦 المخزون: ${p.stock} قطعة`);
        console.log(`   💰 التكلفة الإجمالية: ${cost} ج`);
        console.log(`   📅 التاريخ: ${new Date(p.createdAt).toLocaleString('ar-EG')}`);
        console.log('');
      });
      console.log(`   📊 إجمالي تكلفة المنتجات المملوكة: ${totalOwnedCost} ج\n`);
    } else {
      console.log('   ℹ️  لا توجد منتجات مملوكة\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 5. ملخص نهائي
    const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalOfflineCost = offlineProducts.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0);
    const totalOwnedCost = ownedProducts.reduce((sum, p) => sum + ((p.supplierCost || p.productionCost || 0) * p.stock), 0);

    console.log('📊 الملخص النهائي:\n');
    console.log(`   💵 رأس المال الأولي: ${vendor.initialCapital} ج`);
    console.log(`   💸 المصاريف: -${totalExpensesAmount} ج`);
    console.log(`   📦 البضاعة للوسطاء: -${totalOfflineCost} ج`);
    console.log(`   🛍️  المنتجات المملوكة: -${totalOwnedCost} ج`);
    console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`   💰 المتوقع: ${(vendor.initialCapital - totalExpensesAmount - totalOfflineCost - totalOwnedCost).toFixed(2)} ج`);
    console.log(`   💰 الفعلي (من DB): ${vendor.capitalBalance} ج`);
    console.log(`   ❗ الفرق: ${((vendor.initialCapital - totalExpensesAmount - totalOfflineCost - totalOwnedCost) - vendor.capitalBalance).toFixed(2)} ج`);
    console.log('');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNadaCapitalTransactions();
