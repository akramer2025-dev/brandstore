-- إضافة نظام موظفي التسويق والمنتجات المستوردة

-- 1. إضافة MARKETING_STAFF إلى enum UserRole
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
    RAISE NOTICE 'UserRole enum not found';
  ELSE
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'MARKETING_STAFF' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')) THEN
      ALTER TYPE "UserRole" ADD VALUE 'MARKETING_STAFF';
    END IF;
  END IF;
END$$;

-- 2. إنشاء enum ImportSource
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ImportSource') THEN
    CREATE TYPE "ImportSource" AS ENUM ('SHEIN', 'ALIEXPRESS', 'ALIBABA', 'TAOBAO', 'TEMU', 'OTHER');
  END IF;
END$$;

-- 3. إضافة حقول المنتجات المستوردة
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "isImported" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "importSource" "ImportSource";
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "marketingStaffId" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "downPaymentPercent" DOUBLE PRECISION NOT NULL DEFAULT 100;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "deliveryDaysMin" INTEGER;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "deliveryDaysMax" INTEGER;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "importNotes" TEXT;

-- 4. إنشاء جدول marketing_staff
CREATE TABLE IF NOT EXISTS "marketing_staff" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 5,
  "totalSales" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalCommission" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isApproved" BOOLEAN NOT NULL DEFAULT false,
  "bankName" TEXT,
  "accountNumber" TEXT,
  "iban" TEXT,
  "accountHolderName" TEXT,
  "instaPay" TEXT,
  "etisalatCash" TEXT,
  "vodafoneCash" TEXT,
  "wePay" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "marketing_staff_pkey" PRIMARY KEY ("id")
);

-- 5. إنشاء جدول marketing_commissions
CREATE TABLE IF NOT EXISTS "marketing_commissions" (
  "id" TEXT NOT NULL,
  "marketingStaffId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "orderItemId" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  "saleAmount" DOUBLE PRECISION NOT NULL,
  "commissionRate" DOUBLE PRECISION NOT NULL,
  "commissionAmount" DOUBLE PRECISION NOT NULL,
  "isPaid" BOOLEAN NOT NULL DEFAULT false,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "marketing_commissions_pkey" PRIMARY KEY ("id")
);

-- 6. إنشاء Constraints و Indexes
DO $$
BEGIN
  -- Unique constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketing_staff_userId_key') THEN
    ALTER TABLE "marketing_staff" ADD CONSTRAINT "marketing_staff_userId_key" UNIQUE ("userId");
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketing_staff_phone_key') THEN
    ALTER TABLE "marketing_staff" ADD CONSTRAINT "marketing_staff_phone_key" UNIQUE ("phone");
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketing_staff_email_key') THEN
    ALTER TABLE "marketing_staff" ADD CONSTRAINT "marketing_staff_email_key" UNIQUE ("email");
  END IF;

  -- Foreign Keys
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketing_staff_userId_fkey') THEN
    ALTER TABLE "marketing_staff" ADD CONSTRAINT "marketing_staff_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_marketingStaffId_fkey') THEN
    ALTER TABLE "products" ADD CONSTRAINT "products_marketingStaffId_fkey" 
      FOREIGN KEY ("marketingStaffId") REFERENCES "marketing_staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketing_commissions_marketingStaffId_fkey') THEN
    ALTER TABLE "marketing_commissions" ADD CONSTRAINT "marketing_commissions_marketingStaffId_fkey" 
      FOREIGN KEY ("marketingStaffId") REFERENCES "marketing_staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketing_commissions_productId_fkey') THEN
    ALTER TABLE "marketing_commissions" ADD CONSTRAINT "marketing_commissions_productId_fkey" 
      FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketing_commissions_orderItemId_fkey') THEN
    ALTER TABLE "marketing_commissions" ADD CONSTRAINT "marketing_commissions_orderItemId_fkey" 
      FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END$$;

-- 7. إنشاء Indexes
CREATE INDEX IF NOT EXISTS "marketing_commissions_marketingStaffId_idx" ON "marketing_commissions"("marketingStaffId");
CREATE INDEX IF NOT EXISTS "marketing_commissions_productId_idx" ON "marketing_commissions"("productId");
CREATE INDEX IF NOT EXISTS "marketing_commissions_isPaid_idx" ON "marketing_commissions"("isPaid");
CREATE INDEX IF NOT EXISTS "products_marketingStaffId_idx" ON "products"("marketingStaffId");
CREATE INDEX IF NOT EXISTS "products_isImported_idx" ON "products"("isImported");
CREATE INDEX IF NOT EXISTS "products_importSource_idx" ON "products"("importSource");
