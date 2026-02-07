import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 فحص شامل للنظام...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let allGood = true;

  try {
    // 1. فحص الحسابات
    console.log('👥 1. فحص الحسابات...');
    
    const developer = await prisma.user.findUnique({
      where: { email: 'akram@gmail.com' },
      include: { marketingStaff: true }
    });

    const mediaBuyer = await prisma.user.findUnique({
      where: { email: 'mediabuyer@brandstore.com' },
      include: { marketingStaff: true }
    });

    const playmaker = await prisma.user.findUnique({
      where: { email: 'playmaker@brandstore.com' },
      include: { marketingStaff: true }
    });

    if (!developer) {
      console.log('   ❌ حساب المطور غير موجود!');
      allGood = false;
    } else {
      console.log('   ✅ المطور: akram@gmail.com');
      console.log(`      الدور: ${developer.role}`);
    }

    if (!mediaBuyer) {
      console.log('   ❌ Media Buyer غير موجود!');
      allGood = false;
    } else {
      console.log('   ✅ Media Buyer: mediabuyer@brandstore.com');
      console.log(`      الدور: ${mediaBuyer.role}`);
      console.log(`      Marketing Staff ID: ${mediaBuyer.marketingStaff?.id}`);
    }

    if (!playmaker) {
      console.log('   ❌ Playmaker غير موجود!');
      allGood = false;
    } else {
      console.log('   ✅ Playmaker: playmaker@brandstore.com');
      console.log(`      الدور: ${playmaker.role}`);
      console.log(`      Marketing Staff ID: ${playmaker.marketingStaff?.id}`);
    }

    // 2. فحص Marketing Staff
    console.log('\n📊 2. فحص Marketing Staff...');
    
    const marketingStaffCount = await prisma.marketingStaff.count();
    console.log(`   ✅ عدد موظفي التسويق: ${marketingStaffCount}`);

    if (marketingStaffCount < 2) {
      console.log('   ⚠️ يجب أن يكون هناك 2 موظف على الأقل (Media Buyer + Playmaker)');
      allGood = false;
    }

    const marketingStaff = await prisma.marketingStaff.findMany({
      include: {
        user: { select: { email: true, role: true } }
      }
    });

    marketingStaff.forEach(staff => {
      console.log(`   - ${staff.name}`);
      console.log(`     Email: ${staff.email}`);
      console.log(`     نسبة العمولة: ${staff.commissionRate}%`);
      console.log(`     مفعّل: ${staff.isApproved ? 'نعم' : 'لا'}`);
    });

    // 3. فحص المنتجات المستوردة
    console.log('\n📦 3. فحص المنتجات المستوردة...');
    
    const importedProducts = await prisma.product.count({
      where: { isImported: true }
    });

    console.log(`   ℹ️ عدد المنتجات المستوردة: ${importedProducts}`);
    
    if (importedProducts === 0) {
      console.log('   ⚠️ لا توجد منتجات مستوردة بعد (طبيعي في البداية)');
    }

    // 4. فحص العمولات
    console.log('\n💰 4. فحص نظام العمولات...');
    
    const commissions = await prisma.marketingCommission.count();
    console.log(`   ℹ️ عدد العمولات: ${commissions}`);

    if (commissions === 0) {
      console.log('   ⚠️ لا توجد عمولات بعد (طبيعي في البداية)');
    } else {
      const paidCommissions = await prisma.marketingCommission.count({
        where: { isPaid: true }
      });
      const unpaidCommissions = await prisma.marketingCommission.count({
        where: { isPaid: false }
      });
      console.log(`   ✅ مدفوعة: ${paidCommissions}`);
      console.log(`   ⏳ معلقة: ${unpaidCommissions}`);
    }

    // 5. فحص الطلبات
    console.log('\n🛍️ 5. فحص الطلبات...');
    
    const totalOrders = await prisma.order.count();
    const deliveredOrders = await prisma.order.count({
      where: { status: 'DELIVERED' }
    });

    console.log(`   ℹ️ إجمالي الطلبات: ${totalOrders}`);
    console.log(`   ✅ مُكتملة (DELIVERED): ${deliveredOrders}`);

    // 6. فحص Campaigns (للـ Media Buyer AI)
    console.log('\n📢 6. فحص الحملات التسويقية...');
    
    const campaigns = await prisma.marketingCampaign.count();
    console.log(`   ℹ️ عدد الحملات: ${campaigns}`);

    if (campaigns === 0) {
      console.log('   ⚠️ لا توجد حملات بعد (طبيعي في البداية)');
    } else {
      const activeCampaigns = await prisma.marketingCampaign.count({
        where: { status: 'ACTIVE' }
      });
      console.log(`   🟢 نشطة: ${activeCampaigns}`);
    }

    // 7. فحص OpenAI API Key
    console.log('\n🤖 7. فحص الذكاء الاصطناعي...');
    
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      console.log('   ❌ OpenAI API Key غير موجود!');
      console.log('   📝 أضف OPENAI_API_KEY في ملف .env');
      allGood = false;
    } else if (openaiKey.startsWith('sk-proj-') || openaiKey.startsWith('sk-')) {
      console.log('   ✅ OpenAI API Key موجود');
      console.log(`   🔑 المفتاح يبدأ بـ: ${openaiKey.substring(0, 10)}...`);
    } else {
      console.log('   ⚠️ OpenAI API Key قد يكون غير صحيح');
      console.log('   📝 تأكد أن المفتاح يبدأ بـ sk-proj- أو sk-');
      allGood = false;
    }

    // 8. فحص Database Connection
    console.log('\n🗄️ 8. فحص قاعدة البيانات...');
    
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log('   ❌ DATABASE_URL غير موجود!');
      allGood = false;
    } else {
      console.log('   ✅ قاعدة البيانات متصلة');
      // عرض أول 20 حرف فقط للأمان
      console.log(`   🔗 ${dbUrl.substring(0, 30)}...`);
    }

    // النتيجة النهائية
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ملخص النظام');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (allGood) {
      console.log('✅ النظام جاهز 100% للعمل!\n');

      console.log('🚀 الخطوات التالية:');
      console.log('   1. إذا لم تضف OpenAI API Key، أضفه الآن في .env');
      console.log('   2. شغل Server: npm run dev');
      console.log('   3. افتح المتصفح: http://localhost:3000');
      console.log('   4. دخول المطور: /auth/login');
      console.log('      📧 akram@gmail.com');
      console.log('      🔑 Aazxc123');
      console.log('   5. دخول Media Buyer: mediabuyer@brandstore.com / MediaBuyer2026!');
      console.log('   6. دخول Playmaker: playmaker@brandstore.com / Playmaker2026!');
      console.log('\n📚 المستندات:');
      console.log('   - SYSTEM_READY.md - ملخص كامل');
      console.log('   - QUICK_START_GUIDE.md - دليل البدء');
      console.log('   - AI_MARKETING_STRATEGIES.md - استراتيجيات AI');
      console.log('   - MARKETING_ACTIVATION_PLAN.md - خطة 30 يوم');
      
    } else {
      console.log('⚠️ يوجد بعض المشاكل التي تحتاج إصلاح\n');
      console.log('📝 راجع الأخطاء أعلاه وأصلحها');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ خطأ في الفحص:', error);
    allGood = false;
  } finally {
    await prisma.$disconnect();
  }

  process.exit(allGood ? 0 : 1);
}

main();
