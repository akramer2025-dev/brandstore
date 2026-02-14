import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLatestCampaigns() {
  try {
    console.log('🔍 جاري فحص آخر الحملات...\n');

    // Get latest campaigns
    const campaigns = await prisma.marketingCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        type: true,
        budget: true,
        status: true,
        facebookCampaignId: true,
        facebookAdSetId: true,
        facebookAdId: true,
        createdAt: true,
        startDate: true,
      },
    });

    if (campaigns.length === 0) {
      console.log('❌ لا توجد حملات في النظام');
      return;
    }

    console.log(`✅ تم العثور على ${campaigns.length} حملة\n`);
    console.log('═'.repeat(100));

    campaigns.forEach((campaign, index) => {
      console.log(`\n📊 حملة ${index + 1}:`);
      console.log(`   الاسم: ${campaign.name}`);
      console.log(`   النوع: ${campaign.type}`);
      console.log(`   الميزانية: ${campaign.budget} ج`);
      console.log(`   الحالة: ${campaign.status}`);
      console.log(`   تم الإنشاء: ${campaign.createdAt.toLocaleString('ar-EG')}`);
      console.log(`   تاريخ البدء: ${campaign.startDate.toLocaleString('ar-EG')}`);
      
      // Check Facebook status
      if (campaign.facebookCampaignId) {
        console.log(`   ✅ تم الرفع على Facebook:`);
        console.log(`      • Campaign ID: ${campaign.facebookCampaignId}`);
        console.log(`      • AdSet ID: ${campaign.facebookAdSetId || 'N/A'}`);
        console.log(`      • Ad ID: ${campaign.facebookAdId || 'N/A'}`);
        console.log(`      • رابط Facebook Ads Manager:`);
        console.log(`        https://business.facebook.com/adsmanager/manage/campaigns?act=${process.env.FACEBOOK_AD_ACCOUNT_ID?.replace('act_', '')}&selected_campaign_ids=${campaign.facebookCampaignId}`);
      } else {
        console.log(`   ⚠️ لم يتم الرفع على Facebook بعد (DRAFT)`);
      }
      
      console.log('─'.repeat(100));
    });

    // Summary
    const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE');
    const fbCampaigns = campaigns.filter(c => c.facebookCampaignId);
    const draftCampaigns = campaigns.filter(c => !c.facebookCampaignId);

    console.log(`\n📊 الملخص:`);
    console.log(`   • إجمالي الحملات: ${campaigns.length}`);
    console.log(`   • حملات نشطة: ${activeCampaigns.length}`);
    console.log(`   • تم رفعها على Facebook: ${fbCampaigns.length} ✅`);
    console.log(`   • مسودات (لم ترفع): ${draftCampaigns.length} ⚠️`);

    // Latest campaign details
    const latest = campaigns[0];
    console.log(`\n🆕 آخر حملة تم إنشاؤها:`);
    console.log(`   الاسم: "${latest.name}"`);
    console.log(`   الوقت: ${latest.createdAt.toLocaleString('ar-EG')}`);
    
    if (latest.facebookCampaignId) {
      console.log(`   ✅ تم رفعها على Facebook بنجاح!`);
      console.log(`\n🔗 افتح في Facebook Ads Manager:`);
      console.log(`   https://business.facebook.com/adsmanager/manage/campaigns?act=${process.env.FACEBOOK_AD_ACCOUNT_ID?.replace('act_', '')}&selected_campaign_ids=${latest.facebookCampaignId}`);
      
      console.log(`\n💡 لمتابعة أداء الحملة:`);
      console.log(`   1. افتح الرابط أعلاه`);
      console.log(`   2. راقب: Reach, Clicks, CTR, CPC`);
      console.log(`   3. انتظر 48-72 ساعة للنتائج الحقيقية`);
    } else {
      console.log(`   ⚠️ الحملة في وضع المسودة (DRAFT)`);
      console.log(`   لم يتم رفعها على Facebook بعد`);
      
      console.log(`\n❓ الأسباب المحتملة:`);
      console.log(`   1. حدث خطأ أثناء الإنشاء`);
      console.log(`   2. لم تضغط "إطلاق الحملة"`);
      console.log(`   3. مشكلة في Facebook API`);
      
      console.log(`\n✅ الحل:`);
      console.log(`   • افتح /admin/media-buyer`);
      console.log(`   • أعد إنشاء الحملة`);
      console.log(`   • تأكد من الضغط على "إطلاق الحملة الآن!"`);
    }

  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkLatestCampaigns();
