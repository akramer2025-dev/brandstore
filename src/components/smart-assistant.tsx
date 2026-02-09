'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  MessageCircle,
  X,
  Wallet,
  Package,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2,
  Info,
  ArrowRight,
  Store,
  EyeOff,
} from 'lucide-react'
import Link from 'next/link'

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
  info?: string
}

const ASSISTANT_HIDDEN_KEY = 'remo_assistant_hidden'

export default function SmartAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentStep, setCurrentStep] = useState<string>('welcome')
  const [showInfo, setShowInfo] = useState<string | null>(null)

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
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: 'مرحباً بك في ريمو ستور! 👋\n\nأنا مساعدك الذكي، هنا لمساعدتك في إدارة متجرك بكل سهولة.\n\nكيف يمكنني مساعدتك اليوم؟',
      },
      {
        id: '2',
        type: 'options',
        content: '',
        options: getMainOptions(),
      },
    ])
    setCurrentStep('main')
  }

  const getMainOptions = (): Option[] => [
    {
      id: 'capital',
      icon: <Wallet className="w-6 h-6" />,
      title: 'إضافة رأس المال',
      description: 'ابدأ بتحديد رأس مالك',
      link: '/vendor/capital',
      info: 'رأس المال هو المبلغ الأساسي الذي تبدأ به تجارتك. يمكنك إيداع أو سحب من رأس المال في أي وقت.',
    },
    {
      id: 'purchases',
      icon: <Receipt className="w-6 h-6" />,
      title: 'إضافة فواتير المشتريات',
      description: 'سجل مشترياتك من الموردين',
      link: '/vendor/purchases/new',
      info: 'فواتير المشتريات تساعدك على تتبع ما اشتريته من الموردين وتخصم تلقائياً من رأس المال.',
    },
    {
      id: 'products',
      icon: <Package className="w-6 h-6" />,
      title: 'إضافة المنتجات',
      description: 'أضف منتجات لمتجرك',
      action: () => showProductTypes(),
      info: 'يمكنك إضافة منتجات خاصة بك أو منتجات من وسطاء (شركاء).',
    },
    {
      id: 'help',
      icon: <HelpCircle className="w-6 h-6" />,
      title: 'كيف يعمل النظام؟',
      description: 'شرح مفصل للنظام',
      action: () => showSystemExplanation(),
    },
  ]

  const showProductTypes = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'user',
        content: 'إضافة المنتجات',
      },
      {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '📦 عند إضافة المنتجات، لديك خياران:\n\nاختر نوع المنتج الذي تريد إضافته:',
      },
      {
        id: (Date.now() + 2).toString(),
        type: 'options',
        content: '',
        options: [
          {
            id: 'owned',
            icon: <DollarSign className="w-6 h-6" />,
            title: 'منتج خاص بي (مدفوع)',
            description: 'منتج اشتريته ودفعت ثمنه',
            action: () => showOwnedProductInfo(),
            info: 'هذا النوع يخصم سعر التكلفة من رأس المال فوراً لأنك دفعت ثمنه مسبقاً.',
          },
          {
            id: 'consignment',
            icon: <Users className="w-6 h-6" />,
            title: 'منتج من وسيط/شريك',
            description: 'منتج تعرضه لصالح شخص آخر',
            action: () => showConsignmentProductInfo(),
            info: 'هذا النوع لا يخصم من رأس المال لأنك لم تدفع ثمنه. عند البيع، يُضاف المكسب فقط بعد تحويل حصة الوسيط.',
          },
          {
            id: 'back',
            icon: <ChevronRight className="w-6 h-6" />,
            title: 'رجوع للقائمة الرئيسية',
            action: () => resetToMain(),
          },
        ],
      },
    ])
    setCurrentStep('products')
  }

  const showOwnedProductInfo = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'user',
        content: 'منتج خاص بي (مدفوع)',
      },
      {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `💰 المنتج الخاص (المدفوع)

عند إضافة منتج خاص بك:

✅ يُخصم سعر التكلفة من رأس المال فوراً
✅ عند البيع، يُضاف سعر البيع كاملاً لرأس المال
✅ الربح = سعر البيع - سعر التكلفة

مثال:
• سعر التكلفة: 100 جنيه ← يُخصم من رأس المال
• سعر البيع: 150 جنيه ← يُضاف لرأس المال
• صافي الربح: 50 جنيه 🎉`,
      },
      {
        id: (Date.now() + 2).toString(),
        type: 'options',
        content: '',
        options: [
          {
            id: 'add-owned',
            icon: <Package className="w-6 h-6" />,
            title: 'إضافة منتج خاص الآن',
            link: '/vendor/products/new',
          },
          {
            id: 'back-products',
            icon: <ChevronRight className="w-6 h-6" />,
            title: 'رجوع لأنواع المنتجات',
            action: () => showProductTypes(),
          },
          {
            id: 'back-main',
            icon: <ChevronRight className="w-6 h-6" />,
            title: 'رجوع للقائمة الرئيسية',
            action: () => resetToMain(),
          },
        ],
      },
    ])
  }

  const showConsignmentProductInfo = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'user',
        content: 'منتج من وسيط/شريك',
      },
      {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `👥 منتج الوسيط/الشريك

عند إضافة منتج من وسيط (أنت تعرض صور فقط):

✅ لا يُخصم شيء من رأس المال
✅ عند البيع، تحوّل سعر المنتج للوسيط أولاً
✅ ثم يُضاف المكسب (العمولة) فقط لرأس مالك

مثال:
• سعر المنتج للوسيط: 100 جنيه
• سعر البيع: 150 جنيه
• عند البيع:
  - تحوّل 100 جنيه للوسيط
  - يُضاف 50 جنيه (المكسب) لرأس مالك 🎉

⚠️ مهم: عند إضافة المنتج، اختر "منتج من وسيط" وحدد اسم الوسيط.`,
      },
      {
        id: (Date.now() + 2).toString(),
        type: 'options',
        content: '',
        options: [
          {
            id: 'add-consignment',
            icon: <Package className="w-6 h-6" />,
            title: 'إضافة منتج وسيط الآن',
            link: '/vendor/products/new',
          },
          {
            id: 'manage-suppliers',
            icon: <Users className="w-6 h-6" />,
            title: 'إدارة الوسطاء/الموردين',
            link: '/vendor/suppliers',
          },
          {
            id: 'back-products',
            icon: <ChevronRight className="w-6 h-6" />,
            title: 'رجوع لأنواع المنتجات',
            action: () => showProductTypes(),
          },
          {
            id: 'back-main',
            icon: <ChevronRight className="w-6 h-6" />,
            title: 'رجوع للقائمة الرئيسية',
            action: () => resetToMain(),
          },
        ],
      },
    ])
  }

  const showSystemExplanation = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'user',
        content: 'كيف يعمل النظام؟',
      },
      {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `🎯 كيف يعمل نظام ريمو ستور؟

1️⃣ رأس المال
ابدأ بإضافة رأس مالك الأساسي. هذا هو المبلغ الذي تبدأ به تجارتك.

2️⃣ المنتجات
- منتج خاص: تشتريه وتدفع ثمنه ← يُخصم من رأس المال
- منتج وسيط: تعرضه لشخص آخر ← لا يُخصم من رأس المال

3️⃣ المبيعات
عند البيع من نقطة البيع:
- المنتج الخاص: يُضاف سعر البيع كاملاً لرأس المال
- منتج الوسيط: يُضاف المكسب فقط بعد تسجيل تحويل المبلغ للوسيط

4️⃣ المشتريات
عند شراء بضاعة من مورد، سجّل فاتورة الشراء لتتبع مصاريفك.

5️⃣ التقارير
تابع أرباحك ومبيعاتك من صفحة التقارير.`,
      },
      {
        id: (Date.now() + 2).toString(),
        type: 'options',
        content: '',
        options: [
          {
            id: 'start-capital',
            icon: <Wallet className="w-6 h-6" />,
            title: 'ابدأ بإضافة رأس المال',
            link: '/vendor/capital',
          },
          {
            id: 'back-main',
            icon: <ChevronRight className="w-6 h-6" />,
            title: 'رجوع للقائمة الرئيسية',
            action: () => resetToMain(),
          },
        ],
      },
    ])
  }

  const resetToMain = () => {
    setMessages([])
    setTimeout(() => {
      showWelcomeMessage()
    }, 100)
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
        className="fixed bottom-20 left-4 md:left-6 z-40 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-2.5 md:p-3 rounded-full shadow-2xl backdrop-blur-sm transition-all hover:scale-105"
        title="إظهار المساعد الذكي"
      >
        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/20 backdrop-blur flex items-center justify-center font-bold text-xs">
          R
        </div>
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
            className="fixed bottom-20 left-4 md:left-6 z-40 group"
          >
            <div className="relative">
              {/* تأثير التوهج */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 animate-pulse"></div>
              
              {/* الزر الرئيسي */}
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2.5 md:p-3.5 rounded-full shadow-2xl flex items-center gap-2">
                {/* شعار التطبيق */}
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/20 backdrop-blur flex items-center justify-center font-bold text-xs md:text-sm">
                  R
                </div>
                <span className="font-bold text-xs md:text-sm hidden sm:inline">مساعد ريمو</span>
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
            className="fixed bottom-[4.5rem] left-4 right-4 sm:left-4 sm:right-auto sm:w-[400px] z-40 max-h-[65vh] md:max-h-[70vh]"
          >
            <Card className="bg-gradient-to-br from-slate-900 via-purple-900/90 to-slate-900 border-purple-500/50 shadow-2xl overflow-hidden rounded-2xl">
              {/* رأس النافذة */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 md:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  {/* شعار التطبيق */}
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center font-bold text-white shadow-lg">
                    R
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm md:text-lg">مساعد ريمو ستور</h3>
                    <p className="text-purple-100 text-[10px] md:text-xs">
                      مساعدك الذكي 🤖
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
              <CardContent className="p-3 md:p-4 max-h-[50vh] md:max-h-[55vh] overflow-y-auto space-y-3 md:space-y-4 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
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
                        <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-md text-xs">
                          R
                        </div>
                        <div className="bg-slate-800/80 backdrop-blur rounded-2xl rounded-tl-sm p-3 md:p-4 text-white/90 text-xs md:text-sm whitespace-pre-line flex-1">
                          {message.content}
                        </div>
                      </div>
                    )}

                    {message.type === 'user' && (
                      <div className="flex justify-end">
                        <div className="bg-purple-600/80 backdrop-blur rounded-2xl rounded-tr-sm p-3 text-white text-sm max-w-[80%]">
                          {message.content}
                        </div>
                      </div>
                    )}

                    {message.type === 'options' && message.options && (
                      <div className="grid gap-2 mt-3">
                        {message.options.map((option) => (
                          <div key={option.id} className="relative">
                            {option.link ? (
                              <Link href={option.link} onClick={() => setIsOpen(false)}>
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="bg-slate-800/60 hover:bg-slate-700/80 border border-purple-500/30 hover:border-purple-500/60 rounded-xl p-3 cursor-pointer transition-all group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 p-2 rounded-lg text-purple-300 group-hover:text-purple-200">
                                      {option.icon}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-white font-medium text-sm">{option.title}</p>
                                      {option.description && (
                                        <p className="text-gray-400 text-xs">{option.description}</p>
                                      )}
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-[-4px] transition-transform" />
                                  </div>
                                </motion.div>
                              </Link>
                            ) : (
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={option.action}
                                className="bg-slate-800/60 hover:bg-slate-700/80 border border-purple-500/30 hover:border-purple-500/60 rounded-xl p-3 cursor-pointer transition-all group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 p-2 rounded-lg text-purple-300 group-hover:text-purple-200">
                                    {option.icon}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-white font-medium text-sm">{option.title}</p>
                                    {option.description && (
                                      <p className="text-gray-400 text-xs">{option.description}</p>
                                    )}
                                  </div>
                                  {option.info && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setShowInfo(showInfo === option.id ? null : option.id)
                                      }}
                                      className="text-purple-400 hover:text-purple-300 p-1"
                                    >
                                      <Info className="w-4 h-4" />
                                    </button>
                                  )}
                                  <ChevronLeft className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                                </div>
                              </motion.div>
                            )}

                            {/* معلومات إضافية */}
                            <AnimatePresence>
                              {showInfo === option.id && option.info && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-2 text-blue-200 text-xs">
                                    <div className="flex items-start gap-2">
                                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                      <p>{option.info}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </CardContent>

              {/* ذيل النافذة */}
              <div className="border-t border-purple-500/30 p-3 bg-slate-900/80">
                <p className="text-center text-gray-500 text-xs">
                  مساعد ريمو ستور 💜 هنا لمساعدتك دائماً
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
