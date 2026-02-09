// 🧪 اختبار Bosta API v2 - الإصدار الصحيح
import 'dotenv/config';

const API_KEY = process.env.BUSTA_API_KEY;
const BASE_URL = 'http://app.bosta.co/api/v2';

async function testBostaV2() {
  console.log('🧪 Testing Bosta API v2\n');
  console.log('🔑 API Key:', API_KEY?.substring(0, 20) + '...');
  console.log('🌐 Base URL:', BASE_URL);
  console.log('');

  try {
    // Test 1: List Cities
    console.log('📋 Test 1: List Cities\n');
    
    const response = await fetch(`${BASE_URL}/cities`, {
      method: 'GET',
      headers: {
        'Authorization': API_KEY!,
        'Accept': 'application/json',
      },
    });

    console.log('📊 Status:', response.status);
    console.log('📊 OK:', response.ok);
    console.log('');

    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! API Connection Working!');
      console.log('📦 Data:', JSON.stringify(data, null, 2).substring(0, 500));
    } else {
      const text = await response.text();
      console.log('❌ Error Response:', text.substring(0, 300));
    }

  } catch (error: any) {
    console.error('\n❌ Connection Error:', error.message);
  }
}

testBostaV2();
