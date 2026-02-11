// اختبار سريع لإعدادات Cloudinary
// تشغيل هذا الملف بـ: npx tsx check-cloudinary-config.ts

import { v2 as cloudinary } from 'cloudinary';

// تحميل متغيرات البيئة من .env
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function checkCloudinaryConfig() {
  console.log('🔍 فحص إعدادات Cloudinary...\n');

  // التحقق من وجود المتغيرات
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log('📋 المتغيرات:');
  console.log(`   CLOUDINARY_CLOUD_NAME: ${cloudName ? '✅ موجود' : '❌ مفقود'}`);
  console.log(`   CLOUDINARY_API_KEY: ${apiKey ? '✅ موجود' : '❌ مفقود'}`);
  console.log(`   CLOUDINARY_API_SECRET: ${apiSecret ? '✅ موجود' : '❌ مفقود'}`);
  console.log('');

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ إعدادات Cloudinary غير كاملة!');
    console.log('\nيرجى التأكد من وجود المتغيرات التالية في ملف .env:');
    console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name');
    console.log('CLOUDINARY_API_KEY=your_api_key');
    console.log('CLOUDINARY_API_SECRET=your_api_secret');
    process.exit(1);
  }

  // اختبار الاتصال بـ Cloudinary
  try {
    console.log('🔗 اختبار الاتصال بـ Cloudinary...');
    
    // محاولة جلب معلومات الحساب (ping test)
    const result = await cloudinary.api.ping();
    
    if (result.status === 'ok') {
      console.log('✅ الاتصال بـ Cloudinary نجح!');
      console.log(`   Cloud Name: ${cloudName}`);
    }
  } catch (error: any) {
    console.error('❌ فشل الاتصال بـ Cloudinary!');
    console.error(`   الخطأ: ${error.message}`);
    console.log('\nالأسباب المحتملة:');
    console.log('1. API credentials غير صحيحة');
    console.log('2. Cloud Name غير صحيح');
    console.log('3. مشكلة في الاتصال بالإنترنت');
    process.exit(1);
  }

  // اختبار رفع صورة تجريبية
  try {
    console.log('\n📤 اختبار رفع صورة تجريبية...');
    
    // إنشاء صورة base64 صغيرة (1x1 pixel)
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    const uploadResult = await cloudinary.uploader.upload(testImage, {
      folder: 'remostore/test',
      resource_type: 'image',
    });

    console.log('✅ رفع الصورة التجريبية نجح!');
    console.log(`   URL: ${uploadResult.secure_url}`);
    console.log(`   Public ID: ${uploadResult.public_id}`);

    // حذف الصورة التجريبية بعد الاختبار
    await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log('🗑️  تم حذف الصورة التجريبية');

  } catch (error: any) {
    console.error('❌ فشل رفع الصورة التجريبية!');
    console.error(`   الخطأ: ${error.message}`);
    console.log('\nالأسباب المحتملة:');
    console.log('1. الحساب غير مفعل');
    console.log('2. صلاحيات الرفع محظورة');
    console.log('3. تجاوز حد الاستخدام المجاني');
    process.exit(1);
  }

  console.log('\n✅ جميع الاختبارات نجحت!');
  console.log('💡 Cloudinary جاهز للاستخدام في التطبيق');
}

checkCloudinaryConfig().catch(error => {
  console.error('❌ خطأ غير متوقع:', error);
  process.exit(1);
});
