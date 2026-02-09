// 🧪 اختبار الاتصال مع Bosta API
// Run: npx ts-node test-bosta-connection.ts

const API_KEY = 'aa7a6bc56bef29f049f0f1612d76be9f9fb49ed894a38ad3d2a4f76132a36a41';
const BASE_URL = 'http://app.bosta.co/api/v2';

async function testBostaConnection() {
  console.log('🧪 ========================================');
  console.log('🧪 Testing Bosta API Connection');
  console.log('🧪 ========================================\n');

  // Test 1: حساب تكلفة الشحن (Pricing)
  console.log('📋 Test 1: Calculate Delivery Fee\n');
  try {
    const response = await fetch(`${BASE_URL}/pricing`, {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        city: 'Cairo',
        type: 10, // Send
        cod: 200, // Cash on Delivery amount
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Test 1 PASSED - Connection Successful!');
      console.log('📦 Delivery Fee Details:');
      console.log(JSON.stringify(result, null, 2));
      console.log('');
    } else {
      console.log('❌ Test 1 FAILED');
      console.log('Error:', result);
      console.log('');
    }
  } catch (error: any) {
    console.log('❌ Test 1 FAILED');
    console.log('Error:', error.message);
    console.log('');
  }

  // Test 2: الحصول على المدن المتاحة (Cities)
  console.log('📋 Test 2: Get Available Cities\n');
  try {
    const response = await fetch(`${BASE_URL}/cities`, {
      method: 'GET',
      headers: {
        'Authorization': API_KEY,
        'Accept': 'application/json',
      },
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Test 2 PASSED');
      console.log('📦 Available Cities:', result.length || 'N/A');
      if (result.length > 0) {
        console.log('First 5 cities:', result.slice(0, 5).map((c: any) => c.name));
      }
      console.log('');
    } else {
      console.log('❌ Test 2 FAILED');
      console.log('Error:', result);
      console.log('');
    }
  } catch (error: any) {
    console.log('❌ Test 2 FAILED');
    console.log('Error:', error.message);
    console.log('');
  }

  // Test 3: التحقق من API Key
  console.log('📋 Test 3: Validate API Key\n');
  try {
    // نجرب endpoint بسيط للتحقق
    const response = await fetch(`${BASE_URL}/deliveries?pageSize=1`, {
      method: 'GET',
      headers: {
        'Authorization': API_KEY,
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      console.log('✅ Test 3 PASSED - API Key is Valid!');
      console.log('');
    } else {
      console.log('❌ Test 3 FAILED - API Key might be invalid');
      const result = await response.json();
      console.log('Error:', result);
      console.log('');
    }
  } catch (error: any) {
    console.log('❌ Test 3 FAILED');
    console.log('Error:', error.message);
    console.log('');
  }

  console.log('🧪 ========================================');
  console.log('🧪 Tests Completed!');
  console.log('🧪 ========================================\n');

  console.log('📝 Next Steps:');
  console.log('1. ✅ إذا نجحت الاختبارات، API Key شغال!');
  console.log('2. ✅ اقرأ https://api-docs.bosta.co/');
  console.log('3. ✅ أضف Webhook URL في لوحة تحكم بوسطة');
  console.log('4. ✅ جرب إنشاء شحنة تجريبية');
  console.log('');
}

// تشغيل الاختبارات
testBostaConnection().catch(console.error);
