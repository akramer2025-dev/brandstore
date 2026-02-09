import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  console.log('\n🔧 حذف الإيداع الخاطئ\n');
  console.log('═══════════════════════════════════════════════════════\n');

  const nada = await prisma.user.findUnique({
    where: { email: 'nada@gmail.com' },
    include: { vendor: true }
  });

  const vendorId = nada!.vendor!.id;
  const currentCapital = nada!.vendor!.capitalBalance!;

  // حذف الإيداع الخاطئ (7500 ج)
  const wrongDeposit = await prisma.capitalTransaction.findFirst({
    where: {
      vendorId,
      type: 'DEPOSIT',
      amount: 7500,
      descriptionAr: 'إيداع رأس مال'
    }
  });

  if (!wrongDeposit) {
    console.log('❌ لم يتم العثور على الإيداع الخاطئ');
    await prisma.$disconnect();
    return;
  }

  console.log(`💰 رأس المال الحالي بالخطأ: ${currentCapital} ج`);
  console.log(`❌ سيتم حذف إيداع خاطئ:     7500 ج\n`);

  const correctedCapital = currentCapital - 7500;

  console.log(`✅ رأس المال المصحح:        ${correctedCapital} ج\n`);

  // حذف الإيداع
  await prisma.capitalTransaction.delete({
    where: { id: wrongDeposit.id }
  });

  // تحديث رأس المال
  await prisma.vendor.update({
    where: { id: vendorId },
    data: { capitalBalance: correctedCapital }
  });

  console.log('✅ تم الحذف والتصحيح!\n');

  await prisma.$disconnect();
})();
