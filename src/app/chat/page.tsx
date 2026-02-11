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
  Home,
  User,
  Settings,
  Menu,
  X,
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
          content: 'نورتنا 😊 معاك ريمو ستور، هرد على كل استفساراتك.\n\nقولي محتاج تسأل على منتج معين؟ 🛍️\nعندك شكوى؟ 💬\nعاوز تعرف أسعار التوصيل للمحافظات؟ 🚚\n\nقولي اقدر اساعدك ازاي؟ ✨',
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
    <div className="flex h-screen bg-white">
      {/* Sidebar - على اليسار زي Messenger */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-20 lg:w-20
        bg-white border-l border-gray-200 shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full py-4">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <img
              src="/logo.png"
              alt="Remo"
              className="w-12 h-12 rounded-full object-cover shadow-md"
            />
          </div>

          {/* Navigation Icons */}
          <nav className="flex-1 flex flex-col items-center gap-4">
            {/* المحادثة (Active) */}
            <button
              className="relative w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
              title="المحادثة"
            >
              <MessageCircle className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </button>

            {/* الرئيسية */}
            <Link
              href="/"
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-all hover:scale-110"
              title="الرئيسية"
            >
              <Home className="w-5 h-5" />
            </Link>

            {/* السلة */}
            <Link
              href="/cart"
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-all hover:scale-110"
              title="السلة"
            >
              <ShoppingCart className="w-5 h-5" />
            </Link>

            {/* الواتساب */}
            <a
              href="https://wa.me/201555512778"
              target="_blank"
              className="w-12 h-12 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-700 transition-all hover:scale-110"
              title="واتساب"
            >
              <Phone className="w-5 h-5" />
            </a>
          </nav>

          {/* Settings/Profile at bottom */}
          <div className="flex flex-col items-center gap-3">
            <button
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-all"
              title="الإعدادات"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Chat Header - بسيط زي Messenger */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Remo"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h1 className="font-bold text-gray-900 text-base">مساعد ريمو الذكي</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">متصل الآن</span>
              </div>
            </div>
          </div>
        </div>

      {/* Chat Container - زي Messenger */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {/* Welcome Animation */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-12 gap-3"
            >
              <img
                src="/logo.png"
                alt="Remo Store"
                className="w-20 h-20 rounded-full object-cover shadow-lg"
              />
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-teal-300 text-sm">جاري تحميل المساعد الذكي...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        {messages.map((msg) => (
          <motion.div
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-gray-500 text-sm">جاري تحميل المساعد الذكي...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages - بسيط زي Messenger */}
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* رسالة المستخدم - على اليمين بلون أزرق */}
            {msg.type === 'user' && (
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-3xl px-4 py-2.5 max-w-[75%] sm:max-w-[60%] shadow-sm text-sm leading-relaxed">
                  {msg.content}
                </div>
              </div>
            )}

            {/* رسالة المساعد - على اليسار بلون رمادي */}
            {msg.type === 'assistant' && (
              <div className="flex gap-2">
                <img
                  src="/logo.png"
                  alt="Remo"
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
                <div className="bg-gray-200 text-gray-900 rounded-3xl px-4 py-2.5 max-w-[75%] sm:max-w-[60%] shadow-sm text-sm whitespace-pre-line leading-relaxed">
                  {msg.content}
                </div>
              </div>
            )}

            {/* كروت المنتجات - بسيطة */}
            {msg.type === 'products' && msg.products && msg.products.length > 0 && (
              <div className="mr-9">
                <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  اضغط على أي منتج لمشاهدته 👇
                </p>
                <div className="grid gap-2">
                  {msg.products.map((product) => (
                    <Link key={product.id} href={product.link}>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-3 cursor-pointer transition-all shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 font-semibold text-sm truncate">{product.name}</p>
                            {product.category && (
                              <p className="text-gray-500 text-xs mt-0.5">{product.category}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-blue-600 font-bold text-sm">{product.price} ج.م</span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-gray-400 line-through text-xs">{product.originalPrice} ج.م</span>
                              )}
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* الأسئلة السريعة - بسيطة */}
            {msg.type === 'suggestions' && msg.suggestions && (
              <div className="mr-9">
                <div className="flex flex-wrap gap-2">
                  {msg.suggestions.map((suggestion, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => sendMessage(suggestion)}
                      disabled={isLoading}
                      className="bg-white border border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-600 text-xs sm:text-sm px-3 py-1.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {/* مؤشر الكتابة - بسيط زي Messenger */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-2"
            >
              <img
                src="/logo.png"
                alt="Remo"
                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
              />
              <div className="bg-gray-200 rounded-3xl px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - بسيط زي Messenger */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="اكتب رسالة..."
            disabled={isLoading}
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:bg-gray-200 disabled:opacity-50 text-sm transition-all"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        
        {/* Powered by */}
        <div className="text-center mt-2">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-[10px] transition-colors">
            Powered by Remo Store
          </Link>
        </div>
      </div>
    </div>
    </div>
  )
}
