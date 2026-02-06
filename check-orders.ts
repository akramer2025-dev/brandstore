import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrders() {
  try {
    console.log('📊 فحص الطلبات الموجودة...\n');

    const orders = await prisma.order.findMany({
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                nameAr: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`📦 إجمالي الطلبات: ${orders.length}\n`);

    if (orders.length === 0) {
      console.log('✅ لا توجد طلبات في قاعدة البيانات');
    } else {
      console.log('📋 قائمة الطلبات:\n');
      orders.forEach((order, index) => {
        console.log(`${index + 1}. طلب #${order.orderNumber.slice(0, 8)}`);
        console.log(`   العميل: ${order.customer?.name || 'غير معروف'}`);
        console.log(`   الحالة: ${order.status}`);
        console.log(`   الإجمالي: ${order.totalAmount} جنيه`);
        console.log(`   التاريخ: ${order.createdAt.toLocaleDateString('ar-EG')}`);
        console.log(`   المنتجات: ${order.items.length} منتج`);
        order.items.forEach((item) => {
          console.log(`      - ${item.product.nameAr || item.product.name} (${item.quantity}×)`);
        });
        console.log('');
      });
    }

    // إحصائيات حسب الحالة
    const statuses = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });

    if (statuses.length > 0) {
      console.log('📊 إحصائيات حسب الحالة:');
      statuses.forEach((stat) => {
        console.log(`   ${stat.status}: ${stat._count} طلب`);
      });
    }

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrders();
