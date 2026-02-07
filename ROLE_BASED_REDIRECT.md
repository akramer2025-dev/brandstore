# نظام التوجيه الذكي بناءً على دور المستخدم

## نظرة عامة
تم تطبيق نظام توجيه ذكي يوجه المستخدمين إلى الصفحة المناسبة بناءً على دورهم (role) بعد تسجيل الدخول.

## التغييرات المُنفذة

### 1️⃣ صفحة تسجيل الدخول (`src/app/auth/login/page.tsx`)

#### التوجيه بعد تسجيل الدخول:
- **ADMIN** → `/admin` (لوحة الإدارة)
- **VENDOR** → `/vendor/dashboard` (لوحة الشريك)
- **MANUFACTURER** → `/manufacturer/dashboard` (لوحة المصنّع)
- **DELIVERY_STAFF** → `/delivery-dashboard` (لوحة التوصيل)
- **MARKETING_STAFF** → `/marketing/dashboard` (لوحة التسويق)
- **CUSTOMER** → `/` (الصفحة الرئيسية)

#### التحسينات:
1. **useEffect محسّن**: يفحص role المستخدم بعد تسجيل الدخول ويوجهه للوحته
2. **Google Sign In**: تم تحديثه ليتوافق مع نظام التوجيه الجديد
3. **Credentials Login**: يحافظ على logic التوجيه الموجود مسبقاً

### 2️⃣ Middleware (`src/middleware.ts`)

#### التحديثات:
1. **استخدام auth() function**: للحصول على session كاملة بدلاً من التحقق من cookie فقط
2. **منع الوصول لصفحات auth**: إذا كان المستخدم مسجل دخول
3. **التوجيه الذكي**: توجيه المستخدم للوحته إذا حاول الوصول لـ `/auth/login` أو `/auth/register`

#### Matcher:
```typescript
matcher: ['/auth/login', '/auth/register']
```

## كيفية العمل

### السيناريو 1: تسجيل دخول جديد
```
1. المستخدم يفتح /auth/login
2. يسجل دخول (Credentials أو Google)
3. useEffect يفحص session.user.role
4. يوجه المستخدم للصفحة المناسبة:
   - Admin → /admin
   - Vendor → /vendor/dashboard
   - Customer → /
```

### السيناريو 2: مستخدم مسجل دخول مسبقاً
```
1. المستخدم مسجل دخول ويحاول فتح /auth/login
2. Middleware يفحص session
3. يوجهه مباشرة للوحته بدون عرض صفحة login
```

### السيناريو 3: Google OAuth
```
1. المستخدم يضغط "تسجيل الدخول بواسطة Google"
2. يوافق على الأذونات في Google
3. يعود للموقع مع session جديدة
4. useEffect يفحص role ويوجهه للوحته
```

## الفوائد

### ✅ تجربة مستخدم محسّنة
- كل مستخدم يذهب مباشرة للوحة الخاصة به
- لا حاجة للتنقل اليدوي بعد تسجيل الدخول

### ✅ أمان محسّن
- منع الوصول لصفحات auth إذا كان المستخدم مسجل دخول
- التوجيه التلقائي يمنع الوصول غير المصرح لصفحات أخرى

### ✅ دعم جميع طرق تسجيل الدخول
- ✅ Credentials (Email/Password)
- ✅ Google OAuth
- ✅ أي OAuth provider آخر مستقبلاً

## الاختبار

### اختبر كـ ADMIN:
```
1. سجل دخول بحساب admin
2. المتوقع: يوجهك لـ /admin
```

### اختبر كـ VENDOR:
```
1. سجل دخول بحساب شريك (vendor)
2. المتوقع: يوجهك لـ /vendor/dashboard
```

### اختبر كـ CUSTOMER:
```
1. سجل دخول بحساب عميل جديد (أو Google)
2. المتوقع: يوجهك للصفحة الرئيسية /
```

### اختبر Middleware:
```
1. سجل دخول بأي حساب
2. افتح link: /auth/login
3. المتوقع: يوجهك مباشرة للوحتك (بدون عرض صفحة login)
```

## ملاحظات فنية

### استخدام auth() في Middleware:
```typescript
const session = await auth();
if (session?.user) {
  // التوجيه بناءً على role
}
```

هذا يتطلب:
- NextAuth v5
- Middleware يجب أن يكون async
- auth() يجب أن يكون imported من `@/lib/auth`

### useEffect Dependencies:
```typescript
useEffect(() => {
  if (status === 'authenticated' && session?.user) {
    // redirect logic
  }
}, [status, session, router]);
```

يتم تشغيله عند:
- تغيير status (loading → authenticated)
- تحديث session
- تغيير router (نادر)

## التوسعات المستقبلية

### إضافة roles جديدة:
```typescript
// في login/page.tsx و middleware.ts
else if (session.user.role === 'NEW_ROLE') {
  router.push('/new-role/dashboard');
}
```

### إضافة redirect مخصص:
```typescript
// في login page
const searchParams = useSearchParams();
const callbackUrl = searchParams.get('callbackUrl');

if (callbackUrl) {
  router.push(callbackUrl);
} else {
  // default role-based redirect
}
```

## Git Commit
```
ff52350 - Implement role-based redirect after login - Admin/Vendor to dashboard, Customer to homepage
```

---

**تاريخ الإنشاء**: 8 فبراير 2026  
**الحالة**: ✅ مُنفذ ومُختبر  
**التأثير**: جميع المستخدمين (Admin, Vendor, Customer)
