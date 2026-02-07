import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createCouponTable() {
  console.log('🔄 جاري إنشاء جدول الكوبونات...');

  try {
    // تنفيذ SQL مباشرة
    await prisma.$executeRawUnsafe(`
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
    `);
    
    console.log('✅ تم إنشاء جدول coupons');

    // إنشاء الـ indexes
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "coupons_code_key" ON "coupons"("code");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "coupons_code_idx" ON "coupons"("code");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "coupons_userId_idx" ON "coupons"("userId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "coupons_isActive_expiresAt_idx" ON "coupons"("isActive", "expiresAt");`);
    
    console.log('✅ تم إنشاء الـ indexes');

    // إضافة foreign key (قد تفشل إذا كان موجود)
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "coupons" 
        ADD CONSTRAINT "coupons_userId_fkey" 
        FOREIGN KEY ("userId") 
        REFERENCES "users"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
      `);
      console.log('✅ تم إضافة foreign key');
    } catch (e) {
      console.log('⚠️ Foreign key موجود بالفعل أو حدث خطأ:', (e as Error).message);
    }

    console.log('✅ اكتمل إنشاء جدول الكوبونات بنجاح!');
  } catch (error) {
    console.error('❌ خطأ:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createCouponTable()
  .catch((error) => {
    console.error('❌ فشل الإنشاء:', error);
    process.exit(1);
  });
