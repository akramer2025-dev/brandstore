import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function explainCapitalSystem() {
  console.log('📊 ============================================');
  console.log('   شرح نظام رأس المال بالأمثلة الحقيقية');
  console.log('============================================\n');

  try {
    // 1. اختيار شريك للتوضيح
    const vendor = await prisma.vendor.findFirst({
      where: {
        products: {
          some: {}
        }
      },
      include: {
        user: true,
        products: {
          take: 3,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!vendor) {
      console.log('❌ لا يوجد شركاء للتوضيح');
      return;
    }

    console.log('👤 الشريك: ' + vendor.user.name);
    console.log('📧 الإيميل: ' + vendor.user.email);
    console.log('\n💰 رأس المال:');
    console.log(`   💵 رأس المال الأولي: ${vendor.initialCapital.toLocaleString()} ج (ثابت)`);
    console.log(`   💳 رأس المال الحالي: ${vendor.capitalBalance.toLocaleString()} ج (متغير)`);
    
    const spent = vendor.initialCapital - vendor.capitalBalance;
    const percentage = ((spent / vendor.initialCapital) * 100).toFixed(1);
    
    if (spent > 0) {
      console.log(`   📉 المصروف: ${spent.toLocaleString()} ج (${percentage}% من رأس المال)`);
    } else if (spent < 0) {
      console.log(`   📈 الربح المضاف: ${Math.abs(spent).toLocaleString()} ج`);
    }

    console.log('\n📦 المنتجات (آخر 3):');
    vendor.products.forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.nameAr}`);
      console.log(`   💵 سعر البيع: ${p.price.toLocaleString()} ج`);
      console.log(`   💰 تكلفة الشراء: ${p.productionCost?.toLocaleString() || 0} ج`);
      console.log(`   📊 المخزون: ${p.stock} قطعة`);
      console.log(`   🏷️ نوع المنتج: ${p.productSource === 'OWNED' ? 'مملوك 🏪' : 'وسيط 🤝'}`);
      
      if (p.productSource === 'OWNED' && p.productionCost) {
        const totalCost = p.productionCost * p.stock;
        const potentialProfit = (p.price - p.productionCost) * p.stock;
        console.log(`   💸 إجمالي التكلفة: ${totalCost.toLocaleString()} ج`);
        console.log(`   💎 الربح المتوقع: ${potentialProfit.toLocaleString()} ج`);
      }
    });

    // 2. شرح كيف يعمل النظام
    console.log('\n\n🔄 ============================================');
    console.log('   كيف يعمل النظام؟');
    console.log('============================================\n');

    console.log('✅ عند إضافة منتج OWNED (مملوك):');
    console.log('   1️⃣ الشريك يدخل: الاسم، السعر، الكمية، تكلفة الشراء');
    console.log('   2️⃣ النظام يحسب: التكلفة الإجمالية = تكلفة الشراء × الكمية');
    console.log('   3️⃣ يتحقق من رأس المال:');
    console.log('      ✅ لو كافي → يخصم من capitalBalance');
    console.log('      ⚠️ لو مش كافي → يضيف المنتج بدون خصم (مع تحذير)');
    console.log('   4️⃣ يسجل المعاملة في CapitalTransaction بنوع PURCHASE');

    console.log('\n✅ عند إضافة منتج CONSIGNMENT (وسيط):');
    console.log('   1️⃣ الشريك يدخل: الاسم، السعر، الكمية، تكلفة المورد');
    console.log('   2️⃣ ❌ لا يتم الخصم من رأس المال!');
    console.log('   3️⃣ عند البيع: الربح = سعر البيع - تكلفة المورد');
    console.log('   4️⃣ الربح يضاف على capitalBalance');

    console.log('\n💸 عند بيع منتج:');
    console.log('   1️⃣ النظام يحسب الربح = سعر البيع - تكلفة الشراء');
    console.log('   2️⃣ يضيف الربح على capitalBalance');
    console.log('   3️⃣ يسجل في CapitalTransaction بنوع SALE_PROFIT');

    // 3. مثال حسابي
    console.log('\n\n💡 ============================================');
    console.log('   مثال حسابي مبسط');
    console.log('============================================\n');

    const exampleCapital = 7500;
    console.log(`رأس المال الأولي: ${exampleCapital.toLocaleString()} ج\n`);

    // خطوة 1
    const purchase1Qty = 10;
    const purchase1Cost = 100;
    const purchase1Total = purchase1Qty * purchase1Cost;
    const balance1 = exampleCapital - purchase1Total;
    
    console.log('1️⃣ شراء بضاعة OWNED:');
    console.log(`   - شراء ${purchase1Qty} قطع × ${purchase1Cost} ج = ${purchase1Total} ج`);
    console.log(`   - رأس المال بعد الشراء: ${balance1.toLocaleString()} ج`);

    // خطوة 2
    const sale1Qty = 5;
    const sale1Price = 180;
    const sale1Revenue = sale1Qty * sale1Price;
    const sale1Cost = sale1Qty * purchase1Cost;
    const sale1Profit = sale1Revenue - sale1Cost;
    const balance2 = balance1 + sale1Profit;

    console.log(`\n2️⃣ بيع ${sale1Qty} قطع:`);
    console.log(`   - سعر البيع: ${sale1Qty} × ${sale1Price} ج = ${sale1Revenue} ج`);
    console.log(`   - التكلفة: ${sale1Qty} × ${purchase1Cost} ج = ${sale1Cost} ج`);
    console.log(`   - الربح: ${sale1Profit} ج`);
    console.log(`   - رأس المال بعد البيع: ${balance2.toLocaleString()} ج`);

    // خطوة 3
    const expense1 = 100;
    const balance3 = balance2 - expense1;

    console.log(`\n3️⃣ مصروفات (شحن، تغليف):`);
    console.log(`   - مصروف: ${expense1} ج`);
    console.log(`   - رأس المال بعد المصروفات: ${balance3.toLocaleString()} ج`);

    // خطوة 4
    const consignment1Qty = 5;
    const consignment1Cost = 150;

    console.log(`\n4️⃣ إضافة منتج CONSIGNMENT (وسيط):`);
    console.log(`   - ${consignment1Qty} قطع من مورد ب ${consignment1Cost} ج للقطعة`);
    console.log(`   - ❌ لا يتم الخصم من رأس المال!`);
    console.log(`   - رأس المال: ${balance3.toLocaleString()} ج (كما هو)`);

    // خطوة 5
    const consignmentSaleQty = 3;
    const consignmentSalePrice = 250;
    const consignmentRevenue = consignmentSaleQty * consignmentSalePrice;
    const consignmentCost = consignmentSaleQty * consignment1Cost;
    const consignmentProfit = consignmentRevenue - consignmentCost;
    const balance4 = balance3 + consignmentProfit;

    console.log(`\n5️⃣ بيع ${consignmentSaleQty} قطع من الوسيط:`);
    console.log(`   - سعر البيع: ${consignmentSaleQty} × ${consignmentSalePrice} ج = ${consignmentRevenue} ج`);
    console.log(`   - تكلفة المورد: ${consignmentSaleQty} × ${consignment1Cost} ج = ${consignmentCost} ج`);
    console.log(`   - عمولة الشريك: ${consignmentProfit} ج`);
    console.log(`   - رأس المال بعد البيع: ${balance4.toLocaleString()} ج`);

    // النتيجة النهائية
    const totalChange = balance4 - exampleCapital;
    console.log(`\n📊 النتيجة النهائية:`);
    console.log(`   💵 رأس المال الأولي: ${exampleCapital.toLocaleString()} ج`);
    console.log(`   💳 رأس المال الحالي: ${balance4.toLocaleString()} ج`);
    if (totalChange > 0) {
      console.log(`   📈 الربح: +${totalChange.toLocaleString()} ج ✅`);
    } else if (totalChange < 0) {
      console.log(`   📉 الخسارة: ${totalChange.toLocaleString()} ج ⚠️`);
    } else {
      console.log(`   ➡️ لا تغيير`);
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

explainCapitalSystem();
