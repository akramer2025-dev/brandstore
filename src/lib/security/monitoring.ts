/**
 * 🛡️ Security Monitoring & Logging
 * 
 * نظام تسجيل ومراقبة الأحداث الأمنية
 */

export type SecurityEventType =
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_CSRF_TOKEN'
  | 'UNAUTHORIZED_ACCESS'
  | 'INVALID_INPUT'
  | 'SUSPICIOUS_ACTIVITY'
  | 'FILE_UPLOAD_BLOCKED'
  | 'SQL_INJECTION_ATTEMPT'
  | 'XSS_ATTEMPT'
  | 'BRUTE_FORCE_ATTEMPT'
  | 'INVALID_ORIGIN'
  | 'SESSION_HIJACK_ATTEMPT';

export interface SecurityEvent {
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

/**
 * تخزين الأحداث الأمنية (في الإنتاج، استخدم database أو logging service)
 */
const securityEvents: SecurityEvent[] = [];

// تنظيف الأحداث القديمة كل ساعة (الاحتفاظ بآخر 24 ساعة فقط)
setInterval(() => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const filteredEvents = securityEvents.filter(
    event => event.timestamp > oneDayAgo
  );
  securityEvents.splice(0, securityEvents.length, ...filteredEvents);
  
  if (filteredEvents.length < securityEvents.length) {
    console.log(`🧹 Cleaned ${securityEvents.length - filteredEvents.length} old security events`);
  }
}, 60 * 60 * 1000);

/**
 * تسجيل حدث أمني
 */
export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: new Date()
  };
  
  securityEvents.push(fullEvent);
  
  // طباعة في Console حسب الخطورة
  const emoji = {
    low: '📘',
    medium: '⚠️',
    high: '🚨',
    critical: '🔥'
  };
  
  const prefix = emoji[event.severity];
  const logMessage = `${prefix} [SECURITY] ${event.type}: ${event.message}`;
  
  if (event.severity === 'critical' || event.severity === 'high') {
    console.error(logMessage, event.details || '');
  } else if (event.severity === 'medium') {
    console.warn(logMessage, event.details || '');
  } else {
    console.log(logMessage);
  }
  
  // في الإنتاج، أرسل تنبيهات للأحداث الحرجة
  if (process.env.NODE_ENV === 'production' && event.severity === 'critical') {
    // TODO: إرسال تنبيه للأدمن عبر Email أو Slack
    sendCriticalAlert(fullEvent);
  }
}

/**
 * إرسال تنبيه حرج (للتنفيذ في الإنتاج)
 */
async function sendCriticalAlert(event: SecurityEvent): Promise<void> {
  // TODO: تنفيذ إرسال التنبيه
  console.error('🔥🔥🔥 CRITICAL SECURITY EVENT - ADMIN NOTIFICATION REQUIRED:', {
    type: event.type,
    message: event.message,
    userId: event.userId,
    ip: event.ip,
    endpoint: event.endpoint,
    timestamp: event.timestamp.toISOString()
  });
}

/**
 * الحصول على إحصائيات الأحداث الأمنية
 */
export function getSecurityStats(hours: number = 24): {
  total: number;
  byType: Record<SecurityEventType, number>;
  bySeverity: Record<string, number>;
  recentEvents: SecurityEvent[];
  topIPs: Array<{ ip: string; count: number }>;
} {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const recentEvents = securityEvents.filter(e => e.timestamp > since);
  
  // تجميع حسب النوع
  const byType = recentEvents.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<SecurityEventType, number>);
  
  // تجميع حسب الخطورة
  const bySeverity = recentEvents.reduce((acc, event) => {
    acc[event.severity] = (acc[event.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // أكثر IPs نشاطاً
  const ipCounts = recentEvents
    .filter(e => e.ip)
    .reduce((acc, event) => {
      const ip = event.ip!;
      acc[ip] = (acc[ip] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  const topIPs = Object.entries(ipCounts)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    total: recentEvents.length,
    byType,
    bySeverity,
    recentEvents: recentEvents.slice(-20), // آخر 20 حدث
    topIPs
  };
}

/**
 * التحقق من نشاط مشبوه من IP معين
 */
export function checkSuspiciousActivity(ip: string, threshold: number = 50): boolean {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentEventsFromIP = securityEvents.filter(
    e => e.ip === ip && e.timestamp > oneHourAgo
  );
  
  if (recentEventsFromIP.length > threshold) {
    logSecurityEvent({
      type: 'SUSPICIOUS_ACTIVITY',
      severity: 'high',
      message: `نشاط مشبوه من IP: ${ip} - ${recentEventsFromIP.length} حدث في آخر ساعة`,
      ip,
      details: {
        eventCount: recentEventsFromIP.length,
        threshold
      }
    });
    return true;
  }
  
  return false;
}

/**
 * الحصول على معلومات من Request
 */
export function extractRequestInfo(request: Request): {
  ip: string;
  userAgent: string;
  endpoint: string;
} {
  // الحصول على IP
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || real || 'unknown';
  
  // User Agent
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Endpoint
  const url = new URL(request.url);
  const endpoint = url.pathname;
  
  return { ip, userAgent, endpoint };
}

/**
 * مساعد لتسجيل محاولة Rate Limit
 */
export function logRateLimitExceeded(
  request: Request,
  userId?: string,
  limit?: number
): void {
  const { ip, userAgent, endpoint } = extractRequestInfo(request);
  
  logSecurityEvent({
    type: 'RATE_LIMIT_EXCEEDED',
    severity: 'medium',
    message: `تجاوز حد الطلبات من ${ip}${userId ? ` (User: ${userId})` : ''}`,
    userId,
    ip,
    userAgent,
    endpoint,
    details: { limit }
  });
}

/**
 * مساعد لتسجيل محاولة CSRF فاشلة
 */
export function logCSRFTokenInvalid(
  request: Request,
  userId?: string
): void {
  const { ip, userAgent, endpoint } = extractRequestInfo(request);
  
  logSecurityEvent({
    type: 'INVALID_CSRF_TOKEN',
    severity: 'high',
    message: `محاولة طلب بدون CSRF token صحيح من ${ip}`,
    userId,
    ip,
    userAgent,
    endpoint
  });
}

/**
 * مساعد لتسجيل محاولة دخول غير مصرح بها
 */
export function logUnauthorizedAccess(
  request: Request,
  userId?: string,
  requiredRole?: string
): void {
  const { ip, userAgent, endpoint } = extractRequestInfo(request);
  
  logSecurityEvent({
    type: 'UNAUTHORIZED_ACCESS',
    severity: 'high',
    message: `محاولة دخول غير مصرح بها إلى ${endpoint}`,
    userId,
    ip,
    userAgent,
    endpoint,
    details: { requiredRole }
  });
}

/**
 * مساعد لتسجيل مدخلات غير صحيحة
 */
export function logInvalidInput(
  request: Request,
  reason: string,
  userId?: string
): void {
  const { ip, userAgent, endpoint } = extractRequestInfo(request);
  
  logSecurityEvent({
    type: 'INVALID_INPUT',
    severity: 'low',
    message: `مدخلات غير صحيحة: ${reason}`,
    userId,
    ip,
    userAgent,
    endpoint,
    details: { reason }
  });
}

/**
 * مساعد لتسجيل محاولة XSS
 */
export function logXSSAttempt(
  request: Request,
  field: string,
  userId?: string
): void {
  const { ip, userAgent, endpoint } = extractRequestInfo(request);
  
  logSecurityEvent({
    type: 'XSS_ATTEMPT',
    severity: 'critical',
    message: `محاولة XSS في حقل: ${field}`,
    userId,
    ip,
    userAgent,
    endpoint,
    details: { field }
  });
}

/**
 * مساعد لتسجيل محاولة SQL Injection
 */
export function logSQLInjectionAttempt(
  request: Request,
  field: string,
  userId?: string
): void {
  const { ip, userAgent, endpoint } = extractRequestInfo(request);
  
  logSecurityEvent({
    type: 'SQL_INJECTION_ATTEMPT',
    severity: 'critical',
    message: `محاولة SQL Injection في حقل: ${field}`,
    userId,
    ip,
    userAgent,
    endpoint,
    details: { field }
  });
}

/**
 * جلب جميع الأحداث (للأدمن فقط)
 */
export function getAllSecurityEvents(
  limit: number = 100
): SecurityEvent[] {
  return securityEvents.slice(-limit).reverse();
}

/**
 * مسح جميع الأحداث (للأدمن فقط)
 */
export function clearSecurityEvents(): number {
  const count = securityEvents.length;
  securityEvents.splice(0, securityEvents.length);
  console.log(`🧹 Cleared ${count} security events`);
  return count;
}
