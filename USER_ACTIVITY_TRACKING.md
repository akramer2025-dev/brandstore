# 📊 نظام تتبع نشاط المستخدمين - User Activity Tracking

## ✅ تم التفعيل بنجاح!

نظام يسجل تلقائياً:
- 📱 نوع الجهاز (Mobile/Desktop/Tablet)
- 🌐 المتصفح (Chrome, Safari, Firefox, etc)
- 💻 نظام التشغيل (Android, iOS, Windows, etc)
- 📲 موديل الجهاز (iPhone, Samsung Galaxy, etc)
- 🌍 IP Address
- ⚡ الأنشطة (LOGIN, ADD_PRODUCT, CREATE_ORDER, etc)

---

## 📚 كيفية الاستخدام

###1. **تسجيل نشاط يدوياً:**

\`\`\`typescript
import { logUserActivity } from '@/lib/user-activity';

await logUserActivity({
  userId: 'user-id',
  action: 'ADD_PRODUCT',
  ip: req.headers.get('x-forwarded-for') || 'unknown',
  userAgent: req.headers.get('user-agent') || undefined,
  metadata: { productName: 'منتج جديد' },
});
\`\`\`

### 2. **عرض آخر أنشطة المستخدم:**

\`\`\`typescript
import { getUserActivities } from '@/lib/user-activity';

const activities = await getUserActivities(userId, 20); // آخر 20 نشاط
\`\`\`

### 3. **إحصائيات المستخدم:**

\`\`\`typescript
import { getUserActivityStats } from '@/lib/user-activity';

const stats = await getUserActivityStats(userId);
// يرجع: إجمالي الأنشطة، الأجهزة، المتصفحات، أنواع الأنشطة
\`\`\`

---

## 🔌 API Endpoints

### `GET /api/user/activity`
عرض آخر أنشطة المستخدم الحالي

**Parameters:**
- `limit` (optional): عدد الأنشطة (افتراضي: 20)

**مثال:**
\`\`\`
GET /api/user/activity?limit=50
\`\`\`

### `GET /api/user/activity?stats=true`
إحصائيات نشاط المستخدم

**مثال:**
\`\`\`
GET /api/user/activity?stats=true
\`\`\`

**الرد:**
\`\`\`json
{
  "totalActivities": 150,
  "lastActivity": {...},
  "deviceTypes": {
    "MOBILE": 80,
    "DESKTOP": 70
  },
  "browsers": {
    "Chrome": 100,
    "Safari": 50
  },
  "actions": {
    "LOGIN": 50,
    "ADD_PRODUCT": 30,
    "CREATE_ORDER": 70
  }
}
\`\`\`

---

## ⚙️ تسجيل تلقائي

### ✅ يتم التسجيل تلقائياً في:

1. **عند تسجيل الدخول (LOGIN)**
   - يتم تسجيله في `auth.ts` callbacks
   - يحفظ: Provider (Google/Credentials), Device Info

### 🔜 يمكنك إضافة تسجيل تلقائي في:

2. **عند إضافة منتج (ADD_PRODUCT)**
   - في API: `/api/products` (POST method)

3. **عند إنشاء طلب (CREATE_ORDER)**
   - في API: `/api/orders` (POST method)

4. **عند عرض لوحة التحكم (VIEW_DASHBOARD)**
   - في صفحة: `/vendor/dashboard` (useEffect)

---

## 🧹 صيانة

### مسح السجلات القديمة (أكثر من 90 يوم):

\`\`\`typescript
import { cleanOldActivityLogs } from '@/lib/user-activity';

const deleted = await cleanOldActivityLogs(90); // 90 يوم
console.log(\`تم مسح \${deleted} سجل قديم\`);
\`\`\`

**💡 نصيحة:** اعمل Cron Job ينظف السجلات القديمة كل شهر

---

## 📊 Database Schema

### جدول `user_activity_logs`:
- `id`: معرف السجل  
- `userId`: معرف المستخدم
- `action`: نوع النشاط (LOGIN, ADD_PRODUCT, etc)
- `ip`: IP Address
- `userAgent`: User-Agent String
- `deviceType`: MOBILE/DESKTOP/TABLET
- `browser`: اسم المتصفح
- `os`: نظام التشغيل
- `deviceModel`: موديل الجهاز
- `location`: المدينة/البلد (اختياري)
- `metadata`: بيانات إضافية (JSON)
- `createdAt`: تاريخ النشاط

### تحديثات `users` table:
- `lastLoginAt`: آخر تسجيل دخول
- `lastLoginIp`: آخر IP
- `lastLoginDevice`: آخر جهاز

---

##Actions المتاحة

يمكنك استخدام أي action تريده، مثل:
- `LOGIN` - تسجيل الدخول
- `LOGOUT` - تسجيل الخروج  
- `ADD_PRODUCT` - إضافة منتج
- `EDIT_PRODUCT` - تعديل منتج
- `DELETE_PRODUCT` - حذف منتج
- `CREATE_ORDER` - إنشاء طلب
- `CANCEL_ORDER` - إلغاء طلب
- `VIEW_DASHBOARD` - عرض لوحة التحكم
- `EXPORT_DATA` - تصدير بيانات
- `CHANGE_PASSWORD` - تغيير كلمة المرور
- ... أي نشاط تريد تتبعه!

---

## 🧪 الاختبار

\`\`\`bash
npx tsx test-activity-tracking.ts
\`\`\`

---

## ⚠️ ملاحظات مهمة

1. **لا يكسر التطبيق:** إذا فشل التسجيل، لن يؤثر على عمل التطبيق
2. **Optional:** كل الحقول optional ماعدا userId و action
3. **Performance:** الجدول مُفهرس (indexed) للأداء السريع
4. **Privacy:** لا يحفظ بيانات حساسة (كلمات مرور، etc)
5. **GDPR:** يمكن مسح بيانات مستخدم معين بسهولة

---

## 🎯 الخطوات التالية (اختياري)

- [ ] إضافة تسجيل تلقائي في APIs الأخرى
- [ ] عمل صفحة Admin لعرض أنشطة كل المستخدمين
- [ ] إضافة تتبع Location (المدينة/البلد) من IP
- [ ] عمل Cron Job لمسح السجلات القديمة تلقائياً
- [ ] إضافة Dashboard للإحصائيات والتحليلات

---

**✨ النظام جاهز للاستخدام!**
