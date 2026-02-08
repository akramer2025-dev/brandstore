const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVendorOrders() {
  try {
    // البحث عن طلبات جاهزة للشحن (CONFIRMED أو PREPARING + HOME_DELIVERY)
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['CONFIRMED', 'PREPARING'] },
        deliveryMethod: 'HOME_DELIVERY',
        bustaShipmentId: null, // لم يتم شحنها بعد
        vendorId: { not: null }, // لها vendor
      },
      include: {
        vendor: {
          include: {
            user: true
          }
        },
        customer: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log('\n=== 📦 طلبات جاهزة للشحن مع بوسطة ===\n');
    
    if (orders.length === 0) {
      console.log('❌ لا توجد طلبات جاهزة للشحن حالياً!');
      console.log('\n💡 الحل: نحتاج إنشاء طلب تجريبي جديد\n');
      return;
    }

    orders.forEach((order, index) => {
      console.log(`${index + 1}. طلب رقم: ${order.orderNumber}`);
      console.log(`   📦 الحالة: ${order.status}`);
      console.log(`   💰 المبلغ: ${order.finalAmount} جنيه`);
      console.log(`   📍 العنوان: ${order.deliveryAddress || '❌ غير متوفر'}`);
      console.log(`   🏛️ المحافظة: ${order.governorate || '❌ غير متوفر'}`);
      console.log(`   👤 العميل: ${order.customer.name} (${order.customer.email})`);
      console.log(`   🏪 البائع: ${order.vendor?.user?.email || 'غير محدد'}`);
      console.log(`   🆔 Order ID: ${order.id}`);
      console.log('');
    });

    // البحث عن بيانات الـ vendor
    const vendorEmails = await prisma.user.findMany({
      where: {
        id: { in: orders.map(o => o.vendorId).filter(Boolean) }
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    console.log('---\n');
    console.log('🔑 بيانات دخول الـ Vendors:\n');
    vendorEmails.forEach(vendor => {
      console.log(`📧 ${vendor.email} - ${vendor.name}`);
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVendorOrders();
