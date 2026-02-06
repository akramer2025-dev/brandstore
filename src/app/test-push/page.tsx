'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function TestPushPage() {
  const { data: session } = useSession();
  const [status, setStatus] = useState<string>('');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkPushStatus();
  }, []);

  const checkPushStatus = async () => {
    // التحقق من وجود browser environment
    if (typeof window === 'undefined') {
      return;
    }

    if (!('serviceWorker' in navigator)) {
      setStatus('❌ Service Worker غير مدعوم');
      return;
    }

    if (!('PushManager' in window)) {
      setStatus('❌ Push Notifications غير مدعومة');
      return;
    }

    const permission = Notification.permission;
    setStatus(`📋 Permission: ${permission}`);

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
      
      if (sub) {
        setStatus(prev => prev + '\n✅ Push Subscription موجود');
      } else {
        setStatus(prev => prev + '\n⚠️  لا يوجد Push Subscription');
      }
    } catch (error) {
      console.error(error);
      setStatus(prev => prev + '\n❌ خطأ: ' + error);
    }
  };

  const requestPermission = async () => {
    if (typeof window === 'undefined') return;
    
    const permission = await Notification.requestPermission();
    setStatus(`📋 تم ${permission === 'granted' ? 'منح' : 'رفض'} الإذن`);
    if (permission === 'granted') {
      await subscribeToPush();
    }
  };

  const subscribeToPush = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const vapidPublicKey = 'BGwdJnBs2lTWLJQqk6O0vLdIhtGIKYzEMdcDeo1XEBfDSNAQDmCZkIQV8a0u-BxxhFpR6Vik_3KT3NLdVYlpTIE';
      
      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
          .replace(/\-/g, '+')
          .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      };

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      setSubscription(sub);
      setStatus('✅ تم إنشاء Push Subscription\n\n' + JSON.stringify(sub.toJSON(), null, 2));

      // حفظ في Database
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'subscribe',
          subscription: sub.toJSON(),
        }),
      });

      const result = await response.json();
      setStatus(prev => prev + '\n\n✅ تم حفظ في Database:\n' + JSON.stringify(result, null, 2));
    } catch (error: any) {
      console.error(error);
      setStatus('❌ خطأ: ' + error.message);
    }
  };

  const testPush = async () => {
    if (!session?.user?.id) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      setStatus('🚀 جاري إرسال Push Notification...');
      
      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
        }),
      });

      const result = await response.json();
      setStatus('✅ تم الإرسال:\n' + JSON.stringify(result, null, 2));
    } catch (error: any) {
      setStatus('❌ خطأ: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔔 اختبار Push Notifications</h1>

        <div className="space-y-4">
          <button
            onClick={checkPushStatus}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            🔍 فحص الحالة
          </button>

          <button
            onClick={requestPermission}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
          >
            ✅ طلب الإذن والاشتراك
          </button>

          <button
            onClick={subscribeToPush}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
          >
            📝 الاشتراك في Push Notifications
          </button>

          <button
            onClick={testPush}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg"
          >
            🚀 اختبار إرسال Push
          </button>
        </div>

        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">📊 الحالة:</h2>
          <pre className="whitespace-pre-wrap text-sm text-green-400">
            {status || 'اضغط على "فحص الحالة" للبدء'}
          </pre>
        </div>

        {subscription && (
          <div className="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">📋 Subscription Details:</h2>
            <pre className="whitespace-pre-wrap text-xs text-gray-400 overflow-x-auto">
              {JSON.stringify(subscription.toJSON(), null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">ℹ️  معلومات:</h2>
          {mounted ? (
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• المتصفح: {typeof navigator !== 'undefined' && navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other'}</li>
              <li>• Service Worker: {typeof navigator !== 'undefined' && ('serviceWorker' in navigator) ? 'مدعوم ✅' : 'غير مدعوم ❌'}</li>
              <li>• Push Manager: {typeof window !== 'undefined' && ('PushManager' in window) ? 'مدعوم ✅' : 'غير مدعوم ❌'}</li>
              <li>• Notification: {typeof window !== 'undefined' && ('Notification' in window) ? 'مدعوم ✅' : 'غير مدعوم ❌'}</li>
              <li>• Permission: {typeof Notification !== 'undefined' ? Notification.permission : 'N/A'}</li>
              <li>• User ID: {session?.user?.id || 'Not logged in'}</li>
            </ul>
          ) : (
            <p className="text-gray-400">جاري التحميل...</p>
          )}
        </div>
      </div>
    </div>
  );
}
