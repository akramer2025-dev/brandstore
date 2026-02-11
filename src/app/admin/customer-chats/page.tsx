'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { 
  MessageCircle, Bot, User, Clock, Trash2, 
  RefreshCw, ChevronLeft, Globe, Smartphone, 
  MessageSquare, Loader2, CheckCircle, Bell, Volume2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Conversation {
  id: string
  sessionId: string
  source: string
  isResolved: boolean
  lastMessage: string
  lastMessageRole: string
  messageCount: number
  lastMessageAt: string
  createdAt: string
}

interface ChatMsg {
  id: string
  conversationId: string
  role: string
  content: string
  productIds: string | null
  createdAt: string
}

export default function CustomerChatsPage() {
  const { data: session, status } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isListMinimized, setIsListMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const previousConversationsRef = useRef<Conversation[]>([])

  // إعداد PWA للتثبيت
  useEffect(() => {
    // إضافة manifest link
    const manifestLink = document.createElement('link')
    manifestLink.rel = 'manifest'
    manifestLink.href = '/chat-manifest.json'
    document.head.appendChild(manifestLink)

    // استماع لحدث beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
      console.log('✅ التطبيق جاهز للتثبيت')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // التحقق من التثبيت السابق
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('📱 التطبيق يعمل في وضع standalone')
      setIsInstallable(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      document.head.removeChild(manifestLink)
    }
  }, [])

  // تثبيت التطبيق
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('⚠️ التطبيق غير قابل للتثبيت الآن. جرب من متصفح آخر (Chrome, Edge)')
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`👤 قرار المستخدم: ${outcome}`)

    if (outcome === 'accepted') {
      console.log('✅ تم تثبيت التطبيق')
      alert('✅ تم تثبيت التطبيق بنجاح! ابحث عن أيقونة "رسائل العملاء" على سطح المكتب أو الموبايل')
    }

    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  // إنشاء صوت الإشعار (صوت واتساب)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // إنشاء صوت باستخدام Web Audio API
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContext) {
        const audioContext = new AudioContext()
        
        // إنشاء ملف صوت بسيط (صوت تنبيه)
        audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxCdN/v1pNMCjhjw+73nWAWDl+68+Pn')
      }
      
      // التحقق من صلاحيات الإشعارات
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          setNotificationsEnabled(true)
          console.log('✅ الإشعارات مفعلة بالفعل')
        } else {
          console.log('⏳ الإشعارات محتاجة تفعيل')
        }
      } else {
        console.log('❌ المتصفح لا يدعم الإشعارات')
      }
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      redirect('/')
    }
  }, [session, status])

  useEffect(() => {
    fetchConversations()
    // Refresh every 10 seconds for new messages (أسرع من 30 ثانية)
    const interval = setInterval(fetchConversations, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // إظهار إشعار المتصفح
  const showBrowserNotification = (title: string, body: string) => {
    if (!notificationsEnabled || !('Notification' in window)) {
      return
    }
    
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'customer-message',
        requireInteraction: true,
        vibrate: [200, 100, 200]
      })
    }
  }

  // تشغيل صوت الإشعار - طويل وواضح
  const playNotificationSound = () => {
    if (!soundEnabled) {
      console.log('🔇 الصوت موقوف')
      return
    }
    
    console.log('🔊 جاري تشغيل صوت الإشعار...')
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) {
        console.error('❌ Web Audio API غير مدعوم')
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
      
      console.log('✅ تم تشغيل الصوت بنجاح')
    } catch (error) {
      console.error('❌ خطأ في تشغيل الصوت:', error)
    }
  }

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/admin/chat-conversations')
      if (res.ok) {
        const data: Conversation[] = await res.json()
        
        console.log(`📊 عدد المحادثات: ${data.length}`)
        
        // التحقق من وجود رسائل جديدة
        const previousConvs = previousConversationsRef.current
        
        console.log(`📝 المحادثات السابقة: ${previousConvs.length}`)
        
        const newMessages = data.filter((conv) => {
          const oldConv = previousConvs.find(c => c.id === conv.id)
          const isNewMessage = conv.lastMessageRole === 'user' && 
            (!oldConv || new Date(conv.lastMessageAt) > new Date(oldConv.lastMessageAt))
          
          if (isNewMessage) {
            console.log(`🆕 رسالة جديدة من: ${conv.sessionId}`)
          }
          
          return isNewMessage
        })

        // إذا كان فيه رسائل جديدة وليست أول مرة
        if (newMessages.length > 0) {
          console.log(`🔔 ${newMessages.length} رسالة جديدة!`)
          
          // تشغيل الصوت (حتى لو أول مرة)
          if (previousConvs.length > 0) {
            console.log('🔊 تشغيل الصوت...')
            playNotificationSound()
            showBrowserNotification('💬 رسالة عميل جديد', `لديك ${newConvs.length} محادثة جديدة من العملاء`)
          } else {
            console.log('⏭️ تخطي الصوت (أول مرة)')
          }
          
          // عرض إشعار
          if (notificationsEnabled && typeof window !== 'undefined' && 'Notification' in window) {
            console.log('📢 عرض الإشعارات...')
            newMessages.forEach((conv) => {
              new Notification('💬 رسالة جديدة من عميل!', {
                body: conv.lastMessage.substring(0, 100) + (conv.lastMessage.length > 100 ? '...' : ''),
                icon: '/logo.png',
                badge: '/logo.png',
                tag: conv.id,
                requireInteraction: true,
                vibrate: [200, 100, 200]
              })
            })
          } else {
            console.log('⚠️ الإشعارات غير مفعلة')
          }
        }

        // حساب الرسائل غير المقروءة
        const unread = data.filter(c => c.lastMessageRole === 'user').length
        setUnreadCount(unread)
        
        console.log(`📬 رسائل غير مقروءة: ${unread}`)
        
        // تحديث القائمة
        setConversations(data)
        previousConversationsRef.current = data
      }
    } catch (error) {
      console.error('❌ خطأ:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const requestNotificationPermission = async () => {
    console.log('📱 بداية طلب الإشعارات...')
    
    // التحقق من دعم الإشعارات
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.error('❌ المتصفح لا يدعم Notification API')
      alert('❌ المتصفح بتاعك مش بيدعم الإشعارات. جرب متصفح تاني زي Chrome أو Firefox')
      return
    }
    
    // التحقق من الصلاحية الحالية
    const currentPermission = Notification.permission
    console.log('🔍 الصلاحية الحالية:', currentPermission)
    
    if (currentPermission === 'granted') {
      setNotificationsEnabled(true)
      console.log('✅ الإشعارات مفعلة بالفعل')
      alert('✅ الإشعارات مفعلة بالفعل!')
      
      try {
        // اختبار الإشعار
        const notification = new Notification('🎉 الإشعارات شغالة!', {
          body: 'هتوصلك إشعارات مع صوت عند أي رسالة جديدة 🔔',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: 'test-notification',
          requireInteraction: false,
          vibrate: [200, 100, 200]
        })
        console.log('✅ تم إرسال إشعار تجريبي')
        playNotificationSound()
      } catch (notifError) {
        console.error('⚠️ خطأ في إرسال الإشعار التجريبي:', notifError)
      }
      return
    }
    
    if (currentPermission === 'denied') {
      console.error('❌ الإشعارات محظورة')
      alert('❌ الإشعارات محظورة. لتفعيلها:\n\n📱 على الموبايل:\n1. اضغط على أيقونة 🔒 جنب الرابط\n2. اختر "إعدادات الموقع"\n3. فعّل "الإشعارات"\n\n💻 على الكمبيوتر:\n1. اضغط على 🔒 في شريط العنوان\n2. اختر "Site settings"\n3. غيّر Notifications إلى Allow')
      return
    }
    
    // طلب الإذن
    try {
      console.log('🔔 جاري طلب إذن الإشعارات...')
      
      const permission = await Notification.requestPermission()
      console.log('📢 النتيجة:', permission)
      
      if (permission === 'granted') {
        setNotificationsEnabled(true)
        console.log('✅ تم تفعيل الإشعارات بنجاح')
        alert('✅ تم تفعيل الإشعارات بنجاح! 🎉\n\nهتوصلك إشعارات مع صوت عند أي رسالة جديدة')
        
        try {
          // اختبار الإشعار
          const notification = new Notification('🎉 تم التفعيل بنجاح!', {
            body: 'الإشعارات شغالة دلوقتي. هتسمع صوت مع كل رسالة جديدة 🔔',
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: 'test-notification',
            requireInteraction: false,
            vibrate: [200, 100, 200]
          })
          console.log('✅ تم إرسال إشعار تجريبي')
          
          // تشغيل الصوت بعد الإشعار
          setTimeout(() => {
            try {
              playNotificationSound()
            } catch (soundError) {
              console.warn('⚠️ خطأ في تشغيل الصوت:', soundError)
            }
          }, 500)
        } catch (notifError) {
          console.error('⚠️ خطأ في إرسال الإشعار التجريبي:', notifError)
        }
      } else if (permission === 'denied') {
        console.error('❌ المستخدم رفض الإشعارات')
        alert('❌ تم رفض الإشعارات.\n\nلو غيّرت رأيك، اضغط على أيقونة 🔒 جنب الرابط وفعّل الإشعارات')
      } else {
        console.warn('⚠️ المستخدم أجل قرار الإشعارات')
        alert('⚠️ محتاج تسمح بالإشعارات عشان تستقبل التنبيهات')
      }
    } catch (error) {
      console.error('❌ خطأ في طلب إذن الإشعارات:', error)
      console.error('تفاصيل الخطأ:', JSON.stringify(error, null, 2))
      
      // رسالة خطأ أوضح
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف'
      alert(`❌ حصل خطأ:\n${errorMessage}\n\nجرب:\n• افتح الصفحة في Chrome أو Firefox\n• تأكد إنك مش في وضع Incognito\n• امسح الـ Cache وجرب تاني`)
    }
  }

  const fetchMessages = async (convId: string) => {
    setIsLoadingMessages(true)
    setSelectedConv(convId)
    setIsListMinimized(true)
    try {
      const res = await fetch(`/api/admin/chat-conversations?id=${convId}`)
      if (res.ok) {
        const data = await res.json()
        setChatMessages(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const deleteConversation = async (convId: string) => {
    if (!confirm('❌ هل أنت متأكد من حذف هذه المحادثة؟')) return
    try {
      const res = await fetch(`/api/admin/chat-conversations?id=${convId}`, { method: 'DELETE' })
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== convId))
        if (selectedConv === convId) {
          setSelectedConv(null)
          setChatMessages([])
          setIsListMinimized(false)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '🕐 الآن'
    if (minutes < 60) return `🕐 منذ ${minutes} دقيقة`
    if (hours < 24) return `🕐 منذ ${hours} ساعة`
    if (days === 1) return '📅 أمس'
    if (days < 7) return `📅 منذ ${days} يوم`
    return `📅 ${date.toLocaleDateString('ar-EG')}`
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'website': return <Globe className="w-4 h-4" />
      case 'chat-page': return <MessageSquare className="w-4 h-4" />
      case 'messenger': return <MessageCircle className="w-4 h-4" />
      default: return <Smartphone className="w-4 h-4" />
    }
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'website': return 'الموقع 🌐'
      case 'chat-page': return 'صفحة الشات 💬'
      case 'messenger': return 'ماسنجر'
      default: return source
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <Loader2 className="w-8 h-8 animate-spin text-purple-200" />
        <span className="mr-3 text-lg text-white">⏳ جاري التحميل...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900" dir="rtl">
    <div className="container mx-auto p-3 sm:p-6">
      <div className="flex flex-wrap justify-between items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-purple-200" />
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
              💬 رسائل العملاء من المساعد الذكي
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm">
              <span className="text-purple-200">
                📊 إجمالي المحادثات: <span className="font-bold text-white">{conversations.length}</span>
              </span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full font-bold animate-pulse text-xs sm:text-sm">
                  🔴 {unreadCount} رسالة غير مقروءة
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {isInstallable && (
            <Button 
              onClick={handleInstallClick} 
              variant="default"
              size="default"
              style={{ backgroundColor: '#7c3aed', color: 'white' }}
              className="font-bold text-sm sm:text-base flex-1 sm:flex-none touch-manipulation min-h-[44px]"
            >
              📱 <span className="hidden sm:inline">تثبيت التطبيق</span><span className="sm:hidden">تثبيت</span>
            </Button>
          )}
          {notificationsEnabled && (
            <Button 
              onClick={() => setSoundEnabled(!soundEnabled)} 
              variant={soundEnabled ? "default" : "outline"} 
              size="default"
              style={soundEnabled ? { backgroundColor: '#10b981', color: 'white' } : {}}
              className="text-sm sm:text-base flex-1 sm:flex-none touch-manipulation min-h-[44px]"
            >
              <Volume2 className="w-4 h-4 ml-1 sm:ml-2" />
              <span className="hidden sm:inline">{soundEnabled ? '🔊 الصوت مفعّل' : '🔇 الصوت موقوف'}</span>
              <span className="sm:hidden">{soundEnabled ? '🔊' : '🔇'}</span>
            </Button>
          )}
          <Button 
            onClick={requestNotificationPermission} 
            variant={notificationsEnabled ? "default" : "outline"} 
            size="default"
            style={notificationsEnabled ? { backgroundColor: '#7c3aed', color: 'white' } : {}}
            className="text-sm sm:text-base flex-1 sm:flex-none touch-manipulation min-h-[44px]"
          >
            <Bell className="w-4 h-4 ml-1 sm:ml-2" />
            <span className="hidden sm:inline">{notificationsEnabled ? '🔔 الإشعارات مفعلة' : '🔕 تفعيل الإشعارات'}</span>
            <span className="sm:hidden">{notificationsEnabled ? '🔔' : '🔕'}</span>
          </Button>
          <Button 
            onClick={fetchConversations} 
            variant="outline" 
            size="default"
            className="text-sm sm:text-base flex-1 sm:flex-none touch-manipulation min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4 ml-1 sm:ml-2" />
            <span className="hidden sm:inline">🔄 تحديث</span>
            <span className="sm:hidden">🔄</span>
          </Button>
          <Button 
            onClick={() => window.open('/admin/test-notifications', '_blank')}
            variant="outline" 
            size="default"
            className="text-sm sm:text-base flex-1 sm:flex-none touch-manipulation min-h-[44px] border-yellow-400 hover:bg-yellow-50"
          >
            <Volume2 className="w-4 h-4 ml-1 sm:ml-2 text-yellow-600" />
            <span className="hidden sm:inline text-yellow-600">🧪 اختبار الصوت</span>
            <span className="sm:hidden text-yellow-600">🧪</span>
          </Button>
        </div>
      </div>

      <div className={`grid ${isListMinimized ? 'grid-cols-10' : 'grid-cols-5'} gap-3 sm:gap-6 h-[calc(100vh-180px)]`}>
        {/* Conversations List - على اليسار */}
        <Card className={`${isListMinimized ? 'col-span-1' : 'col-span-2'} shadow-xl border-2 flex flex-col overflow-hidden transition-all duration-300`} style={{ borderColor: '#7c3aed' }}>
          <CardHeader className="flex-shrink-0 cursor-pointer" style={{ background: 'linear-gradient(to right, #ede9fe, #fce7f3)' }} onClick={() => setIsListMinimized(!isListMinimized)}>
            <CardTitle className="flex items-center justify-between" style={{ color: '#7c3aed' }}>
              <div className="flex items-center gap-2">
                {isListMinimized ? '📝' : '📋 قائمة المحادثات'}
                {unreadCount > 0 && (
                  <Badge className="bg-red-600 text-white animate-bounce">
                    {unreadCount}
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          {!isListMinimized && (
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-30" />
                <p className="text-lg sm:text-xl">😴 لا توجد محادثات بعد</p>
                <p className="text-xs sm:text-sm mt-2">ستظهر هنا عندما يتحدث العملاء مع المساعد الذكي</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => fetchMessages(conv.id)}
                  className={`
                    p-3 sm:p-4 border-b cursor-pointer transition-all duration-300 touch-manipulation
                    ${selectedConv === conv.id 
                      ? 'shadow-lg' 
                      : 'hover:shadow-md active:shadow-lg'
                    }
                    ${conv.lastMessageRole === 'user' ? 'border-r-4 border-red-400' : ''}
                  `}
                  style={selectedConv === conv.id ? {
                    background: 'linear-gradient(to right, #ddd6fe, #fbcfe8)',
                    borderLeft: '4px solid #7c3aed'
                  } : {}}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {getSourceIcon(conv.source)}
                      <Badge variant="secondary" className="text-xs" style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}>
                        {getSourceLabel(conv.source)}
                      </Badge>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-gray-500">{formatDate(conv.lastMessageAt)}</span>
                      {conv.lastMessageRole === 'user' && (
                        <Badge className="bg-red-600 text-white text-xs shadow-lg animate-pulse">
                          🔴 جديد!
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-gray-800 font-medium line-clamp-2 mb-2">
                    {conv.lastMessageRole === 'user' ? '👤' : '🤖'} {conv.lastMessage}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span className="font-semibold">📨 {conv.messageCount} رسالة</span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteConversation(conv.id)
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-red-600 hover:text-red-800 hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
          )}
        </Card>

        {/* Messages Display - على اليمين */}
        <Card className={`${isListMinimized ? 'col-span-9' : 'col-span-3'} shadow-xl border-2 flex flex-col overflow-hidden transition-all duration-300`} style={{ borderColor: '#7c3aed' }}>
          <CardHeader className="border-b-2 flex-shrink-0" style={{ background: 'linear-gradient(to right, #ede9fe, #fce7f3)', borderColor: '#c4b5fd' }}>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold" style={{ color: '#7c3aed' }}>
                💬 المحادثة
                {selectedConv && chatMessages.length > 0 && (
                  <Badge style={{ backgroundColor: '#7c3aed' }}>{chatMessages.length} رسالة</Badge>
                )}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            {!selectedConv ? (
              <div className="flex flex-col items-center justify-center flex-1 text-gray-400 px-4">
                <MessageCircle className="w-24 h-24 sm:w-32 sm:h-32 mb-3 sm:mb-4 opacity-10 animate-pulse" />
                <p className="text-lg sm:text-2xl font-bold text-center">👈 اختر محادثة من القائمة</p>
                <p className="text-xs sm:text-sm mt-1 text-gray-500">لعرض الرسائل</p>
              </div>
            ) : isLoadingMessages ? (
              <div className="flex items-center justify-center flex-1">
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin" style={{ color: '#7c3aed' }} />
                <span className="mr-2 sm:mr-3 text-base sm:text-lg font-medium">⏳ جاري تحميل الرسائل...</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4" style={{ background: 'linear-gradient(to bottom, #faf5ff, #ffffff, #fce7f3)' }}>
                {chatMessages.map((msg, idx) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div
                      className={`
                        max-w-[85%] sm:max-w-[75%] p-3 sm:p-5 rounded-2xl shadow-lg transition-transform active:scale-95 sm:hover:scale-105
                        ${msg.role === 'user' 
                          ? 'bg-white text-gray-900' 
                          : 'text-white'
                        }
                      `}
                      style={msg.role === 'user' ? { border: '2px solid #c4b5fd' } : { background: 'linear-gradient(to right, #7c3aed, #a855f7, #ec4899)' }}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                        {msg.role === 'user' ? (
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ddd6fe' }}>
                            <User className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: '#7c3aed' }} />
                          </div>
                        ) : (
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 flex items-center justify-center">
                            <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                          </div>
                        )}
                        <span className="text-xs sm:text-sm font-bold">
                          {msg.role === 'user' ? '👤 العميل' : '🤖 ريمو'}
                        </span>
                        <span className={`text-xs ${msg.role === 'user' ? 'text-gray-500' : 'text-white/70'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{msg.content}</p>
                      {msg.productIds && (
                        <div className={`mt-2 sm:mt-3 pt-2 sm:pt-3 ${msg.role === 'user' ? 'border-t' : 'border-t border-white/30'}`} style={msg.role === 'user' ? { borderColor: '#c4b5fd' } : {}}>
                          <span className="text-xs sm:text-sm font-semibold">
                            🛍️ عرض {msg.productIds.split(',').length} منتج
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </div>
    </div>
  )
}
