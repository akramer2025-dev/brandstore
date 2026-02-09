import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCapitalFlow() {
  try {
    console.log('\n🧪 اختبار تدفق رأس المال - النظام المعدل\n');
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
    
    console.log('📊 البيانات الأولية:');
    console.log(`   💵 رأس المال الأولي: ${vendor.initialCapital} ج`);
    console.log(`   💰 رأس المال الحالي: ${vendor.capitalBalance} ج\n`);
    console.log('───────────────────────────────────────────────────────\n');

    // 1. حساب البضاعة المملوكة
    const ownedProducts = await prisma.product.findMany({
      where: {
        vendorId: vendor.id,
        productSource: 'OWNED',
        isActive: true,
      },
      select: {
        nameAr: true,
        supplierCost: true,
        productionCost: true,
        stock: true,
      }
    });

    let totalOwnedCost = 0;
    console.log('🛍️  المنتجات المملوكة في المتجر:');
    ownedProducts.forEach((p, index) => {
      const cost = (p.supplierCost || p.productionCost || 0) * p.stock;
      totalOwnedCost += cost;
      console.log(`   ${index + 1}. ${p.nameAr}: ${p.stock} قطعة × ${p.supplierCost || p.productionCost || 0} ج = ${cost} ج`);
    });
    console.log(`   📦 إجمالي تكلفة المنتجات المملوكة: ${totalOwnedCost.toFixed(0)} ج\n`);

    // 2. حساب البضاعة للوسطاء
    const offlineProducts = await prisma.offlineProduct.findMany({
      where: { vendorId: vendor.id },
      select: {
        productName: true,
        description: true,
        purchasePrice: true,
        quantity: true,
        soldQuantity: true,
        sellingPrice: true,
        supplier: {
          select: { name: true }
        }
      }
    });

    let totalOfflineCost = 0;
    let totalOfflineRevenue = 0;
    let totalOfflineSoldRevenue = 0;
    
    console.log('📦 البضاعة للوسطاء:');
    offlineProducts.forEach((p, index) => {
      const cost = p.purchasePrice * p.quantity;
      const revenue = p.sellingPrice * p.quantity;
      const soldRevenue = p.sellingPrice * p.soldQuantity;
      totalOfflineCost += cost;
      totalOfflineRevenue += revenue;
      totalOfflineSoldRevenue += soldRevenue;
      
      console.log(`   ${index + 1}. ${p.productName || p.description} (${p.supplier?.name || 'غير محدد'})`);
      console.log(`      التكلفة: ${cost} ج | مباع: ${soldRevenue} ج | متبقي: ${revenue - soldRevenue} ج`);
    });
    console.log(`   💰 إجمالي تكلفة بضاعة الوسطاء: ${totalOfflineCost.toFixed(0)} ج`);
    console.log(`   💵 إجمالي مبيعات الوسطاء (مسجلة): ${totalOfflineSoldRevenue.toFixed(0)} ج`);
    console.log(`   📊 المتوقع من الوسطاء: ${(totalOfflineRevenue - totalOfflineSoldRevenue).toFixed(0)} ج\n`);

    // 3. حساب سندات القبض والصرف
    const receipts = await prisma.offlineSupplierPayment.findMany({
      where: {
        vendorId: vendor.id,
        type: 'RECEIPT',
      },
      select: { amount: true }
    });

    const payments = await prisma.offlineSupplierPayment.findMany({
      where: {
        vendorId: vendor.id,
        type: 'PAYMENT',
      },
      select: { amount: true }
    });

    const totalReceipts = receipts.reduce((sum, r) => sum + r.amount, 0);
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

    console.log('📜 السندات:');
    console.log(`   ✅ سندات القبض (مستلم من الوسطاء): ${totalReceipts.toFixed(0)} ج`);
    console.log(`   ❌ سندات الصرف (مدفوع للوسطاء): ${totalPayments.toFixed(0)} ج\n`);

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('💡 حساب رأس المال المتوقع:\n');

    const step1 = vendor.initialCapital;
    console.log(`   1️⃣  رأس المال الأولي:          ${step1.toFixed(0)} ج`);
    
    const step2 = step1 - totalOwnedCost;
    console.log(`   2️⃣  بعد شراء منتجات مملوكة:    ${step2.toFixed(0)} ج  (خصم ${totalOwnedCost.toFixed(0)} ج)`);
    
    const step3 = step2 - totalOfflineCost;
    console.log(`   3️⃣  بعد شراء بضاعة للوسطاء:   ${step3.toFixed(0)} ج  (خصم ${totalOfflineCost.toFixed(0)} ج)`);
    
    const step4 = step3 + totalReceipts;
    console.log(`   4️⃣  بعد استلام من الوسطاء:    ${step4.toFixed(0)} ج  (إضافة ${totalReceipts.toFixed(0)} ج)`);
    
    const step5 = step4 - totalPayments;
    console.log(`   5️⃣  بعد الدفع للوسطاء:         ${step5.toFixed(0)} ج  (خصم ${totalPayments.toFixed(0)} ج)`);

    console.log(`\n   ✅ المتوقع:                     ${step5.toFixed(0)} ج`);
    console.log(`   💰 الفعلي (من DB):             ${vendor.capitalBalance.toFixed(0)} ج`);
    console.log(`   ${step5.toFixed(0) === vendor.capitalBalance.toFixed(0) ? '✅' : '❌'} الفرق:                       ${(step5 - vendor.capitalBalance).toFixed(0)} ج\n`);

    console.log('═══════════════════════════════════════════════════════\n');

    // 4. ملخص التحقق
    console.log('✅ التحقق من النظام:\n');
    console.log(`   ✓ المنتجات المملوكة: ${totalOwnedCost > 0 ? 'تخصم من رأس المال ✅' : 'لا توجد'}`);
    console.log(`   ✓ بضاعة الوسطاء: ${totalOfflineCost > 0 ? 'تخصم من رأس المال ✅' : 'لا توجد'}`);
    console.log(`   ✓ مبيعات الوسطاء: مسجلة فقط (${totalOfflineSoldRevenue.toFixed(0)} ج) - لا تزيد رأس المال ⏸️`);
    console.log(`   ✓ سندات القبض: ${totalReceipts > 0 ? `تزيد رأس المال (${totalReceipts.toFixed(0)} ج) ✅` : 'لا توجد'}`);
    console.log(`   ✓ سندات الصرف: ${totalPayments > 0 ? `تنقص رأس المال (${totalPayments.toFixed(0)} ج) ✅` : 'لا توجد'}`);

    console.log('\n═══════════════════════════════════════════════════════\n');

    // 5. حسابات مالية هامة
    console.log('📊 حسابات مالية هامة:\n');
    console.log(`   💰 رأس المال الحالي:           ${vendor.capitalBalance.toFixed(0)} ج`);
    console.log(`   📦 قيمة البضاعة المملوكة:      ${totalOwnedCost.toFixed(0)} ج`);
    console.log(`   📦 قيمة بضاعة الوسطاء:         ${(totalOfflineCost - totalOfflineSoldRevenue).toFixed(0)} ج  (متبقية)`);
    console.log(`   💵 مستحق من الوسطاء:           ${(totalOfflineSoldRevenue - totalReceipts).toFixed(0)} ج`);
    console.log(`   ───────────────────────────────────`);
    console.log(`   💎 إجمالي الأصول الحالية:     ${(vendor.capitalBalance + totalOwnedCost + (totalOfflineCost - totalOfflineSoldRevenue) + (totalOfflineSoldRevenue - totalReceipts)).toFixed(0)} ج\n`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCapitalFlow();
