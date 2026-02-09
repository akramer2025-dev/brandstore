import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testOrderAccept() {
  try {
    console.log('\n🧪 اختبار قبول الطلب وتحديث رأس المال\n');
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
    
    console.log('📊 البيانات الحالية:');
    console.log(`   💵 رأس المال الأولي: ${vendor.initialCapital} ج`);
    console.log(`   💰 رأس المال الحالي: ${vendor.capitalBalance} ج\n`);
    console.log('───────────────────────────────────────────────────────\n');

    // البحث عن طلبات pending لندى
    const pendingOrders = await prisma.order.findMany({
      where: {
        vendorId: vendor.id,
        status: 'PENDING',
        deletedAt: null,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
      take: 5,
    });

    console.log(`📦 الطلبات المعلقة (PENDING): ${pendingOrders.length}\n`);

    if (pendingOrders.length === 0) {
      console.log('ℹ️  لا توجد طلبات معلقة للاختبار\n');
      console.log('💡 لاختبار النظام، يمكنك:');
      console.log('   1. إنشاء طلب جديد من الموقع');
      console.log('   2. اختيار طريقة دفع (تحويل بنكي/محفظة)');
      console.log('   3. رفع صورة الإيصال');
      console.log('   4. قبول الطلب من لوحة التاجر\n');
      return;
    }

    // عرض تفاصيل الطلبات
    pendingOrders.forEach((order, index) => {
      console.log(`${index + 1}. طلب #${order.orderNumber.slice(0, 8)}`);
      console.log(`   💳 طريقة الدفع: ${order.paymentMethod}`);
      console.log(`   💰 المبلغ: ${order.finalAmount} ج`);
      console.log(`   📸 إيصال مرفق: ${order.bankTransferReceipt ? '✅ نعم' : '❌ لا'}`);
      console.log(`   📦 المنتجات: ${order.items.length}`);
      
      order.items.forEach((item, i) => {
        console.log(`      ${i + 1}. ${item.product.nameAr} - ${item.quantity} قطعة × ${item.price} ج`);
        console.log(`         📌 نوع المنتج: ${item.product.productSource}`);
        if (item.product.productSource === 'OWNED') {
          const cost = item.product.supplierCost || item.product.productionCost || 0;
          const profit = (item.price - cost) * item.quantity;
          console.log(`         💵 التكلفة: ${cost} ج/قطعة`);
          console.log(`         💸 الربح المتوقع: ${profit.toFixed(2)} ج`);
        } else if (item.product.productSource === 'CONSIGNMENT') {
          const cost = item.product.supplierCost || 0;
          const profit = (item.price - cost) * item.quantity;
          console.log(`         💵 مستحقات المورد: ${cost} ج/قطعة`);
          console.log(`         💸 الربح المتوقع: ${profit.toFixed(2)} ج`);
        }
      });
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('✅ للاختبار الفعلي:');
    console.log('   1. انسخ رقم طلب من الأعلى');
    console.log('   2. افتح لوحة التاجر');
    console.log('   3. اضغط "قبول" على الطلب');
    console.log('   4. شوف رأس المال اتحدث ولا لأ\n');

    // فحص آخر معاملات رأس المال
    const lastTransactions = await prisma.capitalTransaction.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        type: true,
        amount: true,
        balanceAfter: true,
        descriptionAr: true,
        createdAt: true,
      }
    });

    console.log('📜 آخر 5 معاملات رأس المال:\n');
    if (lastTransactions.length > 0) {
      lastTransactions.forEach((t, index) => {
        console.log(`${index + 1}. ${t.type} - ${t.amount} ج`);
        console.log(`   الرصيد بعد: ${t.balanceAfter} ج`);
        console.log(`   الوصف: ${t.descriptionAr || 'لا يوجد'}`);
        console.log(`   التاريخ: ${new Date(t.createdAt).toLocaleString('ar-EG')}\n`);
      });
    } else {
      console.log('   ℹ️  لا توجد معاملات\n');
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderAccept();
