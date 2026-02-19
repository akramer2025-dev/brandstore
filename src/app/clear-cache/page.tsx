'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearCachePage() {
  const [status, setStatus] = useState('جاري التنظيف...');
  const [details, setDetails] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const clearEverything = async () => {
      const logs: string[] = [];

      try {
        // 1. إلغاء تسجيل جميع Service Workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          logs.push(`🔍 وجدنا ${registrations.length} service workers`);
          
          for (const registration of registrations) {
            await registration.unregister();
            logs.push('✅ تم إلغاء تسجيل service worker');
          }
        }

        // 2. حذف جميع الـ Caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          logs.push(`🔍 وجدنا ${cacheNames.length} caches`);
          
          for (const cacheName of cacheNames) {
            await caches.delete(cacheName);
            logs.push(`🗑️ تم حذف: ${cacheName}`);
          }
        }

        // 3. مسح localStorage
        if (typeof window !== 'undefined') {
          localStorage.clear();
          logs.push('✅ تم مسح localStorage');
        }

        // 4. مسح sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.clear();
          logs.push('✅ تم مسح sessionStorage');
        }

        setDetails(logs);
        setStatus('✨ تم التنظيف بنجاح!');

        // الانتقال للصفحة الرئيسية بعد 3 ثواني
        setTimeout(() => {
          setStatus('🔄 جاري إعادة التوجيه...');
          window.location.href = '/';
        }, 3000);

      } catch (error) {
        logs.push(`❌ خطأ: ${error}`);
        setDetails(logs);
        setStatus('❌ حدث خطأ في التنظيف');
      }
    };

    clearEverything();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🧹</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            تنظيف الكاش
          </h1>
          <p className="text-xl font-semibold text-purple-600">
            {status}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto" dir="rtl">
          {details.map((detail, index) => (
            <div 
              key={index} 
              className="text-sm text-gray-700 mb-2 font-mono"
            >
              {detail}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          سيتم إعادة توجيهك تلقائياً...
        </div>
      </div>
    </div>
  );
}
