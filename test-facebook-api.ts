// اختبار سريع لـ Facebook API
async function testFacebookAPI() {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;

  if (!accessToken || !adAccountId) {
    console.log('❌ Facebook credentials غير موجودة!');
    console.log('الحل: افتح /admin/facebook-settings وأدخل:');
    console.log('  • Access Token');
    console.log('  • Ad Account ID');
    console.log('  • Page ID');
    return;
  }

  console.log('✅ Facebook credentials موجودة');
  console.log(`   Ad Account: ${adAccountId}`);

  try {
    console.log('\n🔍 جاري الاتصال بـ Facebook...');
    
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${adAccountId}?fields=name,currency,account_status&access_token=${accessToken}`
    );

    if (!response.ok) {
      const error = await response.text();
      console.log('❌ فشل الاتصال بـ Facebook!');
      console.log('التفاصيل:', error);
      console.log('\n💡 الحلول:');
      console.log('  1. تأكد من Access Token صحيح');
      console.log('  2. تأكد من Ad Account ID صحيح');
      console.log('  3. جدد الـ Access Token من facebook-settings');
      return;
    }

    const data = await response.json();
    console.log('\n✅ الاتصال بـ Facebook ناجح!');
    console.log(`   اسم الحساب: ${data.name}`);
    console.log(`   العملة: ${data.currency}`);
    console.log(`   الحالة: ${data.account_status === 1 ? 'نشط 🟢' : 'غير نشط 🔴'}`);

    if (data.account_status === 1) {
      console.log('\n🎉 الحساب جاهز لإنشاء الحملات!');
      console.log('\n📝 الخطوات التالية:');
      console.log('  1. افتح: www.remostore.net/admin/media-buyer');
      console.log('  2. اختر تاب "احترافي 🚀"');
      console.log('  3. املأ 6 خطوات');
      console.log('  4. اضغط "إطلاق الحملة الآن!"');
      console.log('  5. انتظر رسالة النجاح مع Campaign ID');
    } else {
      console.log('\n⚠️ الحساب غير نشط!');
      console.log('تواصل مع Facebook Support');
    }

    // Get active campaigns
    console.log('\n🔍 جاري فحص الحملات النشطة...');
    const campaignsResponse = await fetch(
      `https://graph.facebook.com/v21.0/${adAccountId}/campaigns?fields=name,status,daily_budget,objective&limit=5&access_token=${accessToken}`
    );

    if (campaignsResponse.ok) {
      const campaignsData = await campaignsResponse.json();
      if (campaignsData.data && campaignsData.data.length > 0) {
        console.log(`\n✅ عندك ${campaignsData.data.length} حملة نشطة على Facebook:`);
        campaignsData.data.forEach((campaign: any, index: number) => {
          console.log(`\n${index + 1}. ${campaign.name}`);
          console.log(`   ID: ${campaign.id}`);
          console.log(`   الحالة: ${campaign.status}`);
          console.log(`   الهدف: ${campaign.objective}`);
          if (campaign.daily_budget) {
            console.log(`   الميزانية: ${campaign.daily_budget / 100} ج/يوم`);
          }
        });
      } else {
        console.log('\n⚠️ لا توجد حملات نشطة على Facebook');
        console.log('📝 ابدأ بإنشاء أول حملة من النظام الاحترافي!');
      }
    }

  } catch (error: any) {
    console.log('❌ خطأ:', error.message);
  }
}

testFacebookAPI();
