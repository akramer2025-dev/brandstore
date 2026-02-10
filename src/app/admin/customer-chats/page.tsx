'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { 
  MessageCircle, Bot, User, Clock, Trash2, 
  RefreshCw, ChevronLeft, Globe, Smartphone, 
  MessageSquare, Loader2, CheckCircle
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
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
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
    if (!confirm('هل أنت متأكد من حذف هذه المحادثة؟')) return
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

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'chat-page': return <Smartphone className="w-4 h-4" />
      case 'messenger': return <MessageSquare className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'chat-page': return 'صفحة الشات'
      case 'messenger': return 'ماسنجر'
      default: return 'الموقع'
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'الآن'
    if (minutes < 60) return `منذ ${minutes} دقيقة`
    if (hours < 24) return `منذ ${hours} ساعة`
    if (days < 7) return `منذ ${days} يوم`
    return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-7 h-7 text-pink-500" />
              رسائل العملاء - المساعد الذكي
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              جميع محادثات العملاء مع المساعد الذكي ({conversations.length} محادثة)
            </p>
          </div>
          <Button onClick={fetchConversations} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 ml-1" />
            تحديث
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-180px)]">
          {/* قائمة المحادثات */}
          <div className="lg:col-span-1 bg-white rounded-xl border overflow-hidden flex flex-col">
            <div className="p-3 border-b bg-gray-50">
              <h2 className="font-semibold text-gray-700 text-sm">المحادثات</h2>
            </div>
            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>لا توجد محادثات بعد</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => fetchMessages(conv.id)}
                    className={`p-3 border-b cursor-pointer hover:bg-pink-50 transition-colors ${
                      selectedConv === conv.id ? 'bg-pink-50 border-r-4 border-r-pink-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            {getSourceIcon(conv.source)}
                            {getSourceLabel(conv.source)}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {conv.messageCount} رسالة
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 truncate">
                          {conv.lastMessageRole === 'user' ? '👤 ' : '🤖 '}
                          {conv.lastMessage.substring(0, 60)}
                          {conv.lastMessage.length > 60 ? '...' : ''}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(conv.lastMessageAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id) }}
                        className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                        title="حذف المحادثة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* عرض الرسائل */}
          <div className="lg:col-span-2 bg-white rounded-xl border overflow-hidden flex flex-col">
            {!selectedConv ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-3 opacity-20" />
                  <p className="text-lg">اختر محادثة لعرض الرسائل</p>
                  <p className="text-sm mt-1">اضغط على أي محادثة من القائمة</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header المحادثة */}
                <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setSelectedConv(null); setChatMessages([]) }}
                      className="lg:hidden p-1 hover:bg-gray-200 rounded"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h3 className="font-semibold text-gray-700 text-sm">تفاصيل المحادثة</h3>
                      <p className="text-xs text-gray-400">{chatMessages.length} رسالة</p>
                    </div>
                  </div>
                  {conversations.find(c => c.id === selectedConv)?.isResolved && (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 ml-1" />
                      تم الحل
                    </Badge>
                  )}
                </div>

                {/* الرسائل */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    chatMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          msg.role === 'user'
                            ? 'bg-white border border-gray-200 text-gray-800'
                            : 'bg-pink-500 text-white'
                        }`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            {msg.role === 'user' ? (
                              <User className="w-3.5 h-3.5 text-gray-400" />
                            ) : (
                              <Bot className="w-3.5 h-3.5 text-pink-200" />
                            )}
                            <span className={`text-xs font-medium ${
                              msg.role === 'user' ? 'text-gray-400' : 'text-pink-200'
                            }`}>
                              {msg.role === 'user' ? 'العميل' : 'المساعد الذكي'}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${
                            msg.role === 'user' ? 'text-gray-300' : 'text-pink-200'
                          }`}>
                            {new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
