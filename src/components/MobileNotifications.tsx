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
          // تهيئة الإشعارات
          const NotificationManager = (await import('@/lib/notification-manager')).default
          
          await NotificationManager.initialize()
        }
      } catch (error) {
        console.error('❌ فشلت تهيئة الإشعارات:', error)
      }
    }
    
    initNotifications()
  }, [])

  // المكون غير مرئي - يعمل في الخلفية
  return null
}
