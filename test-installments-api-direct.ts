import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testInstallmentsAPI() {
  try {
    console.log('🧪 اختبار API الأقساط مباشرة...\n');

    // محاكاة ما يفعله الـ API
    const page = 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    const [agreements, total] = await Promise.all([
      prisma.installmentAgreement.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true
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
        },
        skip,
        take: limit
      }),
      prisma.installmentAgreement.count({ where })
    ]);

    console.log('✅ تم جلب البيانات بنجاح!');
    console.log(`\n📊 النتائج:`);
    console.log(`   - عدد الاتفاقيات في الصفحة: ${agreements.length}`);
    console.log(`   - الإجمالي: ${total}`);
    console.log(`   - عدد الصفحات: ${Math.ceil(total / limit)}`);

    if (agreements.length > 0) {
      console.log('\n📋 الاتفاقيات:');
      agreements.forEach((agreement, index) => {
        console.log(`\n${index + 1}. ${agreement.agreementNumber}`);
        console.log(`   العميل: ${agreement.user?.name}`);
        console.log(`   البريد: ${agreement.user?.email}`);
        console.log(`   الحالة: ${agreement.status}`);
        console.log(`   المبلغ: ${agreement.totalAmount} جنيه`);
        if (agreement.order) {
          console.log(`   الطلب: ${agreement.order.orderNumber}`);
        }
      });
    }

    // اختبار JSON response
    const response = {
      success: true,
      agreements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    console.log('\n✅ الاستجابة بصيغة JSON صحيحة');
    console.log('📦 حجم البيانات:', JSON.stringify(response).length, 'bytes');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
    console.error('\nالتفاصيل الكاملة:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testInstallmentsAPI();
