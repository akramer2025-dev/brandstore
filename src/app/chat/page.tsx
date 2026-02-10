'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Loader2,
  ShoppingCart,
  ExternalLink,
  Phone,
  MessageCircle,
  Sparkles,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

interface ChatMessage {
  id: string
  type: 'assistant' | 'user' | 'products' | 'suggestions'
  content: string
  products?: ProductCard[]
  suggestions?: string[]
}

interface ProductCard {
  id: string
  name: string
  price: number
  originalPrice?: number | null
  imageUrl: string | null
  category: string | null
  link: string
}

const QUICK_SUGGESTIONS = [
  '🛍️ عرض المنتجات الجديدة',
  '👗 عايزة فساتين',
  '💰 إيه العروض المتاحة؟',
  '🚚 إيه تفاصيل الشحن؟',
  '💳 طرق الدفع المتاحة',
  '🔄 سياسة الإرجاع',
]

// توليد معرف جلسة فريد
function generateSessionId() {
  if (typeof window === 'undefined') return ''
  let id = sessionStorage.getItem('remo_chat_page_session')
  if (!id) {
    id = 'cp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
    sessionStorage.setItem('remo_chat_page_session', id)
  }
  return id
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<any[]>([])
  const [showWelcome, setShowWelcome] = useState(true)
  const [sessionId] = useState(() => generateSessionId())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // رسالة ترحيب أولية
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([
        {
          id: '1',
          type: 'assistant',
          content: 'نورتنا 😊 معاك ريمو ستور، هرد على كل استفساراتك.\nقولى اقدر اساعدك ازاى؟',
        },
        {
          id: '2',
          type: 'suggestions',
          content: '',
          suggestions: QUICK_SUGGESTIONS,
        },
      ])
      setShowWelcome(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
    }

    setMessages((prev) => [...prev, userMsg])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversationHistory,
          sessionId,
          source: 'chat-page'
        }),
      })

      const data = await response.json()

      if (data.success) {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.reply,
        }
        setMessages((prev) => [...prev, aiMsg])

        // عرض كروت المنتجات
        if (data.products && data.products.length > 0) {
          const productsMsg: ChatMessage = {
            id: (Date.now() + 2).toString(),
            type: 'products',
            content: '',
            products: data.products,
          }
          setMessages((prev) => [...prev, productsMsg])
        }

        setConversationHistory(data.conversationHistory || [])
      } else {
        throw new Error(data.error)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: 'عذراً، حدث خطأ. جرب تاني أو تواصل معنا على واتساب 01555512778 📱',
        },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputMessage)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-2xl shadow-teal-900/50">
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDgiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
        
        <div className="relative px-4 py-3 flex items-center justify-between">
          {/* Left side - Logo & Info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
              <img
                src="/logo.png"
                alt="Remo Store"
                className="relative w-11 h-11 rounded-full object-cover ring-3 ring-white/50 shadow-xl"
              />
            </div>
            <div>
              <h1 className="text-white font-black text-lg tracking-wide flex items-center gap-1.5">
                مساعد ريمو الذكي
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </h1>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <span className="text-teal-100 text-xs">متصل الآن • يرد فوراً</span>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/201555512778"
              target="_blank"
              className="bg-white/15 hover:bg-white/25 p-2.5 rounded-xl transition-all backdrop-blur"
              title="واتساب"
            >
              <Phone className="w-5 h-5 text-white" />
            </a>
            <Link
              href="/"
              className="bg-white/15 hover:bg-white/25 p-2.5 rounded-xl transition-all backdrop-blur"
              title="المتجر"
            >
              <ShoppingCart className="w-5 h-5 text-white" />
            </Link>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-4 max-w-3xl w-full mx-auto"
      >
        {/* Welcome Animation */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-teal-500/30 rounded-full blur-2xl animate-pulse"></div>
                <img
                  src="/logo.png"
                  alt="Remo Store"
                  className="relative w-24 h-24 rounded-full object-cover ring-4 ring-teal-400/50 shadow-2xl"
                />
              </div>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-teal-300 text-sm">جاري تحميل المساعد الذكي...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* رسالة المستخدم */}
            {msg.type === 'user' && (
              <div className="flex justify-end mb-1">
                <div className="bg-gradient-to-br from-teal-600 to-cyan-600 text-white rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%] shadow-lg shadow-teal-900/30 text-sm md:text-base leading-relaxed">
                  {msg.content}
                </div>
              </div>
            )}

            {/* رسالة المساعد */}
            {msg.type === 'assistant' && (
              <div className="flex gap-3 mb-1">
                <div className="flex-shrink-0 relative mt-1">
                  <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-md"></div>
                  <img
                    src="/logo.png"
                    alt="Remo"
                    className="relative w-9 h-9 rounded-full object-cover ring-2 ring-teal-400/40 shadow-lg"
                  />
                </div>
                <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-teal-500/20 text-white/95 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] shadow-lg text-sm md:text-base whitespace-pre-line leading-relaxed">
                  {msg.content}
                </div>
              </div>
            )}

            {/* كروت المنتجات */}
            {msg.type === 'products' && msg.products && msg.products.length > 0 && (
              <div className="pr-12 mb-1">
                <p className="text-teal-400/80 text-xs mb-2 flex items-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  اضغط على أي منتج لمشاهدته 👇
                </p>
                <div className="grid gap-2.5">
                  {msg.products.map((product) => (
                    <Link key={product.id} href={product.link}>
                      <motion.div
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-gradient-to-r from-slate-800/80 to-slate-800/50 hover:from-slate-700/90 hover:to-slate-700/70 border border-teal-500/30 hover:border-teal-400/60 rounded-2xl p-3 cursor-pointer transition-all group shadow-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-700/50 border border-teal-500/15">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-teal-500/50" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm md:text-base truncate">{product.name}</p>
                            {product.category && (
                              <p className="text-teal-400/70 text-xs mt-0.5">{product.category}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-emerald-400 font-black text-base md:text-lg">{product.price} ج.م</span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-gray-500 line-through text-xs">{product.originalPrice} ج.م</span>
                              )}
                            </div>
                          </div>
                          <ExternalLink className="w-5 h-5 text-teal-400 group-hover:text-teal-300 group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* الأسئلة السريعة */}
            {msg.type === 'suggestions' && msg.suggestions && (
              <div className="pr-12 mb-1">
                <div className="flex flex-wrap gap-2">
                  {msg.suggestions.map((suggestion, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => sendMessage(suggestion)}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-slate-800/70 to-slate-800/50 hover:from-teal-800/50 hover:to-cyan-800/50 border border-teal-500/30 hover:border-teal-400/60 text-white/90 hover:text-white text-xs md:text-sm px-3.5 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {/* مؤشر الكتابة */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3"
            >
              <div className="flex-shrink-0 relative mt-1">
                <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-md animate-pulse"></div>
                <img
                  src="/logo.png"
                  alt="Remo"
                  className="relative w-9 h-9 rounded-full object-cover ring-2 ring-teal-400/40 shadow-lg"
                />
              </div>
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-teal-500/20 rounded-2xl rounded-tl-sm px-5 py-3.5 flex items-center gap-2.5 shadow-lg">
                <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
                <span className="text-teal-300 text-sm">جاري التفكير...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* رسالة أسفل الشات */}
      <div className="text-center py-1.5">
        <Link href="/" className="text-teal-500/60 hover:text-teal-400 text-[10px] md:text-xs transition-colors">
          Powered by Remo Store • www.remostore.net
        </Link>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-4 pb-4 px-3 md:px-6">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="اكتب سؤالك هنا..."
              disabled={isLoading}
              className="flex-1 bg-slate-800/60 border border-teal-500/30 focus:border-teal-400 rounded-2xl px-5 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 disabled:opacity-50 text-sm md:text-base transition-all backdrop-blur"
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-gradient-to-br from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white p-3.5 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg shadow-teal-600/30 hover:shadow-teal-500/50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
