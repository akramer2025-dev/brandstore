// نص للتحقق من مشكلة رفع الصور
// استخدم: npx tsx test-upload-debug.ts

import { prisma } from './src/lib/prisma';

async function checkUploadIssue() {
  console.log('🔍 فحص مشكلة رفع الصور...\n');

  // 1. فحص المستخدمين الـ VENDOR
  const vendors = await prisma.user.findMany({
    where: { role: 'VENDOR' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  console.log(`✅ عدد الـ VENDOR: ${vendors.length}`);
  vendors.forEach((v, i) => {
    console.log(`   ${i + 1}. ${v.name} (${v.email})`);
  });

  console.log('\n💡 ملاحظات:');
  console.log('   - يجب تسجيل الدخول كـ VENDOR أو ADMIN لرفع الصور');
  console.log('   - افتح Console في المتصفح F12 لرؤية الأخطاء');
  console.log('   - تأكد من حجم الصورة < 5MB');
  console.log('   - الأنواع المدعومة: JPEG, PNG, WebP فقط');

  await prisma.$disconnect();
}

checkUploadIssue().catch(console.error);
