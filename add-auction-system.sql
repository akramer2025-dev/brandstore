-- ============================================================
-- 🔨 نظام المزادات (Auction System) - Migration SQL
-- ============================================================
-- تاريخ الإنشاء: 2026-02-17
-- الوصف: إضافة نظام مزادات احترافي للمتجر الإلكتروني
-- ============================================================

-- إنشاء enum لحالات المزاد
DO $$ BEGIN
    CREATE TYPE "AuctionStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'ENDED', 'SOLD', 'CANCELLED', 'NO_SALE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- إنشاء enum لحالات المزايدة
DO $$ BEGIN
    CREATE TYPE "BidStatus" AS ENUM ('ACTIVE', 'OUTBID', 'WINNING', 'LOST', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- جدول المزادات
CREATE TABLE IF NOT EXISTS "auctions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "description" TEXT,
    "descriptionAr" TEXT,
    
    -- الأسعار
    "startingPrice" DOUBLE PRECISION NOT NULL,
    "currentPrice" DOUBLE PRECISION NOT NULL,
    "reservePrice" DOUBLE PRECISION,
    "buyNowPrice" DOUBLE PRECISION,
    "minimumBidIncrement" DOUBLE PRECISION NOT NULL DEFAULT 10,
    
    -- التوقيت
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "extendOnBid" BOOLEAN NOT NULL DEFAULT true,
    
    -- الحالة
    "status" "AuctionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "winnerId" TEXT,
    "winningBidId" TEXT,
    
    -- تفاصيل إضافية
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "images" TEXT[],
    "termsAndConditions" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "bidCount" INTEGER NOT NULL DEFAULT 0,
    
    -- الإشعارات
    "notifyOnBid" BOOLEAN NOT NULL DEFAULT true,
    "notifyBeforeEnd" BOOLEAN NOT NULL DEFAULT true,
    
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "auctions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "auctions_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- جدول المزايدات
CREATE TABLE IF NOT EXISTS "bids" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auctionId" TEXT NOT NULL,
    "bidderId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    
    -- الحالة
    "status" "BidStatus" NOT NULL DEFAULT 'ACTIVE',
    "isWinning" BOOLEAN NOT NULL DEFAULT false,
    "isAutoBid" BOOLEAN NOT NULL DEFAULT false,
    "maxAutoBidAmount" DOUBLE PRECISION,
    
    -- معلومات إضافية
    "ip" TEXT,
    "userAgent" TEXT,
    "notes" TEXT,
    
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "bids_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "auctions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bids_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- إنشاء الفهارس (Indexes) لتحسين الأداء
CREATE INDEX IF NOT EXISTS "auctions_productId_idx" ON "auctions"("productId");
CREATE INDEX IF NOT EXISTS "auctions_status_idx" ON "auctions"("status");
CREATE INDEX IF NOT EXISTS "auctions_endDate_idx" ON "auctions"("endDate");
CREATE INDEX IF NOT EXISTS "auctions_featured_idx" ON "auctions"("featured");

CREATE INDEX IF NOT EXISTS "bids_auctionId_idx" ON "bids"("auctionId");
CREATE INDEX IF NOT EXISTS "bids_bidderId_idx" ON "bids"("bidderId");
CREATE INDEX IF NOT EXISTS "bids_createdAt_idx" ON "bids"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "bids_amount_idx" ON "bids"("amount");

-- ============================================================
-- 📝 ملاحظات:
-- ============================================================
-- 1. تم إضافة نظام المزادات بدون حذف أي بيانات موجودة
-- 2. جميع الـ Foreign Keys تستخدم CASCADE للحفاظ على النزاهة
-- 3. الـ Indexes تحسن أداء الاستعلامات الشائعة
-- 4. يمكن تشغيل هذا الـ script بأمان على قاعدة البيانات
-- ============================================================
