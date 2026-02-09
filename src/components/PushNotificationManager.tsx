'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

// دالة تحويل VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // التحقق من دعم الإشعارات
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const subscribeToPush = async () => {
    setIsLoading(true);
    try {
      // طلب الإذن
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('يجب السماح بالإشعارات لتفعيل هذه الميزة');
        setIsLoading(false);
        return;
      }

      // تسجيل service worker
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register('/push-sw.js', {
          scope: '/',
        });
        await navigator.serviceWorker.ready;
      }

      // الاشتراك في Push notifications
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        toast.error('VAPID key غير متوفر');
        setIsLoading(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // إرسال الاشتراك للسيرفر
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          action: 'subscribe',
        }),
      });

      if (!response.ok) {
        throw new Error('فشل حفظ الاشتراك');
      }

      setIsSubscribed(true);
      toast.success('تم تفعيل الإشعارات بنجاح! 🔔');
    } catch (error: any) {
      console.error('Error subscribing to push:', error);
      toast.error('حدث خطأ أثناء تفعيل الإشعارات');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // إخبار السيرفر بإلغاء الاشتراك  
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'unsubscribe',
            endpoint: subscription.endpoint,
          }),
        });
      }

      setIsSubscribed(false);
      toast.success('تم إلغاء تفعيل الإشعارات');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('حدث خطأ أثناء إلغاء الإشعارات');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 z-50">
      <Button
        onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
        disabled={isLoading}
        size="lg"
        className={`rounded-full shadow-2xl ${
          isSubscribed
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
        }`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isSubscribed ? (
          <>
            <Bell className="w-5 h-5 ml-2" />
            مفعّل
          </>
        ) : (
          <>
            <BellOff className="w-5 h-5 ml-2" />
            فعّل الإشعارات
          </>
        )}
      </Button>
    </div>
  );
}
