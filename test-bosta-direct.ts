// اختبار Bosta API مباشرة
require('dotenv').config();
const fetch = require('node-fetch');

async function testBostaAPI() {
  try {
    console.log('\n=== 🚚 اختبار Bosta API ===\n');
    
    const apiKey = process.env.BUSTA_API_KEY;
    const apiUrl = process.env.BUSTA_API_URL || 'https://api.bosta.co/v1';
    
    console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : '❌ مفقود');
    console.log('🌐 API URL:', apiUrl);
    console.log('');
    
    if (!apiKey) {
      console.error('❌ BUSTA_API_KEY مفقود في .env');
      return;
    }
    
    // Test data
    const testDelivery = {
      type: 10, // Delivery Type (10 = Send)
      specs: {
        packageType: 'Package',
        size: 'SMALL',
        packageDetails: {
          itemsCount: 1,
          description: 'ملابس - اختبار',
        },
      },
      dropOffAddress: {
        firstLine: '15 شارع التحرير، الدور الثالث، شقة 5، مدينة نصر',
        city: {
          name: 'القاهرة',
        },
        zone: '',
      },
      receiver: {
        firstName: 'ندى',
        phone: '01000000002',
        email: 'nada@test.com',
      },
      cod: 27, // Cash on Delivery amount
      allowToOpenPackage: true,
      businessReference: 'TEST_ORDER_123',
      notes: 'طلب تجريبي - فحص المنتج قبل الدفع',
    };
    
    console.log('📦 إرسال طلب لـ Bosta API...\n');
    console.log('📍 البيانات:', JSON.stringify(testDelivery, null, 2));
    console.log('');
    
    const response = await fetch(`${apiUrl}/deliveries`, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testDelivery),
    });
    
    console.log('📊 HTTP Status:', response.status);
    console.log('📋 Headers:', JSON.stringify([...response.headers.entries()], null, 2));
    
    const contentType = response.headers.get('content-type');
    console.log('📄 Content-Type:', contentType);
    console.log('');
    
    let result;
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
      console.log('📋 Response:', JSON.stringify(result, null, 2));
    } else {
      const text = await response.text();
      console.log('📋 Response (text):', text.substring(0, 500));
    }
    console.log('');
    
    if (!response.ok) {
      console.error('❌ فشل الطلب!');
      console.error('💬 الرسالة:', result.message || 'غير معروفة');
      if (result.errors) {
        console.error('🔍 التفاصيل:', JSON.stringify(result.errors, null, 2));
      }
    } else {
      console.log('✅ نجح الطلب!');
      console.log('🆔 Shipment ID:', result._id);
      console.log('📦 Tracking Number:', result.trackingNumber);
      console.log('🔗 Tracking URL:', `https://bosta.co/tracking/${result.trackingNumber}`);
    }
    
  } catch (error) {
    console.error('\n❌ خطأ في الاتصال:', error.message);
    console.error('📄 التفاصيل:', error);
  }
}

testBostaAPI();
