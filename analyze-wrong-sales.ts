import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeWrongSales() {
  try {
    console.log('\n🔍 تحليل معاملات SALE_PROFIT الخاطئة\n');
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
    
    console.log('📊 الوضع الحالي (ندى):');
    console.log(`   💰 رأس المال: ${vendor.capitalBalance} ج\n`);

    // البحث عن معاملات SALE_PROFIT من بيع خارج النظام
    const wrongSaleProfits = await prisma.capitalTransaction.findMany({
      where: {
        vendorId: vendor.id,
        type: 'SALE_PROFIT',
        descriptionAr: {
          contains: 'بيع بضاعة خارج النظام'
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`🔍 معاملات SALE_PROFIT الخاطئة: ${wrongSaleProfits.length}\n`);

    if (wrongSaleProfits.length === 0) {
      console.log('✅ لا توجد معاملات خاطئة للحذف\n');
      return;
    }

    const totalWrongAmount = wrongSaleProfits.reduce((sum, t) => sum + t.amount, 0);
    console.log(`💸 إجمالي الزيادة الخاطئة: ${totalWrongAmount} ج\n`);

    wrongSaleProfits.forEach((t, index) => {
      const date = new Date(t.createdAt).toLocaleString('ar-EG', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      console.log(`${index + 1}. [${date}] ${t.amount} ج`);
      console.log(`   الوصف: ${t.descriptionAr}`);
      console.log(`   الرصيد قبل: ${t.balanceBefore} ج → بعد: ${t.balanceAfter} ج\n`);
    });

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('🧮 الحساب المصحح:\n');
    console.log(`   رأس المال الحالي:         ${vendor.capitalBalance} ج`);
    console.log(`   - الزيادة الخاطئة:         ${totalWrongAmount} ج`);
    console.log(`   ─────────────────────────────`);
    const correctedBalance = vendor.capitalBalance! - totalWrongAmount;
    console.log(`   = رأس المال المصحح:        ${correctedBalance.toFixed(2)} ج\n`);

    console.log('───────────────────────────────────────────────────────\n');
    console.log('📝 ملاحظة: هذه المعاملات تمت قبل إصلاح النظام\n');
    console.log('   ❌ القديم: البيع خارج النظام كان يضيف profit لرأس المال');
    console.log(`   ✅ الجديد: البيع خارج النظام لا يعدل رأس المال (سند القبض فقط)\n`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeWrongSales();
