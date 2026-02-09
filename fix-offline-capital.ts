import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixOfflineProductsCapital() {
  try {
    console.log('\n🔧 إصلاح رأس المال - البضاعة الخارجية\n');
    console.log('═══════════════════════════════════════════════════════\n');

    const nadaUser = await prisma.user.findUnique({
      where: { email: 'nada@gmail.com' },
      include: {
        vendor: {
          select: {
            id: true,
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

    console.log('📊 الوضع الحالي:\n');
    console.log(`   💰 رأس المال: ${currentCapital} ج\n`);

    // 1. البضاعة الخارجية الموجودة حالياً
    const offlineProducts = await prisma.offlineProduct.findMany({
      where: { vendorId },
      select: {
        purchasePrice: true,
        quantity: true,
        soldQuantity: true,
      }
    });

    const currentOfflineValue = offlineProducts.reduce((sum, p) => {
      const stock = (p.quantity || 0) - (p.soldQuantity || 0);
      return sum + (p.purchasePrice * stock);
    }, 0);

    console.log('📦 البضاعة الخارجية الحالية:\n');
    console.log(`   💵 القيمة: ${currentOfflineValue} ج\n`);

    // 2. معاملات PURCHASE للبضاعة الخارجية
    const purchaseTransactions = await prisma.capitalTransaction.findMany({
      where: {
        vendorId,
        type: 'PURCHASE',
        descriptionAr: { contains: 'بضاعة خارج النظام' }
      },
      select: { amount: true }
    });

    const totalPurchased = purchaseTransactions.reduce((sum, t) => sum + t.amount, 0);

    console.log('📜 المعاملات المسجلة:\n');
    console.log(`   💸 إجمالي المشتريات: ${totalPurchased} ج\n`);

    // 3. معاملات DEPOSIT (الإلغاءات/المرتجعات)
    const depositTransactions = await prisma.capitalTransaction.findMany({
      where: {
        vendorId,
        type: 'DEPOSIT',
        OR: [
          { descriptionAr: { contains: 'إلغاء شراء بضاعة' } },
          { descriptionAr: { contains: 'مسح جميع البضائع' } }
        ]
      },
      select: { amount: true }
    });

    const totalReturned = depositTransactions.reduce((sum, t) => sum + t.amount, 0);

    console.log('📥 المرتجعات المسجلة:\n');
    console.log(`   💵 إجمالي المرتجع: ${totalReturned} ج\n`);

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('🧮 التحليل:\n');

    const netPurchased = totalPurchased - totalReturned;
    console.log(`   المشتريات:         ${totalPurchased} ج`);
    console.log(`   - المرتجع:         ${totalReturned} ج`);
    console.log(`   ─────────────────────────────`);
    console.log(`   = صافي المشتريات:  ${netPurchased} ج\n`);
    
    console.log(`   البضاعة الحالية:   ${currentOfflineValue} ج`);
    console.log(`   الفرق (مباع/محذوف): ${(netPurchased - currentOfflineValue).toFixed(2)} ج\n`);

    // 4. حساب المبلغ المفقود
    const missingAmount = netPurchased - currentOfflineValue;

    if (missingAmount > 0) {
      console.log('⚠️  المشكلة:\n');
      console.log(`   فيه ${missingAmount.toFixed(2)} ج بضاعة اتباعت/اتحذفت`);
      console.log(`   لكن الفلوس ما رجعتش لرأس المال!\n`);

      console.log('───────────────────────────────────────────────────────\n');
      console.log('💡 الحل:\n');
      console.log(`   هنضيف ${missingAmount.toFixed(2)} ج لرأس المال\n`);

      const updatedVendor = await prisma.vendor.update({
        where: { id: vendorId },
        data: {
          capitalBalance: {
            increment: missingAmount,
          },
        },
      });

      await prisma.capitalTransaction.create({
        data: {
          vendorId,
          type: 'DEPOSIT',
          amount: missingAmount,
          balanceBefore: currentCapital,
          balanceAfter: updatedVendor.capitalBalance,
          description: 'تصحيح رأس المال - بضاعة خارجية محذوفة',
          descriptionAr: 'تصحيح رأس المال - بضاعة خارجية محذوفة',
        },
      });

      console.log('✅ تم التصحيح!\n');
      console.log(`   رأس المال قبل:    ${currentCapital.toFixed(2)} ج`);
      console.log(`   رأس المال بعد:    ${updatedVendor.capitalBalance.toFixed(2)} ج`);
      console.log(`   الفرق:             +${missingAmount.toFixed(2)} ج\n`);
    } else {
      console.log('✅ رأس المال صحيح! لا يوجد مبالغ مفقودة.\n');
    }

    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOfflineProductsCapital();
