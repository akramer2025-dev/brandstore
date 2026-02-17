-- ============================================================
-- ⚡ نظام العروض الخاطفة (Flash Deals) للتجار - Migration SQL
-- ============================================================
-- تاريخ الإنشاء: 2026-02-17
-- الوصف: إضافة حقول جديدة لنظام العروض الخاطفة المحسّن
-- ============================================================

-- إضافة حقول العروض الخاطفة الجديدة إلى جدول المنتجات
-- ملاحظة: الحقول isFlashDeal و flashDealEndsAt موجودة بالفعل

-- إضافة تاريخ بدء العرض الخاطف
ALTER TABLE "products" 
ADD COLUMN IF NOT EXISTS "flashDealStartsAt" TIMESTAMP(3);

-- إضافة سعر العرض الخاطف
ALTER TABLE "products" 
ADD COLUMN IF NOT EXISTS "flashDealPrice" DOUBLE PRECISION;

-- إضافة الكمية المتاحة للعرض الخاطف
ALTER TABLE "products" 
ADD COLUMN IF NOT EXISTS "flashDealStock" INTEGER;

-- إنشاء Index لتحسين أداء استعلامات العروض الخاطفة النشطة
CREATE INDEX IF NOT EXISTS "products_flash_deal_active_idx" 
ON "products"("isFlashDeal", "flashDealStartsAt", "flashDealEndsAt") 
WHERE "isFlashDeal" = true AND "isActive" = true;

-- إنشاء Index للعروض المنتهية
CREATE INDEX IF NOT EXISTS "products_flash_deal_ends_idx" 
ON "products"("flashDealEndsAt") 
WHERE "isFlashDeal" = true;

-- ============================================================
-- 📝 ملاحظات الاستخدام:
-- ============================================================
-- 1. flashDealStartsAt: تاريخ بدء العرض (يمكن أن يكون في المستقبل)
-- 2. flashDealEndsAt: تاريخ انتهاء العرض
-- 3. flashDealPrice: السعر الخاص بالعرض (يجب أن يكون أقل من price)
-- 4. flashDealStock: الكمية المخصصة للعرض (لا تتجاوز stock)
-- 5. originalPrice: يتم حفظ السعر الأصلي تلقائياً عند إنشاء العرض
-- ============================================================

-- مثال على إضافة عرض خاطف لمنتج موجود:
-- UPDATE products 
-- SET 
--   "isFlashDeal" = true,
--   "flashDealStartsAt" = NOW(),
--   "flashDealEndsAt" = NOW() + INTERVAL '24 hours',
--   "flashDealPrice" = 100.00,
--   "flashDealStock" = 50,
--   "originalPrice" = COALESCE("originalPrice", "price")
-- WHERE id = 'PRODUCT_ID';

-- استعلام للحصول على جميع العروض النشطة:
-- SELECT * FROM products
-- WHERE "isFlashDeal" = true
--   AND "isActive" = true
--   AND "flashDealStartsAt" <= NOW()
--   AND "flashDealEndsAt" >= NOW()
--   AND "flashDealStock" > 0;

-- ============================================================
-- ✅ التحقق من نجاح التطبيق
-- ============================================================
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'products' 
--   AND column_name LIKE 'flashDeal%';
