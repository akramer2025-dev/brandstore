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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const previousConversationsRef = useRef<Conversation[]>([])

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
      if ('Notification' in window && Notification.permission === 'granted') {
        setNotificationsEnabled(true)
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

  // تشغيل صوت الإشعار
  const playNotificationSound = () => {
    if (!soundEnabled) return
    
    try {
      // محاولة تشغيل الصوت المخصص
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // إذا فشل، استخدم beep بسيط
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext
          if (AudioContext) {
            const audioContext = new AudioContext()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            oscillator.frequency.value = 800
            oscillator.type = 'sine'
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
            
            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.5)
          }
        })
      }
    } catch (error) {
      console.error('Error playing sound:', error)
    }
  }

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/admin/chat-conversations')
      if (res.ok) {
        const data: Conversation[] = await res.json()
        
        // التحقق من وجود رسائل جديدة
        const previousConvs = previousConversationsRef.current
        const newMessages = data.filter((conv) => {
          const oldConv = previousConvs.find(c => c.id === conv.id)
          return (
            conv.lastMessageRole === 'user' && 
            (!oldConv || new Date(conv.lastMessageAt) > new Date(oldConv.lastMessageAt))
          )
        })

        // إذا كان فيه رسائل جديدة
        if (newMessages.length > 0 && previousConvs.length > 0) {
          console.log('🔔 رسائل جديدة:', newMessages.length)
          
          // تشغيل الصوت
          playNotificationSound()
          
          // عرض إشعار
          if (notificationsEnabled && typeof window !== 'undefined' && 'Notification' in window) {
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
          }
        }

        // حساب الرسائل غير المقروءة
        const unread = data.filter(c => c.lastMessageRole === 'user').length
        setUnreadCount(unread)
        
        // تحديث القائمة
        setConversations(data)
        previousConversationsRef.current = data
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setNotificationsEnabled(true)
        alert('✅ تم تفعيل الإشعارات! هتوصلك إشعارات مع صوت عند أي رسالة جديدة')
        
        // اختبار الإشعار
        new Notification('🎉 تم التفعيل بنجاح!', {
          body: 'الإشعارات شغالة دلوقتي. هتسمع صوت مع كل رسالة جديدة 🔔',
          icon: '/logo.png'
        })
        playNotificationSound()
      } else {
        alert('❌ لم يتم تفعيل الإشعارات. يرجى السماح بالإشعارات في إعدادات المتصفح')
      }
    }
  }

  const fetchMessages = async (convId: string) => {
    setIsLoadingMessages(true)
    setSelectedConv(convId)
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="mr-3 text-lg">⏳ جاري التحميل...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-10 h-10 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              💬 رسائل العملاء من المساعد الذكي
            </h1>
            <div className="flex items-center gap-4 mt-1 text-sm">
              <span className="text-gray-600">
                📊 إجمالي المحادثات: <span className="font-bold text-purple-600">{conversations.length}</span>
              </span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full font-bold animate-pulse">
                  🔴 {unreadCount} رسالة غير مقروءة
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {notificationsEnabled && (
            <Button 
              onClick={() => setSoundEnabled(!soundEnabled)} 
              variant={soundEnabled ? "default" : "outline"} 
              size="sm"
              className={soundEnabled ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Volume2 className="w-4 h-4 ml-2" />
              {soundEnabled ? '🔊 الصوت مفعّل' : '🔇 الصوت موقوف'}
            </Button>
          )}
          <Button 
            onClick={requestNotificationPermission} 
            variant={notificationsEnabled ? "default" : "outline"} 
            size="sm"
            className={notificationsEnabled ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            <Bell className="w-4 h-4 ml-2" />
            {notificationsEnabled ? '🔔 الإشعارات مفعلة' : '🔕 تفعيل الإشعارات'}
          </Button>
          <Button onClick={fetchConversations} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 ml-2" />
            🔄 تحديث
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1 shadow-xl border-purple-300 border-2">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
            <CardTitle className="flex items-center justify-between text-purple-900">
              <div className="flex items-center gap-2">
                📋 قائمة المحادثات
                {unreadCount > 0 && (
                  <Badge className="bg-red-600 text-white animate-bounce">
                    {unreadCount}
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-[70vh] overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-xl">😴 لا توجد محادثات بعد</p>
                <p className="text-sm mt-2">ستظهر هنا عندما يتحدث العملاء مع المساعد الذكي</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => fetchMessages(conv.id)}
                  className={`
                    p-4 border-b cursor-pointer transition-all duration-300
                    ${selectedConv === conv.id 
                      ? 'bg-gradient-to-r from-purple-200 to-pink-200 border-l-4 border-purple-700 shadow-lg' 
                      : 'hover:bg-purple-50 hover:shadow-md'
                    }
                    ${conv.lastMessageRole === 'user' ? 'border-r-4 border-red-400' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getSourceIcon(conv.source)}
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
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
                  
                  <p className="text-sm text-gray-800 font-medium line-clamp-2 mb-2">
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
        </Card>

        {/* Messages Display */}
        <Card className="lg:col-span-2 shadow-xl border-purple-300 border-2">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 border-b-2 border-purple-200">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-purple-900 font-bold">
                💬 المحادثة
                {selectedConv && chatMessages.length > 0 && (
                  <Badge className="bg-purple-600">{chatMessages.length} رسالة</Badge>
                )}
              </span>
              {selectedConv && (
                <Button
                  onClick={() => {
                    setSelectedConv(null)
                    setChatMessages([])
                  }}
                  variant="ghost"
                  size="sm"
                  className="hover:bg-purple-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  رجوع
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!selectedConv ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                <MessageCircle className="w-32 h-32 mb-4 opacity-10 animate-pulse" />
                <p className="text-2xl font-bold">👈 اختر محادثة من القائمة</p>
                <p className="text-sm mt- text-gray-500">لعرض الرسائل</p>
              </div>
            ) : isLoadingMessages ? (
              <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                <span className="mr-3 text-lg font-medium">⏳ جاري تحميل الرسائل...</span>
              </div>
            ) : (
              <div className="h-[60vh] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-purple-50/30 via-white to-pink-50/30">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div
                      className={`
                        max-w-[75%] p-5 rounded-2xl shadow-lg transition-transform hover:scale-105
                        ${msg.role === 'user' 
                          ? 'bg-white border-2 border-purple-300 text-gray-900' 
                          : 'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 text-white'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {msg.role === 'user' ? (
                          <div className="w-7 h-7 rounded-full bg-purple-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-purple-700" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}
                        <span className="text-sm font-bold">
                          {msg.role === 'user' ? '👤 العميل' : '🤖 ريمو'}
                        </span>
                        <span className={`text-xs ${msg.role === 'user' ? 'text-gray-500' : 'text-white/70'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed text-base">{msg.content}</p>
                      {msg.productIds && (
                        <div className={`mt-3 pt-3 ${msg.role === 'user' ? 'border-t border-purple-200' : 'border-t border-white/30'}`}>
                          <span className="text-sm font-semibold">
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
  )
}
