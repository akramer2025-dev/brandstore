-- إضافة جدول لتتبع نشاط المستخدمين (User Activity Logs)
-- هيسجل: نوع الجهاز، المتصفح، IP، آخر تسجيل دخول، الخ

-- إضافة جدول جديد بدون تعديل الـ User model الحالي
CREATE TABLE IF NOT EXISTS "user_activity_logs" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL, -- مثل: LOGIN, LOGOUT, ADD_PRODUCT, etc
  "ip" TEXT,
  "userAgent" TEXT,
  "deviceType" TEXT, -- MOBILE, DESKTOP, TABLET
  "browser" TEXT,
  "os" TEXT,
  "deviceModel" TEXT,
  "location" TEXT, -- اختياري: المدينة/البلد
  "metadata" JSONB, -- بيانات إضافية
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "user_activity_logs_userId_fkey" FOREIGN KEY ("userId") 
    REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- فهرس لتسريع البحث
CREATE INDEX IF NOT EXISTS "user_activity_logs_userId_idx" ON "user_activity_logs"("userId");
CREATE INDEX IF NOT EXISTS "user_activity_logs_createdAt_idx" ON "user_activity_logs"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "user_activity_logs_action_idx" ON "user_activity_logs"("action");

-- إضافة حقول للـ User model (optional)
ALTER TABLE "users" 
  ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastLoginIp" TEXT,
  ADD COLUMN IF NOT EXISTS "lastLoginDevice" TEXT;

COMMENT ON TABLE "user_activity_logs" IS 'سجل نشاط المستخدمين - تتبع تسجيل الدخول والأنشطة';
