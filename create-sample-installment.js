const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleInstallmentOrder() {
  try {
    console.log('🚀 جاري إنشاء طلب تقسيط تجريبي...\n');

    // 1. نجيب أول عميل من الداتابيز
    const user = await prisma.user.findFirst({
      where: {
        NOT: {
          role: 'ADMIN'
        }
      }
    });

    if (!user) {
      console.error('❌ لا يوجد مستخدمين في النظام!');
      console.log('\n💡 قم بإنشاء مستخدم أولاً من صفحة التسجيل');
      return;
    }

    console.log(`✅ المستخدم: ${user.name || user.email}`);

    // 2. نجيب منتج يدعم التقسيط
    const product = await prisma.product.findFirst({
      where: {
        allowInstallment: true,
        stock: { gt: 0 }
      }
    });

    if (!product) {
      console.error('❌ لا توجد منتجات متاحة للتقسيط!');
      return;
    }

    console.log(`✅ المنتج: ${product.name} - ${product.price} جنيه`);

    // 3. ننشئ الطلب
    const totalAmount = product.price * 1; // منتج واحد
    const installments = 4; // 4 أقساط
    const downPayment = totalAmount * 0.25; // 25% مقدم
    const monthlyAmount = (totalAmount - downPayment) / (installments - 1);
    
    // حساب تاريخ الانتهاء (بعد 4 أشهر من اليوم)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + installments);

    const order = await prisma.order.create({
      data: {
        customerId: user.id,
        items: {
          create: [
            {
              productId: product.id,
              quantity: 1,
              price: product.price
            }
          ]
        },
        totalAmount: totalAmount,
        finalAmount: totalAmount,
        status: 'PENDING',
        paymentMethod: 'INSTALLMENT_4',
        deliveryAddress: 'عنوان تجريبي - القاهرة',
        deliveryPhone: user.phone || '01000000000',
        governorate: 'القاهرة',
        downPayment: downPayment,
        remainingAmount: totalAmount - downPayment,
        
        // خطة التقسيط
        installmentPlan: {
          create: {
            totalAmount: totalAmount,
            downPayment: downPayment,
            numberOfMonths: installments,
            monthlyAmount: monthlyAmount,
            endDate: endDate,
            status: 'ACTIVE'
          }
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        installmentPlan: true
      }
    });

    console.log('\n✅ تم إنشاء الطلب بنجاح!\n');
    console.log('📋 تفاصيل الطلب:');
    console.log(`   🆔 رقم الطلب: ${order.id}`);
    console.log(`   👤 العميل: ${user.name || user.email}`);
    console.log(`   💰 إجمالي المبلغ: ${totalAmount} جنيه`);
    console.log(`   💳 المقدم: ${downPayment} جنيه`);
    console.log(`   📅 عدد الأقساط: ${installments}`);
    console.log(`   💵 القسط الشهري: ${monthlyAmount.toFixed(2)} جنيه`);
    console.log(`   📦 الحالة: ${order.status}`);

    console.log('\n🎯 الآن يمكنك:');
    console.log('   1. فتح صفحة الطلبات: /admin/orders');
    console.log(`   2. البحث عن الطلب رقم: ${order.id}`);
    console.log('   3. مشاهدة تفاصيل نموذج التقسيط');
    console.log('\n💡 لحذف الطلب التجريبي بعد المعاينة:');
    console.log(`   node delete-sample-installment.js ${order.id}`);

  } catch (error) {
    console.error('❌ حدث خطأ:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleInstallmentOrder();
