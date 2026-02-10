'use client'

import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import NotificationManager from '@/lib/notification-manager'

/**
 * مكون إدارة الإشعارات للتطبيق
 * يتم تحميله مرة واحدة عند بدء التطبيق
 */
export default function MobileNotifications() {
  
  useEffect(() => {
    // تحقق إذا كنا على موبايل
    if (Capacitor.isNativePlatform()) {
      console.log('📱 التطبيق يعمل على موبايل - تهيئة الإشعارات...')
      
      // تهيئة الإشعارات
      NotificationManager.initialize()
        .then(() => {
          console.log('✅ تم تهيئة نظام الإشعارات بنجاح')
        })
        .catch((error) => {
          console.error('❌ فشلت تهيئة الإشعارات:', error)
        })
    } else {
      console.log('🌐 التطبيق يعمل على متصفح - الإشعارات غير مفعلة')
    }
    
    // تنظيف عند إلغاء التحميل
    return () => {
      console.log('🔄 تنظيف مستمعي الإشعارات...')
    }
  }, [])

  // المكون غير مرئي - يعمل في الخلفية
  return null
}
