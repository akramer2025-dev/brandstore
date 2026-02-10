'use client'

import { useEffect } from 'react'

/**
 * مكون إدارة الإشعارات للتطبيق
 * يتم تحميله مرة واحدة عند بدء التطبيق
 */
export default function MobileNotifications() {
  
  useEffect(() => {
    // Dynamic import لتجنب SSR issues
    const initNotifications = async () => {
      try {
        // تحقق من وجود Capacitor
        const { Capacitor } = await import('@capacitor/core')
        
        // تحقق إذا كنا على موبايل
        if (Capacitor.isNativePlatform()) {
          console.log('📱 التطبيق يعمل على موبايل - تهيئة الإشعارات...')
          
          // تهيئة الإشعارات
          const NotificationManager = (await import('@/lib/notification-manager')).default
          
          await NotificationManager.initialize()
          console.log('✅ تم تهيئة نظام الإشعارات بنجاح')
        } else {
          console.log('🌐 التطبيق يعمل على متصفح - الإشعارات غير مفعلة')
        }
      } catch (error) {
        console.error('❌ فشلت تهيئة الإشعارات:', error)
      }
    }
    
    initNotifications()
    
    // تنظيف عند إلغاء التحميل
    return () => {
      console.log('🔄 تنظيف مستمعي الإشعارات...')
    }
  }, [])

  // المكون غير مرئي - يعمل في الخلفية
  return null
}
