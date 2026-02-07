# 🎁 نظام الكوبونات المتقدم - دليل شامل

## ✅ تم الإنجاز

### 1. نظام الكوبونات الموجود
```typescript
// الحقول الموجودة في Schema
model Coupon {
  code        String   @unique
  discount    Float    // نسبة الخصم
  maxUses     Int      // الحد الأقصى للاستخدام
  usedCount   Int      @default(0)
  expiresAt   DateTime // تاريخ الانتهاء
  isActive    Boolean  @default(true)
  userId      String?  // خاص بمستخدم معين
}
```

---

## 🚀 الميزات الجديدة المقترحة

### 1. أنواع الكوبونات

#### كوبون نسبة مئوية
```typescript
{
  type: 'PERCENTAGE',
  discount: 20, // 20% خصم
  maxDiscount: 100, // حد أقصى 100 جنيه
}
```

#### كوبون مبلغ ثابت
```typescript
{
  type: 'FIXED',
  discount: 50, // 50 جنيه خصم
}
```

#### كوبون شحن مجاني
```typescript
{
  type: 'FREE_SHIPPING',
  discount: 0,
}
```

#### كوبون اشتري X احصل على Y مجاناً
```typescript
{
  type: 'BUY_X_GET_Y',
  buyQuantity: 2,
  getQuantity: 1,
  applicableProducts: ['product-id-1', 'product-id-2']
}
```

---

### 2. شروط الاستخدام

#### الحد الأدنى للشراء
```typescript
{
  minPurchaseAmount: 500, // يجب أن يكون الطلب 500 جنيه على الأقل
}
```

#### فئات محددة فقط
```typescript
{
  applicableCategories: ['category-id-1', 'category-id-2'],
}
```

#### منتجات محددة فقط
```typescript
{
  applicableProducts: ['product-id-1', 'product-id-2'],
}
```

#### عملاء جدد فقط
```typescript
{
  newCustomersOnly: true,
}
```

---

### 3. كوبونات تلقائية

#### كوبون ترحيبي
```typescript
// عند إنشاء حساب جديد
{
  code: 'WELCOME10',
  discount: 10,
  autoApply: true,
  validForDays: 7,
}
```

#### كوبون عيد ميلاد
```typescript
// في يوم عيد ميلاد العميل
{
  code: 'BIRTHDAY25',
  discount: 25,
  validForDays: 3,
}
```

#### كوبون استرجاع
```typescript
// للعملاء الذين لم يشتروا منذ فترة
{
  code: 'COMEBACK20',
  discount: 20,
  targetInactiveDays: 60,
}
```

---

### 4. كوبونات الإحالة

```typescript
{
  type: 'REFERRAL',
  referrerDiscount: 50, // المُحيل يحصل على 50 ج
  refereeDiscount: 30,  // المُحال يحصل على 30 ج
  code: 'REF-USER123',
}
```

---

### 5. كوبونات الولاء

#### حسب النقاط
```typescript
{
  type: 'LOYALTY_POINTS',
  pointsRequired: 500, // يحتاج 500 نقطة
  discount: 100,       // خصم 100 جنيه
}
```

#### حسب مستوى العميل
```typescript
{
  type: 'VIP_TIER',
  requiredTier: 'GOLD', // فقط للعملاء Gold
  discount: 15,
}
```

---

## 💡 أمثلة عملية

### مثال 1: حملة تسويقية
```typescript
await prisma.coupon.create({
  data: {
    code: 'SUMMER2026',
    type: 'PERCENTAGE',
    discount: 30,
    maxDiscount: 200,
    minPurchaseAmount: 500,
    maxUses: 1000,
    startsAt: new Date('2026-06-01'),
    expiresAt: new Date('2026-08-31'),
    description: 'خصم صيف 2026 - خصم 30% حتى 200 جنيه',
  }
});
```

### مثال 2: كوبون شخصي للعميل
```typescript
// عند إلغاء الطلب، أعطه كوبون
await prisma.coupon.create({
  data: {
    code: `SORRY-${userId.slice(0, 8)}`,
    discount: 50,
    type: 'FIXED',
    maxUses: 1,
    userId: userId,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
    description: 'نعتذر عن الإزعاج - خصم 50 جنيه على طلبك القادم',
  }
});
```

### مثال 3: كوبون أول طلب
```typescript
// API endpoint لإنشاء كوبون للعميل الجديد
export async function POST(req: Request) {
  const { userId } = await req.json();
  
  // تحقق أنه عميل جديد
  const orderCount = await prisma.order.count({
    where: { customerId: userId }
  });
  
  if (orderCount > 0) {
    return NextResponse.json({ error: 'ليس عميل جديد' }, { status: 400 });
  }
  
  const coupon = await prisma.coupon.create({
    data: {
      code: `FIRST-${userId.slice(0, 8)}`,
      discount: 15,
      type: 'PERCENTAGE',
      maxUses: 1,
      userId: userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 أيام
      description: 'خصم 15% على أول طلب لك!',
    }
  });
  
  return NextResponse.json(coupon);
}
```

---

## 🔧 APIs مطلوبة

### 1. التحقق من الكوبون
```typescript
POST /api/coupons/validate
Body: { code: string, cartTotal: number, items: [] }
Response: { valid: boolean, discount: number, message: string }
```

### 2. تطبيق الكوبون
```typescript
POST /api/coupons/apply
Body: { code: string, orderId: string }
Response: { success: boolean, newTotal: number }
```

### 3. إنشاء كوبون تلقائي
```typescript
POST /api/admin/coupons/auto-generate
Body: { type: string, conditions: {} }
Response: { coupon: Coupon }
```

### 4. كوبونات العميل
```typescript
GET /api/coupons/my-coupons
Response: { coupons: Coupon[], totalValue: number }
```

---

## 📊 تقارير الكوبونات

### 1. أكثر الكوبونات استخداماً
```sql
SELECT code, usedCount, discount, createdAt
FROM Coupon
WHERE usedCount > 0
ORDER BY usedCount DESC
LIMIT 10;
```

### 2. الكوبونات المنتهية الصلاحية
```sql
SELECT code, expiresAt, maxUses, usedCount
FROM Coupon
WHERE expiresAt < NOW() AND usedCount < maxUses;
```

### 3. قيمة الخصومات الإجمالية
```sql
SELECT 
  SUM(discount * usedCount) as total_discount,
  COUNT(*) as total_coupons
FROM Coupon
WHERE usedCount > 0;
```

---

## 🎯 خطة التنفيذ

### المرحلة 1 (أساسي) ✅
- [x] نظام كوبونات بسيط
- [x] كود فريد لكل كوبون
- [x] تاريخ انتهاء
- [x] عدد استخدامات محدود

### المرحلة 2 (متوسط)
- [ ] أنواع مختلفة من الكوبونات
- [ ] شروط الاستخدام
- [ ] كوبونات تلقائية
- [ ] API للتحقق والتطبيق

### المرحلة 3 (متقدم)
- [ ] كوبونات الإحالة
- [ ] كوبونات الولاء
- [ ] تقارير مفصلة
- [ ] A/B Testing للكوبونات

---

## 🚀 البدء السريع

1. تفعيل نظام الكوبونات في الإعدادات
2. إنشاء أول كوبون تجريبي
3. اختبار التطبيق في الـ Cart
4. مراقبة الاستخدام والتحليلات

**النظام جاهز للتوسع! 🎉**
