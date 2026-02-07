import axios from 'axios';

async function testFacebookPost() {
  const PAGE_ACCESS_TOKEN = 'EAAWc2Eqq7AoBQgSdtHlZBAYJos4bOPmjqHto9FxcsDx68mILGkkhY9JZA4lZBI3ZCc8n1nZCwnkckwMZAFbtY8Aq6iZChf4GLZAMOBKwJPsDItt82yI29s4ypKTmX4DeBoNLb88IPrZBZCYKIjmka49zqtKOBRmH9ZBNZCGECEH6ZCV5lXLA4JIbael1NYBlWok1KZAyi8kVZAyHAE5nhKBDnE55OLhYzhQ72Dc5ZC238OeSYKhtZC8HdZAUkPPOiQRPGIjF64ThbgknDC5fJBcNIPHQLKQZAYlFhsYEaaC0fZAe20UZD';
  const PAGE_ID = '103042954595602';

  console.log('🔍 اختبار Token...');

  try {
    // 1. اختبار Token
    const tokenInfo = await axios.get(
      `https://graph.facebook.com/v18.0/me`,
      {
        params: { access_token: PAGE_ACCESS_TOKEN }
      }
    );
    console.log('✅ Token صالح:', tokenInfo.data);

    // 2. جلب معلومات الصفحة
    const pageInfo = await axios.get(
      `https://graph.facebook.com/v18.0/${PAGE_ID}`,
      {
        params: {
          access_token: PAGE_ACCESS_TOKEN,
          fields: 'id,name,access_token'
        }
      }
    );
    console.log('✅ معلومات الصفحة:', pageInfo.data);

    // 3. محاولة النشر
    console.log('\n🚀 محاولة النشر...');
    const postResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${PAGE_ID}/feed`,
      null,
      {
        params: {
          message: '🎉 منشور تجريبي من التطبيق!',
          access_token: PAGE_ACCESS_TOKEN
        }
      }
    );

    console.log('✅ نجح النشر!');
    console.log('Post ID:', postResponse.data.id);
    console.log('رابط المنشور:', `https://facebook.com/${postResponse.data.id}`);

  } catch (error: any) {
    console.error('\n❌ فشل:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testFacebookPost();
