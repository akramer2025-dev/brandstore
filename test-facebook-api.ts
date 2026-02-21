import dotenv from 'dotenv';

dotenv.config();

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
const adAccountId = process.env.FACEBOOK_AD_ACCOUNT;

async function testFacebookAPI() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 اختبار Facebook API Access Token');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (!accessToken) {
    console.log('❌ FACEBOOK_ACCESS_TOKEN غير موجود في .env\n');
    return;
  }

  console.log('🔑 Token موجود:', accessToken.substring(0, 30) + '...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test 1: User Info
  console.log('📝 Test 1: معلومات المستخدم...\n');
  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/me?access_token=${accessToken}`
    );
    const data = await response.json();

    if (data.error) {
      console.log('❌ فشل:', data.error.message);
      console.log('   الكود:', data.error.code);
      console.log('   النوع:', data.error.type);
      
      if (data.error.code === 190) {
        console.log('\n💡 الحل: الـ Token منتهي أو غير صحيح');
        console.log('   قم بتشغيل: npx tsx renew-facebook-token.ts\n');
      }
      return;
    }

    console.log('✅ نجح! المستخدم:', data.name || data.id);
  } catch (error: any) {
    console.log('❌ خطأ في الاتصال:', error.message);
    return;
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test 2: Token Info
  console.log('📝 Test 2: معلومات الـ Token...\n');
  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/debug_token?input_token=${accessToken}&access_token=${accessToken}`
    );
    const data = await response.json();

    if (data.data) {
      const tokenInfo = data.data;
      console.log('✅ معلومات الـ Token:');
      console.log(`   App ID: ${tokenInfo.app_id}`);
      console.log(`   نوع Token: ${tokenInfo.type}`);
      console.log(`   صالح: ${tokenInfo.is_valid ? 'نعم ✅' : 'لا ❌'}`);
      
      if (tokenInfo.expires_at) {
        const expiryDate = new Date(tokenInfo.expires_at * 1000);
        const daysLeft = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        console.log(`   تاريخ الانتهاء: ${expiryDate.toLocaleDateString('ar-EG')}`);
        console.log(`   الوقت المتبقي: ${daysLeft} يوم`);
        
        if (daysLeft < 7) {
          console.log('\n   ⚠️ تحذير: الـ Token سينتهي قريباً! جدده الآن');
        }
      } else {
        console.log('   تاريخ الانتهاء: لا ينتهي ♾️');
      }
      
      console.log('\n   الصلاحيات:');
      if (tokenInfo.scopes && tokenInfo.scopes.length > 0) {
        tokenInfo.scopes.forEach((scope: string) => {
          console.log(`     - ${scope}`);
        });
      }
    }
  } catch (error: any) {
    console.log('❌ لا يمكن الحصول على معلومات الـ Token:', error.message);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test 3: Ad Account
  if (adAccountId) {
    console.log('📝 Test 3: Ad Account...\n');
    try {
      const response = await fetch(
        `https://graph.facebook.com/v21.0/${adAccountId}?fields=name,account_status,amount_spent,balance,currency&access_token=${accessToken}`
      );
      const data = await response.json();

      if (data.error) {
        console.log('❌ فشل:', data.error.message);
      } else {
        console.log('✅ معلومات Ad Account:');
        console.log(`   الاسم: ${data.name}`);
        console.log(`   ID: ${data.id}`);
        
        const statusMap: any = {
          1: 'نشط ✅',
          2: 'معطل',
          3: 'غير مطابق للشروط',
          7: 'معلق',
          8: 'غير محدد',
          9: 'مغلق',
          101: 'مغلق بسبب مخالفة',
        };
        
        console.log(`   الحالة: ${statusMap[data.account_status] || data.account_status}`);
        console.log(`   العملة: ${data.currency}`);
        console.log(`   المبلغ المنفق: ${(parseFloat(data.amount_spent) / 100).toFixed(2)} ${data.currency}`);
      }
    } catch (error: any) {
      console.log('❌ خطأ:', error.message);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test 4: Campaigns
    console.log('📝 Test 4: الحملات الإعلانية...\n');
    try {
      const response = await fetch(
        `https://graph.facebook.com/v21.0/${adAccountId}/campaigns?fields=name,status,effective_status,objective&limit=5&access_token=${accessToken}`
      );
      const data = await response.json();

      if (data.error) {
        console.log('❌ فشل:', data.error.message);
      } else if (data.data && data.data.length > 0) {
        console.log(`✅ تم العثور على ${data.data.length} حملة:\n`);
        
        data.data.forEach((campaign: any, index: number) => {
          console.log(`${index + 1}. ${campaign.name}`);
          console.log(`   ID: ${campaign.id}`);
          console.log(`   الهدف: ${campaign.objective}`);
          console.log(`   حالة الإعداد: ${campaign.status}`);
          console.log(`   الحالة الفعلية: ${campaign.effective_status}`);
          console.log('');
        });

        console.log(`📊 إجمالي الحملات: ${data.data.length}`);
        if (data.paging && data.paging.next) {
          console.log('   (يوجد المزيد من الحملات...)');
        }
      } else {
        console.log('📭 لا توجد حملات إعلانية بعد');
      }
    } catch (error: any) {
      console.log('❌ خطأ:', error.message);
    }
  } else {
    console.log('⚠️ FACEBOOK_AD_ACCOUNT غير موجود في .env - تخطي اختبار Ad Account\n');
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ انتهى الاختبار!');
  console.log('═══════════════════════════════════════════════════════════\n');
}
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
