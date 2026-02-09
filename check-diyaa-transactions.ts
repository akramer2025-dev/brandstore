import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDiyaaTransactions() {
  try {
    // جلب بيانات ندى
    const nada = await prisma.vendor.findFirst({
      where: {
        user: { email: 'nada@gmail.com' }
      }
    });

    if (!nada) {
      console.log('❌ حساب غير موجود');
      return;
    }

    // جلب مكتبة ضياء
    const diyaa = await prisma.offlineSupplier.findFirst({
      where: {
        vendorId: nada.id,
        name: { contains: 'ضياء' }
      }
    });

    if (!diyaa) {
      console.log('❌ مكتبة ضياء غير موجودة');
      return;
    }

    console.log('🏪 مكتبة ضياء');
    console.log('═══════════════════════════════════════════════════════\n');

    // جلب كل البضاعة الخاصة بضياء
    const products = await prisma.offlineProduct.findMany({
      where: {
        vendorId: nada.id,
        supplierId: diyaa.id
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log('📦 البضاعة المشتراة:\n');
    let totalPurchased = 0;
    let totalStock = 0;
    let totalSold = 0;

    products.forEach((p, i) => {
      const remaining = p.quantity - p.soldQuantity;
      const purchaseCost = p.purchasePrice * p.quantity;
      const stockCost = p.purchasePrice * remaining;
      const soldCost = p.purchasePrice * p.soldQuantity;

      totalPurchased += purchaseCost;
      totalStock += stockCost;
      totalSold += soldCost;

      console.log(`${i + 1}. ${p.productName || 'بدون اسم'}`);
      console.log(`   📅 تاريخ الشراء: ${p.createdAt.toLocaleDateString('ar-EG')}`);
      console.log(`   💵 سعر الشراء: ${p.purchasePrice} ج للقطعة`);
      console.log(`   📊 الكمية: ${p.quantity} قطعة`);
      console.log(`   💰 تكلفة الشراء الكلية: ${purchaseCost} ج`);
      console.log(`   ✅ مباع: ${p.soldQuantity} قطعة (${soldCost} ج)`);
      console.log(`   📦 متبقي: ${remaining} قطعة (${stockCost} ج)`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 الملخص:\n');
    console.log(`💰 إجمالي المشتريات: ${totalPurchased.toFixed(2)} ج`);
    console.log(`✅ مباع (معلق): ${totalSold.toFixed(2)} ج`);
    console.log(`📦 متبقي (مخزن): ${totalStock.toFixed(2)} ج`);
    console.log('');

    // جلب الدفعات للمورد
    const payments = await prisma.offlineSupplierPayment.findMany({
      where: {
        vendorId: nada.id,
        supplierId: diyaa.id
      },
      orderBy: { createdAt: 'asc' }
    });

    if (payments.length > 0) {
      console.log('═══════════════════════════════════════════════════════');
      console.log('💸 الدفعات المدفوعة:\n');
      
      let totalPaid = 0;
      payments.forEach((pay, i) => {
        totalPaid += pay.amount;
        console.log(`${i + 1}. مبلغ: ${pay.amount} ج`);
        console.log(`   📅 تاريخ: ${pay.createdAt.toLocaleDateString('ar-EG')}`);
        console.log(`   📝 نوع: ${pay.paymentType === 'CASH' ? 'كاش' : pay.paymentType}`);
        if (pay.receiptNumber) console.log(`   📄 سند رقم: ${pay.receiptNumber}`);
        if (pay.notes) console.log(`   📌 ملاحظات: ${pay.notes}`);
        console.log('');
      });
      
      console.log(`💸 إجمالي المدفوع: ${totalPaid.toFixed(2)} ج`);
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('🧮 حركة رأس المال:\n');
    
    // عرض رأس المال الحالي
    console.log(`💰 رأس المال المتاح الآن: ${nada.capitalBalance.toFixed(2)} ج`);
    console.log(`   (نفس المبلغ في التقارير الشامل ولوحة الشريك)\n`);
    
    console.log(`1️⃣ اشتريت بضاعة بـ: ${totalPurchased.toFixed(2)} ج → خصم من رأس المال`);
    console.log(`2️⃣ باقي في المخزن: ${totalStock.toFixed(2)} ج → لسه محجوز في البضاعة`);
    console.log(`3️⃣ مباع ومعلق: ${totalSold.toFixed(2)} ج → منتظر استلام الفلوس`);
    console.log('');
    console.log(`✅ لما تستلم الـ ${totalSold.toFixed(2)} ج → ترجع لرأس المال`);
    console.log(`✅ لما تبيع الباقي ${totalStock.toFixed(2)} ج → ترجع لرأس المال`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDiyaaTransactions();
