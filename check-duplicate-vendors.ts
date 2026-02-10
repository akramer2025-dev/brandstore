import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicateVendors() {
  console.log('🔍 البحث عن Vendor accounts مكررة...\n');

  try {
    // جلب كل الـ users
    const users = await prisma.user.findMany({
      where: {
        role: 'VENDOR'
      }
    });

    console.log(`👥 عدد users بدور VENDOR: ${users.length}\n`);

    let duplicatesFound = 0;

    for (const user of users) {
      // جلب كل الـ vendor accounts للـ user ده
      const vendorAccounts = await prisma.vendor.findMany({
        where: {
          userId: user.id
        },
        include: {
          _count: {
            select: {
              products: {
                where: { isActive: true }
              }
            }
          }
        }
      });

      if (vendorAccounts.length > 1) {
        duplicatesFound++;
        console.log(`⚠️ ${user.name} (${user.email}) عنده ${vendorAccounts.length} vendor accounts:\n`);
        
        vendorAccounts.forEach((vendor, index) => {
          console.log(`   ${index + 1}. Vendor ID: ${vendor.id}`);
          console.log(`      📦 عدد المنتجات: ${vendor._count.products}`);
          console.log(`      💰 رأس المال: ${vendor.capitalBalance?.toLocaleString() || 0} ج`);
          console.log(`      📅 تاريخ الإنشاء: ${vendor.createdAt.toLocaleString('ar-EG')}\n`);
        });

        // اقتراح الـ account الصحيح (اللي فيه منتجات أكتر أو رأس مال أكبر)
        const mainAccount = vendorAccounts.sort((a, b) => {
          // أولوية للي فيه منتجات
          if (a._count.products !== b._count.products) {
            return b._count.products - a._count.products;
          }
          // ثم للي فيه رأس مال
          return (b.capitalBalance || 0) - (a.capitalBalance || 0);
        })[0];

        console.log(`   ✅ الـ Account الرئيسي المقترح: ${mainAccount.id}`);
        console.log(`      (${mainAccount._count.products} منتج، ${mainAccount.capitalBalance?.toLocaleString() || 0} ج رأس مال)\n`);
      }
    }

    if (duplicatesFound === 0) {
      console.log('✅ لا توجد vendor accounts مكررة!');
    } else {
      console.log(`\n⚠️ تحذير: تم العثور على ${duplicatesFound} مستخدم لديهم vendor accounts مكررة!`);
      console.log('💡 يُنصح بحذف الـ accounts الزيادة يدوياً من قاعدة البيانات.');
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateVendors();
