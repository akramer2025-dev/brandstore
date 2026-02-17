import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixOldInstallmentAgreements() {
  try {
    console.log('🔄 إصلاح اتفاقيات التقسيط القديمة...\n');

    // جلب الاتفاقيات بدون طلبات
    const agreementsWithoutOrders = await prisma.installmentAgreement.findMany({
      where: {
        orderId: null,
        status: {
          in: ['DOCUMENTS_COMPLETE', 'PENDING']
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    console.log(`📋 اتفاقيات تحتاج تصليح: ${agreementsWithoutOrders.length}\n`);

    if (agreementsWithoutOrders.length === 0) {
      console.log('✅ جميع الاتفاقيات مرتبطة بطلبات');
      return;
    }

    for (const agreement of agreementsWithoutOrders) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📝 معالجة اتفاقية: ${agreement.agreementNumber}`);
      console.log(`👤 العميل: ${agreement.user.name || agreement.user.email}`);
      console.log(`💰 المبلغ: ${agreement.totalAmount} ج.م`);

      // توليد رقم طلب
      const generateOrderNumber = () => {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `ORD-${timestamp}-${random}`;
      };

      try {
        // إنشاء طلب "وهمي" مرتبط بالاتفاقية
        // (لأننا ما عندناش معلومات السلة القديمة)
        const order = await prisma.order.create({
          data: {
            customerId: agreement.userId,
            orderNumber: generateOrderNumber(),
            status: 'PENDING',
            paymentStatus: 'PENDING',
            paymentMethod: 'INSTALLMENT_4',
            totalAmount: agreement.totalAmount,
            deliveryFee: 0,
            finalAmount: agreement.totalAmount,
            deliveryAddress: agreement.address || 'عنوان غير محدد (طلب قديم)',
            deliveryPhone: agreement.user.phone || 'غير محدد',
            governorate: 'غير محدد',
            deliveryMethod: 'HOME_DELIVERY',
            customerNotes: `طلب تقسيط قديم - تم تحويله من اتفاقية ${agreement.agreementNumber}`,
            items: {
              create: [] // لا توجد منتجات (الطلب القديم ما كانش يحفظ المنتجات)
            }
          }
        });

        // ربط الاتفاقية بالطلب
        await prisma.installmentAgreement.update({
          where: { id: agreement.id },
          data: {
            orderId: order.id,
            status: 'PENDING' // تغيير الحالة لـ PENDING
          }
        });

        console.log(`✅ تم إنشاء طلب: ${order.orderNumber}`);
        console.log(`✅ تم ربط الاتفاقية بالطلب`);
        
      } catch (error) {
        console.error(`❌ خطأ في معالجة الاتفاقية:`, error);
      }
      
      console.log('');
    }

    console.log('\n✅ تم إصلاح جميع الاتفاقيات!');
    console.log('📝 ملاحظة: الطلبات المُنشأة للاتفاقيات القديمة بدون منتجات');
    console.log('   يمكن للعميل الآن رؤية طلباته في صفحة "طلباتي"');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOldInstallmentAgreements();
