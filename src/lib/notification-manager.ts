// 📱 Push Notifications Manager for Remo Store App
// يدير إشعارات التطبيق

import { PushNotifications } from '@capacitor/push-notifications';
import type { 
  PushNotificationSchema, 
  Token 
} from '@capacitor/push-notifications';

export class NotificationManager {
  
  // تهيئة الإشعارات
  static async initialize() {
    console.log('🔔 تهيئة نظام الإشعارات...');
    
    try {
      // طلب إذن الإشعارات
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        console.log('✅ تم منح إذن الإشعارات');
        
        // تسجيل الجهاز
        await PushNotifications.register();
        
        // الاستماع للأحداث
        this.setupListeners();
      } else {
        console.log('❌ لم يتم منح إذن الإشعارات');
      }
    } catch (error) {
      console.error('❌ خطأ في تهيئة الإشعارات:', error);
    }
  }
  
  // إعداد المستمعين
  static setupListeners() {
    // عند التسجيل الناجح
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('✅ تم التسجيل! Token:', token.value);
      
      // إرسال الـ token للسيرفر
      this.sendTokenToServer(token.value);
    });
    
    // عند فشل التسجيل
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('❌ فشل التسجيل:', error);
    });
    
    // عند استلام إشعار (التطبيق مفتوح)
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('📩 إشعار جديد:', notification);
        
        // يمكنك عرض toast أو تنبيه
        this.showInAppNotification(notification);
      }
    );
    
    // عند الضغط على إشعار
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: any) => {
        console.log('👆 تم الضغط على الإشعار:', notification);
        
        // التنقل للصفحة المناسبة
        this.handleNotificationTap(notification);
      }
    );
  }
  
  // إرسال Token للسيرفر
  static async sendTokenToServer(token: string) {
    try {
      const response = await fetch('https://www.remostore.net/api/notifications/register-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          platform: 'android',
          deviceInfo: {
            model: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })
      });
      
      if (response.ok) {
        console.log('✅ تم حفظ Token على السيرفر');
      }
    } catch (error) {
      console.error('❌ خطأ في إرسال Token:', error);
    }
  }
  
  // عرض إشعار داخل التطبيق
  static showInAppNotification(notification: PushNotificationSchema) {
    // يمكنك استخدام toast library أو custom notification
    console.log('📱 عرض إشعار:', notification.title, notification.body);
    
    // مثال: عرض alert بسيط
    if (notification.title && notification.body) {
      // يمكنك استخدام مكتبة مثل react-hot-toast
      alert(`${notification.title}\n${notification.body}`);
    }
  }
  
  // معالجة الضغط على الإشعار
  static handleNotificationTap(notification: any) {
    const data = notification.notification.data;
    
    // التنقل حسب نوع الإشعار
    if (data?.type === 'order') {
      // فتح صفحة الطلب
      window.location.href = `/orders/${data.orderId}`;
    } else if (data?.type === 'product') {
      // فتح صفحة المنتج
      window.location.href = `/products/${data.productId}`;
    } else {
      // فتح الصفحة الرئيسية
      window.location.href = '/';
    }
  }
  
  // الحصول على قائمة الإشعارات المعروضة
  static async getDeliveredNotifications() {
    const result = await PushNotifications.getDeliveredNotifications();
    console.log('📬 الإشعارات المعروضة:', result.notifications);
    return result.notifications;
  }
  
  // إزالة جميع الإشعارات
  static async removeAllNotifications() {
    await PushNotifications.removeAllDeliveredNotifications();
    console.log('🗑️ تم مسح جميع الإشعارات');
  }
}

// تصدير للاستخدام المباشر
export default NotificationManager;
