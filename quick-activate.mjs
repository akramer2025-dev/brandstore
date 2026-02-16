// تفعيل بسيط عن طريق Prisma Studio أو SQL
// افتح Prisma Studio: npx prisma studio
// ثم افتح Settings table
// غيّر paymentMethodInstallment إلى true

// أو استخدم هذا الكود:

import { prisma } from './src/lib/prisma';

async function activateInstallment() {
  console.log('🔧 تفعيل نظام التقسيط...\n');
  
  // تفعيل في الإعدادات
  await prisma.settings.upsert({
    where: { id: 'global' },
    update: { paymentMethodInstallment: true },
    create: {
      id: 'global',
      paymentMethodInstallment: true,
      paymentMethodCashOnDelivery: true,
      paymentMethodWePayWallet: true,
      paymentMethodGooglePay: true,
    }
  });
  
  // تفعيل على المنتجات
  const updated = await prisma.product.updateMany({
    where: { price: { gte: 100 } },
    data: { allowInstallment: true }
  });
  
  console.log(`✅ تم التفعيل بنجاح!`);
  console.log(`📦 ${updated.count} منتج تم تفعيل التقسيط عليه`);
}

activateInstallment().catch(console.error);
