// 🧪 اختبار بسيط - Bosta API
import 'dotenv/config';

const API_KEY = process.env.BUSTA_API_KEY;
const BASE_URL = 'https://api.bosta.co/v1';

async function testBostaAPI() {
  console.log('🧪 Testing Bosta API Connection\n');
  console.log('🔑 API Key:', API_KEY?.substring(0, 20) + '...\n');

  try {
    // Test 1: Get Cities (أبسط request)
    console.log('📋 Fetching available cities...\n');
    
    const response = await fetch(`${BASE_URL}/cities`, {
      method: 'GET',
      headers: {
        'Authorization': API_KEY!,
        'Accept': 'application/json',
      },
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response OK:', response.ok);
    
    const contentType = response.headers.get('content-type');
    console.log('📄 Content-Type:', contentType);
    console.log('');

    if (contentType?.includes('application/json')) {
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ SUCCESS! API Key is working!');
        console.log(`✅ Found ${data.length || 0} cities`);
        
        if (Array.isArray(data) && data.length > 0) {
          console.log('\n📍 First 5 cities:');
          data.slice(0, 5).forEach((city: any) => {
            console.log(`  - ${city.name || city}`);
          });
        }
      } else {
        console.log('❌ API Error:', data.message || data);
      }
    } else {
      const text = await response.text();
      console.log('❌ ERROR: Got HTML instead of JSON');
      console.log('Response preview:', text.substring(0, 200));
    }

  } catch (error: any) {
    console.error('\n❌ Connection Error:', error.message);
  }
}

testBostaAPI();
