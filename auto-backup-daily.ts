import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function autoDailyBackup() {
  console.log('🔄 جاري عمل Backup يومي أوتوماتيكي...\n');

  try {
    // جلب كل البيانات
    const [products, categories, users, orders, vendors, offlineProducts, purchases] = await Promise.all([
      prisma.product.findMany({ include: { category: true, vendor: true } }),
      prisma.category.findMany(),
      prisma.user.findMany(),
      prisma.order.findMany({ include: { items: true } }),
      prisma.vendor.findMany(),
      prisma.offlineProduct.findMany(),
      prisma.purchase.findMany(),
    ]);

    console.log(`✅ تم جلب ${products.length} منتج`);
    console.log(`✅ تم جلب ${categories.length} فئة`);
    console.log(`✅ تم جلب ${users.length} مستخدم`);
    console.log(`✅ تم جلب ${orders.length} طلب`);
    console.log(`✅ تم جلب ${vendors.length} متجر`);
    console.log(`✅ تم جلب ${offlineProducts.length} منتج خارجي`);
    console.log(`✅ تم جلب ${purchases.length} مشتريات`);

    // إنشاء مجلد الbackups
    const backupsDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // حفظ البيانات
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupData = {
      timestamp: new Date().toISOString(),
      stats: {
        products: products.length,
        categories: categories.length,
        users: users.length,
        orders: orders.length,
        vendors: vendors.length,
        offlineProducts: offlineProducts.length,
        purchases: purchases.length,
      },
      data: {
        products,
        categories,
        users,
        orders,
        vendors,
        offlineProducts,
        purchases,
      }
    };

    const filename = `backup-${timestamp}.json`;
    const filepath = path.join(backupsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

    console.log(`\n✅ تم حفظ الBackup في: ${filepath}`);
    console.log(`📊 حجم الملف: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);

    // حذف الbackups القديمة (أكثر من 30 يوم)
    const files = fs.readdirSync(backupsDir);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    let deletedCount = 0;
    files.forEach(file => {
      const filePath = path.join(backupsDir, file);
      const stats = fs.statSync(filePath);
      if (stats.mtimeMs < thirtyDaysAgo && file.startsWith('backup-')) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      console.log(`\n🗑️  تم حذف ${deletedCount} backup قديم (أكثر من 30 يوم)`);
    }

    console.log('\n✅ Backup يومي اكتمل بنجاح! 🎉');

  } catch (error) {
    console.error('❌ خطأ في الBackup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

autoDailyBackup();
