// Service Worker للإشعارات
const CACHE_NAME = 'remostore-v1';

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(clients.claim());
});

// استقبال Push Notifications
self.addEventListener('push', (event) => {
  console.log('📩 Push received in Service Worker:', event);
  console.log('📩 Push data:', event.data ? event.data.text() : 'No data');
  
  let data = {
    title: '🎉 إشعار جديد',
    body: 'لديك إشعار جديد',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'notification',
    requireInteraction: true, // يجبر المستخدم على التفاعل
    vibrate: [200, 100, 200, 100, 200], // اهتزاز
    actions: [
      { action: 'open', title: 'فتح' },
      { action: 'close', title: 'إغلاق' }
    ]
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      console.log('✅ Parsed push data:', pushData);
      data = { ...data, ...pushData };
    } catch (e) {
      console.log('⚠️  Could not parse push data as JSON, using text');
      data.body = event.data.text();
    }
  }

  console.log('🔔 Showing notification with data:', data);

  // تشغيل الصوت (سيتم تشغيله في الصفحة المفتوحة)
  event.waitUntil(
    Promise.all([
      // إظهار الإشعار
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: data.tag,
        requireInteraction: data.requireInteraction,
        vibrate: data.vibrate,
        data: data.data,
        actions: data.actions,
        silent: false, // تشغيل صوت النظام
      }).then(() => {
        console.log('✅ Notification displayed successfully');
      }),
      // إرسال رسالة لجميع النوافذ المفتوحة
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
  
  event.notification.close();

  if (event.action === 'close') {
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
