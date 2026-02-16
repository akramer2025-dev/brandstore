-- تشغيل هذا الكود في Neon Console مباشرةً

-- 1️⃣ تفعيل التقسيط في الإعدادات
INSERT INTO "Settings" (id, "paymentMethodInstallment", "paymentMethodCashOnDelivery", "paymentMethodWePayWallet", "paymentMethodGooglePay")
VALUES ('global', true, true, true, true)
ON CONFLICT (id) 
DO UPDATE SET "paymentMethodInstallment" = true;

-- 2️⃣ ت فعيل التقسيط على المنتجات (السعر >= 100 جنيه)
UPDATE "Product"
SET "allowInstallment" = true
WHERE price >= 100;

-- 3️⃣ التحقق من التفعيل
SELECT 
  (SELECT COUNT(*) FROM "Product" WHERE "allowInstallment" = true) as products_with_installment,
  (SELECT "paymentMethodInstallment" FROM "Settings" WHERE id = 'global') as installment_enabled;
