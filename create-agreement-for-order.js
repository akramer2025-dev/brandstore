const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAgreementForOrder() {
  try {
    console.log('🔍 جاري البحث عن الطلب التجريبي...\n');

    // Find the test order
    const order = await prisma.order.findUnique({
      where: { id: 'cmlotqj7b0002e3wgnjk7styt' },
      include: {
        customer: true,
        installmentPlan: true,
      },
    });

    if (!order) {
      console.log('❌ الطلب غير موجود');
      return;
    }

    console.log(`✅ الطلب موجود: ${order.orderNumber}`);
    console.log(`   العميل: ${order.customer.name}`);
    
    // Check if agreement already exists
    const existingAgreement = await prisma.installmentAgreement.findUnique({
      where: { orderId: order.id },
    });

    if (existingAgreement) {
      console.log(`\n✓ الاتفاقية موجودة بالفعل!`);
      console.log(`   رقم الاتفاقية: ${existingAgreement.agreementNumber}`);
      console.log(`   الحالة: ${existingAgreement.status}`);
      return;
    }

    // Generate agreement number
    const timestamp = Date.now().toString().slice(-8);
    const agreementNumber = `AGR-${timestamp}`;

    // Create sample images URLs (using placeholder images)
    const sampleImages = {
      selfieImage: 'https://via.placeholder.com/400x400/4F46E5/ffffff?text=صورة+شخصية',
      nationalIdImage: 'https://via.placeholder.com/600x400/3B82F6/ffffff?text=البطاقة+الأمامية',
      nationalIdBack: 'https://via.placeholder.com/600x400/3B82F6/ffffff?text=البطاقة+الخلفية',
      signature: 'https://via.placeholder.com/400x200/8B5CF6/ffffff?text=التوقيع',
    };

    // Create the agreement
    const agreement = await prisma.installmentAgreement.create({
      data: {
        userId: order.customerId,
        orderId: order.id,
        agreementNumber: agreementNumber,
        status: 'PENDING',
        
        // Documents
        selfieImage: sampleImages.selfieImage,
        nationalIdImage: sampleImages.nationalIdImage,
        nationalIdBack: sampleImages.nationalIdBack,
        signature: sampleImages.signature,
        
        // Customer data
        fullName: order.customer.name || 'داليا حسن',
        nationalId: '29801012345678',
        address: order.deliveryAddress,
        
        // Installment details
        totalAmount: order.installmentPlan.totalAmount,
        downPayment: order.installmentPlan.downPayment,
        numberOfInstallments: order.installmentPlan.numberOfMonths,
        monthlyInstallment: order.installmentPlan.monthlyAmount,
        interestRate: order.installmentPlan.interestRate,
        
        // Terms
        acceptedTerms: true,
        acceptedAt: new Date(),
      },
    });

    console.log(`\n✅ تم إنشاء الاتفاقية بنجاح!\n`);
    console.log(`📋 تفاصيل الاتفاقية:`);
    console.log(`   🆔 رقم الاتفاقية: ${agreement.agreementNumber}`);
    console.log(`   📦 رقم الطلب: ${order.orderNumber}`);
    console.log(`   👤 العميل: ${agreement.fullName}`);
    console.log(`   💰 المبلغ الإجمالي: ${agreement.totalAmount} جنيه`);
    console.log(`   💳 المقدم: ${agreement.downPayment} جنيه`);
    console.log(`   📅 عدد الأقساط: ${agreement.numberOfInstallments}`);
    console.log(`   💵 القسط الشهري: ${agreement.monthlyInstallment} جنيه`);
    console.log(`   📦 الحالة: ${agreement.status}`);
    
    console.log(`\n🎯 الآن يمكنك:`);
    console.log(`   1. فتح صفحة الطلب: /admin/orders/${order.id}`);
    console.log(`   2. مشاهدة اتفاقية التقسيط الكاملة مع جميع الصور`);
    console.log(`   3. الموافقة أو رفض الاتفاقية`);
    console.log(`   4. تحميل PDF أو إرسال واتساب`);

  } catch (error) {
    console.error('❌ حدث خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAgreementForOrder();
