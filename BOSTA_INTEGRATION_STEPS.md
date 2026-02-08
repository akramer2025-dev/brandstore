# 🚚 خطوات التكامل مع شركة بوسطة - Bosta Integration

## ✅ ما تم حتى الآن

- [x] الحصول على API Key من بوسطة ✅
- [x] إضافة API Key في ملف `.env` ✅
- [x] تجهيز الكود الأساسي ✅

---

## 🔑 API Key الخاص بك

```
e4811f5cd1477c9d386f173921215b0cd3e81caa6deee89ff41e4d1390186ced
```

✅ **تم إضافته في ملف `.env`**

---

## 📚 معلومات شركة بوسطة

### API Documentation
```
الرابط: https://api-docs.bosta.co/
Base URL: https://api.bosta.co/v1
Authentication: API Key (في الـ Headers)
```

### Headers المطلوبة
```http
Authorization: YOUR_API_KEY
Content-Type: application/json
Accept: application/json
```

---

## 🔧 الخطوات التالية

### الخطوة 1️⃣: قراءة Documentation بوسطة ✅

**مهم:** اقرأ التوثيق الرسمي من بوسطة:
- https://api-docs.bosta.co/

**أهم الـ Endpoints:**
1. **إنشاء شحنة جديدة** (Create Delivery)
2. **تتبع الشحنة** (Track Delivery)
3. **حساب تكلفة الشحن** (Calculate Pricing)
4. **إلغاء الشحنة** (Cancel Delivery)

---

### الخطوة 2️⃣: إعداد Webhook

من الصورة اللي أرسلتها، في قسم **"إضافة رابط الـ Webhook"**

#### ما هو الـ Webhook؟
- بوسطة يبعتلك تحديثات تلقائية عن حالة الشحنة
- مثلاً: تم الاستلام، في الطريق، تم التسليم، إلخ.

#### خطوات إعداد الـ Webhook:

1. **أولاً: أنشئ Webhook Endpoint في نظامك**
   ```
   URL: https://your-domain.com/api/webhooks/bosta
   ```

2. **ثانياً: اذهب للوحة تحكم بوسطة**
   - اضغط على "إضافة رابط الـ Webhook"
   - ضع URL: `https://your-domain.com/api/webhooks/bosta`
   - احفظ

3. **ثالثاً: بوسطة هيبعتلك Webhook Secret**
   - استخدمه للتحقق من صحة الـ Webhooks
   - ضعه في `.env`:
   ```env
   BUSTA_WEBHOOK_SECRET="SECRET_FROM_BOSTA"
   ```

---

### الخطوة 3️⃣: إنشاء Webhook Endpoint

أنشئ ملف: `src/app/api/webhooks/bosta/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log('📦 Bosta Webhook Received:', body);

    // استخرج البيانات من الـ Webhook
    const {
      _id,              // Bosta Shipment ID
      trackingNumber,   // رقم التتبع
      state,            // حالة الشحنة
      deliveryStatus,   // تفاصيل الحالة
      orderReference,   // رقم طلبك (Order ID)
    } = body;

    // ابحث عن الطلب في قاعدة البيانات
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderReference },
          { bustaShipmentId: _id },
          { orderNumber: trackingNumber },
        ],
      },
    });

    if (!order) {
      console.log('❌ Order not found:', orderReference);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // حدّث حالة الطلب
    await prisma.order.update({
      where: { id: order.id },
      data: {
        bustaShipmentId: _id,
        bustaStatus: state,
        bustaTrackingUrl: `https://bosta.co/tracking/${trackingNumber}`,
        // حدّث status الطلب بناءً على حالة بوسطة
        status: mapBostaStatusToOrderStatus(state),
        updatedAt: new Date(),
      },
    });

    console.log('✅ Order updated:', order.orderNumber);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Webhook Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// تحويل حالة بوسطة لحالة الطلب
function mapBostaStatusToOrderStatus(bostaState: string) {
  const statusMap: Record<string, string> = {
    '10': 'CONFIRMED',        // Ticket Created
    '11': 'PREPARING',        // Package Picked up from Business
    '20': 'SHIPPED',          // Package at Warehouse
    '21': 'SHIPPED',          // Out for Delivery
    '30': 'DELIVERED',        // Delivered
    '40': 'CANCELLED',        // Delivery Failed
    '45': 'CANCELLED',        // Returned to Business
  };

  return statusMap[bostaState] || 'PENDING';
}
```

---

### الخطوة 4️⃣: إنشاء Bosta Service

أنشئ ملف: `src/lib/bosta-service.ts`

```typescript
import { prisma } from './prisma';

interface BostaDeliveryData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  city: string;
  zone?: string;
  cashOnDelivery: number;
  notes?: string;
}

export class BostaService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.BUSTA_API_KEY || '';
    this.baseUrl = process.env.BUSTA_API_URL || 'https://api.bosta.co/v1';
  }

  /**
   * إنشاء شحنة جديدة في بوسطة
   */
  async createDelivery(data: BostaDeliveryData) {
    try {
      const response = await fetch(`${this.baseUrl}/deliveries`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          type: 10, // Delivery Type (10 = Send)
          specs: {
            packageType: 'Package',
            size: 'SMALL', // SMALL, MEDIUM, LARGE
            packageDetails: {
              itemsCount: 1,
              description: 'ملابس',
            },
          },
          dropOffAddress: {
            firstLine: data.deliveryAddress,
            city: {
              name: data.city,
            },
            zone: data.zone || '',
          },
          receiver: {
            firstName: data.customerName,
            phone: data.customerPhone,
            email: data.customerEmail,
          },
          cod: data.cashOnDelivery,
          allowToOpenPackage: true, // السماح بفتح الطرد للفحص
          businessReference: data.orderId, // رقم الطلب عندك
          notes: data.notes || 'فحص المنتج قبل الدفع',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create delivery');
      }

      const result = await response.json();

      // حفظ بيانات الشحنة في قاعدة البيانات
      await prisma.order.update({
        where: { id: data.orderId },
        data: {
          bustaShipmentId: result._id,
          bustaTrackingUrl: `https://bosta.co/tracking/${result.trackingNumber}`,
          bustaStatus: result.state,
          bustaSentAt: new Date(),
          status: 'SHIPPED',
        },
      });

      return {
        success: true,
        shipmentId: result._id,
        trackingNumber: result.trackingNumber,
        trackingUrl: `https://bosta.co/tracking/${result.trackingNumber}`,
      };
    } catch (error: any) {
      console.error('❌ Bosta Error:', error);
      throw error;
    }
  }

  /**
   * تتبع الشحنة
   */
  async trackDelivery(trackingNumber: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/deliveries/trackingNumber/${trackingNumber}`,
        {
          method: 'GET',
          headers: {
            'Authorization': this.apiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to track delivery');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Track Error:', error);
      throw error;
    }
  }

  /**
   * حساب تكلفة الشحن
   */
  async calculateDeliveryFee(city: string, codAmount: number) {
    try {
      const response = await fetch(`${this.baseUrl}/pricing`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: city,
          type: 10, // Send
          cod: codAmount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate fee');
      }

      const result = await response.json();
      return result.deliveryFees || 50; // Default 50 EGP
    } catch (error) {
      console.error('❌ Calculate Fee Error:', error);
      return 50; // Default fee
    }
  }

  /**
   * إلغاء الشحنة
   */
  async cancelDelivery(deliveryId: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/deliveries/${deliveryId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel delivery');
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Cancel Error:', error);
      throw error;
    }
  }
}
```

---

### الخطوة 5️⃣: إضافة API Endpoint لإرسال الشحنة

أنشئ ملف: `src/app/api/orders/[id]/ship/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BostaService } from '@/lib/bosta-service';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // تحقق من الصلاحيات (Vendor أو Admin فقط)
    if (!session || !['VENDOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orderId = params.id;

    // جلب تفاصيل الطلب
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // تحقق من أن الطلب لم يُرسل بالفعل
    if (order.bustaShipmentId) {
      return NextResponse.json(
        { error: 'Order already shipped' },
        { status: 400 }
      );
    }

    // إنشاء شحنة في بوسطة
    const bostaService = new BostaService();
    const shipment = await bostaService.createDelivery({
      orderId: order.id,
      customerName: order.customer.name,
      customerPhone: order.deliveryPhone,
      customerEmail: order.customer.email,
      deliveryAddress: order.deliveryAddress,
      city: order.governorate || 'القاهرة',
      cashOnDelivery: order.finalAmount,
      notes: order.customerNotes || 'فحص المنتج قبل الدفع',
    });

    return NextResponse.json({
      success: true,
      message: 'تم إرسال الطلب لشركة بوسطة بنجاح',
      shipment,
    });
  } catch (error: any) {
    console.error('❌ Ship Order Error:', error);
    return NextResponse.json(
      { error: error.message || 'فشل إرسال الطلب' },
      { status: 500 }
    );
  }
}
```

---

## 🧪 الاختبار

### 1. اختبار الاتصال بـ API

أنشئ ملف: `test-bosta-connection.ts`

```typescript
async function testBostaConnection() {
  const apiKey = 'e4811f5cd1477c9d386f173921215b0cd3e81caa6deee89ff41e4d1390186ced';
  
  try {
    // اختبار بسيط: حساب تكلفة الشحن
    const response = await fetch('https://api.bosta.co/v1/pricing', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        city: 'Cairo',
        type: 10,
        cod: 100,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ اتصال ناجح مع بوسطة!');
      console.log('تكلفة الشحن:', result);
    } else {
      console.log('❌ فشل الاتصال:', response.statusText);
    }
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

testBostaConnection();
```

شغله:
```bash
npx ts-node test-bosta-connection.ts
```

---

## 📋 Checklist

### الآن:
- [x] API Key موجود ✅
- [x] تم إضافته في `.env` ✅
- [ ] قراءة Documentation بوسطة
- [ ] إعداد Webhook في لوحة تحكم بوسطة
- [ ] إنشاء ملف `bosta-service.ts`
- [ ] إنشاء Webhook endpoint
- [ ] اختبار الاتصال

### بعدها:
- [ ] اختبار إنشاء شحنة
- [ ] اختبار Webhook
- [ ] اختبار التتبع
- [ ] Deploy to Production

---

## 🔗 روابط مهمة

| الرابط | الوصف |
|--------|-------|
| https://api-docs.bosta.co/ | توثيق API بوسطة |
| https://app.bosta.co/ | لوحة التحكم |
| https://bosta.co/tracking/ | تتبع الشحنات |

---

## 💡 نصائح مهمة

1. **اقرأ Documentation بوسطة جيداً** 📚
   - في تفاصيل مهمة عن الـ API

2. **إعداد Webhook مهم جداً** 🔔
   - عشان تعرف حالة الشحنة Real-time

3. **استخدم Test Environment أولاً** 🧪
   - لو متاح عند بوسطة

4. **احفظ الـ Logs** 📝
   - لكل طلب وشحنة

5. **Error Handling** ⚠️
   - اعمل try-catch في كل مكان

---

## 📞 الدعم

لو عندك مشكلة مع بوسطة:
- 📧 Email: support@bosta.co
- 📱 WhatsApp: (check their website)
- 💻 Documentation: https://api-docs.bosta.co/

---

## ✅ الخطوة التالية

**الآن، اعمل الآتي:**

1. ✅ اقرأ https://api-docs.bosta.co/
2. ✅ ارجع لـ Dashboard بوسطة
3. ✅ أضف Webhook URL
4. ✅ اختبر الاتصال
5. ✅ أنشئ أول شحنة تجريبية!

---

**🎉 نظامك جاهز للتكامل مع بوسطة!**
