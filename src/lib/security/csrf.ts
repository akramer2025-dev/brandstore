/**
 * 🛡️ حماية CSRF (Cross-Site Request Forgery)
 * 
 * يمنع الهجمات التي تجبر المستخدمين على تنفيذ إجراءات غير مرغوب فيها
 */

import { NextRequest } from 'next/server';
import { randomBytes, createHmac } from 'crypto';

// مفتاح سري للتوقيع (يجب أن يكون في .env في الإنتاج)
const CSRF_SECRET = process.env.CSRF_SECRET || 'change-this-in-production-' + randomBytes(32).toString('hex');

/**
 * إنشاء CSRF token
 */
export function generateCSRFToken(userId?: string): string {
  const timestamp = Date.now().toString();
  const random = randomBytes(16).toString('hex');
  const data = `${userId || 'anonymous'}-${timestamp}-${random}`;
  
  // إنشاء توقيع
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(data)
    .digest('hex');
  
  // دمج البيانات مع التوقيع
  const token = Buffer.from(`${data}:${signature}`).toString('base64');
  
  return token;
}

/**
 * التحقق من CSRF token
 */
export function verifyCSRFToken(token: string, userId?: string): boolean {
  try {
    if (!token) return false;
    
    // فك الترميز
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [data, signature] = decoded.split(':');
    
    if (!data || !signature) return false;
    
    // التحقق من التوقيع
    const expectedSignature = createHmac('sha256', CSRF_SECRET)
      .update(data)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      console.warn('🚨 CSRF token signature mismatch');
      return false;
    }
    
    // استخراج البيانات
    const [tokenUserId, timestamp] = data.split('-');
    
    // التحقق من المستخدم إذا كان موجوداً
    if (userId && tokenUserId !== userId && tokenUserId !== 'anonymous') {
      console.warn('🚨 CSRF token user mismatch');
      return false;
    }
    
    // التحقق من صلاحية الوقت (24 ساعة)
    const tokenTime = parseInt(timestamp);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 ساعة
    
    if (now - tokenTime > maxAge) {
      console.warn('🚨 CSRF token expired');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ CSRF token verification error:', error);
    return false;
  }
}

/**
 * Middleware للتحقق من CSRF token
 */
export async function csrfProtection(
  request: NextRequest,
  userId?: string
): Promise<{ valid: boolean; error?: string }> {
  // الطلبات GET آمنة (read-only)
  if (request.method === 'GET' || request.method === 'HEAD') {
    return { valid: true };
  }
  
  // الحصول على token من header
  const token = request.headers.get('x-csrf-token');
  
  if (!token) {
    return {
      valid: false,
      error: 'CSRF token missing'
    };
  }
  
  const isValid = verifyCSRFToken(token, userId);
  
  if (!isValid) {
    return {
      valid: false,
      error: 'Invalid CSRF token'
    };
  }
  
  return { valid: true };
}

/**
 * Double Submit Cookie Pattern (بديل للـ CSRF tokens)
 */
export function generateDoubleCsrfCookie(): {
  cookieValue: string;
  headerValue: string;
} {
  const value = randomBytes(32).toString('hex');
  
  return {
    cookieValue: value,
    headerValue: createHmac('sha256', CSRF_SECRET)
      .update(value)
      .digest('hex')
  };
}

/**
 * التحقق من Double Submit Cookie
 */
export function verifyDoubleCsrfCookie(
  cookieValue: string,
  headerValue: string
): boolean {
  try {
    const expectedHeader = createHmac('sha256', CSRF_SECRET)
      .update(cookieValue)
      .digest('hex');
    
    return headerValue === expectedHeader;
  } catch {
    return false;
  }
}
