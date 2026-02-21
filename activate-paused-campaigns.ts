import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function activateAllPausedCampaigns() {
  console.log('\n🔍 جاري البحث عن الحملات المتوقفة...\n');

  try {
    // Get campaigns with Facebook IDs but still in DRAFT or PAUSED
    const campaigns = await prisma.marketingCampaign.findMany({
      where: {
        facebookCampaignId: { not: null },
        OR: [
          { status: 'DRAFT' },
          { status: 'PAUSED' },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (campaigns.length === 0) {
      console.log('✅ لا توجد حملات متوقفة! كل الحملات نشطة');
      return;
    }

    console.log(`📊 عدد الحملات المتوقفة: ${campaigns.length}\n`);

    const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!FACEBOOK_ACCESS_TOKEN) {
      console.error('❌ Facebook Access Token غير موجود في .env');
      return;
    }

    for (const campaign of campaigns) {
      console.log(`\n⚙️ تفعيل حملة: ${campaign.name}`);
      console.log(`   Campaign ID: ${campaign.facebookCampaignId}`);

      try {
        // Activate Campaign
        const campaignUrl = `https://graph.facebook.com/v21.0/${campaign.facebookCampaignId}`;
        const campaignResponse = await fetch(campaignUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'ACTIVE',
            access_token: FACEBOOK_ACCESS_TOKEN,
          }),
        });

        if (!campaignResponse.ok) {
          const error = await campaignResponse.json();
          console.log(`   ❌ فشل تفعيل Campaign: ${error.error?.message}`);
          continue;
        }

        // Activate AdSet if exists
        if (campaign.facebookAdSetId) {
          const adSetUrl = `https://graph.facebook.com/v21.0/${campaign.facebookAdSetId}`;
          const adSetResponse = await fetch(adSetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'ACTIVE',
              access_token: FACEBOOK_ACCESS_TOKEN,
            }),
          });

          if (!adSetResponse.ok) {
            const error = await adSetResponse.json();
            console.log(`   ⚠️ فشل تفعيل AdSet: ${error.error?.message}`);
          }
        }

        // Activate Ad if exists
        if (campaign.facebookAdId) {
          const adUrl = `https://graph.facebook.com/v21.0/${campaign.facebookAdId}`;
          const adResponse = await fetch(adUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'ACTIVE',
              access_token: FACEBOOK_ACCESS_TOKEN,
            }),
          });

          if (!adResponse.ok) {
            const error = await adResponse.json();
            console.log(`   ⚠️ فشل تفعيل Ad: ${error.error?.message}`);
          }
        }

        // Update database
        await prisma.marketingCampaign.update({
          where: { id: campaign.id },
          data: { status: 'ACTIVE' },
        });

        console.log(`   ✅ تم تفعيل الحملة بنجاح على Facebook وقاعدة البيانات!`);

      } catch (error: any) {
        console.error(`   ❌ خطأ: ${error.message}`);
      }
    }

    console.log('\n\n✅ اكتمل التفعيل! افتح Facebook Ads Manager للتحقق:\n');
    console.log(`🔗 https://business.facebook.com/adsmanager/manage/campaigns?act=${process.env.FACEBOOK_AD_ACCOUNT_ID?.replace('act_', '')}\n`);

  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

activateAllPausedCampaigns();
