-- إنشاء جدول الكوبونات في قاعدة البيانات
CREATE TABLE IF NOT EXISTS "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "minPurchase" DOUBLE PRECISION NOT NULL,
    "discountType" TEXT NOT NULL DEFAULT 'FIXED',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- إنشاء الـ indexes
CREATE UNIQUE INDEX IF NOT EXISTS "coupons_code_key" ON "coupons"("code");
CREATE INDEX IF NOT EXISTS "coupons_code_idx" ON "coupons"("code");
CREATE INDEX IF NOT EXISTS "coupons_userId_idx" ON "coupons"("userId");
CREATE INDEX IF NOT EXISTS "coupons_isActive_expiresAt_idx" ON "coupons"("isActive", "expiresAt");

-- إضافة foreign key للمستخدم
ALTER TABLE "coupons" 
ADD CONSTRAINT "coupons_userId_fkey" 
FOREIGN KEY ("userId") 
REFERENCES "users"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;
