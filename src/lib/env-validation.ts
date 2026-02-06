/**
 * Environment Variables Validation
 * يتحقق من وجود جميع المتغيرات المطلوبة عند بدء التطبيق
 */

const requiredEnvVars = {
  // Critical - لازم تكون موجودة
  critical: [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ],
  // Important - مهمة لكن التطبيق يعمل بدونها
  important: [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
    'VAPID_PRIVATE_KEY',
  ],
  // Optional - اختيارية
  optional: [
    'RESEND_API_KEY',
    'BUSTA_EMAIL',
    'OPENAI_API_KEY',
  ],
};

export function validateEnv() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check critical variables
  for (const varName of requiredEnvVars.critical) {
    if (!process.env[varName]) {
      errors.push(`❌ Missing critical environment variable: ${varName}`);
    }
  }

  // Check important variables
  for (const varName of requiredEnvVars.important) {
    if (!process.env[varName]) {
      warnings.push(`⚠️  Missing important environment variable: ${varName}`);
    }
  }

  // Check optional variables
  for (const varName of requiredEnvVars.optional) {
    if (!process.env[varName]) {
      console.log(`ℹ️  Optional environment variable not set: ${varName}`);
    }
  }

  // Log results
  if (errors.length > 0) {
    console.error('\n🔴 CRITICAL: Missing required environment variables:\n');
    errors.forEach(error => console.error(error));
    console.error('\n📝 Please check VERCEL_ENV_SETUP.md for setup instructions\n');
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing critical environment variables. Application cannot start.');
    }
  }

  if (warnings.length > 0) {
    console.warn('\n🟡 WARNING: Missing important environment variables:\n');
    warnings.forEach(warning => console.warn(warning));
    console.warn('\n📝 Some features may not work correctly\n');
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All environment variables are set correctly\n');
  }
}

// Validate on import (در server-side فقط)
if (typeof window === 'undefined') {
  validateEnv();
}
