/**
 * Reset Visitor Tracking - مسح كل سجلات الزوار القديمة
 * للبدء من الصفر لقياس نتائج الإعلان الممول
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetVisitorTracking() {
  console.log('🧹 بدء مسح سجلات الزوار القديمة...\n');

  try {
    // 1. حساب السجلات الحالية
    const currentVisitors = await prisma.visitor.count();
    const currentAnalytics = await prisma.websiteAnalytics.count();
    
    console.log(`📊 السجلات الحالية:`);
    console.log(`   - سجلات الزوار: ${currentVisitors}`);
    console.log(`   - سجلات التحليلات: ${currentAnalytics}\n`);

    // استشهادات قبل الحذف
    if (currentVisitors === 0 && currentAnalytics === 0) {
      console.log('✅ لا توجد سجلات للمسح - النظام نظيف بالفعل!');
      return;
    }

    // تأكيد نهائي
    console.log('⚠️  سيتم حذف كل السجلات التالية:');
    console.log(`   1. جميع سجلات الزوار (${currentVisitors} سجل)`);
    console.log(`   2. جميع سجلات التحليلات اليومية (${currentAnalytics} سجل)`);
    console.log('\n⏳ جاري الحذف...\n');

    // 2. حذف سجلات الزوار
    const deletedVisitors = await prisma.visitor.deleteMany({});
    console.log(`✅ تم حذف ${deletedVisitors.count} سجل من جدول الزوار`);

    // 3. حذف سجلات التحليلات
    const deletedAnalytics = await prisma.websiteAnalytics.deleteMany({});
    console.log(`✅ تم حذف ${deletedAnalytics.count} سجل من جدول التحليلات`);

    // 4. التحقق من النتيجة
    const remainingVisitors = await prisma.visitor.count();
    const remainingAnalytics = await prisma.websiteAnalytics.count();

    console.log('\n📊 الحالة بعد المسح:');
    console.log(`   - سجلات الزوار: ${remainingVisitors}`);
    console.log(`   - سجلات التحليلات: ${remainingAnalytics}`);

    if (remainingVisitors === 0 && remainingAnalytics === 0) {
      console.log('\n🎉 تم مسح كل السجلات بنجاح!');
      console.log('🚀 النظام جاهز لتتبع زوار الإعلان الممول من الصفر');
      console.log('\n📈 الآن يمكنك:');
      console.log('   1. تشغيل الإعلان الممول');
      console.log('   2. زيارة صفحة الإدارة لمتابعة الإحصائيات الحقيقية');
      console.log('   3. مراقبة الزوار في الوقت الفعلي من /admin');
    } else {
      console.log('\n⚠️  تحذير: لم يتم مسح جميع السجلات!');
    }

  } catch (error) {
    console.error('\n❌ خطأ أثناء مسح السجلات:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
resetVisitorTracking()
  .then(() => {
    console.log('\n✨ تمت العملية بنجاح!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 فشلت العملية:', error);
    process.exit(1);
  });
