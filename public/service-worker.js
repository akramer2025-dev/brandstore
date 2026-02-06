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
  console.log('Push received:', event);
  
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
      data = { ...data, ...pushData };
    } catch (e) {
      data.body = event.data.text();
    }
  }

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

  // فتح أو التركيز على صفحة التطبيق
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // البحث عن نافذة مفتوحة
        for (let client of clientList) {
          if (client.url.includes('/vendor/dashboard') && 'focus' in client) {
            return client.focus();
          }
        }
        // فتح نافذة جديدة
        if (clients.openWindow) {
          return clients.openWindow('/vendor/dashboard');
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
