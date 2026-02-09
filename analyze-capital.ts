import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeCapital() {
  try {
    console.log('\n💰 تحليل رأس المال - ندى\n');
    console.log('═══════════════════════════════════════════════════════\n');

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
    
    console.log('📊 رأس المال:');
    console.log(`   💵 الأولي: ${vendor.initialCapital} ج`);
    console.log(`   💰 الحالي: ${vendor.capitalBalance} ج`);
    console.log(`   📉 الفرق: ${(vendor.capitalBalance! - vendor.initialCapital!).toFixed(2)} ج\n`);
    console.log('───────────────────────────────────────────────────────\n');

    // جميع معاملات رأس المال
    const capitalTransactions = await prisma.capitalTransaction.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'asc' },
      select: {
        type: true,
        amount: true,
        balanceBefore: true,
        balanceAfter: true,
        descriptionAr: true,
        createdAt: true,
        referenceType: true,
        referenceId: true,
      }
    });

    console.log(`📜 جميع معاملات رأس المال (${capitalTransactions.length}):\n`);

    let expectedBalance = vendor.initialCapital!;

    capitalTransactions.forEach((t, index) => {
      const date = new Date(t.createdAt).toLocaleString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      console.log(`${index + 1}. [${date}]`);
      console.log(`   النوع: ${t.type}`);
      console.log(`   المبلغ: ${t.amount > 0 ? '+' : ''}${t.amount} ج`);
      console.log(`   الرصيد قبل: ${t.balanceBefore} ج`);
      console.log(`   الرصيد بعد: ${t.balanceAfter} ج`);
      
      // التحقق من صحة الحساب
      let calculatedBalance = t.balanceBefore!;
      if (t.type === 'PURCHASE' || t.type === 'PAYMENT_TO_SUPPLIER') {
        calculatedBalance -= Math.abs(t.amount);
      } else {
        calculatedBalance += Math.abs(t.amount);
      }
      
      if (Math.abs(calculatedBalance - t.balanceAfter!) > 0.01) {
        console.log(`   ⚠️  خطأ في الحساب! المتوقع: ${calculatedBalance.toFixed(2)} ج`);
      }
      
      console.log(`   الوصف: ${t.descriptionAr || 'لا يوجد'}`);
      if (t.referenceType && t.referenceId) {
        console.log(`   المرجع: ${t.referenceType} - ${t.referenceId}`);
      }
      console.log('');

      expectedBalance = t.balanceAfter!;
    });

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📊 ملخص المعاملات:\n');

    const summary = capitalTransactions.reduce((acc, t) => {
      if (!acc[t.type]) {
        acc[t.type] = { count: 0, total: 0 };
      }
      acc[t.type].count++;
      acc[t.type].total += t.amount;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    Object.entries(summary).forEach(([type, data]) => {
      console.log(`   ${type}: ${data.count} معاملة، إجمالي ${data.total > 0 ? '+' : ''}${data.total.toFixed(2)} ج`);
    });

    console.log('\n───────────────────────────────────────────────────────\n');

    // تحليل المنتجات
    const products = await prisma.product.findMany({
      where: { vendorId: vendor.id, deletedAt: null },
      select: {
        id: true,
        nameAr: true,
        productSource: true,
        supplierCost: true,
        productionCost: true,
        sellingPrice: true,
        quantity: true,
        soldQuantity: true,
      }
    });

    const ownedProducts = products.filter(p => p.productSource === 'OWNED');
    const consignmentProducts = products.filter(p => p.productSource === 'CONSIGNMENT');

    console.log('📦 المنتجات:\n');
    console.log(`   💼 مملوكة: ${ownedProducts.length} منتج`);
    const ownedValue = ownedProducts.reduce((sum, p) => {
      const cost = p.supplierCost || p.productionCost || 0;
      return sum + (cost * (p.quantity || 0));
    }, 0);
    console.log(`      قيمة المخزون: ${ownedValue.toFixed(2)} ج\n`);

    console.log(`   🤝 للوسطاء: ${consignmentProducts.length} منتج`);
    const consignmentValue = consignmentProducts.reduce((sum, p) => {
      const cost = p.supplierCost || 0;
      return sum + (cost * (p.quantity || 0));
    }, 0);
    console.log(`      قيمة المخزون: ${consignmentValue.toFixed(2)} ج`);
    
    const consignmentSold = consignmentProducts.reduce((sum, p) => {
      const cost = p.supplierCost || 0;
      return sum + (cost * (p.soldQuantity || 0));
    }, 0);
    console.log(`      مبيعات للوسطاء (بدون سند): ${consignmentSold.toFixed(2)} ج\n`);

    console.log('───────────────────────────────────────────────────────\n');
    console.log('🧮 الحساب المتوقع:\n');
    console.log(`   رأس المال الأولي:        ${vendor.initialCapital} ج`);
    console.log(`   - بضاعة مملوكة:          ${ownedValue.toFixed(2)} ج`);
    console.log(`   - بضاعة للوسطاء:         ${consignmentValue.toFixed(2)} ج`);
    console.log(`   - مبيعات وسطاء (معلقة):  ${consignmentSold.toFixed(2)} ج`);
    console.log(`   ─────────────────────────────`);
    const calculated = vendor.initialCapital! - ownedValue - consignmentValue - consignmentSold;
    console.log(`   = المتوقع:                ${calculated.toFixed(2)} ج`);
    console.log(`   = الفعلي:                 ${vendor.capitalBalance} ج`);
    console.log(`   📊 الفرق:                 ${(vendor.capitalBalance! - calculated).toFixed(2)} ج\n`);

    if (Math.abs(vendor.capitalBalance! - calculated) > 0.01) {
      console.log('⚠️  يوجد فرق! دعنا نحلل السبب...\n');
      
      // فحص سجلات المبيعات الغير مسجلة في CapitalTransaction
      const sales = await prisma.sale.findMany({
        where: { vendorId: vendor.id },
        select: {
          id: true,
          productNameAr: true,
          quantity: true,
          unitPrice: true,
          totalAmount: true,
          profit: true,
          paymentMethod: true,
          createdAt: true,
        }
      });

      const totalSalesProfit = sales.reduce((sum, s) => sum + (s.profit || 0), 0);
      console.log(`   💸 مجموع أرباح المبيعات المسجلة: ${totalSalesProfit.toFixed(2)} ج`);
      
      const saleProfitTransactions = capitalTransactions
        .filter(t => t.type === 'SALE_PROFIT' || t.type === 'CONSIGNMENT_PROFIT')
        .reduce((sum, t) => sum + t.amount, 0);
      console.log(`   📝 مجموع معاملات SALE_PROFIT: ${saleProfitTransactions.toFixed(2)} ج`);
      console.log(`   📊 الفرق في الأرباح: ${(totalSalesProfit - saleProfitTransactions).toFixed(2)} ج\n`);
    } else {
      console.log('✅ رأس المال متطابق مع الحساب المتوقع!\n');
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeCapital();
