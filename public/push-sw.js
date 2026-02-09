// Push Notifications Service Worker

self.addEventListener('install', (event) => {
  console.log('[Push SW] Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Push SW] Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// استقبال Push Notification
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('[Push SW] Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    const { title, body, icon, image, badge, url, tag, requireInteraction } = data;

    const options = {
      body: body || '',
      icon: icon || '/logo.png',
      badge: badge || '/logo.png',
      image: image || undefined,
      tag: tag || 'notification',
      requireInteraction: requireInteraction || false,
      vibrate: [200, 100, 200],
      data: {
        url: url || '/',
        dateOfArrival: Date.now(),
      },
      actions: [
        {
          action: 'open',
          title: 'فتح',
          icon: '/logo.png'
        },
        {
          action: 'close',
          title: 'إغلاق'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('[Push SW] Error showing notification:', error);
  }
});

// معالجة النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  console.log('[Push SW] Notification clicked');
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((clientList) => {
      // البحث عن نافذة مفتوحة بنفس الـ URL
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // فتح نافذة جديدة
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// معالجة تغيير الاشتراك
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[Push SW] Push subscription changed');
  
  event.waitUntil(
    fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'resubscribe',
        oldSubscription: event.oldSubscription,
        newSubscription: event.newSubscription
      })
    })
  );
});
