# 🎨 إضافة Variants (الأشكال المتنوعة) للكتالوج

## 📋 **ما هي Variants؟**

الـ Variants = نسخ مختلفة من نفس المنتج:
- 👕 **المقاسات:** S, M, L, XL, XXL
- 🎨 **الألوان:** أحمر، أزرق، أسود، أبيض
- 📏 **الأحجام:** صغير، وسط، كبير

---

## ⚠️ **المشكلة في CSV الحالي:**

الـ `product-feed.csv` الذي أنشأناه **بدون variants** (كل منتج = صف واحد)

في الـ Facebook Catalog، كل المنتجات تظهر:
```
الأشكال المتنوعة: — (خالي)
```

---

## ✅ **الحلول:**

### **Option 1: إذا منتجاتك Single Variant (بدون مقاسات/ألوان)**

✅ **لا تفعل شيء!** الكتالوج شغّال تمام

**الاستخدامات:**
- منتجات unique (قطعة واحدة)
- إكسسوارات
- مستحضرات تجميل (بدون ألوان)

---

### **Option 2: إذا منتجاتك فيها Variants**

يجب تعديل الـ CSV وإضافة variants:

#### **مثال: منتج بـ 3 مقاسات**

**قبل (بدون variants):**
```csv
id,title,price,size
123,جلابية قطيفة,500,
```

**بعد (مع variants):**
```csv
id,item_group_id,title,price,size,availability
123_S,123,جلابية قطيفة - مقاس S,500,S,in stock
123_M,123,جلابية قطيفة - مقاس M,500,M,in stock
123_L,123,جلابية قطيفة - مقاس L,500,L,in stock
```

#### **مثال: منتج بـ 3 ألوان**
```csv
id,item_group_id,title,price,color,availability
456_RED,456,فستان صيفي - أحمر,300,red,in stock
456_BLUE,456,فستان صيفي - أزرق,300,blue,in stock
456_BLACK,456,فستان صيفي - أسود,300,black,in stock
```

#### **مثال: منتج بـ مقاسات + ألوان**
```csv
id,item_group_id,title,price,size,color,availability
789_S_RED,789,تيشيرت - S أحمر,150,S,red,in stock
789_S_BLUE,789,تيشيرت - S أزرق,150,S,blue,in stock
789_M_RED,789,تيشيرت - M أحمر,150,M,red,in stock
789_M_BLUE,789,تيشيرت - M أزرق,150,M,blue,in stock
```

---

## 🛠️ **تعديل Database Schema (إذا أردت)**

إذا أردت إضافة variants في التطبيق:

### **1. تعديل Prisma Schema:**

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  basePrice   Decimal  // السعر الأساسي
  // ... باقي الحقول
  
  variants    ProductVariant[]
}

model ProductVariant {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  sku         String   @unique // رقم مميز للـ variant
  size        String?  // S, M, L, XL
  color       String?  // red, blue, black
  price       Decimal  // السعر (قد يختلف عن السعر الأساسي)
  stock       Int      @default(0)
  imageUrl    String?  // صورة خاصة بالـ variant
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([productId])
}
```

### **2. تعديل CSV Generator:**

```typescript
// في sync-facebook-catalog.ts

// للمنتجات بدون variants (كما هو)
const simpleProducts = products.filter(p => !p.variants || p.variants.length === 0);

// للمنتجات مع variants
const productsWithVariants = products.filter(p => p.variants && p.variants.length > 0);

// Generate CSV rows
const rows = [];

// Simple products
simpleProducts.forEach(product => {
  rows.push({
    id: product.id,
    title: product.name,
    price: `${product.price} EGP`,
    // ... باقي الحقول
  });
});

// Products with variants
productsWithVariants.forEach(product => {
  product.variants.forEach(variant => {
    rows.push({
      id: variant.sku, // unique ID للـ variant
      item_group_id: product.id, // ربط بالمنتج الأساسي
      title: `${product.name} - ${variant.size || ''} ${variant.color || ''}`,
      price: `${variant.price} EGP`,
      size: variant.size || '',
      color: variant.color || '',
      availability: variant.stock > 0 ? 'in stock' : 'out of stock',
      // ... باقي الحقول
    });
  });
});
```

---

## 🎯 **توصيتي:**

### **للمنتجات الحالية (بدون variants):**
✅ **اتركها كما هي** - الكتالوج شغّال!

### **للمنتجات الجديدة (مع variants):**
1. أضف ProductVariant model في Prisma
2. عدّل CSV generator
3. ارفع CSV جديد

---

## 📊 **الفوائد من Variants:**

| بدون Variants | مع Variants |
|---------------|-------------|
| "جلابية قطيفة - 500 ج.م" | "جلابية قطيفة - S - 500 ج.م"<br>"جلابية قطيفة - M - 500 ج.م"<br>"جلابية قطيفة - L - 500 ج.م" |
| العميل يتصل يسأل عن المقاس | العميل يختار المقاس من الإعلان مباشرة |
| إدارة مخزون صعبة | كل variant له مخزون مستقل |
| Dynamic Ads تعرض منتج واحد | Dynamic Ads تعرض كل الـ variants |

---

## 🚀 **الخطوة التالية:**

إذا كانت منتجاتك:
- ✅ **Single variant** (قطعة واحدة) → **اتركها كما هي** وابدأ Dynamic Ads!
- ⚠️ **Multiple variants** (مقاسات/ألوان) → **عدّل CSV** وأضف variants

**معظم المنتجات في صورتك (مستحضرات تجميل) = single variant → جاهزة! 🎉**
