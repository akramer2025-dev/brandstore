# تعليمات مسح localStorage للمستخدمين

## المشكلة
بعد تنظيف الكوبونات المكررة، المستخدمين اللي عندهم كوبونات نشطة بيشوفوا عجلة الحظ لأن localStorage عندهم مش محدث.

## المستخدمين المتأثرين
1. **أكرم** (akram@gmail.com) - عنده كوبون LUCKY906161
2. **ندى** (nada@vendor.com) - عندها كوبون LUCKY1209913

## الحل

### على المتصفح
افتح Console في المتصفح (F12) واكتب:
```javascript
// مسح كل localStorage
localStorage.clear();

// أو مسح المفتاح المحدد فقط
localStorage.removeItem('prizeClaimed');
localStorage.removeItem('hasVisitedBefore');
localStorage.removeItem('pendingPrize');
localStorage.removeItem('userPrize');
```

### إعادة التحميل
بعد مسح localStorage، أعد تحميل الصفحة (Ctrl+F5 أو Ctrl+R)

## السلوك المتوقع بعد الإصلاح
- ✅ المستخدم اللي عنده كوبون نشط → العجلة **لن تظهر له**
- ✅ المستخدم الجديد → العجلة **تظهر له بعد ثانيتين**
- ✅ لو ضغط "جرب حظك" → يربح جائزة
- ✅ لو ضغط "احصل على الخصم" → يحفظ الكوبون في قاعدة البيانات
- ✅ بعد حفظ الكوبون → العجلة **لن تظهر له مرة أخرى**

## الكود المُحسّن
تم تحسين SpinWheel.tsx لـ:
1. استخدام `Promise.then()` للانتظار حتى يكتمل فحص الكوبونات
2. إضافة `isMounted` flag لمنع memory leaks
3. الـ `setTimeout` يتم تنفيذه فقط إذا المستخدم ليس لديه كوبونات
4. إضافة console.log للتتبع والتشخيص
