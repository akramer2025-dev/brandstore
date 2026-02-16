const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAndRecreateAgreement() {
  try {
    const orderId = 'cmlotqj7b0002e3wgnjk7styt';
    
    console.log('🔍 جاري البحث عن الاتفاقية القديمة...\n');

    // Find and delete old agreement
    const oldAgreement = await prisma.installmentAgreement.findUnique({
      where: { orderId: orderId },
    });

    if (oldAgreement) {
      await prisma.installmentAgreement.delete({
        where: { id: oldAgreement.id },
      });
      console.log('✅ تم حذف الاتفاقية القديمة');
    }

    console.log('🔄 جاري إنشاء اتفاقية جديدة بصور واقعية...\n');

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        installmentPlan: true,
      },
    });

    if (!order) {
      console.log('❌ الطلب غير موجود');
      return;
    }

    // Generate agreement number
    const timestamp = Date.now().toString().slice(-8);
    const agreementNumber = `AGR-${timestamp}`;

    // Create realistic random images
    const randomSeed = Math.floor(Math.random() * 1000);
    const sampleImages = {
      // صورة شخصية واقعية
      selfieImage: `https://i.pravatar.cc/400?img=${randomSeed % 70}`,
      // صورة بطاقة أمامية (مستند)
      nationalIdImage: `https://picsum.photos/seed/id-front-${randomSeed}/600/400`,
      // صورة بطاقة خلفية (مستند)
      nationalIdBack: `https://picsum.photos/seed/id-back-${randomSeed}/600/400`,
      // توقيع (صورة بسيطة)
      signature: `https://picsum.photos/seed/signature-${randomSeed}/400/150?blur=1`,
    };

    // Create the agreement
    const agreement = await prisma.installmentAgreement.create({
      data: {
        userId: order.customerId,
        orderId: order.id,
        agreementNumber: agreementNumber,
        status: 'PENDING',
        
        // Documents with realistic images
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

    console.log(`\n✅ تم إنشاء اتفاقية جديدة بصور واقعية!\n`);
    console.log(`📋 تفاصيل الاتفاقية:`);
    console.log(`   🆔 رقم الاتفاقية: ${agreement.agreementNumber}`);
    console.log(`   👤 العميل: ${agreement.fullName}`);
    console.log(`   💰 المبلغ الإجمالي: ${agreement.totalAmount} جنيه`);
    console.log(`\n🖼️ الصور المستخدمة:`);
    console.log(`   📷 صورة شخصية: ${agreement.selfieImage}`);
    console.log(`   🪪 بطاقة أمامية: ${agreement.nationalIdImage}`);
    console.log(`   🪪 بطاقة خلفية: ${agreement.nationalIdBack}`);
    console.log(`   ✍️ التوقيع: ${agreement.signature}`);
    
    console.log(`\n🎯 الآن يمكنك:`);
    console.log(`   1. فتح: https://remostore.net/admin/orders/${orderId}`);
    console.log(`   2. شاهد الصور الواقعية`);
    console.log(`   3. اضغط "تحميل PDF" أو "طباعة"`);

  } catch (error) {
    console.error('❌ حدث خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAndRecreateAgreement();
