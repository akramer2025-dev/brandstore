'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { 
  MessageCircle, Bot, User, Clock, Trash2, 
  RefreshCw, ChevronLeft, Globe, Smartphone, 
  MessageSquare, Loader2, CheckCircle, Bell
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      redirect('/')
    }
  }, [session, status])

  useEffect(() => {
    fetchConversations()
    // Refresh every 30 seconds for new messages
    const interval = setInterval(fetchConversations, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const fetchConversations = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/chat-conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
        
        // Check for new messages and show notification
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            const newConvs = data.filter((c: Conversation) => 
              !conversations.find(old => old.id === c.id) && c.lastMessageRole === 'user'
            )
            if (newConvs.length > 0) {
              new Notification('رسالة جديدة من عميل 📩', {
                body: `${newConvs.length} رسالة جديدة في انتظارك`,
                icon: '/logo.png'
              })
            }
          }
        }
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
        alert('✅ تم تفعيل الإشعارات! هتوصلك إشعارات عند أي رسالة جديدة')
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
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-10 h-10 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              💬 رسائل العملاء من المساعد الذكي
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              📊 إجمالي المحادثات: <span className="font-bold text-purple-600">{conversations.length}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={requestNotificationPermission} variant="outline" size="sm">
            <Bell className="w-4 h-4 ml-2" />
            🔔 تفعيل الإشعارات
          </Button>
          <Button onClick={fetchConversations} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 ml-2" />
            🔄 تحديث
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1 shadow-lg border-purple-200 border-2">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              📋 قائمة المحادثات
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
                    p-4 border-b cursor-pointer transition-all duration-200
                    ${selectedConv === conv.id 
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-l-4 border-purple-600' 
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getSourceIcon(conv.source)}
                      <Badge variant="secondary" className="text-xs">
                        {getSourceLabel(conv.source)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{formatDate(conv.lastMessageAt)}</span>
                      {conv.lastMessageRole === 'user' && (
                        <Badge className="bg-red-500 text-white text-xs animate-pulse">
                          🔴 جديد
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                    {conv.lastMessageRole === 'user' ? '👤' : '🤖'} {conv.lastMessage}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>📨 {conv.messageCount} رسالة</span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteConversation(conv.id)
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
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
        <Card className="lg:col-span-2 shadow-lg border-purple-200 border-2">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-purple-800">
                💬 المحادثة
              </span>
              {selectedConv && (
                <Button
                  onClick={() => {
                    setSelectedConv(null)
                    setChatMessages([])
                  }}
                  variant="ghost"
                  size="sm"
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
                <MessageCircle className="w-24 h-24 mb-4 opacity-20" />
                <p className="text-xl">👈 اختر محادثة من القائمة</p>
              </div>
            ) : isLoadingMessages ? (
              <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <span className="mr-3">⏳ جاري تحميل الرسائل...</span>
              </div>
            ) : (
              <div className="h-[60vh] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                  >
                    <div
                      className={`
                        max-w-[70%] p-4 rounded-2xl shadow-md
                        ${msg.role === 'user' 
                          ? 'bg-white border-2 border-purple-200' 
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {msg.role === 'user' ? (
                          <User className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Bot className="w-5 h-5" />
                        )}
                        <span className="text-xs font-semibold">
                          {msg.role === 'user' ? '👤 العميل' : '🤖 ريمو'}
                        </span>
                        <span className="text-xs opacity-70">
                          {new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      {msg.productIds && (
                        <div className="mt-2 pt-2 border-t border-opacity-20">
                          <span className="text-xs opacity-80">
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
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
