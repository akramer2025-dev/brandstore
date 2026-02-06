// Service Worker للإشعارات
const CACHE_NAME = 'remostore-v1';

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // تفعيل Service Worker الجديد فوراً
  self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  // السيطرة على جميع الصفحات فوراً
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // حذف caches القديمة
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      }),
      // حذف جميع الإشعارات القديمة عند التفعيل
      self.registration.getNotifications().then(notifications => {
        console.log(`Clearing ${notifications.length} old notifications`);
        notifications.forEach(notification => notification.close());
      })
    ])
  );
});

// استقبال Push Notifications (يعمل حتى مع التطبيق المغلق)
self.addEventListener('push', (event) => {
  console.log('📩 Push received in Service Worker (Background Mode):', event);
  console.log('📩 Push data:', event.data ? event.data.text() : 'No data');
  
  let data = {
    title: '🎉 إشعار جديد من Remostore',
    body: 'لديك إشعار جديد',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'default', // سيتم تحديثه حسب نوع الإشعار
    requireInteraction: true, // يبقى الإشعار حتى يتفاعل المستخدم
    vibrate: [200, 100, 200, 100, 200, 100, 400], // اهتزاز أطول
    renotify: true, // إعادة إظهار الإشعار إذا كان هناك إشعار بنفس الـ tag
    silent: false, // تشغيل صوت النظام
    actions: [
      { action: 'open', title: '📱 فتح', icon: '/icon-192x192.png' },
      { action: 'close', title: '❌ إغلاق' }
    ],
    timestamp: Date.now()
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      console.log('✅ Parsed push data:', pushData);
      data = { ...data, ...pushData };
      
      // إنشاء tag فريد حسب نوع الإشعار والطلب
      if (pushData.data && pushData.data.orderId) {
        data.tag = `order-${pushData.data.orderId}`;
      }
    } catch (e) {
      console.log('⚠️  Could not parse push data as JSON, using text');
      data.body = event.data.text();
    }
  }

  console.log('🔔 Showing notification with data:', data);

  event.waitUntil(
    Promise.all([
      // إظهار الإشعار (يعمل حتى مع التطبيق المغلق)
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: data.tag,
        requireInteraction: data.requireInteraction,
        vibrate: data.vibrate,
        data: data.data,
        actions: data.actions,
        silent: data.silent,
        renotify: data.renotify,
        timestamp: data.timestamp,
      }).then(() => {
        console.log('✅ Notification displayed successfully (Background Mode)');
      }),
      // إرسال رسالة لجميع النوافذ المفتوحة (إن وجدت)
      sendMessageToAllClients({
        type: 'NEW_NOTIFICATION',
        data: data
      })
    ])
  );
});

// النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  // إغلاق الإشعار الحالي
  event.notification.close();
  
  // حذف جميع الإشعارات القديمة من نفس الطلب
  if (event.notification.tag) {
    event.waitUntil(
      self.registration.getNotifications({ tag: event.notification.tag })
        .then(notifications => {
          notifications.forEach(notification => notification.close());
        })
    );
  }

  if (event.action === 'close') {
    // مجرد إغلاق الإشعار - تم بالفعل
    return;
  }

  // تحديد الصفحة المطلوب فتحها بناءً على نوع الإشعار
  let targetUrl = '/vendor/dashboard';
  
  if (event.notification.data) {
    const { type, orderId } = event.notification.data;
    
    if (type === 'NEW_ORDER' && orderId) {
      targetUrl = `/vendor/orders/${orderId}`;
    } else if (type === 'ORDER_CONFIRMED' && orderId) {
      targetUrl = `/orders/${orderId}`;
    }
  }

  // فتح أو التركيز على صفحة التطبيق
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // البحث عن نافذة مفتوحة
        for (let client of clientList) {
          if ('focus' in client) {
            return client.focus().then(() => {
              // إرسال رسالة للصفحة للانتقال للرابط المطلوب
              client.postMessage({
                type: 'NAVIGATE',
                url: targetUrl
              });
            });
          }
        }
        // فتح نافذة جديدة
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// إرسال رسالة لجميع النوافذ المفتوحة
async function sendMessageToAllClients(message) {
  const allClients = await clients.matchAll({ includeUncontrolled: true });
  allClients.forEach(client => {
    client.postMessage(message);
  });
}
