/**
 * اختبار إعدادات Google OAuth
 * 
 * يفحص:
 * 1. NEXTAUTH_URL صحيح
 * 2. Google credentials موجودة
 * 3. Redirect URLs صحيحة
 * 
 * الاستخدام:
 * npx tsx test-google-oauth.ts
 */

import { config } from 'dotenv';
config();

console.log('\n🔍 فحص إعدادات Google OAuth...\n');

// 1. فحص NEXTAUTH_URL
const nextAuthUrl = process.env.NEXTAUTH_URL;
console.log('1️⃣ NEXTAUTH_URL:', nextAuthUrl);

if (!nextAuthUrl) {
  console.error('   ❌ NEXTAUTH_URL غير موجود في .env');
  console.log('   💡 أضف: NEXTAUTH_URL="http://localhost:3000"\n');
} else if (nextAuthUrl.includes('localhost')) {
  console.log('   ⚠️  محلي (localhost) - جيد للتطوير فقط');
  console.log('   💡 للـ production، استخدم: NEXTAUTH_URL="https://brandstore-lyart.vercel.app"\n');
} else if (nextAuthUrl.startsWith('https://')) {
  console.log('   ✅ Production URL - صحيح!\n');
} else {
  console.log('   ⚠️  URL يجب أن يبدأ بـ https:// للـ production\n');
}

// 2. فحص NEXTAUTH_SECRET
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
console.log('2️⃣ NEXTAUTH_SECRET:', nextAuthSecret ? '✅ موجود' : '❌ غير موجود');

if (!nextAuthSecret) {
  console.log('   💡 أضف: NEXTAUTH_SECRET="your-secret-key-here"');
  console.log('   💡 استخدم: openssl rand -base64 32\n');
} else if (nextAuthSecret.length < 32) {
  console.log('   ⚠️  قصير جداً (يجب أن يكون 32+ حرف)\n');
} else {
  console.log('   ✅ طويل بما فيه الكفاية\n');
}

// 3. فحص Google Client ID
const googleClientId = process.env.GOOGLE_CLIENT_ID;
console.log('3️⃣ GOOGLE_CLIENT_ID:', googleClientId ? '✅ موجود' : '❌ غير موجود');

if (!googleClientId) {
  console.log('   ❌ GOOGLE_CLIENT_ID غير موجود');
  console.log('   💡 احصل عليه من: https://console.cloud.google.com/apis/credentials\n');
} else if (googleClientId.includes('your-') || googleClientId === '') {
  console.log('   ❌ قيمة افتراضية - حدّثها من Google Console\n');
} else {
  console.log('   ✅ صحيح\n');
}

// 4. فحص Google Client Secret
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
console.log('4️⃣ GOOGLE_CLIENT_SECRET:', googleClientSecret ? '✅ موجود' : '❌ غير موجود');

if (!googleClientSecret) {
  console.log('   ❌ GOOGLE_CLIENT_SECRET غير موجود');
  console.log('   💡 احصل عليه من: https://console.cloud.google.com/apis/credentials\n');
} else if (googleClientSecret.includes('your-') || googleClientSecret === '') {
  console.log('   ❌ قيمة افتراضية - حدّثها من Google Console\n');
} else {
  console.log('   ✅ صحيح\n');
}

// 5. عرض Redirect URLs المتوقعة
console.log('\n📍 Redirect URLs المتوقعة في Google Console:\n');

if (nextAuthUrl) {
  // Local
  if (nextAuthUrl.includes('localhost')) {
    console.log('   للتطوير المحلي:');
    console.log('   • http://localhost:3000/api/auth/callback/google');
    console.log('   • http://localhost:3001/api/auth/callback/google');
  }
  
  // Production
  else {
    console.log('   للـ Production:');
    console.log(`   • ${nextAuthUrl}/api/auth/callback/google`);
  }
} else {
  console.log('   ⚠️  لا يمكن عرض URLs - NEXTAUTH_URL غير موجود');
}

console.log('\n   💡 تأكد من إضافة هذه URLs في:');
console.log('      https://console.cloud.google.com/apis/credentials');
console.log('      > اختر OAuth 2.0 Client ID');
console.log('      > Authorized redirect URIs\n');

// 6. ملخص
console.log('\n📊 الملخص:\n');

let allGood = true;

if (!nextAuthUrl) {
  console.log('   ❌ NEXTAUTH_URL مفقود');
  allGood = false;
}

if (!nextAuthSecret || nextAuthSecret.length < 32) {
  console.log('   ❌ NEXTAUTH_SECRET مفقود أو قصير');
  allGood = false;
}

if (!googleClientId || googleClientId.includes('your-')) {
  console.log('   ❌ GOOGLE_CLIENT_ID مفقود أو خطأ');
  allGood = false;
}

if (!googleClientSecret || googleClientSecret.includes('your-')) {
  console.log('   ❌ GOOGLE_CLIENT_SECRET مفقود أو خطأ');
  allGood = false;
}

if (allGood) {
  console.log('   ✅ جميع الإعدادات صحيحة!');
  console.log('\n   الخطوات التالية:');
  console.log('   1. تأكد من Redirect URLs في Google Console');
  console.log('   2. شغّل المشروع: npm run dev');
  console.log('   3. جرّب تسجيل الدخول: http://localhost:3000/auth/login');
} else {
  console.log('   ⚠️  بعض الإعدادات ناقصة أو خطأ');
  console.log('\n   راجع الملف: GOOGLE_OAUTH_FIX.md للحل الشامل');
}

console.log('\n✅ انتهى الفحص!\n');

// 7. معلومات إضافية للـ production
if (process.env.NODE_ENV === 'production' || process.argv.includes('--production')) {
  console.log('\n🚀 ملاحظات للـ Production:\n');
  console.log('   1. تأكد من تحديث Environment Variables على Vercel:');
  console.log('      vercel.com/your-team/brandstore/settings/environment-variables\n');
  console.log('   2. تأكد من:');
  console.log('      NEXTAUTH_URL=https://brandstore-lyart.vercel.app');
  console.log('      (أو domain مخصص إذا كنت تستخدم واحد)\n');
  console.log('   3. بعد تحديث Environment Variables:');
  console.log('      - اضغط "Save"');
  console.log('      - اضغط "Redeploy" لتطبيق التغييرات\n');
  console.log('   4. انتظر 2-3 دقائق بعد Deploy قبل الاختبار\n');
}
