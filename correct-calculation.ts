import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function correctCalculation() {
  try {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('        💰 الحساب الصحيح لرأس المال - ندى');
    console.log('═══════════════════════════════════════════════════════\n');

    const nadaUser = await prisma.user.findUnique({
      where: { email: 'nada@gmail.com' },
      include: {
        vendor: {
          select: {
            id: true,
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

    const vendorId = nadaUser.vendor.id;
    const initialCapital = nadaUser.vendor.initialCapital!;
    const currentCapital = nadaUser.vendor.capitalBalance!;

    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│              📊 رأس المال الحالي                   │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log(`│ 💵 رأس المال الأولي:         ${initialCapital.toFixed(2)} ج        │`);
    console.log(`│ 💰 رأس المال الحالي (DB):    ${currentCapital.toFixed(2)} ج        │`);
    console.log('└─────────────────────────────────────────────────────┘\n');

    // 1. البضاعة المملوكة (OWNED) فقط - هذه تخصم من رأس المال
    const ownedProducts = await prisma.product.findMany({
      where: { vendorId, productSource: 'OWNED' },
      select: {
        id: true,
        nameAr: true,
        supplierCost: true,
        productionCost: true,
        stock: true,
        soldCount: true,
      }
    });

    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│         💼 بضاعة مملوكة (OWNED) - مدفوعة          │');
    console.log('├─────────────────────────────────────────────────────┤\n');

    let ownedStockValue = 0;

    if (ownedProducts.length > 0) {
      ownedProducts.forEach((p, index) => {
        const cost = p.supplierCost || p.productionCost || 0;
        const stockValue = cost * (p.stock || 0);
        ownedStockValue += stockValue;

        console.log(`${index + 1}. ${p.nameAr}`);
        console.log(`   💵 التكلفة: ${cost} ج/قطعة`);
        console.log(`   📦 المخزون: ${p.stock || 0} قطعة`);
        console.log(`   💰 القيمة: ${stockValue.toFixed(2)} ج\n`);
      });
    } else {
      console.log('   ℹ️  لا توجد بضاعة مملوكة\n');
    }

    console.log('├─────────────────────────────────────────────────────┤');
    console.log(`│ 💼 إجمالي البضاعة المملوكة:  ${ownedStockValue.toFixed(2)} ج        │`);
    console.log('└─────────────────────────────────────────────────────┘\n');

    // 2. بضاعة CONSIGNMENT - للمعلومات فقط (لا تخصم من رأس المال)
    const consignmentProducts = await prisma.product.findMany({
      where: { vendorId, productSource: 'CONSIGNMENT' },
      select: {
        id: true,
        nameAr: true,
        supplierName: true,
        supplierCost: true,
        stock: true,
        soldCount: true,
      }
    });

    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│    🤝 بضاعة من وسطاء (CONSIGNMENT) - صور فقط      │');
    console.log('│         (لا تخصم من رأس المال)                     │');
    console.log('├─────────────────────────────────────────────────────┤\n');

    let consignmentStockValue = 0;
    let consignmentSoldValue = 0;

    if (consignmentProducts.length > 0) {
      consignmentProducts.forEach((p, index) => {
        const cost = p.supplierCost || 0;
        const stockValue = cost * (p.stock || 0);
        const soldValue = cost * (p.soldCount || 0);
        consignmentStockValue += stockValue;
        consignmentSoldValue += soldValue;

        if (stockValue > 0 || soldValue > 0) {
          console.log(`${index + 1}. ${p.nameAr}`);
          console.log(`   👤 المورد: ${p.supplierName || 'غير محدد'}`);
          console.log(`   💵 سعر المورد: ${cost} ج/قطعة`);
          console.log(`   📦 المخزون: ${p.stock || 0} قطعة (قيمة: ${stockValue.toFixed(2)} ج)`);
          if (p.soldCount && p.soldCount > 0) {
            console.log(`   ✅ المباع: ${p.soldCount} قطعة (دين: ${soldValue.toFixed(2)} ج)`);
          }
          console.log('');
        }
      });
    } else {
      console.log('   ℹ️  لا توجد بضاعة من وسطاء\n');
    }

    console.log('├─────────────────────────────────────────────────────┤');
    console.log(`│ 📦 إجمالي المخزون:            ${consignmentStockValue.toFixed(2)} ج     │`);
    console.log(`│ 💸 إجمالي المباع (دين):       ${consignmentSoldValue.toFixed(2)} ج        │`);
    console.log('└─────────────────────────────────────────────────────┘\n');

    // 3. الحساب الصحيح
    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│              🧮 الحساب الصحيح                      │');
    console.log('├─────────────────────────────────────────────────────┤\n');
    
    console.log(`   💵 رأس المال الأولي:           ${initialCapital.toFixed(2)} ج`);
    console.log(`   - بضاعة مملوكة (مدفوعة):       ${ownedStockValue.toFixed(2)} ج`);
    console.log(`   ─────────────────────────────────────`);
    
    const expectedCapital = initialCapital - ownedStockValue;
    console.log(`   = رأس المال المتوقع:           ${expectedCapital.toFixed(2)} ج\n`);
    
    console.log(`   💰 رأس المال الفعلي (DB):      ${currentCapital.toFixed(2)} ج`);
    console.log(`   📊 الفرق:                       ${(currentCapital - expectedCapital).toFixed(2)} ج\n`);

    console.log('└─────────────────────────────────────────────────────┘\n');

    // 4. تحليل الفرق
    if (Math.abs(currentCapital - expectedCapital) > 0.01) {
      console.log('┌─────────────────────────────────────────────────────┐');
      console.log('│              🔍 تحليل الفرق                        │');
      console.log('├─────────────────────────────────────────────────────┤\n');

      // فحص المعاملات
      const allTransactions = await prisma.capitalTransaction.findMany({
        where: { vendorId },
        orderBy: { createdAt: 'asc' },
        select: {
          type: true,
          amount: true,
          descriptionAr: true,
          createdAt: true,
        }
      });

      const summary: Record<string, { count: number; total: number }> = {};
      allTransactions.forEach(t => {
        if (!summary[t.type]) {
          summary[t.type] = { count: 0, total: 0 };
        }
        summary[t.type].count++;
        summary[t.type].total += t.amount;
      });

      console.log('   📜 ملخص المعاملات:\n');
      Object.entries(summary).forEach(([type, data]) => {
        const sign = ['PURCHASE', 'WITHDRAWAL', 'PAYMENT_TO_SUPPLIER'].includes(type) ? '-' : '+';
        console.log(`      ${type}: ${data.count} معاملة، ${sign}${Math.abs(data.total).toFixed(2)} ج`);
      });

      console.log('\n   💡 الأسباب المحتملة للفرق:\n');
      
      if (currentCapital > expectedCapital) {
        console.log('      ✅ رأس المال أعلى من المتوقع:');
        console.log('         • أرباح من مبيعات بضاعة مملوكة');
        console.log('         • إيداعات إضافية');
        console.log('         • سندات قبض من محلات خارجية\n');
      } else {
        console.log('      ⚠️  رأس المال أقل من المتوقع:');
        console.log('         • سحوبات أو مصاريف');
        console.log('         • مشتريات بضاعة مملوكة إضافية');
        console.log('         • معاملات قديمة لم يتم تسجيلها\n');
      }

      console.log('└─────────────────────────────────────────────────────┘\n');
    } else {
      console.log('✅ رأس المال متطابق مع الحساب المتوقع!\n');
    }

    // 5. الديون للموردين (CONSIGNMENT المباع)
    if (consignmentSoldValue > 0) {
      console.log('┌─────────────────────────────────────────────────────┐');
      console.log('│          💸 الديون المستحقة للموردين               │');
      console.log('├─────────────────────────────────────────────────────┤\n');

      const supplierPayments = await prisma.supplierPayment.findMany({
        where: { 
          vendorId,
          status: 'PENDING'
        },
        select: {
          supplierName: true,
          amount: true,
          dueDate: true,
        }
      });

      if (supplierPayments.length > 0) {
        const totalDue = supplierPayments.reduce((sum, p) => sum + p.amount, 0);
        
        supplierPayments.forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.supplierName}: ${p.amount} ج`);
          if (p.dueDate) {
            console.log(`      📅 الاستحقاق: ${new Date(p.dueDate).toLocaleDateString('ar-EG')}`);
          }
          console.log('');
        });

        console.log('├─────────────────────────────────────────────────────┤');
        console.log(`│ 💰 إجمالي الديون المعلقة:     ${totalDue.toFixed(2)} ج        │`);
        console.log('└─────────────────────────────────────────────────────┘\n');
      } else {
        console.log('   ℹ️  لا توجد ديون معلقة للموردين\n');
        console.log('└─────────────────────────────────────────────────────┘\n');
      }
    }

    // 6. الخلاصة النهائية
    console.log('═══════════════════════════════════════════════════════');
    console.log('                  ✅ الخلاصة');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('   📋 النظام الصحيح:\n');
    console.log('      1️⃣  بضاعة OWNED (مملوكة):');
    console.log('         • تخصم من رأس المال عند الشراء ✅');
    console.log('         • الربح يضاف عند البيع ✅\n');
    
    console.log('      2️⃣  بضاعة CONSIGNMENT (من موردين):');
    console.log('         • لا تخصم من رأس المال ❌');
    console.log('         • فقط صور معروضة');
    console.log('         • عند البيع → دين على ندى للمورد ✅\n');
    
    console.log('      3️⃣  محلات خارجية (Offline):');
    console.log('         • المحل يأخذ بضاعة مملوكة من ندى');
    console.log('         • البيع لا يعدل رأس المال ❌');
    console.log('         • سند القبض فقط يعدل رأس المال ✅\n');

    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

correctCalculation();
