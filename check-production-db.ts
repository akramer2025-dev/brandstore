// سكريبت للتحقق من قاعدة البيانات الإنتاجية وحذف الطلبات منها
import { PrismaClient } from '@prisma/client';

async function main() {
  console.log('🔍 فحص قاعدة البيانات...');
  console.log('📍 DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    // عرض الطلبات الموجودة
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log(`\n📦 إجمالي الطلبات: ${orders.length}\n`);

    if (orders.length > 0) {
      console.log('🗑️  الطلبات الموجودة:');
      for (const order of orders) {
        console.log(`  • رقم ${order.orderNumber} - ${order.customer?.name || 'غير معروف'} - ${order.status} - ${order.totalAmount} جنيه`);
      }

      console.log('\n⚠️  هل تريد حذف هذه الطلبات؟');
      console.log('💡 لتنفيذ الحذف، أضف المتغير: DELETE_ORDERS=true');
      
      if (process.env.DELETE_ORDERS === 'true') {
        console.log('\n🧹 جاري حذف الطلبات...');
        
        // حذف عناصر الطلبات أولاً
        const deletedItems = await prisma.orderItem.deleteMany({});
        console.log(`✅ تم حذف ${deletedItems.count} عنصر طلب`);
        
        // حذف الطلبات
        const deletedOrders = await prisma.order.deleteMany({});
        console.log(`✅ تم حذف ${deletedOrders.count} طلب`);
        
        // إعادة تعيين رأس المال للشركاء
        console.log('\n💰 إعادة تعيين رأس المال للشركاء...');
        
        const partners = [
          { name: 'Radwa', capital: 0 },
          { name: 'Nada', capital: 7500 },
          { name: 'محل ميس رييم', capital: 100000 },
        ];
        
        for (const partner of partners) {
          const updated = await prisma.partner.updateMany({
            where: { name: partner.name },
            data: { capital: partner.capital },
          });
          
          if (updated.count > 0) {
            console.log(`  ✅ ${partner.name}: ${partner.capital} جنيه`);
          }
        }
        
        // حذف المعاملات المالية
        const deletedTransactions = await prisma.capitalTransaction.deleteMany({});
        console.log(`✅ تم حذف ${deletedTransactions.count} معاملة مالية`);
        
        // إعادة تعيين رصيد الشركاء في Vendor
        console.log('\n💼 إعادة تعيين رصيد البائعين...');
        const vendors = await prisma.vendor.findMany({
          include: { partners: true },
        });
        
        for (const vendor of vendors) {
          // حساب رأس المال الإجمالي
          const totalCapital = vendor.partners.reduce((sum, p) => sum + (p.capital || 0), 0);
          
          await prisma.vendor.update({
            where: { id: vendor.id },
            data: {
              capitalBalance: totalCapital,
              totalSales: 0,
            },
          });
          
          console.log(`  ✅ ${vendor.name}: رصيد = ${totalCapital} جنيه`);
        }
        
        console.log('\n✨ تم تنظيف قاعدة البيانات بنجاح!');
      }
    } else {
      console.log('✅ قاعدة البيانات نظيفة، لا توجد طلبات');
    }
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
