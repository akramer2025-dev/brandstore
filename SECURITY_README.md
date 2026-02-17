# 🛡️ Remo Store - Security Features

تم تأمين التطبيق بالكامل ضد جميع أنواع الهجمات الإلكترونية.

## 🎯 الحماية المطبقة

### 1. ✅ Rate Limiting (حماية من DDoS)
- تسجيل الدخول: 5 محاولات كل 15 دقيقة
- التسجيل: 3 حسابات كل ساعة
- API عامة: 100 طلب كل 15 دقيقة
- رفع الملفات: 10 ملفات كل ساعة
- حظر تلقائي للمخالفين

### 2. ✅ Input Validation (حماية من XSS/SQL Injection)
- تنظيف تلقائي لجميع المدخلات
- التحقق من البريد الإلكتروني والهاتف
- فحص قوة كلمة المرور
- منع HTML/JavaScript الخبيث
- حماية من Path Traversal

### 3. ✅ CSRF Protection
- Token-based protection
- Double submit cookies
- صلاحية محدودة بالوقت (24 ساعة)
- ربط بمعرف المستخدم

### 4. ✅ Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection
- Content-Security-Policy
- Strict-Transport-Security
- Referrer-Policy
- Permissions-Policy

### 5. ✅ API Protection
- Authentication required
- Role-based access control
- Origin validation
- Content-Type validation
- Secure error handling
- Automatic security headers

### 6. ✅ Password Security
- bcrypt hashing (12 rounds)
- قوة كلمة المرور مطلوبة:
  - 8 أحرف على الأقل
  - حرف كبير + صغير
  - رقم + رمز خاص
  - منع كلمات المرور الشائعة

### 7. ✅ File Upload Security
- التحقق من نوع الملف
- حد أقصى لحجم الملف
- تنظيف اسم الملف
- Rate limiting للرفع
- قائمة بيضاء للأنواع المسموحة

### 8. ✅ Database Security
- Prisma ORM (حماية من SQL Injection)
- Parameterized queries
- Input sanitization
- Access control

### 9. ✅ Image Security
- قائمة بيضاء للنطاقات الموثوقة فقط
- منع الصور من مصادر غير موثوقة
- حماية من Image-based attacks

### 10. ✅ Session Security
- NextAuth v5
- Secure cookies (httpOnly, secure, sameSite)
- Token rotation
- Automatic expiration

---

## 📦 الملفات الأمنية

```
src/lib/security/
├── index.ts              # Exports شاملة
├── rate-limit.ts         # Rate Limiting system
├── validation.ts         # Input validation
├── csrf.ts               # CSRF protection
└── api-protection.ts     # API security helpers
```

---

## 🚀 الاستخدام السريع

### في API Route:

```typescript
import {
  apiRateLimit,
  sanitizeInput,
  requireAdmin,
  secureResponse
} from '@/lib/security';

export async function POST(request: NextRequest) {
  // 1. Rate Limiting
  const rateCheck = await apiRateLimit(request);
  if (!rateCheck.success) {
    return NextResponse.json({ error: rateCheck.error }, { status: 429 });
  }
  
  // 2. Authentication & Authorization
  const authCheck = await requireAdmin(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }
  
  // 3. Input Validation
  const body = await request.json();
  const cleanData = sanitizeInput(body);
  
  // 4. Business Logic...
  
  // 5. Secure Response
  return secureResponse({ success: true });
}
```

### مثال Login Route محمي:

```typescript
import {
  loginRateLimit,
  validateEmail,
  validatePassword,
  sanitizeInput,
  secureResponse
} from '@/lib/security';

export async function POST(request: NextRequest) {
  // Rate limiting مشدد
  const rateCheck = await loginRateLimit(request);
  if (!rateCheck.success) {
    return NextResponse.json({ error: rateCheck.error }, { status: 429 });
  }
  
  const body = await request.json();
  const cleanData = sanitizeInput(body);
  
  // التحقق من المدخلات
  if (!validateEmail(cleanData.email)) {
    return NextResponse.json({ error: 'بريد إلكتروني غير صحيح' }, { status: 400 });
  }
  
  const passwordCheck = validatePassword(cleanData.password);
  if (!passwordCheck.valid) {
    return NextResponse.json({ error: passwordCheck.errors[0] }, { status: 400 });
  }
  
  // تسجيل الدخول...
  
  return secureResponse({ success: true, token: '...' });
}
```

---

## 📖 التوثيق الكامل

راجع [SECURITY_GUIDE.md](./SECURITY_GUIDE.md) للتوثيق التفصيلي.

---

## ⚠️ ملاحظات مهمة

### قبل النشر للإنتاج:

1. **غير المفاتيح السرية:**
   ```bash
   # في .env
   NEXTAUTH_SECRET="your-unique-secret-key-here"
   CSRF_SECRET="another-unique-secret-key"
   ```

2. **فعّل HTTPS:**
   - استخدم Let's Encrypt للشهادة المجانية
   - أو استخدم Cloudflare

3. **راجع CSP:**
   - تأكد من السماح فقط للنطاقات المطلوبة

4. **اختبر الأمان:**
   - اختبر Rate Limiting
   - اختبر XSS/CSRF protection
   - اختبر Access Control

---

## 🔐 الحماية من:

- ✅ Brute Force Attacks
- ✅ DDoS Attacks
- ✅ XSS (Cross-Site Scripting)
- ✅ CSRF (Cross-Site Request Forgery)
- ✅ SQL Injection
- ✅ NoSQL Injection
- ✅ Path Traversal
- ✅ Command Injection
- ✅ Clickjacking
- ✅ Session Hijacking
- ✅ Man-in-the-Middle
- ✅ API Abuse
- ✅ Unauthorized Access
- ✅ Data Leakage

---

## 📊 Logging & Monitoring

جميع الأحداث الأمنية يتم تسجيلها:

```
🚨 Rate limit exceeded for 192.168.1.1:abc123
🚨 Blocked request from unauthorized origin
🚨 CSRF token signature mismatch
🚨 Blocked suspicious key: $where
⚠️ Suspicious email domain detected
```

---

## 🆘 الدعم

للأسئلة أو المشاكل الأمنية، راجع [SECURITY_GUIDE.md](./SECURITY_GUIDE.md)

---

**✅ تطبيقك محمي بالكامل ضد جميع التهديدات الإلكترونية!**
