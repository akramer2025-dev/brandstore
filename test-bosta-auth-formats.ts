// 🧪 اختبار Authorization Formats المختلفة
import 'dotenv/config';

const API_KEY = process.env.BUSTA_API_KEY;
const BASE_URL = 'http://app.bosta.co/api/v2';

async function testDifferentAuthFormats() {
  console.log('🧪 Testing Different Authorization Formats\n');

  const formats = [
    { name: 'Direct Key', value: API_KEY },
    { name: 'Bearer Token', value: `Bearer ${API_KEY}` },
    { name: 'Token Prefix', value: `Token ${API_KEY}` },
    { name: 'ApiKey Prefix', value: `ApiKey ${API_KEY}` },
  ];

  for (const format of formats) {
    console.log(`📋 Testing: ${format.name}`);
    console.log(`   Value: ${format.value?.substring(0, 30)}...`);
    
    try {
      const response = await fetch(`${BASE_URL}/cities`, {
        method: 'GET',
        headers: {
          'Authorization': format.value!,
          'Accept': 'application/json',
        },
      });

      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        console.log(`   ✅ SUCCESS with ${format.name}!`);
        const data = await response.json();
        console.log(`   📦 Got ${data.data?.list?.length || 0} cities`);
        
        // If successful, test create delivery
        console.log(`\n📦 Now testing Create Delivery with ${format.name}...\n`);
        await testCreateWithFormat(format.value!);
        break;
      } else {
        const error = await response.json();
        console.log(`   ❌ Failed: ${error.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }
}

async function testCreateWithFormat(authValue: string) {
  try {
    const deliveryData = {
      type: 10,
      specs: {
        packageType: 'Package',
        size: 'SMALL',
        packageDetails: {
          itemsCount: 1,
          description: 'Test',
        },
      },
      dropOffAddress: {
        firstLine: '15 Test Street',
        city: {
          _id: '8RGlGPdGbEp8Onhyo',
        },
      },
      receiver: {
        firstName: 'Test User',
        phone: '01000000001',
      },
      cod: 100,
      allowToOpenPackage: true,
      businessReference: 'TEST_123',
    };

    const response = await fetch(`${BASE_URL}/deliveries`, {
      method: 'POST',
      headers: {
        'Authorization': authValue,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(deliveryData),
    });

    console.log('   Create Delivery Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('   ✅ Delivery Created Successfully!');
      console.log('   📦 Shipment ID:', result.data?._id);
    } else {
      const error = await response.json();
      console.log('   ❌ Create Failed:', error.message);
    }
  } catch (error: any) {
    console.log('   ❌ Error:', error.message);
  }
}

testDifferentAuthFormats();
