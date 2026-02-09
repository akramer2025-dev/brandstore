// 🧪 اختبار Bosta API - حسب التوثيق الرسمي
import 'dotenv/config';

const API_KEY = process.env.BUSTA_API_KEY;

async function testBostaOfficialAPI() {
  console.log('🧪 Testing Bosta API (Official Documentation)\n');
  
  try {
    // حسب توثيق بوسطة الرسمي - Create Delivery Simulation
    console.log('📋 Test 1: Calculate Delivery Price\n');
    
    const response = await fetch('https://api.bosta.co/pricing', {
      method: 'POST',
      headers: {
        'Authorization': API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 10, // Send
        specs: {
          packageType: "Package",
          size: "SMALL",
          packageDetails: {
            itemsCount: 1,
            description: "Test Item"
          }
        },
        dropOffAddress: {
          firstLine: "Test Address",
          city: {
            _id: "8RGlGPdGbEp8Onhyo"
          }
        },
        cod: 100
      }),
    });

    console.log('📊 Status:', response.status);
    console.log('📊 OK:', response.ok);
    
    const contentType = response.headers.get('content-type');
    console.log('📄 Content-Type:', contentType);
    console.log('');

    if (contentType?.includes('application/json')) {
      const data = await response.json();
      console.log('📦 Response:', JSON.stringify(data, null, 2));
      
      if (response.ok) {
        console.log('\n✅ SUCCESS! API Key is working!');
      } else {
        console.log('\n❌ API Error:', data.message || 'Unknown error');
      }
    } else {
      const text = await response.text();
      console.log('❌ Got non-JSON response:', text.substring(0, 300));
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }
}

testBostaOfficialAPI();
