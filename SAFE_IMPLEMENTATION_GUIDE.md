# 🔧 دليل تطبيق نظام الأسعار بأمان

## ⚠️ مهم جداً: قبل أي تعديل

1. **خذ نسخة احتياطية من الكود**
2. **اختبر على بيئة تطوير أولاً**
3. **لا تعدل الكود الأساسي مباشرة**

---

## 📁 الملفات المُنشأة:

✅ `/src/lib/pricing.ts` - دوال حساب الأسعار (جاهزة وآمنة)

---

## 🎯 التطبيق خطوة بخطوة (اختياري)

### المرحلة 1: تعديل API المنتجات (اختياري)

**الملف:** `src/app/api/products/route.ts`

**التعديل المقترح:**

```typescript
// في بداية الملف
import { auth } from "@/lib/auth";

// في دالة GET، بعد جلب المنتجات
export async function GET(request: Request) {
  try {
    const session = await auth(); // جلب بيانات المستخدم
    
    // ... الكود الموجود ...
    
    const products = await prisma.product.findMany({
      // ... الكود الموجود ...
      select: {
        id: true,
        nameAr: true,
        price: true,
        wholesalePrice: true, // ⬅️ إضافة سعر الجملة
        minWholesaleQuantity: true, // ⬅️ إضافة الحد الأدنى
        // ... باقي الحقول ...
      },
    });
    
    // اختياري: إضافة معلومات الصلاحيات للمستخدم
    const response = NextResponse.json({
      products,
      user: session?.user ? {
        isPartner: session.user.partnerId && session.user.partnerStaffPermissions?.canSellWholesale,
      } : null,
    });
    
    return response;
  } catch (error) {
    // ... الكود الموجود ...
  }
}
```

**⚠️ ملاحظة:** هذا التعديل **اختياري** - الكود الحالي سيعمل بدونه.

---

### المرحلة 2: تعديل صفحة المنتج (اختياري)

**الملف:** `src/app/products/[id]/page.tsx`

**خطوات التعديل الآمنة:**

#### 1. استيراد دوال الأسعار:

```typescript
// في بداية الملف
import { calculatePrice, formatPrice } from '@/lib/pricing';
import { useSession } from 'next-auth/react'; // إذا لم يكن موجود
```

#### 2. استخدام الـ session:

```typescript
export default function ProductDetailPage() {
  const { data: session } = useSession(); // جلب بيانات المستخدم
  
  // ... الكود الموجود ...
```

#### 3. حساب السعر الصحيح:

```typescript
// استبدل دالة getCurrentPrice الموجودة بـ:
const getPriceInfo = () => {
  const productData = {
    price: selectedVariant ? selectedVariant.price : product?.price || 0,
    wholesalePrice: product?.wholesalePrice,
    minWholesaleQuantity: product?.minWholesaleQuantity || 6,
  };
  
  return calculatePrice(productData, session?.user, quantity);
};

const getCurrentPrice = () => {
  return getPriceInfo().displayPrice;
};
```

#### 4. عرض معلومات الأسعار:

```typescript
// في قسم عرض السعر، أضف:
{product && (
  <div className="space-y-2">
    {(() => {
      const priceInfo = getPriceInfo();
      
      return (
        <>
          {/* سعر الجملة للشركاء */}
          {priceInfo.canUseWholesale && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 line-through">
                  {formatPrice(priceInfo.originalPrice)}
                </span>
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                  خصم {priceInfo.discountPercent.toFixed(0)}%
                </span>
              </div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {formatPrice(priceInfo.displayPrice)}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                سعر الجملة - الحد الأدنى: {priceInfo.minQuantity} قطع
              </div>
            </div>
          )}
          
          {/* السعر العادي */}
          {!priceInfo.isWholesalePrice && (
            <div className="text-3xl font-bold text-gray-900">
              {formatPrice(priceInfo.displayPrice)}
            </div>
          )}
          
          {/* رسالة توضيحية */}
          {priceInfo.message && (
            <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
              {priceInfo.message}
            </div>
          )}
        </>
      );
    })()}
  </div>
)}
```

---

### المرحلة 3: تعديل السلة (اختياري)

**الملف:** `src/store/cart.ts` أو `src/app/cart/page.tsx`

**التعديل المقترح:**

```typescript
import { calculateTotalPrice } from '@/lib/pricing';

// عند حساب المجموع
const total = cartItems.reduce((sum, item) => {
  return sum + calculateTotalPrice(
    item.product, 
    session?.user, 
    item.quantity
  );
}, 0);
```

---

## ✅ الاختبار

### 1. اختبر بدون تسجيل دخول:
```
- افتح منتج
- تأكد أن السعر العادي يظهر
- أضف للسلة
- تأكد أن الحساب صحيح
```

### 2. اختبر بحساب عادي:
```
- سجل دخول بحساب عميل
- نفس الخطوات السابقة
- يجب أن يظهر السعر العادي
```

### 3. اختبر بحساب شريك:
```
Email: partner@remostore.net
Password: partner123

- سجل دخول
- افتح منتج
- يجب أن تظهر رسالة عن سعر الجملة
- اطلب أقل من 6 قطع: يظهر السعر العادي + رسالة
- اطلب 6 قطع أو أكثر: يظهر سعر الجملة + خصم
```

---

## 🚨 في حالة حدوث مشاكل

### إذا ظهر خطأ:

1. **راجع Console في المتصفح** (F12)
2. **تأكد من import العناوين صح**
3. **تأكد من TypeScript types**
4. **ارجع للكود الأصلي** (من نسخة احتياطية)

### الحل السريع:

```typescript
// إذا حصل أي error، استخدم try-catch:
const getPriceInfo = () => {
  try {
    return calculatePrice(productData, session?.user, quantity);
  } catch (error) {
    console.error('Price calculation error:', error);
    // ارجع للسعر العادي كـ fallback
    return {
      displayPrice: product?.price || 0,
      originalPrice: product?.price || 0,
      isWholesalePrice: false,
      discount: 0,
      discountPercent: 0,
      canUseWholesale: false,
      minQuantityReached: false,
      minQuantity: 6,
    };
  }
};
```

---

## 📊 مراقبة الأداء

```typescript
// أضف logging لمراقبة الأسعار
console.log('Price Calculation:', {
  product: product?.nameAr,
  quantity,
  priceInfo: getPriceInfo(),
  user: session?.user?.email,
  isPartner: session?.user?.partnerId,
});
```

---

## ⚡ نصائح الأمان

1. ✅ **اختبر بيئة التطوير أولاً** - `npm run dev`
2. ✅ **راجع TypeScript errors** - `npm run build`
3. ✅ **استخدم Git** - commit قبل أي تعديل
4. ✅ **اختبر كل السيناريوهات** - شريك/عميل/زائر
5. ✅ **راقب الأخطاء** - Console + Error Monitoring

---

## 🎯 خلاصة

- ✅ الدوال جاهزة في `/src/lib/pricing.ts`
- ⚠️ التطبيق **اختياري** - الموقع يعمل بدونه
- 🔒 آمن - لا يؤثر على الكود الموجود
- 🧪 قابل للاختبار - سهل التراجع
- 📈 قابل للتوسع - يمكن إضافة مستويات خصم لاحقاً

---

**ملاحظة نهائية:**  
كل التعديلات أعلاه **اختيارية**. نظام الأسعار يعمل حالياً من قاعدة البيانات.  
التعديلات هنا فقط لعرض الأسعار بشكل أفضل في واجهة المستخدم.
