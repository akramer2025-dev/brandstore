/**
 * 🛡️ نظام Rate Limiting المتقدم
 * 
 * يحمي التطبيق من:
 * - Brute force attacks
 * - DDoS attacks
 * - API abuse
 * - Bot attacks
 */

import { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
    blocked: boolean;
    blockUntil?: number;
  };
}

// تخزين مؤقت للطلبات (في الإنتاج استخدم Redis)
const store: RateLimitStore = {};

// تنظيف التخزين كل 10 دقائق
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 10 * 60 * 1000);

export interface RateLimitOptions {
  /**
   * عدد الطلبات المسموح بها
   */
  max: number;
  
  /**
   * النافذة الزمنية بالميلي ثانية
   */
  windowMs: number;
  
  /**
   * مدة الحظر عند تجاوز الحد (بالميلي ثانية)
   */
  blockDuration?: number;
  
  /**
   * رسالة خطأ مخصصة
   */
  message?: string;
}

/**
 * إنشاء rate limiter
 */
export function createRateLimit(options: RateLimitOptions) {
  const {
    max,
    windowMs,
    blockDuration = 15 * 60 * 1000, // 15 دقيقة افتراضياً
    message = 'عدد كبير من المحاولات. حاول مرة أخرى لاحقاً'
  } = options;

  return async (request: NextRequest, identifier?: string) => {
    // استخدام IP address كمعرف افتراضي
    const key = identifier || getIdentifier(request);
    const now = Date.now();

    // التحقق من الحظر
    if (store[key]?.blocked && store[key].blockUntil && store[key].blockUntil! > now) {
      const remainingTime = Math.ceil((store[key].blockUntil! - now) / 1000 / 60);
      return {
        success: false,
        error: `تم حظرك مؤقتاً بسبب تجاوز عدد المحاولات. حاول بعد ${remainingTime} دقيقة`,
        limit: max,
        remaining: 0,
        reset: store[key].blockUntil!,
        blocked: true
      };
    }

    // إنشاء أو تحديث السجل
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
        blocked: false
      };
    }

    // زيادة العداد
    store[key].count++;

    // التحقق من تجاوز الحد
    if (store[key].count > max) {
      // حظر المستخدم
      store[key].blocked = true;
      store[key].blockUntil = now + blockDuration;

      console.warn(`🚨 Rate limit exceeded for ${key} - Blocked for ${blockDuration / 1000 / 60} minutes`);

      return {
        success: false,
        error: message,
        limit: max,
        remaining: 0,
        reset: store[key].resetTime,
        blocked: true,
        blockUntil: store[key].blockUntil
      };
    }

    // السماح بالطلب
    return {
      success: true,
      limit: max,
      remaining: max - store[key].count,
      reset: store[key].resetTime,
      blocked: false
    };
  };
}

/**
 * الحصول على معرف فريد للطلب (IP + User Agent)
 */
function getIdentifier(request: NextRequest): string {
  // الحصول على IP من headers مختلفة
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || real || 'unknown';
  
  // إضافة User Agent للتعرف على الأجهزة المختلفة
  const userAgent = request.headers.get('user-agent') || '';
  
  return `${ip}:${hashUserAgent(userAgent)}`;
}

/**
 * تشفير User Agent بسيط
 */
function hashUserAgent(ua: string): string {
  let hash = 0;
  for (let i = 0; i < ua.length; i++) {
    const char = ua.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Rate limiters جاهزة للاستخدام
 */

// تسجيل الدخول: 5 محاولات كل 15 دقيقة
export const loginRateLimit = createRateLimit({
  max: 5,
  windowMs: 15 * 60 * 1000,
  blockDuration: 30 * 60 * 1000, // حظر لمدة 30 دقيقة
  message: 'عدد كبير من محاولات تسجيل الدخول. حاول مرة أخرى بعد نصف ساعة'
});

// التسجيل: 3 حسابات كل ساعة
export const registerRateLimit = createRateLimit({
  max: 3,
  windowMs: 60 * 60 * 1000,
  blockDuration: 60 * 60 * 1000, // حظر لمدة ساعة
  message: 'عدد كبير من محاولات إنشاء الحسابات. حاول مرة أخرى بعد ساعة'
});

// API عامة: 100 طلب كل 15 دقيقة
export const apiRateLimit = createRateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  blockDuration: 15 * 60 * 1000,
  message: 'عدد كبير من الطلبات. حاول مرة أخرى بعد 15 دقيقة'
});

// رفع الملفات: 10 ملفات كل ساعة
export const uploadRateLimit = createRateLimit({
  max: 10,
  windowMs: 60 * 60 * 1000,
  blockDuration: 60 * 60 * 1000,
  message: 'عدد كبير من محاولات رفع الملفات. حاول مرة أخرى بعد ساعة'
});

// Admin operations: 200 طلب كل 15 دقيقة
export const adminRateLimit = createRateLimit({
  max: 200,
  windowMs: 15 * 60 * 1000,
  blockDuration: 10 * 60 * 1000,
  message: 'عدد كبير من العمليات الإدارية. حاول مرة أخرى بعد 10 دقائق'
});

// Reset password: 3 محاولات كل ساعة
export const passwordResetRateLimit = createRateLimit({
  max: 3,
  windowMs: 60 * 60 * 1000,
  blockDuration: 120 * 60 * 1000, // حظر لمدة ساعتين
  message: 'عدد كبير من محاولات إعادة تعيين كلمة المرور. حاول مرة أخرى بعد ساعتين'
});

// Payment operations: 5 عمليات كل 10 دقائق
export const paymentRateLimit = createRateLimit({
  max: 5,
  windowMs: 10 * 60 * 1000,
  blockDuration: 30 * 60 * 1000,
  message: 'عدد كبير من محاولات الدفع. حاول مرة أخرى بعد 30 دقيقة'
});

// OTP/SMS: 3 رسائل كل 5 دقائق
export const otpRateLimit = createRateLimit({
  max: 3,
  windowMs: 5 * 60 * 1000,
  blockDuration: 60 * 60 * 1000,
  message: 'عدد كبير من طلبات الرمز. حاول مرة أخرى بعد ساعة'
});
