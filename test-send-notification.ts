// Test script لاختبار إرسال إشعار
import { PrismaClient } from '@prisma/client';
import * as admin from 'firebase-admin';

const prisma = new PrismaClient();

// تهيئة Firebase
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

async function testSendNotification() {
  try {
    console.log('🔔 بدء اختبار إرسال الإشعارات...\n');

    // 1. جلب كل الـ tokens النشطة
    const tokens = await prisma.fCMDeviceToken.findMany({
      where: { isActive: true },
      select: { token: true, userId: true, platform: true }
    });

    console.log(`📱 عدد الأجهزة المسجلة: ${tokens.length}`);
    
    if (tokens.length === 0) {
      console.log('❌ لا يوجد أجهزة مسجلة!');
      console.log('💡 افتح التطبيق على emulator ووافق على إذن الإشعارات أولاً');
      return;
    }

    console.log('\n✅ الأجهزة المسجلة:');
    tokens.forEach((t, i) => {
      console.log(`   ${i + 1}. Platform: ${t.platform}, User: ${t.userId || 'Guest'}`);
      console.log(`      Token: ${t.token.substring(0, 30)}...`);
    });

    // 2. إرسال إشعار test
    console.log('\n📤 إرسال إشعار test...');
    
    const message = {
      notification: {
        title: 'مرحباً من Remostore! 🎉',
        body: 'نظام الإشعارات يعمل بنجاح! هذا إشعار تجريبي.',
      },
      data: {
        type: 'test',
        message: 'Hello from Firebase!',
        timestamp: new Date().toISOString()
      },
      tokens: tokens.map(t => t.token)
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    console.log('\n✅ نتائج الإرسال:');
    console.log(`   ✔️ نجح: ${response.successCount}`);
    console.log(`   ❌ فشل: ${response.failureCount}`);

    if (response.failureCount > 0) {
      console.log('\n⚠️ الأخطاء:');
      response.responses.forEach((r, idx) => {
        if (!r.success) {
          console.log(`   ${idx + 1}. ${r.error?.message}`);
        }
      });
    }

    // 3. حفظ في السجل
    await prisma.pushNotification.create({
      data: {
        title: 'مرحباً من Remostore! 🎉',
        body: 'نظام الإشعارات يعمل بنجاح!',
        sentBy: 'TEST_SCRIPT',
        sentToAll: true,
        recipientCount: tokens.length,
        successCount: response.successCount,
        failedCount: response.failureCount
      }
    });

    console.log('\n💾 تم حفظ السجل في database');
    console.log('\n🎊 الاختبار اكتمل بنجاح!');

  } catch (error: any) {
    console.error('\n❌ خطأ في الاختبار:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الاختبار
testSendNotification();
