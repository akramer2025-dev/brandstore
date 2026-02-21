import dotenv from 'dotenv';
import { createInterface } from 'readline';

dotenv.config();

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function renewFacebookToken() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔑 أداة تجديد Facebook Access Token تلقائياً');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📋 ملاحظة: هذه الأداة ستحول Short-Lived Token إلى Long-Lived (60 يوم)\n');

  // Check if credentials exist
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  console.log('🔍 جاري التحقق من البيانات في .env...\n');

  if (!appId || !appSecret) {
    console.log('❌ بيانات التطبيق مفقودة!\n');
    console.log('💡 يرجى إضافة في ملف .env:\n');
    console.log('FACEBOOK_APP_ID=your_app_id');
    console.log('FACEBOOK_APP_SECRET=your_app_secret\n');
    console.log('🔗 احصل عليهم من: https://developers.facebook.com/apps/\n');
    rl.close();
    return;
  }

  console.log('✅ App ID: ' + appId);
  console.log('✅ App Secret: ' + appSecret.substring(0, 10) + '...\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📝 الخطوات:\n');
  console.log('1. افتح: https://developers.facebook.com/tools/explorer/');
  console.log('2. اختر تطبيقك من القائمة');
  console.log('3. اضغط "Generate Access Token"');
  console.log('4. اختر الصلاحيات:');
  console.log('   - ads_management');
  console.log('   - ads_read');
  console.log('   - business_management');
  console.log('   - pages_read_engagement');
  console.log('   - catalog_management');
  console.log('5. انسخ الـ Token\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const shortToken = await question('📥 الصق الـ Short-Lived Token هنا: ');

  if (!shortToken || shortToken.trim().length < 50) {
    console.log('\n❌ الـ Token غير صحيح!\n');
    rl.close();
    return;
  }

  console.log('\n🔄 جاري تحويل الـ Token...\n');

  try {
    const url = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken.trim()}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.log('❌ خطأ:', data.error.message);
      
      if (data.error.message.includes('Invalid')) {
        console.log('\n💡 تأكد من:');
        console.log('  - الـ Token صحيح ومن نفس التطبيق');
        console.log('  - App ID و App Secret صحيحين في .env');
      }
      
      rl.close();
      return;
    }

    if (!data.access_token) {
      console.log('❌ لم يتم الحصول على Token جديد');
      console.log('الاستجابة:', data);
      rl.close();
      return;
    }

    const longLivedToken = data.access_token;
    const expiresIn = data.expires_in;

    console.log('\n✅ تم التحويل بنجاح!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔑 Long-Lived Access Token (60 يوم):\n');
    console.log(longLivedToken);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`⏰ صلاحية الـ Token: ${Math.floor(expiresIn / 86400)} يوم تقريباً\n`);

    console.log('📝 الخطوات التالية:\n');
    console.log('1. افتح ملف .env');
    console.log('2. ابحث عن FACEBOOK_ACCESS_TOKEN=');
    console.log('3. استبدله بالـ Token الجديد أعلاه');
    console.log('4. احفظ الملف');
    console.log('5. أعد تشغيل السيرفر: npm run dev\n');

    console.log('🧪 اختبر الـ Token الآن:\n');
    console.log('npx tsx test-facebook-api.ts\n');

    // Test the new token
    console.log('🔍 جاري اختبار الـ Token الجديد...\n');

    const testUrl = `https://graph.facebook.com/v21.0/me?access_token=${longLivedToken}`;
    const testResponse = await fetch(testUrl);
    const testData = await testResponse.json();

    if (testData.error) {
      console.log('⚠️ تحذير: الـ Token لا يعمل:', testData.error.message);
    } else {
      console.log('✅ الـ Token يعمل بنجاح!');
      console.log(`   المستخدم: ${testData.name || testData.id}\n`);
    }

    // Try to get ad account info
    const adAccountId = process.env.FACEBOOK_AD_ACCOUNT;
    if (adAccountId) {
      console.log(`🔍 جاري التحقق من Ad Account (${adAccountId})...\n`);
      
      const adAccountUrl = `https://graph.facebook.com/v21.0/${adAccountId}?fields=name,account_status,amount_spent,balance&access_token=${longLivedToken}`;
      const adAccountResponse = await fetch(adAccountUrl);
      const adAccountData = await adAccountResponse.json();

      if (adAccountData.error) {
        console.log('⚠️ لا يمكن الوصول للـ Ad Account:', adAccountData.error.message);
      } else {
        console.log('✅ Ad Account يعمل بنجاح!');
        console.log(`   الاسم: ${adAccountData.name}`);
        console.log(`   الحالة: ${adAccountData.account_status === 1 ? 'نشط ✅' : 'غير نشط ❌'}\n`);
      }
    }

  } catch (error: any) {
    console.log('\n❌ خطأ:', error.message);
  } finally {
    rl.close();
  }
}

renewFacebookToken();
