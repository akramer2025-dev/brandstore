'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface Message {
  id: string
  type: 'assistant' | 'user' | 'options'
  content: string
  options?: Option[]
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

export default function CustomerAssistant() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])

  // تحميل حالة الإخفاء من localStorage
  useEffect(() => {
    const hidden = localStorage.getItem(ASSISTANT_HIDDEN_KEY)
    if (hidden === 'true') {
      setIsHidden(true)
    }
  }, [])

  // رسالة الترحيب عند الفتح
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      showWelcomeMessage()
    }
  }, [isOpen])

  const showWelcomeMessage = () => {
    const userName = session?.user?.name || 'عميلنا العزيز'
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: `أهلاً ${userName}! 👋\n\nأنا مساعدك الذكي في ريمو ستور\n\nكيف يمكنني مساعدتك اليوم؟`,
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
      id: 'help',
      icon: <HelpCircle className="w-5 h-5" />,
      title: 'الأسئلة الشائعة',
      description: 'إجابات سريعة',
      action: () => showFAQ(),
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
        content: '📦 معلومات الشحن والتوصيل\n\n✅ شحن مجاني للطلبات أكثر من 500 جنيه\n⏱️ التوصيل خلال 2-5 أيام عمل\n🚚 نوصل لجميع المحافظات\n📍 إمكانية التتبع اللحظي\n💰 الدفع عند الاستلام متاح',
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
        content: '📞 تواصل مع خدمة العملاء\n\n📱 واتساب: 01000000000\n📧 البريد: support@remostore.net\n⏰ نعمل: السبت - الخميس (9 صباحاً - 6 مساءً)\n\n💬 أو استخدم المحادثة المباشرة',
      },
      {
        id: 'contact-2',
        type: 'options',
        content: '',
        options: [
          { id: 'whatsapp', icon: <MessageCircle className="w-5 h-5" />, title: 'راسلنا على واتساب', link: 'https://wa.me/201000000000' },
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
      {/* زر المساعد العائم */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-4 md:right-6 z-40 group"
          >
            <div className="relative">
              {/* تأثير التوهج */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 animate-pulse"></div>
              
              {/* الزر الرئيسي */}
              <div className="relative bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-2.5 md:p-3.5 rounded-full shadow-2xl flex items-center gap-2">
                {/* شعار التطبيق */}
                <img 
                  src="/logo.png" 
                  alt="Remo Store" 
                  className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover"
                />
                <span className="font-bold text-xs md:text-sm hidden sm:inline">كيف نساعدك؟</span>
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* نافذة المساعد */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-[4.5rem] right-4 left-4 sm:right-4 sm:left-auto sm:w-[400px] z-40 max-h-[65vh] md:max-h-[70vh]"
          >
            <Card className="bg-gradient-to-br from-slate-900 via-teal-900/90 to-slate-900 border-teal-500/50 shadow-2xl overflow-hidden rounded-2xl">
              {/* رأس النافذة */}
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-3 md:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  {/* شعار التطبيق */}
                  <img 
                    src="/logo.png" 
                    alt="Remo Store" 
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover shadow-lg"
                  />
                  <div>
                    <h3 className="text-white font-bold text-sm md:text-lg">مساعد ريمو ستور</h3>
                    <p className="text-teal-100 text-[10px] md:text-xs">
                      خدمة العملاء 💬
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <button
                    onClick={hideAssistant}
                    className="text-white/70 hover:text-white p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-all"
                    title="إخفاء المساعد"
                  >
                    <EyeOff className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/70 hover:text-white p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>

              {/* محتوى المحادثة */}
              <CardContent className="p-3 md:p-4 max-h-[50vh] md:max-h-[55vh] overflow-y-auto space-y-3 md:space-y-4 scrollbar-thin scrollbar-thumb-teal-500/50 scrollbar-track-transparent">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {message.type === 'assistant' && (
                      <div className="flex gap-2 md:gap-3">
                        {/* شعار المساعد */}
                        <img 
                          src="/logo.png" 
                          alt="Remo Store" 
                          className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full object-cover shadow-md"
                        />
                        <div className="bg-slate-800/80 backdrop-blur rounded-2xl rounded-tr-sm p-3 md:p-4 text-white/90 text-xs md:text-sm whitespace-pre-line flex-1 leading-relaxed">
                          {message.content}
                        </div>
                      </div>
                    )}

                    {message.type === 'options' && message.options && (
                      <div className="grid gap-2 mt-3">
                        {message.options.map((option) => {
                          // التحقق من متطلبات تسجيل الدخول
                          if (option.requireAuth && !session) {
                            return (
                              <Link key={option.id} href="/auth/login" onClick={() => setIsOpen(false)}>
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="bg-slate-800/60 hover:bg-slate-700/80 border border-teal-500/30 hover:border-teal-500/60 rounded-xl p-3 cursor-pointer transition-all group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="bg-gradient-to-r from-teal-500/30 to-cyan-500/30 p-2 rounded-lg text-teal-300 group-hover:text-teal-200">
                                      {option.icon}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-white font-medium text-sm">{option.title}</p>
                                      {option.description && (
                                        <p className="text-gray-400 text-xs">سجل دخول أولاً</p>
                                      )}
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-teal-400" />
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
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="bg-slate-800/60 hover:bg-slate-700/80 border border-teal-500/30 hover:border-teal-500/60 rounded-xl p-3 cursor-pointer transition-all group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="bg-gradient-to-r from-teal-500/30 to-cyan-500/30 p-2 rounded-lg text-teal-300 group-hover:text-teal-200">
                                      {option.icon}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-white font-medium text-sm">{option.title}</p>
                                      {option.description && (
                                        <p className="text-gray-400 text-xs">{option.description}</p>
                                      )}
                                    </div>
                                    {isExternal && <ExternalLink className="w-4 h-4 text-teal-400" />}
                                  </div>
                                </motion.div>
                              </Link>
                            )
                          }

                          return (
                            <motion.div
                              key={option.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={option.action}
                              className="bg-slate-800/60 hover:bg-slate-700/80 border border-teal-500/30 hover:border-teal-500/60 rounded-xl p-3 cursor-pointer transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-r from-teal-500/30 to-cyan-500/30 p-2 rounded-lg text-teal-300 group-hover:text-teal-200">
                                  {option.icon}
                                </div>
                                <div className="flex-1">
                                  <p className="text-white font-medium text-sm">{option.title}</p>
                                  {option.description && (
                                    <p className="text-gray-400 text-xs">{option.description}</p>
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
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
