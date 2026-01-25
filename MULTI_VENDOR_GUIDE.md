# 🚀 نظام المتجر الإلكتروني متعدد البائعين - Multi-Vendor Marketplace

## 📋 نظرة عامة

تم تحويل المتجر الإلكتروني إلى منصة متعددة البائعين (Multi-vendor Marketplace) احترافية مثل **Shein** و **Temu** و **Trendyol** و **Amazon**، مع دعم كامل لأنظمة الدفع المتعددة بما في ذلك الدفع بالأقساط.

---

## 🎯 المميزات الرئيسية

### 1. نظام البائعين المتعددين (Multi-Vendor System)

#### أنواع المستخدمين:
- **👑 المدير (ADMIN)** - إدارة كاملة للمنصة
- **👥 العملاء (CUSTOMER)** - تصفح وشراء المنتجات
- **🏪 البائعين (VENDOR)** - عرض وبيع المنتجات
- **🚚 موظفي التوصيل (DELIVERY_STAFF)** - توصيل الطلبات
- **🏭 المصنّع (MANUFACTURER)** - للمنتجات المصنّعة ذاتياً

#### معلومات البائع:
```typescript
{
  storeName: string          // اسم المتجر (English)
  storeNameAr: string        // اسم المتجر (العربية)
  logo?: string              // شعار المتجر
  banner?: string            // بانر المتجر
  phone: string              // رقم التواصل
  address: string            // العنوان
  city: string               // المدينة
  description?: string       // وصف المتجر (English)
  descriptionAr?: string     // وصف المتجر (العربية)
  commissionRate: 15%        // نسبة العمولة (افتراضي 15%)
  bankName: string           // اسم البنك
  accountNumber: string      // رقم الحساب البنكي
  iban?: string              // IBAN (اختياري)
  isApproved: boolean        // حالة الموافقة من المدير
  isActive: boolean          // حالة التفعيل
  rating: number            // تقييم المتجر
  totalSales: number        // إجمالي المبيعات
}
```

### 2. أنظمة الدفع (Payment Methods)

#### 1️⃣ الدفع عند الاستلام (Cash on Delivery)
```typescript
paymentMethod: 'CASH_ON_DELIVERY'
```
- ✅ فحص المنتجات قبل الدفع
- ✅ في حالة الرفض: دفع رسوم التوصيل فقط
- ✅ إرجاع تلقائي للمخزون

#### 2️⃣ التحويل البنكي (Bank Transfer)
```typescript
paymentMethod: 'BANK_TRANSFER'
```
- ✅ خصم 5% على السعر
- ✅ إرسال تفاصيل البنك بعد الطلب
- ✅ تأكيد الدفع من الإدارة

#### 3️⃣ الدفع بالأقساط (Installment Plans)

##### خطة 4 أشهر:
```typescript
paymentMethod: 'INSTALLMENT_4'
downPayment: 25%
interestRate: 5%
```

##### خطة 6 أشهر:
```typescript
paymentMethod: 'INSTALLMENT_6'
downPayment: 20%
interestRate: 8%
```

##### خطة 12 شهر:
```typescript
paymentMethod: 'INSTALLMENT_12'
downPayment: 15%
interestRate: 12%
```

##### خطة 24 شهر:
```typescript
paymentMethod: 'INSTALLMENT_24'
downPayment: 10%
interestRate: 18%
```

### 3. نظام العمولات (Commission System)

```typescript
// العمولة الافتراضية
defaultCommission = 15%

// حساب ربح البائع
vendorProfit = orderTotal × (1 - commissionRate)
platformProfit = orderTotal × commissionRate

// مثال: طلب بقيمة 1000 ج.م
vendorProfit = 1000 × 0.85 = 850 ج.م
platformProfit = 1000 × 0.15 = 150 ج.م
```

### 4. نظام المدفوعات للبائعين (Vendor Payouts)

```typescript
{
  vendorId: string
  amount: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  method: 'BANK_TRANSFER' | 'CASH' | 'CHECK'
  reference?: string
  notes?: string
  paidAt?: Date
}
```

---

## 📁 هيكل البيانات (Database Schema)

### جدول البائعين (Vendor)
```prisma
model Vendor {
  id              String    @id @default(cuid())
  userId          String    @unique
  storeName       String
  storeNameAr     String
  logo            String?
  banner          String?
  phone           String
  address         String
  city            String
  description     String?
  descriptionAr   String?
  commissionRate  Float     @default(15)
  bankName        String
  accountNumber   String
  iban            String?
  isApproved      Boolean   @default(false)
  isActive        Boolean   @default(false)
  rating          Float     @default(0)
  totalSales      Float     @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  user            User      @relation(fields: [userId], references: [id])
  products        Product[]
  orders          Order[]
  payouts         VendorPayout[]
}
```

### جدول الأقساط (InstallmentPlan)
```prisma
model InstallmentPlan {
  id            String    @id @default(cuid())
  orderId       String    @unique
  totalAmount   Float
  downPayment   Float
  monthlyAmount Float
  numberOfMonths Int
  interestRate  Float
  status        InstallmentStatus @default(ACTIVE)
  startDate     DateTime
  endDate       DateTime
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  order         Order     @relation(fields: [orderId], references: [id])
  payments      InstallmentPayment[]
}

enum InstallmentStatus {
  ACTIVE
  COMPLETED
  DEFAULTED
  CANCELLED
}
```

### جدول دفعات الأقساط (InstallmentPayment)
```prisma
model InstallmentPayment {
  id            String    @id @default(cuid())
  planId        String
  amount        Float
  dueDate       DateTime
  paidDate      DateTime?
  status        InstallmentPaymentStatus @default(PENDING)
  paymentMethod String?
  reference     String?
  notes         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  plan          InstallmentPlan @relation(fields: [planId], references: [id])
}
```

---

## 🛠️ API Endpoints

### البائعين (Vendors)

#### تسجيل بائع جديد
```http
POST /api/auth/vendor-register
Content-Type: application/json

{
  "email": "vendor@example.com",
  "password": "password123",
  "username": "my_store",
  "storeName": "My Store",
  "storeNameAr": "متجري",
  "phone": "+20 100 000 0000",
  "address": "123 Street Name",
  "city": "Cairo",
  "bankName": "National Bank of Egypt",
  "accountNumber": "123456789"
}
```

#### إحصائيات البائع
```http
GET /api/vendor/stats
Authorization: Bearer {token}

Response:
{
  "totalOrders": 150,
  "totalRevenue": 45000,
  "pendingPayouts": 12000,
  "totalProducts": 85
}
```

### الطلبات (Orders)

#### إنشاء طلب بالدفع بالأقساط
```http
POST /api/orders
Content-Type: application/json

{
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2,
      "price": 500
    }
  ],
  "deliveryAddress": "123 Street, Cairo",
  "deliveryPhone": "+20 100 000 0000",
  "paymentMethod": "INSTALLMENT_6",
  "installmentPlan": {
    "totalAmount": 1080,
    "downPayment": 200,
    "monthlyAmount": 146.67,
    "numberOfMonths": 6,
    "interestRate": 8
  }
}
```

---

## 🎨 المكونات (Components)

### 1. حاسبة الأقساط (InstallmentCalculator)
```tsx
<InstallmentCalculator
  totalAmount={1000}
  onSelect={(plan) => {
    console.log('Selected plan:', plan)
    // plan.months: 4 | 6 | 12 | 24
    // plan.downPayment: number
    // plan.monthlyAmount: number
    // plan.totalWithInterest: number
  }}
/>
```

### 2. لوحة البائع (VendorDashboard)
```tsx
// src/app/vendor/dashboard/page.tsx
- عرض إحصائيات المبيعات
- عدد الطلبات
- الإيرادات
- المدفوعات المعلقة
- عدد المنتجات
```

### 3. صفحة تسجيل البائع (VendorRegister)
```tsx
// src/app/auth/vendor-register/page.tsx
- نموذج تسجيل شامل
- معلومات الحساب
- معلومات المتجر
- معلومات البنك
```

---

## 📦 الصفحات المتاحة

### للعملاء:
- `/` - الصفحة الرئيسية
- `/products` - قائمة المنتجات
- `/cart` - سلة التسوق
- `/checkout` - إتمام الطلب (مع خيارات الدفع)
- `/orders` - طلباتي
- `/profile` - الملف الشخصي

### للبائعين:
- `/vendor/dashboard` - لوحة التحكم
- `/vendor/products` - إدارة المنتجات
- `/vendor/orders` - طلبات المتجر
- `/vendor/payouts` - المدفوعات
- `/vendor/settings` - إعدادات المتجر

### للمدير:
- `/admin` - لوحة الإدارة
- `/admin/vendors` - إدارة البائعين
- `/admin/products` - إدارة المنتجات
- `/admin/orders` - إدارة الطلبات
- `/admin/payouts` - مدفوعات البائعين

### للتسجيل:
- `/auth/login` - تسجيل الدخول
- `/auth/register` - تسجيل عميل جديد
- `/auth/vendor-register` - تسجيل بائع جديد

---

## 🔐 الصلاحيات (Permissions)

### المدير (ADMIN):
- ✅ الموافقة على البائعين الجدد
- ✅ تفعيل/إلغاء تفعيل البائعين
- ✅ إدارة جميع المنتجات والطلبات
- ✅ معالجة المدفوعات للبائعين
- ✅ عرض التقارير المالية
- ✅ إدارة نسب العمولات

### البائع (VENDOR):
- ✅ إضافة وتعديل منتجاته فقط
- ✅ عرض طلبات متجره
- ✅ تتبع المدفوعات
- ✅ تحديث إعدادات المتجر
- ❌ لا يمكنه الوصول لمنتجات البائعين الآخرين

### العميل (CUSTOMER):
- ✅ تصفح جميع المنتجات
- ✅ إضافة للسلة والشراء
- ✅ اختيار طريقة الدفع
- ✅ تتبع طلباته
- ✅ كتابة التقييمات

---

## 💡 سيناريوهات الاستخدام

### سيناريو 1: تسجيل بائع جديد
1. البائع يسجل عبر `/auth/vendor-register`
2. يملأ معلومات المتجر والبنك
3. الحالة: `isApproved: false`, `isActive: false`
4. المدير يراجع الطلب في `/admin/vendors`
5. المدير يوافق: `isApproved: true`, `isActive: true`
6. البائع يستطيع الدخول لـ `/vendor/dashboard`

### سيناريو 2: شراء بالتقسيط
1. العميل يضيف منتجات للسلة
2. في `/checkout` يختار "الدفع بالتقسيط"
3. يظهر له `InstallmentCalculator`
4. يختار خطة (4، 6، 12، أو 24 شهر)
5. يدفع المقدم عند الطلب
6. يُنشأ جدول دفعات شهرية
7. العميل يدفع الأقساط في مواعيدها

### سيناريو 3: دفع أرباح البائع
1. البائع يبيع منتجات بقيمة 10,000 ج.م
2. العمولة 15% = 1,500 ج.م (للمنصة)
3. ربح البائع = 8,500 ج.م
4. المدير ينشئ `VendorPayout` بقيمة 8,500 ج.م
5. الحالة: `PENDING` → `PROCESSING` → `COMPLETED`
6. يتم التحويل للبنك المسجل

---

## 🚀 الخطوات التالية

### ✅ تم إنجازه:
- [x] Schema للبائعين والأقساط
- [x] Migration للتغييرات
- [x] صفحة تسجيل البائع
- [x] لوحة تحكم البائع
- [x] حاسبة الأقساط
- [x] تحديث صفحة Checkout
- [x] API endpoints

### 🔜 قيد التطوير:
- [ ] صفحة إدارة منتجات البائع
- [ ] صفحة طلبات البائع
- [ ] صفحة مدفوعات البائع
- [ ] لوحة إدارة البائعين (Admin)
- [ ] معالجة الأقساط الشهرية
- [ ] تنبيهات الأقساط المتأخرة
- [ ] تقارير مالية شاملة

### 📅 مخطط مستقبلي:
- [ ] نظام تقييمات المتاجر
- [ ] شات مباشر مع البائعين
- [ ] نظام كوبونات خاص بكل بائع
- [ ] برنامج ولاء للعملاء
- [ ] تطبيق موبايل
- [ ] تكامل مع بوابات دفع إلكتروني

---

## 📞 الدعم الفني

للاستفسارات أو المشاكل التقنية:
- 📧 Email: support@yourstore.com
- 📱 WhatsApp: +20 100 000 0000
- 🌐 Website: https://yourstore.com

---

**تم بناؤه بـ ❤️ باستخدام Next.js 15, Prisma, TypeScript**
