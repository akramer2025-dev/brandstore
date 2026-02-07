# نظام موظفي التسويق - دليل شامل

## نظرة عامة
نظام متكامل لإدارة موظفي التسويق الذين يضيفون منتجات مستوردة من مصادر خارجية (Shein, AliExpress, Alibaba, Taobao, Temu) ويحصلون على عمولة 5% من كل عملية بيع.

---

## المميزات الرئيسية

### 1. إدارة الموظفين
- ✅ إنشاء حسابات موظفي التسويق
- ✅ تفعيل/تعطيل الحسابات
- ✅ تحديد نسبة العمولة لكل موظف (افتراضي 5%)
- ✅ تتبع إجمالي المبيعات والعمولات

### 2. إضافة المنتجات المستوردة
- ✅ اختيار مصدر الاستيراد (6 مصادر متاحة)
- ✅ تحديد السعر والكمية والفئة
- ✅ حساب تلقائي للعمولة المتوقعة
- ✅ إضافة صور ووصف المنتج
- ✅ تحديد نسبة الدفعة المقدمة ومدة التوصيل

### 3. حساب العمولات التلقائي
- ✅ يتم حساب العمولة تلقائياً عند تغيير حالة الطلب إلى "مكتمل" (DELIVERED)
- ✅ إنشاء سجل عمولة لكل منتج مستورد في الطلب
- ✅ تحديث إجمالي المبيعات والعمولات للموظف
- ✅ منع تكرار العمولات لنفس الطلب

### 4. إدارة المدفوعات
- ✅ عرض العمولات المدفوعة والمعلقة
- ✅ دفع جماعي للعمولات
- ✅ تسجيل طريقة الدفع ورقم المعاملة
- ✅ دعم 6 طرق دفع مختلفة

### 5. طرق الدفع المتاحة
1. **البنوك**: حساب بنكي كامل (اسم البنك، رقم الحساب، الفرع، صاحب الحساب)
2. **InstaPay**: رقم الهاتف
3. **Etisalat Cash**: رقم الهاتف
4. **Vodafone Cash**: رقم الهاتف
5. **WePay**: رقم الهاتف
6. **Cash**: النقدية

---

## البنية التقنية

### قاعدة البيانات (Prisma Schema)

#### نموذج MarketingStaff
```prisma
model MarketingStaff {
  id              String   @id @default(cuid())
  userId          String   @unique
  name            String
  phone           String   @unique
  email           String?
  commissionRate  Float    @default(5) // نسبة العمولة (%)
  totalSales      Float    @default(0)
  totalCommission Float    @default(0)
  isApproved      Boolean  @default(true)
  
  // بيانات البنك
  bankName           String?
  bankAccountNumber  String?
  bankAccountName    String?
  bankBranch         String?
  
  // المحافظ الإلكترونية
  instaPay      String?
  etisalatCash  String?
  vodafoneCash  String?
  wePay         String?
  
  // العلاقات
  user        User                  @relation(fields: [userId], references: [id])
  products    Product[]
  commissions MarketingCommission[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### نموذج MarketingCommission
```prisma
model MarketingCommission {
  id               String   @id @default(cuid())
  marketingStaffId String
  productId        String
  orderId          String
  
  saleAmount       Float   // مبلغ البيع
  commissionRate   Float   // نسبة العمولة المستخدمة
  commissionAmount Float   // مبلغ العمولة
  quantity         Int     // الكمية المباعة
  
  isPaid           Boolean  @default(false)
  paidAt           DateTime?
  paymentMethod    String?  // طريقة الدفع
  paymentReference String?  // رقم المعاملة
  
  // العلاقات
  marketingStaff MarketingStaff @relation(fields: [marketingStaffId], references: [id])
  product        Product        @relation(fields: [productId], references: [id])
  order          Order          @relation(fields: [orderId], references: [id])
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### حقول Product الجديدة
```prisma
model Product {
  // ... حقول موجودة
  
  isImported              Boolean       @default(false)
  importSource            ImportSource?
  importLink              String?
  marketingStaffId        String?
  downPaymentPercent      Float?        @default(30)
  estimatedDeliveryDays   Int?          @default(14)
  
  marketingStaff          MarketingStaff? @relation(fields: [marketingStaffId], references: [id])
  marketingCommissions    MarketingCommission[]
}

enum ImportSource {
  SHEIN
  ALIEXPRESS
  ALIBABA
  TAOBAO
  TEMU
  OTHER
}
```

---

## API Endpoints

### 1. إدارة الموظفين
#### POST `/api/marketing-staff`
إنشاء موظف تسويق جديد (Admin فقط)
```json
{
  "userId": "user_id",
  "name": "أحمد محمد",
  "phone": "01012345678",
  "email": "ahmed@example.com",
  "commissionRate": 5
}
```

#### GET `/api/marketing-staff`
- **للموظف**: جلب بياناته + منتجاته + عمولاته المعلقة
- **للـ Admin**: جلب قائمة كل الموظفين

---

### 2. طرق الدفع
#### PUT `/api/marketing-staff/payment-methods`
تحديث طرق الدفع (موظف التسويق فقط)
```json
{
  "bankName": "البنك الأهلي المصري",
  "bankAccountNumber": "123456789012",
  "bankAccountName": "أحمد محمد",
  "bankBranch": "فرع المعادي",
  "instaPay": "01012345678",
  "etisalatCash": "",
  "vodafoneCash": "01012345678",
  "wePay": ""
}
```

---

### 3. إدارة المنتجات
#### POST `/api/marketing-staff/products`
إضافة منتج مستورد (موظف التسويق فقط)
```json
{
  "nameAr": "فستان صيفي أنيق",
  "nameEn": "Summer Elegant Dress",
  "descriptionAr": "فستان رائع...",
  "price": 299.99,
  "stock": 10,
  "categoryId": "cat_id",
  "images": "[\"url1\", \"url2\"]",
  "importSource": "SHEIN",
  "importLink": "https://shein.com/product/123",
  "downPaymentPercent": 30,
  "estimatedDeliveryDays": 14
}
```

**Response:**
```json
{
  "success": true,
  "product": {...},
  "message": "تم إضافة المنتج بنجاح 🎉\nعمولتك: 14.99 جنيه لكل عملية بيع"
}
```

#### GET `/api/marketing-staff/products`
جلب منتجات الموظف + الإحصائيات
```json
{
  "products": [...],
  "stats": {
    "totalProducts": 10,
    "totalStock": 50,
    "totalSold": 25,
    "totalRevenue": 7499.75,
    "estimatedCommission": 374.98
  },
  "commissionRate": 5
}
```

---

### 4. إدارة العمولات
#### POST `/api/marketing-staff/commissions`
حساب العمولات لطلب معين (Admin أو موظف التسويق)
```json
{
  "orderId": "order_id"
}
```

**Response:**
```json
{
  "success": true,
  "commissionsCreated": [
    {
      "productName": "فستان صيفي",
      "quantity": 2,
      "saleAmount": 599.98,
      "commissionAmount": 29.99,
      "staffName": "أحمد محمد"
    }
  ],
  "message": "تم حساب 2 عمولة للطلب"
}
```

#### GET `/api/marketing-staff/commissions`
جلب العمولات
- **للموظف**: عمولاته فقط
- **للـ Admin**: كل العمولات

**Response:**
```json
{
  "commissions": [...],
  "stats": {
    "totalCommissions": 50,
    "totalAmount": 1499.50,
    "paidAmount": 999.75,
    "unpaidAmount": 499.75,
    "paidCount": 30,
    "unpaidCount": 20
  }
}
```

---

### 5. دفع العمولات
#### POST `/api/marketing-staff/commissions/pay`
دفع عمولة واحدة (Admin فقط)
```json
{
  "commissionId": "commission_id",
  "paymentMethod": "INSTAPAY",
  "paymentReference": "REF123456"
}
```

#### PUT `/api/marketing-staff/commissions/pay`
دفع جماعي (Admin فقط)
```json
{
  "commissionIds": ["id1", "id2", "id3"],
  "paymentMethod": "BANK_TRANSFER",
  "paymentReference": "TRX789456"
}
```

---

## الصفحات (Pages)

### 1. لوحة تحكم موظف التسويق
**المسار:** `/marketing-staff`  
**الصلاحية:** MARKETING_STAFF فقط

**المحتوى:**
- **الإحصائيات الرئيسية:**
  - إجمالي المبيعات
  - إجمالي العمولات
  - العمولات المدفوعة
  - العمولات المعلقة

- **إحصائيات المنتجات:**
  - عدد المنتجات
  - المخزون الحالي
  - عدد المبيعات
  - العمولة المتوقعة

- **الأزرار:**
  - ➕ إضافة منتج مستورد
  - 💳 طرق الدفع

- **جداول:**
  - منتجاتي (مع تفاصيل العمولة المتوقعة)
  - العمولات (آخر 20 عملية)

---

### 2. إضافة منتج مستورد
**المسار:** `/marketing-staff/add-product`  
**الصلاحية:** MARKETING_STAFF فقط

**النموذج يتضمن:**
1. **معلومات المنتج:**
   - الاسم (عربي + إنجليزي)
   - الفئة
   - مصدر الاستيراد (dropdown)
   - السعر
   - الكمية

2. **الوصف:**
   - وصف بالعربي
   - وصف بالإنجليزي

3. **الصور:**
   - روابط الصور (JSON Array)

4. **تفاصيل الاستيراد:**
   - رابط المنتج الأصلي
   - نسبة الدفعة المقدمة (%)
   - مدة التوصيل المتوقعة (أيام)
   - **معاينة العمولة المتوقعة** (يحسب تلقائياً)

---

### 3. إدارة موظفي التسويق (Admin)
**المسار:** `/admin/marketing-staff`  
**الصلاحية:** ADMIN فقط

**المحتوى:**
- **الإحصائيات الرئيسية:**
  - عدد الموظفين
  - إجمالي العمولات
  - المدفوع
  - المعلق

- **جدول الموظفين:**
  - الاسم، الهاتف، البريد
  - نسبة العمولة
  - عدد المنتجات
  - إجمالي المبيعات
  - إجمالي العمولة
  - الحالة (مفعّل/معلق)

- **قسم الدفع:**
  - تحديد العمولات المراد دفعها
  - اختيار طريقة الدفع
  - إدخال رقم المعاملة
  - زر "تأكيد الدفع"

- **جدول العمولات:**
  - الموظف
  - المنتج
  - الكمية
  - المبلغ
  - العمولة
  - الحالة (مدفوع/معلق)
  - التاريخ
  - Checkboxes للتحديد

---

## الأتمتة

### حساب العمولات التلقائي

**الموقع:** `src/app/api/orders/[id]/status/route.ts`

```typescript
import { calculateCommissionsForOrder } from "@/lib/marketing-service";

// عند تحديث حالة الطلب
if (status === "DELIVERED") {
  const commissionResult = await calculateCommissionsForOrder(order.id);
  
  if (commissionResult.success && commissionResult.commissionsCreated.length > 0) {
    console.log(`✅ تم حساب ${commissionResult.commissionsCreated.length} عمولة للطلب ${order.id}`);
  }
}
```

**ما يحدث تلقائياً:**
1. ✅ جلب الطلب مع كل المنتجات
2. ✅ فحص كل منتج: هل هو مستورد؟ هل له موظف تسويق؟
3. ✅ التحقق من عدم وجود عمولة سابقة (منع التكرار)
4. ✅ حساب العمولة: `saleAmount * commissionRate / 100`
5. ✅ إنشاء سجل `MarketingCommission`
6. ✅ تحديث `totalSales` و `totalCommission` للموظف

---

## خدمة Marketing Service

**الموقع:** `src/lib/marketing-service.ts`

### الدوال المتاحة:

#### 1. calculateCommissionsForOrder(orderId)
حساب العمولات تلقائياً لطلب معين

**Returns:**
```typescript
{
  success: boolean;
  commissionsCreated: Array<{
    id: string;
    productName: string;
    staffName: string;
    quantity: number;
    saleAmount: number;
    commissionAmount: number;
  }>;
  totalCommission: number;
  message: string;
}
```

---

#### 2. getMarketingStaffStats(staffId)
جلب إحصائيات موظف تسويق

**Returns:**
```typescript
{
  name: string;
  phone: string;
  email: string | null;
  commissionRate: number;
  totalProducts: number;
  totalCommissions: number;
  totalSales: number;
  totalCommission: number;
  unpaidCommissions: number;
  paidCommissions: number;
}
```

---

#### 3. getTopMarketingStaff(limit = 10)
جلب أفضل الموظفين حسب المبيعات

**Returns:**
```typescript
Array<{
  id: string;
  name: string;
  totalSales: number;
  totalCommission: number;
  commissionRate: number;
  productsCount: number;
  commissionsCount: number;
}>
```

---

## سكريبت الإعداد

### إنشاء موظف تسويق تجريبي
```bash
npx tsx create-marketing-staff.ts
```

**البيانات المُنشأة:**
- **المستخدم:**
  - البريد: `marketing@test.com`
  - كلمة المرور: `123456`
  - الدور: `MARKETING_STAFF`

- **موظف التسويق:**
  - الاسم: أحمد محمد
  - الهاتف: 01012345678
  - العمولة: 5%
  - بيانات الدفع كاملة (بنك + محافظ)

---

## سيناريو الاستخدام الكامل

### 1. إضافة موظف تسويق (Admin)
```bash
# تشغيل السكريبت
npx tsx create-marketing-staff.ts
```

### 2. تسجيل دخول الموظف
- البريد: `marketing@test.com`
- كلمة المرور: `123456`
- الانتقال إلى: `/marketing-staff`

### 3. تحديث طرق الدفع
- الضغط على "💳 طرق الدفع"
- ملء بيانات البنك أو المحافظ الإلكترونية
- حفظ

### 4. إضافة منتج مستورد
- الضغط على "➕ إضافة منتج مستورد"
- ملء النموذج:
  - الاسم: "فستان عصري من Shein"
  - السعر: 299 جنيه
  - الفئة: ملابس نسائية
  - المصدر: SHEIN
  - رابط المنتج الأصلي
- **معاينة العمولة:** 14.95 جنيه (5% من 299)
- حفظ

### 5. العميل يطلب المنتج
- العميل يضيف المنتج للسلة ويُتم الطلب
- حالة الطلب: PENDING

### 6. Admin يُحدّث حالة الطلب
- Admin يغير الحالة إلى: DELIVERED
- **تلقائياً:**
  - ✅ يتم حساب العمولة (14.95 جنيه)
  - ✅ إنشاء سجل `MarketingCommission`
  - ✅ تحديث `totalSales` (299 جنيه)
  - ✅ تحديث `totalCommission` (14.95 جنيه)

### 7. الموظف يرى العمولة
- في لوحة التحكم: `/marketing-staff`
- **العمولات المعلقة:** 14.95 جنيه
- يظهر في جدول العمولات بحالة "⏳ معلق"

### 8. Admin يدفع العمولة
- الانتقال إلى: `/admin/marketing-staff`
- تحديد العمولة
- اختيار طريقة الدفع (مثلاً: Vodafone Cash)
- إدخال رقم المعاملة (اختياري)
- الضغط على "✅ تأكيد الدفع"

### 9. الموظف يتلقى إشعار
- العمولة تتحول إلى "✅ تم الصرف"
- يُسجل تاريخ ووقت الدفع
- يُحدّث إجمالي "العمولات المدفوعة"

---

## الحماية والأمان

### 1. التحقق من الصلاحيات
- ✅ موظف التسويق يرى بياناته فقط
- ✅ Admin يرى كل البيانات
- ✅ العملاء لا يمكنهم الوصول لصفحات الموظفين

### 2. منع التكرار
- ✅ فحص عدم وجود عمولة سابقة لنفس الطلب والمنتج
- ✅ منع دفع عمولة مدفوعة مرة أخرى

### 3. التحقق من البيانات
- ✅ التأكد أن الطلب في حالة DELIVERED قبل حساب العمولة
- ✅ التحقق من وجود موظف تسويق للمنتج
- ✅ التأكد أن المنتج `isImported = true`

---

## الإحصائيات والتقارير

### لوحة تحكم الموظف
```typescript
{
  totalSales: 7499.75,          // إجمالي المبيعات
  totalCommission: 374.98,      // إجمالي العمولات
  paidCommissions: 249.99,      // المدفوع
  unpaidCommissions: 124.99,    // المعلق
  totalProducts: 10,            // عدد المنتجات
  totalStock: 50,               // المخزون
  totalSold: 25                 // المبيعات
}
```

### لوحة تحكم الـ Admin
```typescript
{
  totalStaff: 5,                // عدد الموظفين
  totalCommissions: 1874.90,    // إجمالي كل العمولات
  paidAmount: 1249.95,          // المدفوع
  unpaidAmount: 624.95,         // المعلق
  paidCount: 150,               // عدد العمليات المدفوعة
  unpaidCount: 75               // عدد العمليات المعلقة
}
```

---

## نصائح التطوير

### 1. إضافة إشعارات
```typescript
// عند حساب العمولة تلقائياً
await sendNotification({
  userId: marketingStaff.userId,
  type: 'COMMISSION_EARNED',
  message: `تم إضافة عمولة ${commissionAmount} جنيه`
});

// عند دفع العمولة
await sendNotification({
  userId: marketingStaff.userId,
  type: 'COMMISSION_PAID',
  message: `تم صرف عمولة ${commissionAmount} جنيه`
});
```

### 2. تقارير Excel
```typescript
// في الـ Admin
export async function exportCommissionsReport() {
  const commissions = await prisma.marketingCommission.findMany({
    include: {
      marketingStaff: true,
      product: true,
      order: true,
    },
  });
  
  // تحويل إلى CSV أو Excel
  return generateExcelFile(commissions);
}
```

### 3. نظام الحوافز
```typescript
// عمولة تصاعدية حسب المبيعات
if (staff.totalSales > 100000) {
  commissionRate = 7; // 7% بدلاً من 5%
} else if (staff.totalSales > 50000) {
  commissionRate = 6; // 6%
}
```

---

## الاختبار

### 1. اختبار إضافة منتج
```bash
# تسجيل دخول كموظف تسويق
# الذهاب إلى /marketing-staff/add-product
# ملء النموذج والحفظ
```

### 2. اختبار حساب العمولات
```bash
# إنشاء طلب يحتوي على منتج مستورد
# تغيير حالة الطلب إلى DELIVERED
# فحص جدول MarketingCommission
# التحقق من تحديث totalSales و totalCommission
```

### 3. اختبار الدفع
```bash
# تسجيل دخول كـ Admin
# الذهاب إلى /admin/marketing-staff
# تحديد عمولات معلقة
# دفع جماعي
# التحقق من تحديث isPaid و paidAt
```

---

## الخلاصة

✅ **تم التنفيذ بالكامل:**
- Schema كامل بكل الحقول المطلوبة
- 5 API endpoints شاملة
- 3 صفحات UI متكاملة
- حساب تلقائي للعمولات
- دعم 6 طرق دفع
- إحصائيات شاملة
- حماية وأمان

🚀 **جاهز للاستخدام:**
```bash
# 1. تشغيل السكريبت
npx tsx create-marketing-staff.ts

# 2. تسجيل الدخول
البريد: marketing@test.com
كلمة المرور: 123456

# 3. إضافة منتج
/marketing-staff/add-product

# 4. إدارة العمولات
/admin/marketing-staff
```
