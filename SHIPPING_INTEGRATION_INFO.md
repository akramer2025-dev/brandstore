# 📦 معلومات التكامل مع شركة الشحن - Shipping Integration Info

## 🎯 نوع المنصة / Platform Type

**المنصة: نظام مخصص Custom-Built E-Commerce Platform**

❌ **ليس Shopify أو WooCommerce أو أي منصة جاهزة**

✅ **نظام مخصص مبني خصيصاً لهذا المتجر**

---

## 🛠️ التقنيات المستخدمة / Tech Stack

```
- Framework: Next.js 15.5.9 (App Router)
- Language: TypeScript
- Database: PostgreSQL
- ORM: Prisma
- API Type: RESTful API
- Authentication: NextAuth.js v5
- Hosting: Vercel (Production Ready)
- Domain: Custom Domain (حسب النطاق الخاص بك)
```

---

## 📡 نظام الـ API

### Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

### Authentication
```
Authentication Type: Session-based with NextAuth
Header: Cookie-based authentication
```

---

## 📦 API Endpoints للطلبات / Orders API

### 1. إنشاء طلب جديد
```http
POST /api/orders
Content-Type: application/json
Authentication: Required (Session)

Request Body:
{
  "items": [
    {
      "productId": "string",
      "quantity": number,
      "price": number
    }
  ],
  "deliveryAddress": "string",
  "deliveryPhone": "string",
  "governorate": "string",
  "deliveryFee": number,
  "paymentMethod": "CASH_ON_DELIVERY | CARD | INSTALLMENT | BANK_TRANSFER | E_WALLET",
  "deliveryMethod": "HOME_DELIVERY | PICKUP",
  "customerNotes": "string (optional)"
}

Response:
{
  "id": "string",
  "orderNumber": "string",
  "status": "PENDING",
  "totalAmount": number,
  "deliveryFee": number,
  "finalAmount": number,
  "deliveryAddress": "string",
  "deliveryPhone": "string",
  "governorate": "string",
  "shippingCompany": "BOSTA", // Default
  "createdAt": "ISO Date string"
}
```

### 2. الحصول على تفاصيل طلب
```http
GET /api/orders/{orderId}
Authentication: Required

Response:
{
  "id": "string",
  "orderNumber": "string",
  "status": "OrderStatus",
  "customer": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string"
  },
  "items": [
    {
      "product": {
        "id": "string",
        "name": "string",
        "nameAr": "string",
        "images": ["string"]
      },
      "quantity": number,
      "price": number
    }
  ],
  "deliveryAddress": "string",
  "deliveryPhone": "string",
  "governorate": "string",
  "totalAmount": number,
  "deliveryFee": number,
  "finalAmount": number,
  "paymentMethod": "string",
  "paymentStatus": "PENDING | PAID | FAILED | REFUNDED",
  
  // Shipping Company Fields
  "shippingCompany": "BOSTA",
  "bustaShipmentId": "string | null",
  "bustaStatus": "string | null",
  "bustaTrackingUrl": "string | null",
  "bustaSentAt": "ISO Date | null",
  
  "createdAt": "ISO Date",
  "updatedAt": "ISO Date"
}
```

### 3. تحديث حالة الطلب
```http
PATCH /api/orders/{orderId}/status
Content-Type: application/json
Authentication: Required (Vendor/Admin)

Request Body:
{
  "status": "PENDING | CONFIRMED | PREPARING | READY | SHIPPED | DELIVERED | CANCELLED",
  "bustaShipmentId": "string (optional)",
  "bustaStatus": "string (optional)",
  "bustaTrackingUrl": "string (optional)"
}
```

### 4. إلغاء طلب
```http
POST /api/orders/{orderId}/cancel
Content-Type: application/json
Authentication: Required

Request Body:
{
  "reason": "string"
}
```

---

## 🗃️ قاعدة البيانات / Database Schema

### جدول الطلبات (Orders Table)
```sql
Table: orders

Columns:
- id: String (Primary Key)
- orderNumber: String (Unique)
- customerId: String (Foreign Key → users)
- status: Enum (PENDING, CONFIRMED, PREPARING, READY, SHIPPED, DELIVERED, CANCELLED)
- paymentStatus: Enum (PENDING, PAID, FAILED, REFUNDED)
- paymentMethod: Enum
- totalAmount: Float
- deliveryFee: Float
- finalAmount: Float

// Shipping Info
- deliveryAddress: String
- deliveryPhone: String
- governorate: String (المحافظة)
- deliveryMethod: Enum (HOME_DELIVERY, PICKUP)

// Shipping Company Integration
- shippingCompany: String (Default: "BOSTA")
- bustaShipmentId: String (Nullable)
- bustaStatus: Enum (Nullable)
- bustaNotes: String (Nullable)
- bustaSentAt: DateTime (Nullable)
- bustaTrackingUrl: String (Nullable)

- createdAt: DateTime
- updatedAt: DateTime
```

### Enums

```typescript
enum OrderStatus {
  PENDING       // قيد الانتظار
  CONFIRMED     // مؤكد
  PREPARING     // قيد التحضير
  READY         // جاهز للشحن
  SHIPPED       // تم الشحن
  DELIVERED     // تم التوصيل
  CANCELLED     // ملغي
}

enum BustaStatus {
  CREATED       // تم إنشاء الشحنة
  PICKED_UP     // تم الاستلام من المتجر
  IN_TRANSIT    // في الطريق
  OUT_FOR_DELIVERY  // خرج للتوصيل
  DELIVERED     // تم التوصيل
  FAILED        // فشل التوصيل
  RETURNED      // راجع
}

enum DeliveryMethod {
  HOME_DELIVERY // توصيل منزلي
  PICKUP        // استلام من الفرع
}
```

---

## 🔗 Webhook Support

### متاح إنشاء Webhooks لـ:
```
✅ عند إنشاء طلب جديد
✅ عند تحديث حالة الطلب
✅ عند إلغاء الطلب
✅ عند تأكيد الدفع
```

### مثال على Webhook Endpoint
```http
POST /api/webhooks/shipping
Content-Type: application/json
Authentication: API Key / Signature

Request Body من شركة الشحن:
{
  "shipmentId": "string",
  "status": "string",
  "trackingUrl": "string",
  "updatedAt": "ISO Date"
}
```

---

## 📊 الحقول المتاحة لشركة الشحن

### معلومات العميل
```json
{
  "customerName": "string",
  "customerPhone": "string",
  "customerEmail": "string"
}
```

### معلومات التوصيل
```json
{
  "deliveryAddress": "string (العنوان الكامل)",
  "governorate": "string (المحافظة)",
  "deliveryPhone": "string (رقم التواصل)",
  "deliveryNotes": "string (ملاحظات العميل)"
}
```

### معلومات الطلب
```json
{
  "orderNumber": "string (رقم الطلب الفريد)",
  "totalAmount": number,
  "deliveryFee": number,
  "finalAmount": number,
  "paymentMethod": "string",
  "items": [
    {
      "productName": "string",
      "quantity": number,
      "price": number,
      "weight": number (optional),
      "dimensions": object (optional)
    }
  ]
}
```

---

## 🔐 طرق المصادقة المتاحة للتكامل

### 1. API Key Authentication
```http
Headers:
x-api-key: YOUR_API_KEY
```

### 2. Bearer Token
```http
Headers:
Authorization: Bearer YOUR_TOKEN
```

### 3. Webhook Signature Verification
```
يمكن إضافة HMAC signature verification لتأمين الـ Webhooks
```

---

## 🚀 خطوات التكامل المقترحة

### المرحلة 1: الإعداد الأولي
1. ✅ شركة الشحن تقوم بإنشاء حساب API
2. ✅ تبادل API Keys / Credentials
3. ✅ تحديد Base URLs (Production & Staging)

### المرحلة 2: التكامل
1. ✅ شركة الشحن تقوم بإرسال الـ API Documentation الخاصة بهم
2. ✅ نقوم بإنشاء Service لـ Integration
3. ✅ ربط الـ Endpoints:
   - إنشاء شحنة عند تأكيد الطلب
   - استقبال Webhooks لتحديثات الحالة
   - تتبع الشحنة Real-time

### المرحلة 3: الاختبار
1. ✅ اختبار على بيئة Staging
2. ✅ اختبار جميع السيناريوهات:
   - طلب ناجح
   - طلب ملغي
   - فشل التوصيل
   - إرجاع

### المرحلة 4: التشغيل
1. ✅ نقل التكامل للـ Production
2. ✅ مراقبة الأداء
3. ✅ معالجة الأخطاء

---

## 📋 ما تحتاجه من شركة الشحن

### معلومات أساسية
- [ ] API Documentation الكاملة
- [ ] Base URL للـ API
- [ ] API Keys / Credentials
- [ ] Webhook URLs (إذا متوفر)
- [ ] Staging Environment للاختبار

### معلومات تقنية
- [ ] Authentication Method (API Key / OAuth / JWT)
- [ ] Request/Response Format (JSON / XML)
- [ ] Rate Limits
- [ ] Error Codes Documentation
- [ ] Timeout Settings

### متطلبات التكامل
- [ ] كيفية إنشاء شحنة جديدة
- [ ] كيفية تتبع الشحنة
- [ ] Webhook Events المتاحة
- [ ] كيفية إلغاء الشحنة
- [ ] كيفية حساب تكلفة الشحن

---

## 💡 الملخص للرد على شركة الشحن

### أخبرهم بالتالي:

```
نظامنا هو:
- منصة تجارة إلكترونية مخصصة (Custom-Built E-Commerce Platform)
- مبنية بـ Next.js + TypeScript + PostgreSQL
- نوفر RESTful API للتكامل
- نوفر Webhooks لاستقبال التحديثات
- قاعدة البيانات جاهزة بحقول خاصة لبيانات الشحن
- نستطيع التكامل مع أي شركة شحن عبر API

ما نحتاجه منكم:
1. API Documentation الخاصة بكم
2. API Credentials (Keys/Tokens)
3. قائمة بالـ Endpoints المتاحة
4. Webhook Events للتحديثات التلقائية
5. بيئة اختبار (Sandbox/Staging) إن وجدت
```

---

## 📞 نقاط الاتصال الفنية / Technical Contacts

```
Developer Contact: [Your Contact Info]
System Type: Custom Platform (Next.js)
Database: PostgreSQL (Production Ready)
Hosting: Vercel / AWS / Your Hosting
Status: Production Ready ✅
```

---

## 📚 ملفات توثيق إضافية في المشروع

- `README.md` - معلومات عامة عن المشروع
- `DEPLOYMENT_GUIDE.md` - دليل النشر
- `ORDER_WORKFLOW_GUIDE.md` - سير عمل الطلبات
- `prisma/schema.prisma` - هيكل قاعدة البيانات
- `.env.example` - مثال للمتغيرات البيئية

---

## ✅ الخلاصة

نظامك **جاهز للتكامل** مع أي شركة شحن. النظام يحتوي على:

✅ API Endpoints كاملة للطلبات  
✅ قاعدة بيانات مجهزة بحقول الشحن  
✅ إمكانية إضافة Webhooks  
✅ حقول مخصصة لبيانات شركة الشحن  
✅ نظام مرن يدعم التكامل مع أي شركة  

---

**📝 ملاحظة:** هذا الملف يحتوي على جميع المعلومات التقنية. يمكنك إرساله مباشرة للفريق التقني في شركة الشحن أو استخدامه كمرجع أثناء المناقشات الفنية.
