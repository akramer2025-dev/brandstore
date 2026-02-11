'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Volume2, VolumeX, CheckCircle, XCircle, Bell } from 'lucide-react'

export default function TestNotificationsPage() {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [testMessage, setTestMessage] = useState('')

  const playNotificationSound = () => {
    if (!soundEnabled) {
      setTestResult('error')
      setTestMessage('🔇 الصوت موقوف - فعّل الصوت أولاً!')
      return
    }
    
    setTestMessage('🔊 جاري تشغيل صوت الإشعار...')
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) {
        setTestResult('error')
        setTestMessage('❌ Web Audio API غير مدعوم في المتصفح')
        return
      }
      
      const audioContext = new AudioContext()
      
      // تشغيل 3 نغمات متتالية (أطول وأوضح)
      const playBeep = (startTime: number, frequency: number) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = frequency
        oscillator.type = 'sine'
        
        // صوت أعلى وأطول
        gainNode.gain.setValueAtTime(0.6, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4)
        
        oscillator.start(startTime)
        oscillator.stop(startTime + 0.4)
      }
      
      // 3 نغمات: عالية، متوسطة، عالية
      const now = audioContext.currentTime
      playBeep(now, 1200)       // نغمة 1
      playBeep(now + 0.5, 900)  // نغمة 2
      playBeep(now + 1.0, 1200) // نغمة 3
      
      setTestResult('success')
      setTestMessage('✅ تم تشغيل الصوت بنجاح! هل سمعت 3 نغمات؟')
    } catch (error) {
      setTestResult('error')
      setTestMessage(`❌ خطأ في تشغيل الصوت: ${error}`)
    }
  }

  const simulateNewMessage = async () => {
    setTestMessage('📨 جاري محاكاة رسالة جديدة...')
    
    // إظهار إشعار المتصفح
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('💬 رسالة عميل جديد', {
          body: 'هذا اختبار لإشعار رسالة جديدة من العميل',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: 'test-message',
          requireInteraction: true,
          vibrate: [200, 100, 200]
        })
        setTestMessage('✅ تم إظهار الإشعار! تحقق من شريط الإشعارات')
      } else if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          new Notification('💬 رسالة عميل جديد', {
            body: 'تم تفعيل الإشعارات بنجاح!',
            icon: '/icon-192x192.png'
          })
        }
      } else {
        setTestResult('error')
        setTestMessage('❌ الإشعارات محظورة. فعّلها من إعدادات المتصفح')
        return
      }
    }
    
    // تشغيل الصوت بعد ثانية
    setTimeout(() => {
      playNotificationSound()
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-6" dir="rtl">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-2xl border-2 border-purple-400">
          <CardHeader style={{ background: 'linear-gradient(to right, #ede9fe, #fce7f3)' }}>
            <CardTitle className="flex items-center gap-3 text-2xl" style={{ color: '#7c3aed' }}>
              <Bell className="w-8 h-8" />
              🔔 اختبار صوت الإشعارات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* التحكم في الصوت */}
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-6 h-6 text-purple-600" />
                ) : (
                  <VolumeX className="w-6 h-6 text-gray-400" />
                )}
                <div>
                  <p className="font-bold text-gray-800">
                    {soundEnabled ? '🔊 الصوت مفعّل' : '🔇 الصوت موقوف'}
                  </p>
                  <p className="text-xs text-gray-600">
                    حالة الصوت الحالية
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setSoundEnabled(!soundEnabled)}
                variant={soundEnabled ? 'default' : 'outline'}
                className={soundEnabled ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                {soundEnabled ? 'إيقاف الصوت' : 'تفعيل الصوت'}
              </Button>
            </div>

            {/* أزرار الاختبار */}
            <div className="space-y-3">
              <Button
                onClick={playNotificationSound}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg py-6"
                size="lg"
              >
                <Volume2 className="w-5 h-5 ml-2" />
                🔊 تشغيل الصوت الآن
              </Button>

              <Button
                onClick={simulateNewMessage}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-6"
                size="lg"
              >
                <Bell className="w-5 h-5 ml-2" />
                📨 محاكاة رسالة جديدة
              </Button>
            </div>

            {/* نتيجة الاختبار */}
            {testMessage && (
              <div
                className={`p-4 rounded-lg border-2 ${
                  testResult === 'success'
                    ? 'bg-green-50 border-green-500'
                    : testResult === 'error'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  {testResult === 'success' ? (
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  ) : testResult === 'error' ? (
                    <XCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                  ) : (
                    <Bell className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-bold text-gray-800">{testMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* معلومات إضافية */}
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
              <p className="font-bold text-yellow-800 mb-2">💡 ملاحظات هامة:</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• تأكد من أن صوت الجهاز مفتوح</li>
                <li>• تأكد من أن المتصفح يسمح بتشغيل الصوت</li>
                <li>• بعض المتصفحات تحتاج تفاعل من المستخدم أولاً</li>
                <li>• الصوت يشتغل تلقائياً عند وصول رسالة جديدة</li>
              </ul>
            </div>

            {/* معلومات تقنية */}
            <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
              <p className="font-bold text-purple-800 mb-2">🔧 المعلومات التقنية:</p>
              <div className="text-sm text-purple-700 space-y-1">
                <p>• نوع الصوت: Web Audio API</p>
                <p>• عدد النغمات: 3 نغمات متتالية</p>
                <p>• الترددات: 1200Hz → 900Hz → 1200Hz</p>
                <p>• مدة كل نغمة: 0.4 ثانية</p>
                <p>• المدة الإجمالية: 1.5 ثانية</p>
                <p>• الحجم: عالي (0.6)</p>
                <p>• الإشعارات: Browser Notification API</p>
              </div>
            </div>

            {/* رابط العودة */}
            <div className="text-center pt-4">
              <a
                href="/admin/customer-chats"
                className="text-purple-600 hover:text-purple-800 font-bold underline"
              >
                ← العودة لصفحة المحادثات
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
