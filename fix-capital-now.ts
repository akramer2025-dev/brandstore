import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCapitalNow() {
  try {
    console.log('\n🔧 تصحيح رأس المال - حذف المعاملات الخاطئة\n');
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
    const currentCapital = nadaUser.vendor.capitalBalance!;

    // البحث عن المعاملات الخاطئة
    const wrongTransactions = await prisma.capitalTransaction.findMany({
      where: {
        vendorId,
        type: 'SALE_PROFIT',
        descriptionAr: { contains: 'بيع بضاعة خارج النظام' }
      },
      select: {
        id: true,
        amount: true,
        descriptionAr: true,
      }
    });

    const totalWrongAmount = wrongTransactions.reduce((sum, t) => sum + t.amount, 0);
    const correctedCapital = currentCapital - totalWrongAmount;

    console.log('📊 التحليل:\n');
    console.log(`   💰 رأس المال الحالي:         ${currentCapital.toFixed(2)} ج`);
    console.log(`   ❌ معاملات SALE_PROFIT خاطئة:  ${wrongTransactions.length}`);
    console.log(`   💸 إجمالي الأرباح الخاطئة:    ${totalWrongAmount.toFixed(2)} ج`);
    console.log(`   ✅ رأس المال المصحح:         ${correctedCapital.toFixed(2)} ج\n`);

    console.log('───────────────────────────────────────────────────────\n');
    console.log('🗑️  المعاملات التي سيتم حذفها:\n');
    
    wrongTransactions.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.amount} ج - ${t.descriptionAr}`);
    });

    console.log('\n═══════════════════════════════════════════════════════\n');
    console.log('⚙️  جاري التنفيذ...\n');

    // حذف المعاملات الخاطئة
    const deleteResult = await prisma.capitalTransaction.deleteMany({
      where: {
        id: { in: wrongTransactions.map(t => t.id) }
      }
    });

    console.log(`   ✅ تم حذف ${deleteResult.count} معاملة\n`);

    // تحديث رأس المال
    const updateResult = await prisma.vendor.update({
      where: { id: vendorId },
      data: { capitalBalance: correctedCapital }
    });

    console.log(`   ✅ تم تحديث رأس المال إلى ${updateResult.capitalBalance} ج\n`);

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('✨ تم التصحيح بنجاح!\n');
    console.log('📝 الخلاصة:');
    console.log(`   - حُذف ${deleteResult.count} معاملة SALE_PROFIT خاطئة`);
    console.log(`   - رأس المال تم تعديله من ${currentCapital} ج إلى ${correctedCapital.toFixed(2)} ج`);
    console.log(`   - الفرق: ${totalWrongAmount.toFixed(2)} ج\n`);

    console.log('💡 الآن النظام صحيح:\n');
    console.log('   ✅ البيع خارج النظام لا يعدل رأس المال');
    console.log('   ✅ فقط سند القبض يضيف للرأس المال');
    console.log('   ✅ المبيعات الأونلاين تعدل رأس المال حسب طريقة الدفع\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCapitalNow();
