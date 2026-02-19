'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function ServiceWorkerRegistration() {
  const { data: session } = useSession();
  const isVendor = session?.user?.role === 'VENDOR';

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      console.log('🔄 Service Worker: Starting registration v3...');
      
      // ✅ الاستماع لرسائل من Service Worker (إجبار إعادة التحميل)
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'FORCE_RELOAD') {
          console.log('🔄 Service Worker requested FORCE RELOAD');
          window.location.reload();
        }
      });
      
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope);
          
          // ✅ فحص التحديثات دورياً (كل دقيقة)
          setInterval(() => {
            registration.update();
          }, 60000);

          // ✅ الاستماع للتحديثات الجديدة
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated' && !navigator.serviceWorker.controller) {
                  // Service worker جديد تم تفعيله - إعادة تحميل الصفحة
                  console.log('🔄 New Service Worker activated - Reloading...');
                  window.location.reload();
                }
              });
            }
          });
          
          // الاشتراك في Push Notifications فقط للـ Vendors
          if (isVendor && registration.active) {
            console.log('✅ Service Worker active for VENDOR');
            checkAndSubscribe(registration);
          }
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });

      // ✅ تنظيف الـ Cache القديم
      caches.keys().then((cacheNames) => {
        caches.keys().then((names) => {
          console.log('📦 Found caches:', names);
          names.forEach((name) => {
            // حذف الـ caches القديمة
            if (name.startsWith('remostore-v1') || name.startsWith('workbox-')) {
              console.log('🗑️ Deleting old cache:', name);
              caches.delete(name);
            }
          });
        });
      });
    } else {
      console.log('⚠️ Service Worker not supported');
    }
  }, [isVendor]);

  return null;
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
