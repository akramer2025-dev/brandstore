/**
 * 🛡️ مكتبة الأمان الشاملة - Security Library
 * 
 * استيراد سهل لجميع وظائف الأمان
 */

// Rate Limiting
export {
  createRateLimit,
  loginRateLimit,
  registerRateLimit,
  apiRateLimit,
  uploadRateLimit,
  adminRateLimit,
  passwordResetRateLimit,
  paymentRateLimit,
  otpRateLimit,
} from './rate-limit';

// Input Validation
export {
  sanitizeHTML,
  validateEmail,
  validatePhone,
  validatePassword,
  validateURL,
  sanitizeFilename,
  validateFileType,
  validateFileSize,
  sanitizeSQL,
  validateNumber,
  validateJSON,
  sanitizeMongoQuery,
  validateUUID,
  sanitizeInput,
  whitelist,
} from './validation';

// CSRF Protection
export {
  generateCSRFToken,
  verifyCSRFToken,
  csrfProtection,
  generateDoubleCsrfCookie,
  verifyDoubleCsrfCookie,
} from './csrf';

// API Protection
export {
  requireAuth,
  requireRole,
  requireAdmin,
  requireVendor,
  handleError,
  validateContentType,
  validateOrigin,
  createSecureHandler,
  addSecurityHeaders,
  secureResponse,
} from './api-protection';

// Types
export type { RateLimitOptions } from './rate-limit';
