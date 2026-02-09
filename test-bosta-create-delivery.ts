// 🧪 اختبار إنشاء شحنة تجريبية مع Bosta
import 'dotenv/config';

const API_KEY = process.env.BUSTA_API_KEY;
const BASE_URL = 'http://app.bosta.co/api/v2';

async function testCreateDelivery() {
  console.log('🧪 Test: Create Bosta Delivery\n');
  console.log('🔑 API Key:', API_KEY?.substring(0, 20) + '...');
  console.log('🌐 Base URL:', BASE_URL);
  console.log('');

  try {
    // بيانات شحنة تجريبية
    const deliveryData = {
      type: 10, // Send
      specs: {
        packageType: 'Package',
        size: 'SMALL',
        packageDetails: {
          itemsCount: 1,
          description: 'ملابس - اختبار',
        },
      },
      dropOffAddress: {
        firstLine: '15 شارع الجمهورية، الدور الثالث',
        city: {
          _id: '8RGlGPdGbEp8Onhyo', // Cairo ID من الـ cities list
        },
        zone: '',
      },
      receiver: {
        firstName: 'أحمد محمد',
        phone: '01000000001',
        email: 'test@example.com',
      },
      cod: 150, // المبلغ المطلوب تحصيله
      allowToOpenPackage: true,
      businessReference: 'TEST_ORDER_123',
      notes: 'طلب تجريبي - فحص المنتج قبل الدفع',
    };

    console.log('📦 Sending delivery request...\n');
    
    const response = await fetch(`${BASE_URL}/deliveries`, {
      method: 'POST',
      headers: {
        'Authorization': API_KEY!,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(deliveryData),
    });

    console.log('📊 Status:', response.status);
    console.log('📊 OK:', response.ok);
    console.log('');

    if (response.ok) {
      const result = await response.json();
      console.log('✅ SUCCESS! Delivery Created!');
      console.log('\n📦 Delivery Info:');
      console.log('  - Shipment ID:', result.data?._id || 'N/A');
      console.log('  - Tracking Number:', result.data?.trackingNumber || 'N/A');
      console.log('  - Status:', result.data?.state || 'N/A');
      console.log('  - Tracking URL:', `https://bosta.co/tracking/${result.data?.trackingNumber}`);
      console.log('\n📦 Full Response:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      const error = await response.json();
      console.log('❌ Error Creating Delivery:');
      console.log(JSON.stringify(error, null, 2));
    }

  } catch (error: any) {
    console.error('\n❌ Connection Error:', error.message);
  }
}

testCreateDelivery();
