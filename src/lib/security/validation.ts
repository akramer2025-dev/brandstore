/**
 * 🛡️ نظام التحقق من المدخلات والحماية من XSS/SQL Injection
 * 
 * يحمي من:
 * - XSS (Cross-Site Scripting)
 * - SQL Injection (مع Prisma كطبقة إضافية)
 * - NoSQL Injection
 * - Command Injection
 * - Path Traversal
 */

/**
 * تنظيف النص من HTML و JavaScript الخبيث
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    // إزالة العلامات HTML
    .replace(/<[^>]*>/g, '')
    // إزالة JavaScript
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // إزالة محاولات XSS الشائعة
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/eval\s*\(/gi, '')
    .replace(/expression\s*\(/gi, '')
    // تحويل علامات خاصة
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * التحقق من البريد الإلكتروني
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // التحقق من الطول
  if (email.length > 254) return false;
  
  // التحقق من النمط
  if (!emailRegex.test(email)) return false;
  
  // منع البريد المؤقت المشبوه
  const suspiciousDomains = ['tempmail', 'throwaway', 'guerrillamail', '10minutemail'];
  const domain = email.split('@')[1]?.toLowerCase();
  if (suspiciousDomains.some(d => domain?.includes(d))) {
    console.warn(`🚨 Suspicious email domain: ${domain}`);
  }
  
  return true;
}

/**
 * التحقق من رقم الهاتف (مصري)
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  
  // إزالة المسافات والرموز
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // أنماط الأرقام المصرية
  const patterns = [
    /^01[0125]\d{8}$/,           // 11 رقم يبدأ بـ 010, 011, 012, 015
    /^\+2001[0125]\d{8}$/,       // مع كود الدولة
    /^002001[0125]\d{8}$/        // مع كود الدولة (00)
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
}

/**
 * التحقق من كلمة المرور
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['كلمة المرور مطلوبة'], strength: 'weak' };
  }
  
  // الحد الأدنى للطول
  if (password.length < 8) {
    errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  }
  
  // الحد الأقصى للطول
  if (password.length > 128) {
    errors.push('كلمة المرور طويلة جداً (128 حرف كحد أقصى)');
  }
  
  // يجب أن تحتوي على حرف كبير
  if (!/[A-Z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف كبير واحد على الأقل');
  }
  
  // يجب أن تحتوي على حرف صغير
  if (!/[a-z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف صغير واحد على الأقل');
  }
  
  // يجب أن تحتوي على رقم
  if (!/[0-9]/.test(password)) {
    errors.push('يجب أن تحتوي على رقم واحد على الأقل');
  }
  
  // يجب أن تحتوي على رمز خاص
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('يجب أن تحتوي على رمز خاص واحد على الأقل (!@#$%...)');
  }
  
  // منع كلمات المرور الشائعة
  const commonPasswords = [
    'password', '12345678', 'qwerty', 'abc123', 'password123',
    '123456789', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('كلمة المرور ضعيفة جداً. اختر كلمة مرور أقوى');
  }
  
  // حساب قوة كلمة المرور
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (errors.length === 0) {
    strength = 'strong';
  } else if (errors.length <= 2) {
    strength = 'medium';
  }
  
  return {
    valid: errors.length === 0,
    errors,
    strength
  };
}

/**
 * التحقق من URL
 */
export function validateURL(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsed = new URL(url);
    
    // السماح فقط بـ HTTP و HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    // منع URL المحلية في الإنتاج
    if (process.env.NODE_ENV === 'production') {
      const localHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
      if (localHosts.some(host => parsed.hostname.includes(host))) {
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * تنظيف اسم الملف من المحارف الخطيرة
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') return '';
  
  return filename
    // إزالة Path Traversal
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    // إزالة المحارف الخاصة
    .replace(/[<>:"|?*]/g, '')
    // إزالة null bytes
    .replace(/\0/g, '')
    // الحد من الطول
    .slice(0, 255);
}

/**
 * التحقق من نوع الملف المسموح به
 */
export function validateFileType(
  filename: string,
  allowedTypes: string[]
): boolean {
  if (!filename || !allowedTypes || allowedTypes.length === 0) {
    return false;
  }
  
  const ext = filename.toLowerCase().split('.').pop();
  if (!ext) return false;
  
  return allowedTypes.includes(`.${ext}`);
}

/**
 * التحقق من حجم الملف
 */
export function validateFileSize(
  size: number,
  maxSizeMB: number
): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return size > 0 && size <= maxBytes;
}

/**
 * تنظيف النص من SQL Injection (طبقة إضافية مع Prisma)
 */
export function sanitizeSQL(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/['";]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/xp_/gi, '')
    .replace(/exec\s/gi, '')
    .replace(/execute\s/gi, '')
    .replace(/union\s/gi, '')
    .replace(/select\s/gi, '')
    .replace(/insert\s/gi, '')
    .replace(/update\s/gi, '')
    .replace(/delete\s/gi, '')
    .replace(/drop\s/gi, '')
    .replace(/create\s/gi, '')
    .replace(/alter\s/gi, '');
}

/**
 * التحقق من الأرقام
 */
export function validateNumber(
  value: any,
  min?: number,
  max?: number
): boolean {
  const num = Number(value);
  
  if (isNaN(num) || !isFinite(num)) {
    return false;
  }
  
  if (min !== undefined && num < min) {
    return false;
  }
  
  if (max !== undefined && num > max) {
    return false;
  }
  
  return true;
}

/**
 * التحقق من JSON
 */
export function validateJSON(input: string): boolean {
  try {
    JSON.parse(input);
    return true;
  } catch {
    return false;
  }
}

/**
 * منع NoSQL Injection
 */
export function sanitizeMongoQuery(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeMongoQuery(item));
  }
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // منع المفاتيح الخطيرة
    if (key.startsWith('$') || key.startsWith('_')) {
      console.warn(`🚨 Blocked suspicious key: ${key}`);
      continue;
    }
    
    sanitized[key] = sanitizeMongoQuery(value);
  }
  
  return sanitized;
}

/**
 * التحقق من المعرف الفريد (UUID)
 */
export function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * تنظيف شامل للمدخلات
 */
export function sanitizeInput(input: any): any {
  if (input === null || input === undefined) {
    return input;
  }
  
  if (typeof input === 'string') {
    return sanitizeHTML(input.trim());
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  
  if (typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

/**
 * قائمة بيضاء للمدخلات
 */
export function whitelist<T>(
  input: any,
  allowedFields: (keyof T)[]
): Partial<T> {
  const whitelisted: Partial<T> = {};
  
  for (const field of allowedFields) {
    if (field in input) {
      whitelisted[field] = input[field];
    }
  }
  
  return whitelisted;
}
