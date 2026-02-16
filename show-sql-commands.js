// حل بسيط - UPDATE مباشر
const { exec } = require('child_process');

const sqlCommands = `
-- تفعيل التقسيط في الإعدادات
UPDATE "Settings" SET "paymentMethodInstallment" = true WHERE id = 'global';

-- إذا لم يكن موجود، أضفه
INSERT INTO "Settings" (id, "paymentMethodInstallment", "paymentMethodCashOnDelivery", "paymentMethodWePayWallet", "paymentMethodGooglePay")
SELECT 'global', true, true, true, true
WHERE NOT EXISTS (SELECT 1 FROM "Settings" WHERE id = 'global');

-- تفعيل التقسيط على المنتجات
UPDATE "Product" SET "allowInstallment" = true WHERE price >= 100;

-- عرض النتائج
SELECT 
  (SELECT COUNT(*) FROM "Product" WHERE "allowInstallment" = true) as products_count,
  (SELECT "paymentMethodInstallment" FROM "Settings" WHERE id = 'global') as installment_enabled;
`;

console.log('✅ SQL Commands جاهزة!\n');
console.log('🔗 افتح Neon Console من هنا:');
console.log('   https://console.neon.tech/\n');
console.log('📋 انسخ الكود ده والصقه في SQL Editor:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(sqlCommands);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('⚡ بعد تنفيذ الكود، التقسيط هيشتغل فوراً!');
