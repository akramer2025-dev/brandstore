// 🧪 اختبار نهائي - Bosta API مع المفتاح الجديد
import 'dotenv/config';

const API_KEY = 'aa7a6bc56bef29f049f0f1612d76be9f9fb49ed894a38ad3d2a4f76132a36a41';
const BASE_URL = 'http://app.bosta.co/api/v2';

async function testBostaFinal() {
  console.log('🎯 Final Test: Bosta API with Full Access Key\n');
  console.log('🔑 API Key:', API_KEY.substring(0, 20) + '...');
  console.log('🌐 Base URL:', BASE_URL);
  console.log('');

  try {
    // Test: Create Delivery
    console.log('📦 Creating Test Delivery...\n');
    
    const deliveryData = {
      type: 10, // Send
      specs: {
        packageType: 'Package',
        size: 'SMALL',
        packageDetails: {
          itemsCount: 1,
          description: 'ملابس - اختبار نهائي',
        },
      },
      dropOffAddress: {
        firstLine: '15 شارع الجمهورية، الدور الثالث',
        city: {
          _id: '8RGlGPdGbEp8Onhyo', // Cairo
        },
        zone: '',
      },
      receiver: {
        firstName: 'أحمد محمد',
        phone: '01000000001',
        email: 'test@remostore.net',
      },
      cod: 150, // Cash on Delivery
      allowToOpenPackage: true,
      businessReference: 'REMOSTORE_TEST_001',
      notes: 'طلب تجريبي - فحص المنتج قبل الدفع',
    };

    const response = await fetch(`${BASE_URL}/deliveries`, {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(deliveryData),
    });

    console.log('📊 HTTP Status:', response.status);
    console.log('📊 Status OK:', response.ok);
    console.log('');

    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ ✅ ✅ SUCCESS! Delivery Created! ✅ ✅ ✅\n');
        console.log('📦 Shipment Details:');
        console.log('   - Shipment ID:', result.data?._id || 'N/A');
        console.log('   - Tracking Number:', result.data?.trackingNumber || 'N/A');
        console.log('   - Status:', result.data?.state || 'N/A');
        console.log('   - Business Reference:', result.data?.businessReference || 'N/A');
        console.log('');
        console.log('🔗 Tracking URL:');
        console.log('   https://bosta.co/tracking/' + (result.data?.trackingNumber || 'N/A'));
        console.log('');
        console.log('🎉 Bosta Integration is READY FOR PRODUCTION! 🎉');
      } else {
        console.log('❌ Error Response:');
        console.log(JSON.stringify(result, null, 2));
      }
    } else {
      const text = await response.text();
      console.log('❌ Non-JSON Response:');
      console.log(text.substring(0, 500));
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }
}

testBostaFinal();
