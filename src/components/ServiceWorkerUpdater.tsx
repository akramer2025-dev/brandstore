"use client";

import { useEffect } from 'react';

/**
 * مكون لتحديث Service Worker تلقائياً وتنظيف الـ Cache القديم
 * يحل مشكلة: التطبيق أحياناً يشتغل وأحياناً لا على الموبايل
 */
export function ServiceWorkerUpdater() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // تسجيل Service Worker
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker registered successfully');

          // فحص التحديثات كل 30 ثانية
          setInterval(() => {
            registration.update();
          }, 30000);

          // الاستماع لتحديثات Service Worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') {
                  console.log('🔄 New Service Worker activated - Reloading page...');
                  
                  // إعادة تحميل الصفحة بعد ثانية واحدة
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });

      // تنظيف الـ Cache يدوياً عند فتح التطبيق
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          // حذف أي cache قديم
          if (cacheName.startsWith('remostore-v1') || cacheName.startsWith('workbox-')) {
            console.log('🗑️ Deleting old cache:', cacheName);
            caches.delete(cacheName);
          }
        });
      });
    }
  }, []);

  return null;
}
