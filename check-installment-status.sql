-- التحقق من حالة نظام التقسيط

-- 1. التحقق من الإعدادات
SELECT 
  'الإعدادات' as "الجدول",
  id,
  "paymentMethodInstallment" as "التقسيط مفعل",
  "paymentMethodCashOnDelivery" as "الدفع عند الاستلام",
  "paymentMethodBankTransfer" as "التحويل البنكي"
FROM "Settings"
WHERE id = 'global';

-- 2. عدد المنتجات المؤهلة للتقسيط
SELECT 
  'عدد المنتجات المؤهلة' as "الوصف",
  COUNT(*) as "العدد"
FROM "Product"
WHERE "allowInstallment" = true
  AND "isVisible" = true
  AND "isActive" = true;

-- 3. أمثلة على المنتجات المؤهلة (أول 5)
SELECT 
  LEFT(name, 40) as "اسم المنتج",
  price as "السعر",
  "allowInstallment" as "قابل للتقسيط",
  "isVisible" as "ظاهر",
  "isActive" as "نشط"
FROM "Product"
WHERE "allowInstallment" = true
  AND "isVisible" = true
  AND "isActive" = true
ORDER BY price DESC
LIMIT 5;

-- 4. تحليل المنتجات حسب حالة التقسيط
SELECT 
  "allowInstallment" as "قابل للتقسيط",
  COUNT(*) as "عدد المنتجات",
  ROUND(AVG(price), 2) as "متوسط السعر",
  MIN(price) as "أقل سعر",
  MAX(price) as "أعلى سعر"
FROM "Product"
WHERE "isVisible" = true AND "isActive" = true
GROUP BY "allowInstallment";
