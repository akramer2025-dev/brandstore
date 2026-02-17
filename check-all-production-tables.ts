import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllTables() {
  console.log('🔍 فحص شامل لقاعدة البيانات\n');
  console.log('=' .repeat(60));

  try {
    // ✅ 1. المستخدمين
    const usersCount = await prisma.user.count();
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
    const vendors = await prisma.user.count({ where: { role: 'VENDOR' } });
    const customers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    
    console.log('\n👥 المستخدمين:');
    console.log(`   إجمالي: ${usersCount}`);
    console.log(`   - مدراء: ${admins}`);
    console.log(`   - شركاء: ${vendors}`);
    console.log(`   - عملاء: ${customers}`);

    // ✅ 2. الشركاء
    const partnersCount = await prisma.partnerCapital.count();
    const activePartners = await prisma.partnerCapital.count({ where: { isActive: true } });
    
    console.log('\n🤝 الشركاء:');
    console.log(`   إجمالي: ${partnersCount}`);
    console.log(`   - نشطين: ${activePartners}`);

    if (partnersCount > 0) {
      const partners = await prisma.partnerCapital.findMany({
        take: 3,
        include: {
          vendor: {
            select: { storeNameAr: true }
          }
        }
      });
      
      console.log('\n   أمثلة:');
      partners.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.partnerName} - ${p.initialAmount.toFixed(2)} جنيه`);
      });
    }

    // ✅ 3. المنتجات
    const productsCount = await prisma.product.count();
    const activeProducts = await prisma.product.count({ where: { isActive: true } });
    const visibleProducts = await prisma.product.count({ where: { isVisible: true } });
    
    console.log('\n📦 المنتجات:');
    console.log(`   إجمالي: ${productsCount}`);
    console.log(`   - نشطة: ${activeProducts}`);
    console.log(`   - مرئية: ${visibleProducts}`);

    // ✅ 4. الطلبات
    const ordersCount = await prisma.order.count();
    const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });
    const deliveredOrders = await prisma.order.count({ where: { status: 'DELIVERED' } });
    
    console.log('\n🛒 الطلبات:');
    console.log(`   إجمالي: ${ordersCount}`);
    console.log(`   - قيد الانتظار: ${pendingOrders}`);
    console.log(`   - مكتملة: ${deliveredOrders}`);

    // ✅ 5. اتفاقيات التقسيط
    const installmentsCount = await prisma.installmentAgreement.count();
    const pendingInstallments = await prisma.installmentAgreement.count({ 
      where: { status: 'PENDING' } 
    });
    const approvedInstallments = await prisma.installmentAgreement.count({ 
      where: { status: 'APPROVED' } 
    });
    
    console.log('\n💳 اتفاقيات التقسيط:');
    console.log(`   إجمالي: ${installmentsCount}`);
    console.log(`   - في الانتظار: ${pendingInstallments}`);
    console.log(`   - موافق عليها: ${approvedInstallments}`);

    if (installmentsCount > 0) {
      const agreements = await prisma.installmentAgreement.findMany({
        take: 3,
        include: {
          user: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log('\n   آخر الاتفاقيات:');
      agreements.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a.agreementNumber} - ${a.user.name} - ${a.status}`);
      });
    }

    // ✅ 6. الفئات
    const categoriesCount = await prisma.category.count();
    console.log(`\n🏷️  الفئات: ${categoriesCount}`);

    // ✅ 7. الكوبونات
    const couponsCount = await prisma.coupon.count();
    const activeCoupons = await prisma.coupon.count({ 
      where: { 
        expiresAt: { gte: new Date() }
      } 
    });
    
    console.log(`\n🎟️  الكوبونات:`);
    console.log(`   إجمالي: ${couponsCount}`);
    console.log(`   - سارية: ${activeCoupons}`);

    // ✅ 8. سجل رأس المال
    const capitalLogsCount = await prisma.capitalTransaction.count();
    console.log(`\n💰 سجل رأس المال: ${capitalLogsCount} عملية`);

    if (capitalLogsCount > 0) {
      const totalCapital = await prisma.capitalTransaction.aggregate({
        _sum: { amount: true }
      });
      console.log(`   رأس المال الحالي: ${totalCapital._sum.amount?.toFixed(2) || 0} جنيه`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ قاعدة البيانات جاهزة وتعمل بشكل صحيح!');

  } catch (error) {
    console.error('\n❌ خطأ في فحص قاعدة البيانات:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllTables();
