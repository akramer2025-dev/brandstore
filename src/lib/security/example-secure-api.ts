/**
 * 🛡️ مثال عملي لـ API Route محمي بالكامل
 * 
 * هذا المثال يوضح كيفية تطبيق جميع طبقات الحماية
 * 
 * نسخ هذا الملف واستخدامه كقالب لأي API route جديد
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  // Rate Limiting
  apiRateLimit,
  adminRateLimit,
  
  // Input Validation
  sanitizeInput,
  validateEmail,
  validatePassword,
  validateNumber,
  whitelist,
  
  // CSRF Protection
  csrfProtection,
  
  // API Protection
  requireAuth,
  requireAdmin,
  requireRole,
  createSecureHandler,
  secureResponse,
  handleError,
} from '@/lib/security';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * ====================================
 * مثال 1: API عامة مع Rate Limiting فقط
 * ====================================
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Rate Limiting
    const rateCheck = await apiRateLimit(request);
    
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: rateCheck.error },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateCheck.limit.toString(),
            'X-RateLimit-Remaining': rateCheck.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateCheck.reset).toISOString(),
          }
        }
      );
    }
    
    // 2. Business Logic
    const data = await prisma.product.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    
    // 3. Secure Response مع Security Headers
    return secureResponse({
      success: true,
      data,
      remaining: rateCheck.remaining
    });
    
  } catch (error) {
    return handleError(error);
  }
}

/**
 * ====================================
 * مثال 2: POST Route مع حماية كاملة (الطريقة التقليدية)
 * ====================================
 */
export async function POST_Example1(request: NextRequest) {
  try {
    // 1. Rate Limiting
    const rateCheck = await adminRateLimit(request);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: rateCheck.error },
        { status: 429 }
      );
    }
    
    // 2. Authentication & Authorization
    const authCheck = await requireAdmin(request);
    if (!authCheck.authorized) {
      return authCheck.response;
    }
    
    // 3. CSRF Protection
    const csrfCheck = await csrfProtection(request, authCheck.user?.id);
    if (!csrfCheck.valid) {
      return NextResponse.json(
        { error: csrfCheck.error },
        { status: 403 }
      );
    }
    
    // 4. Input Validation
    const body = await request.json();
    
    // تنظيف شامل
    const cleanData = sanitizeInput(body);
    
    // قائمة بيضاء للحقول المسموحة
    const allowedData = whitelist<{
      name: string;
      email: string;
      price: number;
    }>(cleanData, ['name', 'email', 'price']);
    
    // التحقق من الحقول
    if (!allowedData.name || !allowedData.name.trim()) {
      return NextResponse.json(
        { error: 'الاسم مطلوب' },
        { status: 400 }
      );
    }
    
    if (allowedData.email && !validateEmail(allowedData.email)) {
      return NextResponse.json(
        { error: 'بريد إلكتروني غير صحيح' },
        { status: 400 }
      );
    }
    
    if (allowedData.price && !validateNumber(allowedData.price, 0, 1000000)) {
      return NextResponse.json(
        { error: 'السعر يجب أن يكون بين 0 و 1,000,000' },
        { status: 400 }
      );
    }
    
    // 5. Business Logic
    const result = await prisma.product.create({
      data: {
        name: allowedData.name,
        price: allowedData.price || 0,
        // ... other fields
      }
    });
    
    // 6. Secure Response
    return secureResponse({
      success: true,
      data: result
    });
    
  } catch (error) {
    return handleError(error);
  }
}

/**
 * ====================================
 * مثال 3: POST Route مع createSecureHandler (موصى به) ⭐
 * ====================================
 */
export const POST = createSecureHandler(
  async (request: NextRequest) => {
    // 1. Rate Limiting (يدوي)
    const rateCheck = await adminRateLimit(request);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: rateCheck.error },
        { status: 429 }
      );
    }
    
    // 2. Input Validation
    const body = await request.json();
    const cleanData = sanitizeInput(body);
    
    // قائمة بيضاء
    const allowedData = whitelist<{
      title: string;
      description: string;
      price: number;
      quantity: number;
    }>(cleanData, ['title', 'description', 'price', 'quantity']);
    
    // التحقق
    if (!allowedData.title?.trim()) {
      return NextResponse.json(
        { error: 'العنوان مطلوب' },
        { status: 400 }
      );
    }
    
    if (!validateNumber(allowedData.price, 1)) {
      return NextResponse.json(
        { error: 'السعر يجب أن يكون أكبر من 0' },
        { status: 400 }
      );
    }
    
    if (!validateNumber(allowedData.quantity, 0)) {
      return NextResponse.json(
        { error: 'الكمية يجب أن تكون 0 أو أكثر' },
        { status: 400 }
      );
    }
    
    // 3. Business Logic
    const product = await prisma.product.create({
      data: {
        name: allowedData.title,
        description: allowedData.description || '',
        price: allowedData.price,
        stock: allowedData.quantity,
        categoryId: 'default-category-id', // Replace with actual ID
      }
    });
    
    // 4. Response (Security Headers تضاف تلقائياً)
    return secureResponse({
      success: true,
      message: 'تم إنشاء المنتج بنجاح',
      data: {
        id: product.id,
        name: product.name,
        price: product.price,
      }
    }, 201);
  },
  {
    // createSecureHandler سيتحقق من كل هذا تلقائياً
    requireAuth: true,
    allowedRoles: ['ADMIN'],
    allowedMethods: ['POST'],
    requireCSRF: true, // تفعيل CSRF protection
  }
);

/**
 * ====================================
 * مثال 4: User Registration مع حماية متقدمة
 * ====================================
 */
export const POST_UserRegistration = createSecureHandler(
  async (request: NextRequest) => {
    // استخدام loginRateLimit بدلاً من apiRateLimit
    const { registerRateLimit } = await import('@/lib/security');
    const rateCheck = await registerRateLimit(request);
    
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: rateCheck.error,
          blockUntil: rateCheck.blockUntil
        },
        { status: 429 }
      );
    }
    
    const body = await request.json();
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
        {
          error: 'كلمة مرور ضعيفة',
          details: passwordCheck.errors,
          strength: passwordCheck.strength
        },
        { status: 400 }
      );
    }
    
    // التحقق من وجود المستخدم
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanData.email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 409 }
      );
    }
    
    // إنشاء المستخدم
    const hashedPassword = await bcrypt.hash(cleanData.password, 12);
    
    const user = await prisma.user.create({
      data: {
        email: cleanData.email,
        password: hashedPassword,
        name: cleanData.name || '',
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });
    
    return secureResponse({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      user
    }, 201);
  },
  {
    allowedMethods: ['POST'],
    requireCSRF: true,
  }
);

/**
 * ====================================
 * مثال 5: File Upload محمي
 * ====================================
 */
export const POST_FileUpload = createSecureHandler(
  async (request: NextRequest) => {
    const { uploadRateLimit, validateFileType, validateFileSize, sanitizeFilename } = await import('@/lib/security');
    
    // Rate limiting للرفع
    const rateCheck = await uploadRateLimit(request);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: rateCheck.error },
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
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    if (!validateFileType(file.name, allowedTypes)) {
      return NextResponse.json(
        {
          error: 'نوع الملف غير مسموح',
          allowedTypes
        },
        { status: 400 }
      );
    }
    
    // التحقق من حجم الملف (5MB)
    if (!validateFileSize(file.size, 5)) {
      return NextResponse.json(
        {
          error: 'حجم الملف أكبر من الحد المسموح (5 ميجا)',
          maxSize: '5MB',
          yourSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`
        },
        { status: 400 }
      );
    }
    
    // تنظيف اسم الملف
    const safeName = sanitizeFilename(file.name);
    
    // رفع الملف (مثال: Cloudinary)
    // const uploadResult = await uploadToCloudinary(file);
    
    return secureResponse({
      success: true,
      message: 'تم رفع الملف بنجاح',
      file: {
        name: safeName,
        size: file.size,
        type: file.type,
        // url: uploadResult.url
      }
    });
  },
  {
    requireAuth: true,
    allowedMethods: ['POST'],
  }
);

/**
 * ====================================
 * مثال 6: DELETE Route محمي
 * ====================================
 */
export const DELETE = createSecureHandler(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { validateUUID } = await import('@/lib/security');
    
    // التحقق من صحة ID
    if (!validateUUID(params.id)) {
      return NextResponse.json(
        { error: 'معرف غير صحيح' },
        { status: 400 }
      );
    }
    
    // التحقق من وجود السجل
    const record = await prisma.product.findUnique({
      where: { id: params.id }
    });
    
    if (!record) {
      return NextResponse.json(
        { error: 'السجل غير موجود' },
        { status: 404 }
      );
    }
    
    // الحذف
    await prisma.product.delete({
      where: { id: params.id }
    });
    
    return secureResponse({
      success: true,
      message: 'تم الحذف بنجاح'
    });
  },
  {
    requireAuth: true,
    allowedRoles: ['ADMIN'],
    allowedMethods: ['DELETE'],
    requireCSRF: true,
  }
);

/**
 * ====================================
 * ملاحظات مهمة
 * ====================================
 * 
 * 1. استخدم createSecureHandler دائماً للحماية التلقائية
 * 2. طبق Rate Limiting على جميع الـ routes
 * 3. نظف جميع المدخلات قبل استخدامها
 * 4. استخدم whitelist للحقول المسموحة فقط
 * 5. تحقق من صلاحية جميع المدخلات
 * 6. استخدم secureResponse للاستجابات
 * 7. لا ترجع تفاصيل الأخطاء في الإنتاج
 * 8. سجل جميع الأحداث الأمنية
 */
