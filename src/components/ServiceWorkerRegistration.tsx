'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function ServiceWorkerRegistration() {
  const { data: session } = useSession();

  useEffect(() => {
    // تسجيل Service Worker فقط إذا كان المستخدم شريك
    if (session?.user?.role !== 'VENDOR') {
      return;
    }

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      console.log('🔔 بدء تسجيل Service Worker للإشعارات...');
      
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker مسجل بنجاح:', registration.scope);
          
          // التحقق من حالة Service Worker
          if (registration.active) {
            console.log('✅ Service Worker نشط ويعمل');
          }
          
          // الاشتراك في Push Notifications إذا لم يكن مشترك
          checkAndSubscribe(registration);
        })
        .catch((error) => {
          console.error('❌ فشل تسجيل Service Worker:', error);
        });
    } else {
      console.log('⚠️ المتصفح لا يدعم Service Worker أو Push Notifications');
    }
  }, [session?.user?.role]);

  return null; // هذا Component لا يعرض شيء
}

async function checkAndSubscribe(registration: ServiceWorkerRegistration) {
  try {
    // التحقق من الاشتراك الحالي
    const existingSubscription = await registration.pushManager.getSubscription();
    
    if (existingSubscription) {
      console.log('✅ يوجد اشتراك نشط في Push Notifications');
      return;
    }

    // التحقق من الإذن
    if (Notification.permission === 'granted') {
      console.log('📋 الإذن ممنوح، جاري الاشتراك...');
      await subscribeToPush(registration);
    } else if (Notification.permission === 'default') {
      console.log('⏳ في انتظار طلب الإذن من المستخدم');
    } else {
      console.log('❌ الإذن مرفوض من قبل المستخدم');
    }
  } catch (error) {
    console.error('❌ خطأ في التحقق من الاشتراك:', error);
  }
}

async function subscribeToPush(registration: ServiceWorkerRegistration) {
  try {
    const vapidPublicKey = 'BGwdJnBs2lTWLJQqk6O0vLdIhtGIKYzEMdcDeo1XEBfDSNAQDmCZkIQV8a0u-BxxhFpR6Vik_3KT3NLdVYlpTIE';
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey,
    });

    console.log('📝 اشتراك جديد تم إنشاؤه:', subscription.endpoint);

    // حفظ الاشتراك في قاعدة البيانات
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });

    if (response.ok) {
      console.log('✅ تم حفظ الاشتراك في قاعدة البيانات');
    } else {
      console.error('❌ فشل حفظ الاشتراك في قاعدة البيانات');
    }
  } catch (error) {
    console.error('❌ خطأ في الاشتراك في Push:', error);
  }
}
