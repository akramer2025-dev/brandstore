# 🚀 Quick Start - تطبيق الحماية بسرعة

## ✨ الحماية مطبقة بالفعل في:

- ✅ Middleware - Security headers تلقائياً
- ✅ Next.js Config - حماية الصور والـ headers
- ✅ جميع الأدوات جاهزة في `src/lib/security/`

---

## 📝 كيف أحمي API Route جديد؟

### طريقة سريعة (موصى بها):

```typescript
// src/app/api/your-route/route.ts
import { NextRequest } from 'next/server';
import { createSecureHandler, apiRateLimit, sanitizeInput, secureResponse } from '@/lib/security';

export const POST = createSecureHandler(
  async (request: NextRequest) => {
    // 1. Rate limiting
    const rateCheck = await apiRateLimit(request);
    if (!rateCheck.success) {
      return NextResponse.json({ error: rateCheck.error }, { status: 429 });
    }
    
    // 2. تنظيف المدخلات
    const body = await request.json();
    const cleanData = sanitizeInput(body);
    
    // 3. العمليات...
    
    // 4. استجابة آمنة
    return secureResponse({ success: true });
  },
  {
    requireAuth: true,        // يتطلب تسجيل دخول
    allowedRoles: ['ADMIN'],  // الأدوار المسموحة
    requireCSRF: true,        // حماية CSRF
  }
);
```

---

## 🔐 حماية Login/Register

```typescript
// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  registerRateLimit,
  sanitizeInput,
  validateEmail,
  validatePassword,
  secureResponse
} from '@/lib/security';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  // Rate limiting مشدد للتسجيل
  const rateCheck = await registerRateLimit(request);
  if (!rateCheck.success) {
    return NextResponse.json({ error: rateCheck.error }, { status: 429 });
  }
  
  const body = await request.json();
  const cleanData = sanitizeInput(body);
  
  // التحقق من البريد الإلكتروني
  if (!validateEmail(cleanData.email)) {
    return NextResponse.json({ error: 'بريد إلكتروني غير صحيح' }, { status: 400 });
  }
  
  // التحقق من كلمة المرور
  const passwordCheck = validatePassword(cleanData.password);
  if (!passwordCheck.valid) {
    return NextResponse.json({ 
      error: passwordCheck.errors[0],
      strength: passwordCheck.strength 
    }, { status: 400 });
  }
  
  // إنشاء المستخدم
  const hashedPassword = await bcrypt.hash(cleanData.password, 12);
  const user = await prisma.user.create({
    data: {
      email: cleanData.email,
      password: hashedPassword,
      name: cleanData.name || '',
      role: 'CUSTOMER'
    }
  });
  
  return secureResponse({ 
    success: true, 
    userId: user.id 
  }, 201);
}
```

---

## 📤 حماية رفع الملفات

```typescript
import {
  uploadRateLimit,
  validateFileType,
  validateFileSize,
  sanitizeFilename,
  createSecureHandler,
  secureResponse
} from '@/lib/security';

export const POST = createSecureHandler(
  async (request: NextRequest) => {
    // Rate limiting للرفع
    const rateCheck = await uploadRateLimit(request);
    if (!rateCheck.success) {
      return NextResponse.json({ error: rateCheck.error }, { status: 429 });
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'الملف مطلوب' }, { status: 400 });
    }
    
    // التحقق من النوع (صور فقط)
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp'];
    if (!validateFileType(file.name, allowedTypes)) {
      return NextResponse.json({ 
        error: 'نوع الملف غير مسموح',
        allowedTypes 
      }, { status: 400 });
    }
    
    // التحقق من الحجم (5MB)
    if (!validateFileSize(file.size, 5)) {
      return NextResponse.json({ 
        error: 'حجم الملف أكبر من 5 ميجا' 
      }, { status: 400 });
    }
    
    // تنظيف اسم الملف
    const safeName = sanitizeFilename(file.name);
    
    // رفع الملف...
    
    return secureResponse({ 
      success: true, 
      filename: safeName 
    });
  },
  {
    requireAuth: true,
    allowedMethods: ['POST']
  }
);
```

---

## 🔨 حماية Admin Operations

```typescript
import { requireAdmin, adminRateLimit, secureResponse } from '@/lib/security';

export async function DELETE(request: NextRequest) {
  // Rate limiting للأدمن
  const rateCheck = await adminRateLimit(request);
  if (!rateCheck.success) {
    return NextResponse.json({ error: rateCheck.error }, { status: 429 });
  }
  
  // التحقق من صلاحيات الأدمن
  const authCheck = await requireAdmin(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }
  
  // العمليات الإدارية...
  
  return secureResponse({ success: true });
}
```

---

## 🎯 أمثلة سريعة

### 1. تنظيف مدخلات المستخدم:

```typescript
import { sanitizeInput, validateEmail } from '@/lib/security';

const body = await request.json();
const cleanData = sanitizeInput(body); // ينظف جميع الحقول

if (!validateEmail(cleanData.email)) {
  return NextResponse.json({ error: 'بريد غير صحيح' }, { status: 400 });
}
```

### 2. التحقق من كلمة المرور:

```typescript
import { validatePassword } from '@/lib/security';

const passwordCheck = validatePassword(formData.password);

if (!passwordCheck.valid) {
  console.log('Errors:', passwordCheck.errors);
  console.log('Strength:', passwordCheck.strength); // 'weak' | 'medium' | 'strong'
  return NextResponse.json({ error: passwordCheck.errors[0] }, { status: 400 });
}
```

### 3. استخدام CSRF Token في Frontend:

```typescript
// في React Component
const [csrfToken, setCsrfToken] = useState('');

useEffect(() => {
  // الحصول على CSRF token
  fetch('/api/csrf')
    .then(res => res.json())
    .then(data => setCsrfToken(data.csrfToken));
}, []);

// إرساله مع الطلبات
const handleSubmit = async () => {
  const response = await fetch('/api/some-action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken  // ✅ إضافة CSRF token
    },
    body: JSON.stringify(data)
  });
};
```

### 4. Rate Limit Headers:

```typescript
const response = await fetch('/api/login', { method: 'POST', ... });

// قراءة معلومات Rate Limiting
const limit = response.headers.get('X-RateLimit-Limit');
const remaining = response.headers.get('X-RateLimit-Remaining');
const reset = response.headers.get('X-RateLimit-Reset');

console.log(`${remaining}/${limit} طلبات متبقية`);
console.log(`إعادة التعيين: ${new Date(reset)}`);
```

---

## ⚙️ إعدادات سريعة

### إضافة نطاق جديد للصور:

```typescript
// في next.config.ts
remotePatterns: [
  // ... existing
  {
    protocol: 'https',
    hostname: 'your-new-cdn.com',
  },
]
```

### تخصيص Rate Limiting:

```typescript
import { createRateLimit } from '@/lib/security';

export const myCustomLimit = createRateLimit({
  max: 20,                      // 20 طلب
  windowMs: 60 * 1000,          // كل دقيقة
  blockDuration: 5 * 60 * 1000, // حظر لمدة 5 دقائق
  message: 'رسالة مخصصة'
});
```

---

## 📚 الملفات المهمة

- `src/lib/security/` - جميع أدوات الأمان
- `SECURITY_GUIDE.md` - دليل شامل
- `SECURITY_README.md` - نظرة سريعة
- `src/lib/security/example-secure-api.ts` - أمثلة كاملة

---

## ✅ Checklist قبل الإنتاج

- [ ] غيّر `NEXTAUTH_SECRET` في `.env`
- [ ] أضف `CSRF_SECRET` في `.env`
- [ ] فعّل HTTPS
- [ ] راجع Content Security Policy
- [ ] حدد النطاقات المسموحة للصور
- [ ] اختبر Rate Limiting
- [ ] اختبر XSS/CSRF protection
- [ ] راجع جميع API endpoints
- [ ] فعّل Logging
- [ ] خطة للنسخ الاحتياطي

---

**🎉 تطبيقك محمي الآن! ابدأ بنسخ الأمثلة أعلاه وطبقها في كل API route.**
