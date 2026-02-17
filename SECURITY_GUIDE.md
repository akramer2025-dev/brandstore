# 🛡️ نظام الحماية الشامل - Remostore Security

## 📋 نظرة عامة

تم تأمين التطبيق بشكل كامل ضد جميع أنواع الهجمات الإلكترونية الشائعة:

- ✅ **Rate Limiting** - منع هجمات DDoS والـ Brute Force
- ✅ **Input Validation** - الحماية من XSS و SQL Injection
- ✅ **CSRF Protection** - منع هجمات Cross-Site Request Forgery
- ✅ **Security Headers** - حماية متقدمة على مستوى HTTP
- ✅ **API Protection** - تأمين جميع الـ API endpoints
- ✅ **Authentication** - نظام مصادقة قوي مع NextAuth
- ✅ **Authorization** - التحكم في الصلاحيات حسب الأدوار
- ✅ **Password Security** - تشفير قوي باستخدام bcrypt

---

## 🚀 كيفية الاستخدام

### 1. Rate Limiting

حماية API Routes من الطلبات الزائدة:

```typescript
// في أي API route
import { apiRateLimit, loginRateLimit } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  // التحقق من Rate Limit
  const rateLimitResult = await apiRateLimit(request);
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: rateLimitResult.error },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
        }
      }
    );
  }
  
  // متابعة العملية...
}
```

**Rate Limiters الجاهزة:**

```typescript
loginRateLimit        // تسجيل الدخول: 5 محاولات/15 دقيقة
registerRateLimit     // التسجيل: 3 حسابات/ساعة
apiRateLimit          // API عامة: 100 طلب/15 دقيقة
uploadRateLimit       // رفع الملفات: 10 ملفات/ساعة
adminRateLimit        // عمليات الأدمن: 200 طلب/15 دقيقة
passwordResetRateLimit // إعادة تعيين كلمة المرور: 3 محاولات/ساعة
paymentRateLimit      // عمليات الدفع: 5 عمليات/10 دقائق
otpRateLimit          // رسائل OTP: 3 رسائل/5 دقائق
```

---

### 2. Input Validation

حماية من XSS و SQL Injection:

```typescript
import {
  sanitizeHTML,
  validateEmail,
  validatePhone,
  validatePassword,
  sanitizeInput
} from '@/lib/security/validation';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // تنظيف جميع المدخلات
  const cleanData = sanitizeInput(body);
  
  // التحقق من البريد الإلكتروني
  if (!validateEmail(cleanData.email)) {
    return NextResponse.json(
      { error: 'بريد إلكتروني غير صحيح' },
      { status: 400 }
    );
  }
  
  // التحقق من كلمة المرور
  const passwordCheck = validatePassword(cleanData.password);
  if (!passwordCheck.valid) {
    return NextResponse.json(
      { error: passwordCheck.errors.join(', ') },
      { status: 400 }
    );
  }
  
  // متابعة العملية...
}
```

**وظائف التحقق المتاحة:**

- `sanitizeHTML(input)` - إزالة HTML و JavaScript الخبيث
- `validateEmail(email)` - التحقق من صحة البريد الإلكتروني
- `validatePhone(phone)` - التحقق من رقم الهاتف المصري
- `validatePassword(password)` - التحقق من قوة كلمة المرور
- `validateURL(url)` - التحقق من صحة URL
- `sanitizeFilename(filename)` - تنظيف اسم الملف
- `validateFileType(filename, allowedTypes)` - التحقق من نوع الملف
- `validateFileSize(size, maxSizeMB)` - التحقق من حجم الملف
- `validateNumber(value, min?, max?)` - التحقق من الأرقام
- `validateUUID(id)` - التحقق من UUID
- `sanitizeInput(input)` - تنظيف شامل للمدخلات
- `whitelist(input, allowedFields)` - قائمة بيضاء للحقول

---

### 3. CSRF Protection

منع هجمات Cross-Site Request Forgery:

```typescript
import { generateCSRFToken, csrfProtection } from '@/lib/security/csrf';

// في Server Component أو API route
export async function GET() {
  const session = await auth();
  const csrfToken = generateCSRFToken(session?.user?.id);
  
  return NextResponse.json({ csrfToken });
}

// في POST/PUT/DELETE routes
export async function POST(request: NextRequest) {  
  const session = await auth();
  
  // التحقق من CSRF token
  const csrfCheck = await csrfProtection(request, session?.user?.id);
  
  if (!csrfCheck.valid) {
    return NextResponse.json(
      { error: csrfCheck.error },
      { status: 403 }
    );
  }
  
  // متابعة العملية...
}
```

**في الـ Frontend:**

```typescript
// الحصول على CSRF token
const response = await fetch('/api/csrf');
const { csrfToken } = await response.json();

// إرساله مع الطلبات
await fetch('/api/sensitive-operation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
});
```

---

### 4. API Protection

حماية شاملة للـ API Routes:

```typescript
import {
  requireAuth,
  requireAdmin,
  requireRole,
  createSecureHandler,
  secureResponse
} from '@/lib/security/api-protection';

// طريقة 1: استخدام المساعدات
export async function POST(request: NextRequest) {
  // التحقق من الصلاحيات
  const authCheck = await requireAdmin(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }
  
  // العمليات...
  
  return secureResponse({ success: true });
}

// طريقة 2: استخدام createSecureHandler (موصى به)
export const POST = createSecureHandler(
  async (request: NextRequest) => {
    const body = await request.json();
    
    // العمليات...
    
    return secureResponse({ success: true });
  },
  {
    requireAuth: true,
    allowedRoles: ['ADMIN', 'VENDOR'],
    allowedMethods: ['POST'],
    requireCSRF: true
  }
);
```

**المساعدات المتاحة:**

- `requireAuth(request)` - يتطلب تسجيل دخول
- `requireAdmin(request)` - يتطلب دور Admin
- `requireVendor(request)` - يتطلب دور Vendor أو Admin
- `requireRole(request, roles)` - يتطلب أحد الأدوار المحددة
- `handleError(error)` - معالجة آمنة للأخطاء
- `validateContentType(request, types)` - التحقق من Content-Type
- `validateOrigin(request)` - التحقق من Origin
- `createSecureHandler(handler, options)` - إنشاء معالج آمن شامل
- `secureResponse(data, status)` - استجابة مع Security Headers

---

### 5. Security Headers

تم إضافة Security Headers تلقائياً في:

**middleware.ts:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy` - سياسة أمان المحتوى
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` - التحكم في الأذونات
- `Strict-Transport-Security` (في الإنتاج فقط)

**next.config.ts:**
- Headers إضافية على مستوى التطبيق
- حماية الصور من النطاقات غير الموثوقة

---

## 🔐 أفضل الممارسات

### 1. حماية API Routes

```typescript
// ❌ خطأ - بدون حماية
export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await prisma.user.create({ data: body });
  return NextResponse.json(user);
}

// ✅ صحيح - مع حماية كاملة
export const POST = createSecureHandler(
  async (request: NextRequest) => {
    const rateLimitCheck = await registerRateLimit(request);
    if (!rateLimitCheck.success) {
      return NextResponse.json(
        { error: rateLimitCheck.error },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const cleanData = sanitizeInput(body);
    
    if (!validateEmail(cleanData.email)) {
      return NextResponse.json(
        { error: 'بريد إلكتروني غير صحيح' },
        { status: 400 }
      );
    }
    
    const passwordCheck = validatePassword(cleanData.password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.errors[0] },
        { status: 400 }
      );
    }
    
    const user = await prisma.user.create({
      data: {
        email: cleanData.email,
        password: await bcrypt.hash(cleanData.password, 12),
        name: sanitizeHTML(cleanData.name)
      }
    });
    
    return secureResponse({ success: true, userId: user.id });
  },
  {
    allowedMethods: ['POST'],
    requireCSRF: true
  }
);
```

### 2. حماية رفع الملفات

```typescript
import {
  sanitizeFilename,
  validateFileType,
  validateFileSize
} from '@/lib/security/validation';
import { uploadRateLimit } from '@/lib/security/rate-limit';

export const POST = createSecureHandler(
  async (request: NextRequest) => {
    // Rate limiting
    const rateLimitCheck = await uploadRateLimit(request);
    if (!rateLimitCheck.success) {
      return NextResponse.json(
        { error: rateLimitCheck.error },
        { status: 429 }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'الملف مطلوب' },
        { status: 400 }
      );
    }
    
    // التحقق من نوع الملف
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp'];
    if (!validateFileType(file.name, allowedTypes)) {
      return NextResponse.json(
        { error: 'نوع الملف غير مسموح' },
        { status: 400 }
      );
    }
    
    // التحقق من حجم الملف (5MB)
    if (!validateFileSize(file.size, 5)) {
      return NextResponse.json(
        { error: 'حجم الملف أكبر من 5 ميجا' },
        { status: 400 }
      );
    }
    
    // تنظيف اسم الملف
    const safeName = sanitizeFilename(file.name);
    
    // رفع الملف...
    
    return secureResponse({ success: true, filename: safeName });
  },
  {
    requireAuth: true,
    allowedMethods: ['POST']
  }
);
```

### 3. حماية عمليات الدفع

```typescript
import { paymentRateLimit } from '@/lib/security/rate-limit';
import { validateNumber } from '@/lib/security/validation';

export const POST = createSecureHandler(
  async (request: NextRequest) => {
    // Rate limiting مشدد
    const rateLimitCheck = await paymentRateLimit(request);
    if (!rateLimitCheck.success) {
      return NextResponse.json(
        { error: rateLimitCheck.error },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    
    // التحقق من المبلغ
    if (!validateNumber(body.amount, 1, 1000000)) {
      return NextResponse.json(
        { error: 'مبلغ غير صحيح' },
        { status: 400 }
      );
    }
    
    // معالجة الدفع...
    
    return secureResponse({ success: true });
  },
  {
    requireAuth: true,
    requireCSRF: true,
    allowedMethods: ['POST']
  }
);
```

---

## 📊 مراقبة الأمان

### Logging

جميع الأحداث الأمنية يتم تسجيلها تلقائياً:

```typescript
// في console.log
🚨 Rate limit exceeded for 192.168.1.1:abc123 - Blocked for 15 minutes
🚨 Blocked request from unauthorized origin: https://malicious-site.com
🚨 CSRF token signature mismatch
🚨 Blocked suspicious key: $where
🚨 Invalid origin: https://attacker.com
⚠️ Suspicious email domain: tempmail.com
```

### Headers المرجعة

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2026-02-18T12:00:00.000Z
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

---

## ⚙️ الإعدادات

### متغيرات البيئة (.env)

```bash
# Authentication
NEXTAUTH_SECRET="your-super-secret-key-change-this"
NEXTAUTH_URL="https://yoursite.com"

# CSRF Protection
CSRF_SECRET="another-super-secret-key-change-this"

# Database
DATABASE_URL="postgresql://..."

# OAuth (إذا كنت تستخدم Google/Facebook)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

⚠️ **مهم جداً:**
- غير `NEXTAUTH_SECRET` و `CSRF_SECRET` في الإنتاج
- استخدم مفاتيح عشوائية قوية (32+ حرف)
- لا تشارك هذه المفاتيح مع أحد
- لا ترفعها على GitHub

---

## 🧪 الاختبار

### اختبار Rate Limiting

```bash
# اختبار بـ curl (5 محاولات سريعة)
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo "\nAttempt $i"
  sleep 1
done
```

بعد 5 محاولات، يجب أن تحصل على:
```json
{
  "error": "عدد كبير من محاولات تسجيل الدخول. حاول مرة أخرى بعد نصف ساعة"
}
```

### اختبار XSS Protection

```typescript
const maliciousInput = `<script>alert('XSS')</script>`;
const cleaned = sanitizeHTML(maliciousInput);
// Result: &lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;
```

### اختبار CSRF

```bash
# محاولة بدون CSRF token (يجب أن تفشل)
curl -X POST http://localhost:3000/api/sensitive-operation \
  -H "Content-Type: application/json" \
  -d '{"data":"test"}'

# Response: {"error":"CSRF token missing"}
```

---

## 🆘 الأسئلة الشائعة

### س: ماذا لو تم حظر المستخدم بالخطأ؟

ج: الحظر مؤقت فقط. سيتم رفعه تلقائياً بعد انتهاء المدة المحددة. في حالات الطوارئ، يمكن للأدمن تنظيف الـ store يدوياً.

### س: هل Rate Limiting يعمل عبر multiple servers؟

ج: حالياً يستخدم in-memory storage. للإنتاج مع multiple servers، استخدم Redis:

```typescript
// استبدل store بـ Redis
import { Redis } from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// في createRateLimit
const count = await redis.incr(key);
await redis.expire(key, windowMs / 1000);
```

### س: كيف أضيف نطاق جديد للصور؟

ج: في `next.config.ts`:

```typescript
remotePatterns: [
  // ... existing patterns
  {
    protocol: 'https',
    hostname: 'your-cdn.com',
  },
],
```

### س: كيف أخصص رسائل الأخطاء؟

ج: عند إنشاء Rate Limiter:

```typescript
const myRateLimit = createRateLimit({
  max: 10,
  windowMs: 60000,
  message: 'رسالتك المخصصة هنا'
});
```

---

## 📚 موارد إضافية

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSRF Protection Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

---

## ✅ Checklist الأمان

قبل النشر للإنتاج، تأكد من:

- [ ] تغيير `NEXTAUTH_SECRET` في `.env`
- [ ] تغيير `CSRF_SECRET` في `.env`
- [ ] تفعيل HTTPS على السيرفر
- [ ] مراجعة Content Security Policy
- [ ] تحديد النطاقات المسموحة للصور
- [ ] اختبار Rate Limiting
- [ ] مراجعة Role-based Access Control
- [ ] تفعيل Logging للأحداث الأمنية
- [ ] إعداد Monitoring & Alerts
- [ ] مراجعة جميع API endpoints للتأكد من حمايتها
- [ ] اختبار الحماية من XSS
- [ ] اختبار الحماية من CSRF
- [ ] النسخ الاحتياطي للبيانات
- [ ] إعداد خطة استجابة للحوادث الأمنية

---

**🎉 تطبيقك الآن محمي بالكامل!**

تم تطبيق أفضل ممارسات الأمان لحماية تطبيقك وبيانات مستخدميك. 🛡️
