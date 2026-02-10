'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import {
  X,
  Package,
  HelpCircle,
  Truck,
  CreditCard,
  RefreshCcw,
  Phone,
  MessageCircle,
  ShoppingCart,
  Gift,
  MapPin,
  Clock,
  EyeOff,
  ExternalLink,
  Send,
  Bot,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface Message {
  id: string
  type: 'assistant' | 'user' | 'options' | 'products'
  content: string
  options?: Option[]
  products?: ProductCard[]
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

interface Option {
  id: string
  icon: React.ReactNode
  title: string
  description?: string
  action?: () => void
  link?: string
  requireAuth?: boolean
}

const ASSISTANT_HIDDEN_KEY = 'remo_customer_assistant_hidden'
const SESSION_ID_KEY = 'remo_chat_session'
const CHAT_DATA_KEY = 'remo_chat_data'
const SESSION_TTL = 3 * 60 * 1000 // 3 دقايق بالميلي ثانية

interface StoredChatData {
  sessionId: string
  messages: Message[]
  conversationHistory: any[]
  lastActivity: number
}

// توليد معرف جلسة فريد أو استرجاع الجلسة القديمة (إذا لم تنته)
function getOrCreateSessionId(): { sessionId: string; isNew: boolean } {
  if (typeof window === 'undefined') return { sessionId: '', isNew: true }
  
  // محاولة استرجاع الجلسة القديمة
  const storedData = localStorage.getItem(CHAT_DATA_KEY)
  if (storedData) {
    try {
      const data: StoredChatData = JSON.parse(storedData)
      const now = Date.now()
      
      // إذا لم يمر 3 دقايق على آخر نشاط، استرجع الجلسة
      if (now - data.lastActivity < SESSION_TTL) {
        return { sessionId: data.sessionId, isNew: false }
      } else {
        // انتهت صلاحية الجلسة، امسحها
        localStorage.removeItem(CHAT_DATA_KEY)
      }
    } catch (error) {
      console.error('Error parsing stored chat data:', error)
      localStorage.removeItem(CHAT_DATA_KEY)
    }
  }
  
  // إنشاء جلسة جديدة
  const newSessionId = 'cs_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
  return { sessionId: newSessionId, isNew: true }
}

// حفظ بيانات المحادثة في localStorage
function saveChatData(sessionId: string, messages: Message[], conversationHistory: any[]) {
  if (typeof window === 'undefined') return
  
  const data: StoredChatData = {
    sessionId,
    messages,
    conversationHistory,
    lastActivity: Date.now()
  }
  
  try {
    localStorage.setItem(CHAT_DATA_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving chat data:', error)
  }
}

// تحميل بيانات المحادثة من localStorage
function loadChatData(): StoredChatData | null {
  if (typeof window === 'undefined') return null
  
  const storedData = localStorage.getItem(CHAT_DATA_KEY)
  if (!storedData) return null
  
  try {
    const data: StoredChatData = JSON.parse(storedData)
    const now = Date.now()
    
    // تحقق من صلاحية الجلسة
    if (now - data.lastActivity < SESSION_TTL) {
      return data
    } else {
      // انتهت صلاحية الجلسة
      localStorage.removeItem(CHAT_DATA_KEY)
      return null
    }
  } catch (error) {
    console.error('Error loading chat data:', error)
    localStorage.removeItem(CHAT_DATA_KEY)
    return null
  }
}

export default function CustomerAssistant() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<any[]>([])
  const [sessionId, setSessionId] = useState('')
  const [isRestoringSession, setIsRestoringSession] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // التمرير التلقائي لآخر رسالة
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // تركيز على input عند الفتح
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // تحميل حالة الإخفاء من localStorage واسترجاع الجلسة
  useEffect(() => {
    const hidden = localStorage.getItem(ASSISTANT_HIDDEN_KEY)
    if (hidden === 'true') {
      setIsHidden(true)
    }
    
    // محاولة استرجاع الجلسة القديمة
    const { sessionId: sid, isNew } = getOrCreateSessionId()
    setSessionId(sid)
    
    if (!isNew) {
      // استرجاع المحادثة القديمة
      const chatData = loadChatData()
      if (chatData) {
        setMessages(chatData.messages)
        setConversationHistory(chatData.conversationHistory)
      }
    }
    
    setIsRestoringSession(false)
  }, [])

  // رسالة الترحيب عند الفتح (فقط للجلسات الجديدة)
  useEffect(() => {
    if (isOpen && messages.length === 0 && !isRestoringSession) {
      showWelcomeMessage()
    }
  }, [isOpen, isRestoringSession])
  
  // حفظ المحادثة تلقائياً عند أي تحديث
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      saveChatData(sessionId, messages, conversationHistory)
    }
  }, [messages, conversationHistory, sessionId])

  // إرسال رسالة للمساعد الذكي (AI)
  const sendMessageToAI = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText
    }

    setMessages(prev => [...prev, userMessage])
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
          source: 'website'
        })
      })

      const data = await response.json()

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.reply
        }
        setMessages(prev => [...prev, aiMessage])
        
        // عرض كروت المنتجات إذا وجدت
        if (data.products && data.products.length > 0) {
          const productsMessage: Message = {
            id: (Date.now() + 2).toString(),
            type: 'products',
            content: '',
            products: data.products,
          }
          setMessages(prev => [...prev, productsMessage])
        }
        
        // إضافة زر واتساب احترافي إذا كان الرد يحتوي على دعوة للتواصل
        const needsWhatsAppButton = 
          data.reply.includes('راسلنا') || 
          data.reply.includes('تواصل') || 
          data.reply.includes('واتساب') ||
          data.reply.includes('للمساعدة') ||
          data.reply.includes('للتواصل')
        
        const needsDeveloperButton = 
          data.reply.includes('المطور') || 
          data.reply.includes('مستر أكرم') || 
          data.reply.includes('Mr. Akram') ||
          data.reply.includes('للتعاقد') ||
          data.reply.includes('الشراكات')
        
        if (needsWhatsAppButton || needsDeveloperButton) {
          const buttons: Option[] = []
          
          if (needsWhatsAppButton) {
            buttons.push({ 
              id: 'whatsapp-cs', 
              icon: <MessageCircle className="w-5 h-5" />, 
              title: '💬 راسلنا على الواتساب', 
              description: 'خدمة العملاء - رد سريع',
              link: 'https://wa.me/201555512778' 
            })
          }
          
          if (needsDeveloperButton) {
            buttons.push({ 
              id: 'whatsapp-dev', 
              icon: <Phone className="w-5 h-5" />, 
              title: '👨‍💻 تواصل مع المطور', 
              description: 'مستر أكرم - للتعاقدات والشراكات',
              link: 'https://wa.me/966559902557' 
            })
          }
          
          const whatsappButtonMessage: Message = {
            id: (Date.now() + 3).toString(),
            type: 'options',
            content: '',
            options: buttons,
          }
          setMessages(prev => [...prev, whatsappButtonMessage])
        }
        
        setConversationHistory(data.conversationHistory || [])
      } else {
        throw new Error(data.error || 'فشل في الحصول على رد')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'عذراً، حدث خطأ في الاتصال. جرب تاني أو تواصل معانا على الواتساب للمساعدة 📱'
      }
      setMessages(prev => [...prev, errorMessage])
      
      // إضافة زر واتساب للأخطاء
      const whatsappErrorButton: Message = {
        id: (Date.now() + 2).toString(),
        type: 'options',
        content: '',
        options: [
          { 
            id: 'whatsapp-error', 
            icon: <MessageCircle className="w-5 h-5" />, 
            title: '💬 راسلنا على الواتساب', 
            description: 'خدمة العملاء - رد سريع',
            link: 'https://wa.me/201555512778' 
          },
        ],
      }
      setMessages(prev => [...prev, whatsappErrorButton])
    } finally {
      setIsLoading(false)
    }
  }

  // معالجة إرسال الرسالة
  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (inputMessage.trim() && !isLoading) {
      sendMessageToAI(inputMessage)
    }
  }

  const showWelcomeMessage = () => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: 'نورتنا 😊 معاك ريمو ستور، هرد على كل استفساراتك.\nقولى اقدر اساعدك ازاى؟',
      },
      {
        id: '2',
        type: 'options',
        content: '',
        options: getMainOptions(),
      },
    ])
  }

  const getMainOptions = (): Option[] => [
    {
      id: 'ask-ai',
      icon: <Bot className="w-5 h-5" />,
      title: 'اسأل المساعد الذكي',
      description: 'اكتب سؤالك مباشرة',
      action: () => {
        // تركيز على input
        inputRef.current?.focus()
      },
    },
    {
      id: 'track-order',
      icon: <Package className="w-5 h-5" />,
      title: 'تتبع طلبك',
      description: 'تابع حالة طلبك',
      link: session ? '/orders' : '/auth/login?callbackUrl=/orders',
      requireAuth: true,
    },
    {
      id: 'shipping',
      icon: <Truck className="w-5 h-5" />,
      title: 'الشحن والتوصيل',
      description: 'معلومات عن التوصيل',
      action: () => showShippingInfo(),
    },
    {
      id: 'payment',
      icon: <CreditCard className="w-5 h-5" />,
      title: 'طرق الدفع',
      description: 'الدفع الآمن',
      action: () => showPaymentInfo(),
    },
    {
      id: 'return',
      icon: <RefreshCcw className="w-5 h-5" />,
      title: 'الإرجاع والاستبدال',
      description: 'سياسة الإرجاع',
      action: () => showReturnPolicy(),
    },
    {
      id: 'contact',
      icon: <Phone className="w-5 h-5" />,
      title: 'تواصل معنا',
      description: 'خدمة العملاء',
      action: () => showContactInfo(),
    },
  ]

  const showShippingInfo = () => {
    setMessages([
      {
        id: 'shipping-1',
        type: 'assistant',
        content: '📦 معلومات الشحن والتوصيل\n\n✅ شحن مجاني للطلبات أكثر من 1000 جنيه\n⏱️ التوصيل خلال 2-5 أيام عمل\n🚚 نوصل لجميع المحافظات\n📍 إمكانية التتبع اللحظي\n💰 الدفع عند الاستلام متاح فقط للملابس',
      },
      {
        id: 'shipping-2',
        type: 'options',
        content: '',
        options: [
          { id: 'back', icon: <MessageCircle className="w-5 h-5" />, title: 'رجوع للقائمة الرئيسية', action: () => showWelcomeMessage() },
        ],
      },
    ])
  }

  const showPaymentInfo = () => {
    setMessages([
      {
        id: 'payment-1',
        type: 'assistant',
        content: '💳 طرق الدفع المتاحة\n\n✅ الدفع عند الاستلام (كاش)\n✅ فيزا / ماستركارد\n✅ فوري\n✅ فودافون كاش\n\n🔒 جميع المعاملات آمنة ومشفرة 100%',
      },
      {
        id: 'payment-2',
        type: 'options',
        content: '',
        options: [
          { id: 'back', icon: <MessageCircle className="w-5 h-5" />, title: 'رجوع للقائمة الرئيسية', action: () => showWelcomeMessage() },
        ],
      },
    ])
  }

  const showReturnPolicy = () => {
    setMessages([
      {
        id: 'return-1',
        type: 'assistant',
        content: '🔄 سياسة الإرجاع والاستبدال\n\n✅ يمكنك إرجاع المنتج خلال 14 يوم\n✅ يجب أن يكون المنتج بحالته الأصلية\n✅ استرجاع كامل المبلغ أو استبدال\n✅ الفحص عند الاستلام متاح\n\n📱 للإرجاع: تواصل معنا واحنا هنساعدك',
      },
      {
        id: 'return-2',
        type: 'options',
        content: '',
        options: [
          { id: 'contact', icon: <Phone className="w-5 h-5" />, title: 'تواصل معنا للإرجاع', action: () => showContactInfo() },
          { id: 'back', icon: <MessageCircle className="w-5 h-5" />, title: 'رجوع للقائمة الرئيسية', action: () => showWelcomeMessage() },
        ],
      },
    ])
  }

  const showFAQ = () => {
    setMessages([
      {
        id: 'faq-1',
        type: 'assistant',
        content: '❓ الأسئلة الشائعة\n\n• كم يستغرق التوصيل؟\n→ من 2-5 أيام عمل\n\n• هل الشحن مجاني؟\n→ مجاني للطلبات +500 جنيه\n\n• هل يمكن الدفع عند الاستلام؟\n→ نعم، متاح لجميع الطلبات\n\n• كيف أتابع طلبي؟\n→ من حسابك أو رابط التتبع',
      },
      {
        id: 'faq-2',
        type: 'options',
        content: '',
        options: [
          { id: 'track', icon: <Package className="w-5 h-5" />, title: 'تتبع طلبي', link: session ? '/orders' : '/auth/login?callbackUrl=/orders' },
          { id: 'back', icon: <MessageCircle className="w-5 h-5" />, title: 'رجوع للقائمة الرئيسية', action: () => showWelcomeMessage() },
        ],
      },
    ])
  }

  const showContactInfo = () => {
    setMessages([
      {
        id: 'contact-1',
        type: 'assistant',
        content: '📞 تواصل مع خدمة العملاء\n\n📱 واتساب: https://wa.me/201555512778\n📧 البريد الإلكتروني: remostore.egy@gmail.com\n📍 العنوان: مصر - القاهرة\n⏰ نعمل: السبت - الخميس (9 صباحاً - 6 مساءً)\n\n💬 اضغط على رقم الواتساب للتواصل المباشر',
      },
      {
        id: 'contact-2',
        type: 'options',
        content: '',
        options: [
          { id: 'whatsapp', icon: <MessageCircle className="w-5 h-5" />, title: 'راسلنا على واتساب', link: 'https://wa.me/201555512778' },
          { id: 'back', icon: <MessageCircle className="w-5 h-5" />, title: 'رجوع للقائمة الرئيسية', action: () => showWelcomeMessage() },
        ],
      },
    ])
  }

  const hideAssistant = () => {
    setIsHidden(true)
    setIsOpen(false)
    localStorage.setItem(ASSISTANT_HIDDEN_KEY, 'true')
  }

  const showAssistant = () => {
    setIsHidden(false)
    localStorage.setItem(ASSISTANT_HIDDEN_KEY, 'false')
  }

  // زر إظهار المساعد إذا كان مخفياً
  if (isHidden) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={showAssistant}
        className="fixed bottom-20 right-4 md:right-6 z-40 bg-gradient-to-br from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white p-2.5 md:p-3 rounded-full shadow-2xl backdrop-blur-sm transition-all hover:scale-105"
        title="إظهار المساعد الذكي"
      >
        <img 
          src="/logo.png" 
          alt="Remo Store" 
          className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover"
        />
      </motion.button>
    )
  }

  return (
    <>
      {/* زر المساعد العائم - تصميم محسّن احترافي */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.08, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-4 md:bottom-8 md:left-6 z-40 group"
            aria-label="مساعد ريمو الذكي"
          >
            <div className="relative">
              {/* تأثير التوهج الخارجي - النبض */}
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-full blur-xl opacity-60 group-hover:opacity-90 animate-pulse"></div>
              
              {/* حلقة دوارة */}
              <div className="absolute inset-0 rounded-full border-2 border-teal-300/40 animate-spin-slow"></div>
              
              {/* الزر الرئيسي */}
              <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 text-white p-3.5 md:p-4 rounded-full shadow-2xl shadow-teal-600/50 flex items-center gap-2.5 border-2 border-white/30 backdrop-blur">
                {/* شعار التطبيق مع توهج */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white/40 rounded-full blur-sm"></div>
                  <img 
                    src="/logo.png" 
                    alt="Remo Store" 
                    className="relative w-7 h-7 md:w-8 md:h-8 rounded-full object-cover ring-2 ring-white/50 shadow-lg"
                  />
                </div>
                <span className="font-bold text-sm md:text-base hidden sm:inline drop-shadow-lg">مساعدك الذكي 🤖</span>
              </div>
              
              {/* نقطة إشعار حية */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg animate-bounce"></div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* نافذة المساعد - تصميم محسّن احترافي */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed bottom-16 md:bottom-20 left-2 right-2 sm:left-4 sm:right-auto sm:w-[min(95vw,440px)] z-40"
          >
            <Card className="bg-gradient-to-br from-slate-900 via-teal-900/95 to-slate-900 border-2 border-teal-400/60 shadow-[0_20px_60px_rgba(13,148,136,0.4)] overflow-hidden rounded-2xl md:rounded-3xl backdrop-blur-xl max-h-[75vh] md:max-h-[80vh] flex flex-col">
              {/* رأس النافذة - محسّن للموبايل */}
              <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 p-3 md:p-5 flex items-center justify-between overflow-hidden flex-shrink-0">
                {/* نمط خلفية متحرك */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                
                <div className="relative flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                  {/* شعار التطبيق مع حلقة دوارة */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 rounded-full bg-white/30 animate-ping"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-spin-slow"></div>
                    <img 
                      src="/logo.png" 
                      alt="Remo Store" 
                      className="relative w-9 h-9 md:w-12 md:h-12 rounded-full object-cover ring-2 md:ring-4 ring-white/50 shadow-2xl"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-black text-sm md:text-xl tracking-wide drop-shadow-lg truncate">مساعد ريمو الذكي</h3>
                    <div className="flex items-center gap-1.5 md:gap-2 mt-0.5">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                      <p className="text-teal-50 text-[10px] md:text-sm font-medium drop-shadow truncate">
                        متصل الآن
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="relative flex items-center gap-1 md:gap-2 flex-shrink-0">
                  <button
                    onClick={hideAssistant}
                    className="text-white/80 hover:text-white p-1.5 md:p-2.5 hover:bg-white/20 rounded-lg md:rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur"
                    title="إخفاء المساعد"
                    aria-label="إخفاء المساعد"
                  >
                    <EyeOff className="w-4 h-4 md:w-6 md:h-6 drop-shadow" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/80 hover:text-white p-1.5 md:p-2.5 hover:bg-white/20 rounded-lg md:rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur"
                    title="إغلاق"
                    aria-label="إغلاق"
                  >
                    <X className="w-4 h-4 md:w-6 md:h-6 drop-shadow" />
                  </button>
                </div>
              </div>

              {/* محتوى المحادثة - محسّن لارتفاع ديناميكي */}
              <CardContent className="p-3 md:p-5 flex-1 overflow-y-auto space-y-3 md:space-y-5 scrollbar-thin scrollbar-thumb-teal-500/60 scrollbar-track-slate-800/50 min-h-0">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    {message.type === 'user' && (
                      <div className="flex gap-2 md:gap-4 justify-end">
                        <div className="bg-gradient-to-br from-teal-600 to-cyan-600 backdrop-blur-sm border border-teal-400/30 rounded-xl md:rounded-2xl rounded-tl-sm p-3 md:p-5 text-white text-xs md:text-base whitespace-pre-line max-w-[85%] leading-relaxed shadow-lg shadow-teal-900/30">
                          {message.content}
                        </div>
                      </div>
                    )}

                    {message.type === 'assistant' && (
                      <div className="flex gap-2 md:gap-4">
                        {/* شعار المساعد مع حلقة توهج */}
                        <div className="flex-shrink-0 relative">
                          <div className="absolute inset-0 bg-teal-400/30 rounded-full blur-md animate-pulse"></div>
                          <img 
                            src="/logo.png" 
                            alt="Remo Store" 
                            className="relative w-7 h-7 md:w-9 md:h-9 rounded-full object-cover ring-2 ring-teal-400/50 shadow-xl"
                          />
                        </div>
                        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-teal-500/20 rounded-xl md:rounded-2xl rounded-tr-sm p-3 md:p-5 text-white/95 text-xs md:text-base whitespace-pre-line flex-1 leading-relaxed shadow-lg shadow-teal-900/20">
                          {message.content}
                        </div>
                      </div>
                    )}

                    {/* كروت المنتجات - محسّنة للموبايل */}
                    {message.type === 'products' && message.products && message.products.length > 0 && (
                      <div className="mt-3 w-full">
                        <div className="flex gap-2 md:gap-4 mb-3">
                          <div className="flex-shrink-0 relative">
                            <div className="absolute inset-0 bg-teal-400/30 rounded-full blur-md animate-pulse"></div>
                            <img 
                              src="/logo.png" 
                              alt="Remo Store" 
                              className="relative w-7 h-7 md:w-9 md:h-9 rounded-full object-cover ring-2 ring-teal-400/50 shadow-xl"
                            />
                          </div>
                          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-teal-500/20 rounded-2xl rounded-tr-sm p-2.5 md:p-3 text-white/90 text-xs md:text-sm flex-1">
                            🛍️ إليك المنتجات المتاحة:
                          </div>
                        </div>
                        {/* Grid للمنتجات - responsive */}
                        <div className="grid gap-2 pr-0 md:pr-11 w-full">
                          {message.products.map((product) => (
                            <Link
                              key={product.id}
                              href={product.link}
                              onClick={() => setIsOpen(false)}
                              className="w-full"
                            >
                              <motion.div
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-gradient-to-r from-slate-800/80 to-slate-800/50 hover:from-slate-700/90 hover:to-slate-700/70 border-2 border-teal-500/30 hover:border-teal-400/60 rounded-xl md:rounded-2xl p-2.5 md:p-3 cursor-pointer transition-all duration-300 group shadow-lg hover:shadow-teal-500/20 w-full"
                              >
                                <div className="flex items-start gap-2 md:gap-3 w-full">
                                  {/* صورة المنتج - أصغر على الموبايل */}
                                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-lg md:rounded-xl overflow-hidden flex-shrink-0 bg-slate-700/50 border border-teal-500/20">
                                    {product.imageUrl ? (
                                      <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-teal-500/50" />
                                      </div>
                                    )}
                                  </div>
                                  {/* تفاصيل المنتج - محسّنة للموبايل */}
                                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div className="w-full">
                                      <p className="text-white font-bold text-xs md:text-base line-clamp-2 leading-tight">{product.name}</p>
                                      {product.category && (
                                        <p className="text-teal-400/80 text-[10px] md:text-xs mt-0.5 truncate">{product.category}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between gap-2 mt-1 md:mt-1.5 w-full">
                                      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                                        <span className="text-emerald-400 font-black text-sm md:text-lg whitespace-nowrap">{product.price} ج.م</span>
                                        {product.originalPrice && product.originalPrice > product.price && (
                                          <span className="text-gray-500 line-through text-[10px] md:text-xs whitespace-nowrap">{product.originalPrice} ج.م</span>
                                        )}
                                      </div>
                                      <ExternalLink className="w-4 h-4 md:w-5 md:h-5 text-teal-400 group-hover:text-teal-300 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {message.type === 'options' && message.options && (
                      <div className="grid gap-2.5 mt-4">
                        {message.options.map((option) => {
                          // التحقق من متطلبات تسجيل الدخول
                          if (option.requireAuth && !session) {
                            return (
                              <Link key={option.id} href="/auth/login" onClick={() => setIsOpen(false)}>
                                <motion.div
                                  whileHover={{ scale: 1.03, x: 4 }}
                                  whileTap={{ scale: 0.97 }}
                                  className="bg-gradient-to-r from-slate-800/70 to-slate-800/50 hover:from-slate-700/90 hover:to-slate-700/70 border-2 border-teal-500/40 hover:border-teal-400/70 rounded-2xl p-4 cursor-pointer transition-all duration-300 group shadow-lg hover:shadow-teal-500/20"
                                >
                                  <div className="flex items-center gap-3.5">
                                    <div className="bg-gradient-to-br from-teal-500/40 to-cyan-500/40 p-3 rounded-xl text-teal-300 group-hover:text-teal-200 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                                      {option.icon}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-white font-bold text-sm md:text-base">{option.title}</p>
                                      {option.description && (
                                        <p className="text-cyan-300 text-xs md:text-sm mt-1 flex items-center gap-1.5">
                                          <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                                          سجل دخول أولاً
                                        </p>
                                      )}
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-teal-400 group-hover:text-teal-300 group-hover:translate-x-1 transition-all duration-200" />
                                  </div>
                                </motion.div>
                              </Link>
                            )
                          }

                          if (option.link) {
                            const isExternal = option.link.startsWith('http')
                            return (
                              <Link 
                                key={option.id} 
                                href={option.link} 
                                onClick={() => setIsOpen(false)}
                                target={isExternal ? '_blank' : undefined}
                                rel={isExternal ? 'noopener noreferrer' : undefined}
                              >
                                <motion.div
                                  whileHover={{ scale: 1.03, x: 4 }}
                                  whileTap={{ scale: 0.97 }}
                                  className="bg-gradient-to-r from-slate-800/70 to-slate-800/50 hover:from-slate-700/90 hover:to-slate-700/70 border-2 border-teal-500/40 hover:border-teal-400/70 rounded-2xl p-4 cursor-pointer transition-all duration-300 group shadow-lg hover:shadow-teal-500/20"
                                >
                                  <div className="flex items-center gap-3.5">
                                    <div className="bg-gradient-to-br from-teal-500/40 to-cyan-500/40 p-3 rounded-xl text-teal-300 group-hover:text-teal-200 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                                      {option.icon}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-white font-bold text-sm md:text-base">{option.title}</p>
                                      {option.description && (
                                        <p className="text-gray-400 text-xs md:text-sm mt-1">{option.description}</p>
                                      )}
                                    </div>
                                    {isExternal && <ExternalLink className="w-5 h-5 text-teal-400 group-hover:text-teal-300 group-hover:translate-x-1 transition-all duration-200" />}
                                  </div>
                                </motion.div>
                              </Link>
                            )
                          }

                          return (
                            <motion.div
                              key={option.id}
                              whileHover={{ scale: 1.03, x: 4 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={option.action}
                              className="bg-gradient-to-r from-slate-800/70 to-slate-800/50 hover:from-slate-700/90 hover:to-slate-700/70 border-2 border-teal-500/40 hover:border-teal-400/70 rounded-2xl p-4 cursor-pointer transition-all duration-300 group shadow-lg hover:shadow-teal-500/20"
                            >
                              <div className="flex items-center gap-3.5">
                                <div className="bg-gradient-to-br from-teal-500/40 to-cyan-500/40 p-3 rounded-xl text-teal-300 group-hover:text-teal-200 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                                  {option.icon}
                                </div>
                                <div className="flex-1">
                                  <p className="text-white font-bold text-sm md:text-base">{option.title}</p>
                                  {option.description && (
                                    <p className="text-gray-400 text-xs md:text-sm mt-1">{option.description}</p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* مؤشر التحميل */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 md:gap-4"
                  >
                    <div className="flex-shrink-0 relative">
                      <div className="absolute inset-0 bg-teal-400/30 rounded-full blur-md animate-pulse"></div>
                      <img 
                        src="/logo.png" 
                        alt="Remo Store" 
                        className="relative w-8 h-8 md:w-9 md:h-9 rounded-full object-cover ring-2 ring-teal-400/50 shadow-xl"
                      />
                    </div>
                    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-teal-500/20 rounded-2xl rounded-tr-sm p-4 md:p-5 text-white/95 flex gap-2 items-center shadow-lg">
                      <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
                      <span className="text-sm">جاري التفكير...</span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              {/* حقل إدخال الرسالة */}
              <div className="p-4 border-t border-teal-500/20 bg-slate-900/50">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="اكتب سؤالك هنا..."
                    disabled={isLoading}
                    className="flex-1 bg-slate-800/50 border border-teal-500/30 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-gradient-to-br from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg hover:shadow-teal-500/50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
