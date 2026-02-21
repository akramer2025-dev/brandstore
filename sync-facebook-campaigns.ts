import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function syncFacebookCampaigns() {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const adAccountId = process.env.FACEBOOK_AD_ACCOUNT;

  if (!accessToken || !adAccountId) {
    console.error('❌ Facebook credentials مفقودة في .env');
    return;
  }

  console.log('\n🔄 جاري مزامنة الحملات من Facebook...\n');

  try {
    // Get all campaigns from Facebook
    const campaignsUrl = `https://graph.facebook.com/v21.0/${adAccountId}/campaigns?fields=id,name,status,effective_status,objective,daily_budget,lifetime_budget,created_time,updated_time&limit=50&access_token=${accessToken}`;
    
    const response = await fetch(campaignsUrl);
    const data = await response.json();

    if (data.error) {
      console.error('❌ خطأ من Facebook:', data.error.message);
      
      if (data.error.message.includes('expired')) {
        console.log('\n💡 الحل: جدد Facebook Access Token من:');
        console.log('   https://developers.facebook.com/tools/explorer/\n');
      }
      return;
    }

    if (!data.data || data.data.length === 0) {
      console.log('⚠️ لا توجد حملات على Facebook');
      return;
    }

    console.log(`📊 عدد الحملات على Facebook: ${data.data.length}\n`);

    let imported = 0;
    let updated = 0;
    let skipped = 0;

    for (const fbCampaign of data.data) {
      console.log(`\n📌 معالجة: ${fbCampaign.name}`);
      console.log(`   Facebook ID: ${fbCampaign.id}`);
      console.log(`   الحالة: ${fbCampaign.effective_status}`);

      // Get AdSets and Ads for this campaign
      const adSetsUrl = `https://graph.facebook.com/v21.0/${fbCampaign.id}/adsets?fields=id,name,daily_budget&limit=1&access_token=${accessToken}`;
      const adSetsResponse = await fetch(adSetsUrl);
      const adSetsData = await adSetsResponse.json();
      
      const firstAdSet = adSetsData.data?.[0];
      const adSetId = firstAdSet?.id || null;
      const budget = firstAdSet?.daily_budget ? firstAdSet.daily_budget / 100 : 50;

      const adsUrl = `https://graph.facebook.com/v21.0/${fbCampaign.id}/ads?fields=id,name&limit=1&access_token=${accessToken}`;
      const adsResponse = await fetch(adsUrl);
      const adsData = await adsResponse.json();
      
      const firstAd = adsData.data?.[0];
      const adId = firstAd?.id || null;

      // Check if campaign exists in database
      const existing = await prisma.marketingCampaign.findFirst({
        where: { facebookCampaignId: fbCampaign.id }
      });

      const status = fbCampaign.effective_status === 'ACTIVE' ? 'ACTIVE' : 
                     fbCampaign.effective_status === 'PAUSED' ? 'PAUSED' : 'DRAFT';

      if (existing) {
        // Update existing campaign
        await prisma.marketingCampaign.update({
          where: { id: existing.id },
          data: {
            name: fbCampaign.name,
            status: status,
            budget: budget,
            facebookAdSetId: adSetId || existing.facebookAdSetId,
            facebookAdId: adId || existing.facebookAdId,
          }
        });
        console.log(`   ✅ تم التحديث في قاعدة البيانات`);
        updated++;
      } else {
        // Import new campaign
        try {
          await prisma.marketingCampaign.create({
            data: {
              name: fbCampaign.name,
              type: 'FACEBOOK_ADS',
              platform: 'FACEBOOK',
              budget: budget,
              status: status,
              targetAudience: 'مصر، 18-65 سنة',
              adCopy: `حملة مستوردة من Facebook - ${fbCampaign.name}`,
              startDate: new Date(fbCampaign.created_time),
              facebookCampaignId: fbCampaign.id,
              facebookAdSetId: adSetId,
              facebookAdId: adId,
              notes: `Imported from Facebook Ads Manager on ${new Date().toLocaleDateString('ar-EG')}`,
            }
          });
          console.log(`   ✅ تم الاستيراد إلى قاعدة البيانات`);
          imported++;
        } catch (error: any) {
          console.log(`   ⚠️ تخطي: ${error.message}`);
          skipped++;
        }
      }
    }

    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ اكتملت المزامنة!\n');
    console.log(`📊 الإحصائيات:`);
    console.log(`   • تم الاستيراد: ${imported} حملة جديدة`);
    console.log(`   • تم التحديث: ${updated} حملة موجودة`);
    console.log(`   • تم التخطي: ${skipped} حملة`);
    console.log(`   • الإجمالي: ${data.data.length} حملة\n`);

    // Show all campaigns from database
    const allCampaigns = await prisma.marketingCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`\n📋 آخر 10 حملات في قاعدة البيانات:`);
    allCampaigns.forEach((c, i) => {
      console.log(`\n${i + 1}. ${c.name}`);
      console.log(`   الحالة: ${c.status}`);
      console.log(`   الميزانية: ${c.budget} ج.م`);
      if (c.facebookCampaignId) {
        console.log(`   Facebook: https://business.facebook.com/adsmanager/manage/campaigns?act=${adAccountId.replace('act_', '')}&selected_campaign_ids=${c.facebookCampaignId}`);
      }
    });

  } catch (error: any) {
    console.error('\n❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

syncFacebookCampaigns();
