import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateVendorsPermissions() {
  try {
    console.log('🔄 جاري تحديث صلاحيات الشركاء...\n');

    // تحديث جميع الشركاء الموجودين
    const result = await prisma.vendor.updateMany({
      data: {
        canDeleteOrders: true // إعطاء صلاحية حذف الطلبات لجميع الشركاء الموجودين
      }
    });

    console.log(`✅ تم تحديث ${result.count} شريك بنجاح`);
    console.log('✅ جميع الشركاء لديهم الآن صلاحية حذف الطلبات\n');

    // عرض قائمة بالشركاء المحدثين
    const vendors = await prisma.vendor.findMany({
      select: {
        id: true,
        user: {
          select: {
            name: true,
            email: true
          }
        },
        businessName: true,
        canDeleteOrders: true
      }
    });

    console.log('📋 قائمة الشركاء:');
    console.log('─'.repeat(60));
    vendors.forEach((vendor, index) => {
      console.log(`${index + 1}. ${vendor.user.name || vendor.businessName || 'شريك'}`);
      console.log(`   Email: ${vendor.user.email}`);
      console.log(`   صلاحية حذف الطلبات: ${vendor.canDeleteOrders ? '✅ نعم' : '❌ لا'}`);
      console.log('─'.repeat(60));
    });

  } catch (error) {
    console.error('❌ خطأ في تحديث الصلاحيات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateVendorsPermissions();
