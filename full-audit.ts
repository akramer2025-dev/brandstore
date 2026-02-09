import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fullAudit() {
  try {
    console.log('\n📊 تدقيق شامل لحساب ندى\n');
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
    const vendorId = vendor.id;

    console.log('┌─ 📋 بيانات الحساب ─────────────────────────────────┐');
    console.log(`│ الاسم: ${nadaUser.name || 'غير محدد'}`);
    console.log(`│ البريد: ${nadaUser.email}`);
    console.log(`│ المتجر: ${vendor.storeName || 'غير محدد'}`);
    console.log(`│ 💰 رأس المال الأولي: ${vendor.initialCapital} ج`);
    console.log(`│ 💵 رأس المال الحالي: ${vendor.capitalBalance} ج`);
    console.log('└──────────────────────────────────────────────────────┘\n');

    // 1. المنتجات المملوكة (OWNED)
    const ownedProducts = await prisma.product.findMany({
      where: {
        vendorId: vendorId,
        productSource: 'OWNED',
      },
      select: {
        id: true,
        nameAr: true,
        supplierCost: true,
        productionCost: true,
        stock: true,
        price: true,
        soldCount: true,
      }
    });

    console.log('┌─ 📦 بضاعة مملوكة (OWNED) ───────────────────────────┐\n');
    let ownedStockValue = 0;
    let ownedSoldValue = 0;

    if (ownedProducts.length > 0) {
      ownedProducts.forEach((p, index) => {
        const cost = p.supplierCost || p.productionCost || 0;
        const stockValue = cost * (p.stock || 0);
        const soldValue = cost * (p.soldCount || 0);
        ownedStockValue += stockValue;
        ownedSoldValue += soldValue;

        console.log(`${index + 1}. ${p.nameAr}`);
        console.log(`   💵 التكلفة: ${cost} ج/قطعة`);
        console.log(`   📦 المخزون: ${p.stock || 0} قطعة = ${stockValue.toFixed(2)} ج`);
        console.log(`   ✅ المباع: ${p.soldCount || 0} قطعة = ${soldValue.toFixed(2)} ج\n`);
      });
    } else {
      console.log('   ℹ️  لا توجد بضاعة مملوكة\n');
    }

    console.log('├──────────────────────────────────────────────────────┤');
    console.log(`│ 💼 إجمالي قيمة المخزون: ${ownedStockValue.toFixed(2)} ج`);
    console.log(`│ 📊 إجمالي قيمة المباع: ${ownedSoldValue.toFixed(2)} ج`);
    console.log('└──────────────────────────────────────────────────────┘\n');

    // 2. بضاعة الوسطاء (CONSIGNMENT)
    const consignmentProducts = await prisma.product.findMany({
      where: {
        vendorId: vendorId,
        productSource: 'CONSIGNMENT',
      },
      select: {
        id: true,
        nameAr: true,
        supplierName: true,
        supplierCost: true,
        stock: true,
        price: true,
        soldCount: true,
      }
    });

    console.log('┌─ 🤝 بضاعة للوسطاء (CONSIGNMENT) ───────────────────┐\n');
    let consignmentStockValue = 0;
    let consignmentSoldValue = 0;

    if (consignmentProducts.length > 0) {
      consignmentProducts.forEach((p, index) => {
        const cost = p.supplierCost || 0;
        const stockValue = cost * (p.stock || 0);
        const soldValue = cost * (p.soldCount || 0);
        consignmentStockValue += stockValue;
        consignmentSoldValue += soldValue;

        console.log(`${index + 1}. ${p.nameAr}`);
        console.log(`   👤 المورد: ${p.supplierName || 'غير محدد'}`);
        console.log(`   💵 مستحقات المورد: ${cost} ج/قطعة`);
        console.log(`   📦 المخزون: ${p.stock || 0} قطعة = ${stockValue.toFixed(2)} ج`);
        console.log(`   ✅ المباع: ${p.soldCount || 0} قطعة = ${soldValue.toFixed(2)} ج\n`);
      });
    } else {
      console.log('   ℹ️  لا توجد بضاعة للوسطاء\n');
    }

    console.log('├──────────────────────────────────────────────────────┤');
    console.log(`│ 💼 إجمالي قيمة المخزون: ${consignmentStockValue.toFixed(2)} ج`);
    console.log(`│ 📊 إجمالي قيمة المباع (معلق): ${consignmentSoldValue.toFixed(2)} ج`);
    console.log('└──────────────────────────────────────────────────────┘\n');

    // 3. الحساب المتوقع
    console.log('┌─ 🧮 الحساب المتوقع ────────────────────────────────┐\n');
    
    const initialCapital = vendor.initialCapital!;
    console.log(`   رأس المال الأولي:          ${initialCapital.toFixed(2)} ج`);
    console.log(`   - بضاعة مملوكة (مخزون):    ${ownedStockValue.toFixed(2)} ج`);
    console.log(`   - بضاعة للوسطاء (مخزون):   ${consignmentStockValue.toFixed(2)} ج`);
    console.log(`   - مبيعات وسطاء (معلقة):    ${consignmentSoldValue.toFixed(2)} ج`);
    console.log(`   ─────────────────────────────────────`);
    
    const expectedCapital = initialCapital - ownedStockValue - consignmentStockValue - consignmentSoldValue + ownedSoldValue;
    console.log(`   = المتوقع (بدون أرباح):    ${(initialCapital - ownedStockValue - consignmentStockValue - consignmentSoldValue).toFixed(2)} ج`);
    
    console.log('\n   📝 ملاحظة: المبيعات المملوكة');
    console.log(`   + تكلفة البضاعة المباعة:   ${ownedSoldValue.toFixed(2)} ج`);
    console.log(`   (لأننا سددنا التكلفة عند الشراء)\n`);

    console.log('└──────────────────────────────────────────────────────┘\n');

    // 4. معاملات SALE_PROFIT الخاطئة
    const wrongSaleProfits = await prisma.capitalTransaction.findMany({
      where: {
        vendorId: vendorId,
        type: 'SALE_PROFIT',
        descriptionAr: {
          contains: 'بيع بضاعة خارج النظام'
        }
      }
    });

    const wrongProfitAmount = wrongSaleProfits.reduce((sum, t) => sum + t.amount, 0);

    console.log('┌─ ⚠️ المشكلة: معاملات خاطئة ───────────────────────┐\n');
    console.log(`   عدد معاملات SALE_PROFIT الخاطئة: ${wrongSaleProfits.length}`);
    console.log(`   إجمالي الزيادة الخاطئة:       ${wrongProfitAmount.toFixed(2)} ج\n`);
    console.log('   ❌ القديم: البيع خارج النظام كان يضيف profit');
    console.log('   ✅ الجديد: البيع خارج النظام لا يعدل رأس المال\n');
    console.log('└──────────────────────────────────────────────────────┘\n');

    // 5. المقارنة النهائية
    console.log('┌─ 📊 المقارنة النهائية ─────────────────────────────┐\n');
    const currentCapital = vendor.capitalBalance!;
    const correctedCapital = currentCapital - wrongProfitAmount;
    
    console.log(`   💰 رأس المال الحالي (في DB):     ${currentCapital.toFixed(2)} ج`);
    console.log(`   - الأرباح الخاطئة:                ${wrongProfitAmount.toFixed(2)} ج`);
    console.log(`   ─────────────────────────────────────`);
    console.log(`   = رأس المال المصحح:              ${correctedCapital.toFixed(2)} ج\n`);
    
    const theoreticalCapital = initialCapital - ownedStockValue - consignmentStockValue - consignmentSoldValue;
    console.log(`   🧮 رأس المال المتوقع نظرياً:     ${theoreticalCapital.toFixed(2)} ج`);
    console.log(`   (رأس المال الأولي - البضاعة المربوطة)\n`);
    
    const difference = correctedCapital - theoreticalCapital;
    console.log(`   📉 الفرق:                          ${difference.toFixed(2)} ج`);
    
    if (Math.abs(difference) < 0.01) {
      console.log(`   ✅ الحساب متطابق!\n`);
    } else if (difference > 0) {
      console.log(`   ℹ️  رأس المال أعلى من المتوقع بسبب:`);
      console.log(`      - أرباح من بيع البضاعة المملوكة`);
      console.log(`      - أو إيداعات إضافية\n`);
    } else {
      console.log(`   ⚠️  رأس المال أقل من المتوقع!\n`);
    }
    
    console.log('└──────────────────────────────────────────────────────┘\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fullAudit();
