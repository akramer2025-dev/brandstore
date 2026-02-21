import dotenv from 'dotenv';

dotenv.config();

async function checkFacebookCampaignsStatus() {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const adAccountId = process.env.FACEBOOK_AD_ACCOUNT;

  if (!accessToken || !adAccountId) {
    console.error('❌ Facebook credentials missing');
    return;
  }

  console.log('\n🔍 جاري فحص حالة الحملات على Facebook...\n');

  try {
    // Get all campaigns
    const campaignsUrl = `https://graph.facebook.com/v21.0/${adAccountId}/campaigns?fields=id,name,status,effective_status,configured_status,objective,buying_type,daily_budget,created_time&limit=10&access_token=${accessToken}`;
    
    const response = await fetch(campaignsUrl);
    const data = await response.json();

    if (data.error) {
      console.error('❌ خطأ من Facebook:', data.error.message);
      return;
    }

    if (!data.data || data.data.length === 0) {
      console.log('⚠️ لا توجد حملات على Facebook');
      return;
    }

    console.log(`📊 عدد الحملات: ${data.data.length}\n`);

    for (const campaign of data.data) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📌 الحملة: ${campaign.name}`);
      console.log(`   ID: ${campaign.id}`);
      console.log(`   الحالة المُكونة: ${campaign.configured_status}`);
      console.log(`   الحالة الفعلية: ${campaign.effective_status}`);
      console.log(`   الهدف: ${campaign.objective}`);
      
      if (campaign.daily_budget) {
        console.log(`   الميزانية اليومية: ${campaign.daily_budget / 100} ج.م`);
      }

      // Status explanations
      if (campaign.effective_status !== 'ACTIVE') {
        console.log(`\n   ⚠️ الحالة الفعلية: ${campaign.effective_status}`);
        
        if (campaign.effective_status === 'PAUSED') {
          console.log(`   💡 الحل: الحملة متوقفة، قم بتفعيلها من Ads Manager`);
        } else if (campaign.effective_status === 'CAMPAIGN_PAUSED') {
          console.log(`   💡 الحل: الحملة متوقفة على مستوى Campaign`);
        } else if (campaign.effective_status === 'ADSET_PAUSED') {
          console.log(`   💡 الحل: AdSet متوقف، فعّل الـ AdSet`);
        } else if (campaign.effective_status === 'IN_PROCESS') {
          console.log(`   💡 الحملة قيد المراجعة من Facebook (انتظر 5-30 دقيقة)`);
        } else if (campaign.effective_status === 'PENDING_REVIEW') {
          console.log(`   💡 الإعلان ينتظر مراجعة Facebook (عادةً 24 ساعة)`);
        } else if (campaign.effective_status === 'DISAPPROVED') {
          console.log(`   ❌ الإعلان مرفوض من Facebook - راجع سياسات الإعلانات`);
        }
      } else {
        console.log(`   ✅ الحملة نشطة!`);
      }

      // Get AdSets for this campaign
      const adSetsUrl = `https://graph.facebook.com/v21.0/${campaign.id}/adsets?fields=id,name,status,effective_status,daily_budget&access_token=${accessToken}`;
      const adSetsResponse = await fetch(adSetsUrl);
      const adSetsData = await adSetsResponse.json();

      if (adSetsData.data && adSetsData.data.length > 0) {
        console.log(`\n   📁 AdSets (${adSetsData.data.length}):`);
        for (const adset of adSetsData.data) {
          console.log(`      • ${adset.name}`);
          console.log(`        Status: ${adset.status} | Effective: ${adset.effective_status}`);
          if (adset.daily_budget) {
            console.log(`        Budget: ${adset.daily_budget / 100} ج.م/يوم`);
          }
        }
      }

      // Get Ads for this campaign
      const adsUrl = `https://graph.facebook.com/v21.0/${campaign.id}/ads?fields=id,name,status,effective_status,creative{id}&access_token=${accessToken}`;
      const adsResponse = await fetch(adsUrl);
      const adsData = await adsResponse.json();

      if (adsData.data && adsData.data.length > 0) {
        console.log(`\n   🎯 Ads (${adsData.data.length}):`);
        for (const ad of adsData.data) {
          console.log(`      • ${ad.name}`);
          console.log(`        Status: ${ad.status} | Effective: ${ad.effective_status}`);
          if (ad.creative) {
            console.log(`        Creative ID: ${ad.creative.id}`);
          }
        }
      }
    }

    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔗 افتح Ads Manager للتفاصيل الكاملة:');
    console.log(`   https://business.facebook.com/adsmanager/manage/campaigns?act=${adAccountId.replace('act_', '')}\n`);

  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
  }
}

checkFacebookCampaignsStatus();
