import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkInstallmentOrders() {
  try {
    console.log('🔍 فحص طلبات التقسيط...\n');

    // 1. جلب جميع اتفاقيات التقسيط
    const agreements = await prisma.installmentAgreement.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📋 عدد اتفاقيات التقسيط: ${agreements.length}\n`);

    if (agreements.length === 0) {
      console.log('❌ لا توجد اتفاقيات تقسيط');
      return;
    }

    for (const agreement of agreements) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📝 اتفاقية: ${agreement.agreementNumber}`);
      console.log(`👤 العميل: ${agreement.user.name || agreement.user.email}`);
      console.log(`📅 التاريخ: ${agreement.createdAt.toLocaleString('ar-EG')}`);
      console.log(`💰 المبلغ الإجمالي: ${agreement.totalAmount} ج.م`);
      console.log(`📊 الحالة: ${agreement.status}`);
      
      if (agreement.order) {
        console.log(`✅ مرتبط بطلب: ${agreement.order.orderNumber}`);
        console.log(`   - ID: ${agreement.order.id}`);
        console.log(`   - الحالة: ${agreement.order.status}`);
        console.log(`   - المبلغ: ${agreement.order.totalAmount} ج.م`);
      } else {
        console.log(`❌ غير مرتبط بأي طلب!`);
      }
      console.log('');
    }

    // 2. فحص الطلبات بدون اتفاقية تقسيط
    const ordersWithInstallment = await prisma.order.findMany({
      where: {
        paymentMethod: 'INSTALLMENT_4'
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true
          }
        },
        installmentAgreement: true,
        items: {
          include: {
            product: {
              select: {
                nameAr: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\n📦 طلبات بطريقة دفع "تقسيط": ${ordersWithInstallment.length}\n`);

    for (const order of ordersWithInstallment) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📦 طلب: ${order.orderNumber}`);
      console.log(`👤 العميل: ${order.customer.name || order.customer.email}`);
      console.log(`📅 التاريخ: ${order.createdAt.toLocaleString('ar-EG')}`);
      console.log(`💰 المبلغ: ${order.totalAmount} ج.م`);
      console.log(`📊 الحالة: ${order.status}`);
      console.log(`💳 حالة الدفع: ${order.paymentStatus}`);
      console.log(`📦 المنتجات (${order.items.length}):`);
      order.items.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item.product.nameAr} - ${item.quantity} × ${item.price} ج.م`);
      });
      
      if (order.installmentAgreement) {
        console.log(`✅ مرتبط باتفاقية: ${order.installmentAgreement.agreementNumber}`);
      } else {
        console.log(`⚠️ غير مرتبط بأي اتفاقية تقسيط`);
      }
      console.log('');
    }

    // 3. إحصائيات
    console.log('\n📊 إحصائيات:');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ اتفاقيات تقسيط مرتبطة بطلبات: ${agreements.filter(a => a.order).length}`);
    console.log(`❌ اتفاقيات تقسيط بدون طلبات: ${agreements.filter(a => !a.order).length}`);
    console.log(`📦 طلبات تقسيط: ${ordersWithInstallment.length}`);
    console.log(`⚠️ طلبات تقسيط بدون اتفاقية: ${ordersWithInstallment.filter(o => !o.installmentAgreement).length}`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInstallmentOrders();
