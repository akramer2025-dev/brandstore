'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import {
  Package,
  ShoppingCart,
  DollarSign,
  Plus,
  LogOut,
  Store,
  Wallet,
  Users,
  UserPlus,
  Zap,
  Receipt,
  AlertCircle,
  Bell,
  Eye,
  Settings,
  FileText,
  Truck,
  BarChart3,
  ClipboardList,
} from 'lucide-react'
import SmartAssistant from '@/components/smart-assistant'

interface CapitalSummary {
  capital: { current: number; totalDeposits: number; totalWithdrawals: number }
  products: { owned: number; consignment: number; total: number }
  suppliers: { pendingPayments: number; pendingCount: number; consignmentProfits: number }
}

interface Stats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  pendingOrders: number
}

export default function VendorDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [capitalSummary, setCapitalSummary] = useState<CapitalSummary | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [prevUnreadCount, setPrevUnreadCount] = useState(0)
  const [notificationAudio, setNotificationAudio] = useState<HTMLAudioElement | null>(null)
  const [isAlertPlaying, setIsAlertPlaying] = useState(false)

  // تشغيل صوت مستمر للإشعار (يتكرر حتى يتم إيقافه)
  const playNotificationSound = () => {
    try {
      // إنشاء صوت طويل مستمر
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      let isPlaying = true
      setIsAlertPlaying(true)

      const playBeep = () => {
        if (!isPlaying) return

        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        // صوت أطول وأوضح
        oscillator.frequency.value = 1200
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
        
        // تكرار الصوت كل ثانية
        setTimeout(() => playBeep(), 1000)
      }

      playBeep()
      
      // حفظ دالة إيقاف الصوت
      ;(window as any).stopNotificationSound = () => {
        isPlaying = false
        setIsAlertPlaying(false)
        console.log('🔕 تم إيقاف صوت الإشعار')
      }
      
      console.log('🔔 صوت الإشعار المستمر يعمل! اضغط على أي مكان لإيقافه')
    } catch (error) {
      console.error('Error playing notification sound:', error)
    }
  }

  // إيقاف الصوت عند الضغط على الشاشة
  const stopAlert = () => {
    if (isAlertPlaying && (window as any).stopNotificationSound) {
      ;(window as any).stopNotificationSound()
    }
  }

  // تسجيل Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('✅ Service Worker registered:', registration)
        })
        .catch(error => {
          console.error('❌ Service Worker registration failed:', error)
        })

      // الاستماع للرسائل من Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NEW_NOTIFICATION') {
          console.log('📩 رسالة جديدة من Service Worker:', event.data)
          playNotificationSound()
        }
      })
    }
  }, [])

  // طلب إذن الإشعارات
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('✅ تم منح إذن الإشعارات')
        }
      })
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'VENDOR') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, session, router])

  const fetchData = async () => {
    try {
      const [capitalRes, statsRes, notificationsRes] = await Promise.all([
        fetch('/api/vendor/capital/summary').catch(() => null),
        fetch('/api/vendor/stats').catch(() => null),
        fetch('/api/vendor/notifications').catch(() => null)
      ])
      
      if (capitalRes && capitalRes.ok) {
        setCapitalSummary(await capitalRes.json())
      }
      if (statsRes && statsRes.ok) {
        setStats(await statsRes.json())
      }
      if (notificationsRes && notificationsRes.ok) {
        const data = await notificationsRes.json()
        const initialCount = data.unreadCount || 0
        setUnreadCount(initialCount)
        setPrevUnreadCount(initialCount) // تهيئة العداد السابق
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  // تحديث عدد الإشعارات كل 10 ثواني (للاختبار السريع)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/vendor/notifications')
        if (res.ok) {
          const data = await res.json()
          const newUnreadCount = data.unreadCount || 0
          
          // إذا زاد عدد الإشعارات، شغل الصوت
          if (newUnreadCount > prevUnreadCount && prevUnreadCount > 0) {
            playNotificationSound()
            
            // إظهار إشعار desktop أيضاً
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('🎉 طلب جديد!', {
                body: 'لديك طلب جديد في المتجر',
                icon: '/icon-192x192.png',
                tag: 'new-order',
              })
            }
          }
          
          setPrevUnreadCount(newUnreadCount)
          setUnreadCount(newUnreadCount)
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    }, 10000) // كل 10 ثواني
    return () => clearInterval(interval)
  }, [])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-6"
      onClick={stopAlert}
    >
      {/* تنبيه صوتي مستمر */}
      {isAlertPlaying && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8 rounded-2xl shadow-2xl text-center animate-pulse">
            <Bell className="w-16 h-16 text-white mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-white mb-2">🎉 طلب جديد!</h2>
            <p className="text-white/90 mb-4">لديك طلب جديد في المتجر</p>
            <button
              onClick={stopAlert}
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              استقبال الطلب
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        
        {/* Header بسيط - responsive */}
        <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 md:p-3 rounded-xl shadow-lg flex-shrink-0">
              <Store className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-2xl font-bold text-white truncate">لوحة الشريك</h1>
              <p className="text-purple-100 text-xs md:text-sm truncate">{session?.user?.username || session?.user?.email}</p>
            </div>
          </div>
          <Button
            onClick={() => signOut({ callbackUrl: '/' })}
            size="sm"
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* زر نقطة البيع - responsive */}
        <div className="mb-4 md:mb-6">
          <Link href="/vendor/pos">
            <Button className="w-full h-12 md:h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-base md:text-lg font-bold shadow-xl">
              <Zap className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              نقطة البيع
            </Button>
          </Link>
        </div>

        {/* كارت رأس المال الرئيسي */}
        <Card className="backdrop-blur-sm bg-slate-950/90 border-purple-500/50 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/60 mb-6">
          <CardContent className="p-4 md:p-6">
            {/* Header - مع تصميم responsive */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500/30 backdrop-blur p-3 rounded-2xl border border-yellow-500/20">
                  <Wallet className="w-6 md:w-7 h-6 md:h-7 text-yellow-300" />
                </div>
                <div>
                  <p className="text-gray-200 text-xs md:text-sm font-bold">💰 رأس المال المتاح</p>
                  <p className="text-3xl md:text-4xl font-black text-yellow-300">
                    {capitalSummary?.capital.current?.toLocaleString() || 0}
                    <span className="text-lg md:text-xl text-yellow-300 mr-1">ج</span>
                  </p>
                </div>
              </div>
              <Link href="/vendor/capital" className="w-full md:w-auto">
                <Button className="w-full md:w-auto bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm md:text-base">
                  <Eye className="w-4 h-4 ml-2" />
                  <span className="hidden sm:inline">عرض الحسابات التفصيلية</span>
                  <span className="sm:hidden">الحسابات</span>
                </Button>
              </Link>
            </div>
            
            {/* ملخص سريع - responsive grid */}
            <div className="grid grid-cols-3 gap-2 md:gap-3 pt-4 border-t border-yellow-500/30">
              <Link href="/vendor/capital?tab=deposits" className="block">
                <div className="text-center bg-green-600/30 rounded-lg p-2 md:p-3 border border-green-500/50 hover:bg-green-600/40 hover:border-green-400/70 transition-all cursor-pointer group shadow-lg">
                  <p className="text-green-200 text-[10px] md:text-xs font-bold mb-1 group-hover:text-green-100">الإيداعات</p>
                  <p className="text-white font-black text-sm md:text-lg group-hover:scale-105 transition-transform inline-block">{capitalSummary?.capital.totalDeposits?.toLocaleString() || 0} <span className="text-xs md:text-base">ج</span></p>
                </div>
              </Link>
              <Link href="/vendor/products?type=owned" className="block">
                <div className="text-center bg-cyan-600/30 rounded-lg p-2 md:p-3 border border-cyan-500/50 hover:bg-cyan-600/40 hover:border-cyan-400/70 transition-all cursor-pointer group shadow-lg">
                  <p className="text-cyan-200 text-[10px] md:text-xs font-bold mb-1 group-hover:text-cyan-100">منتجات مملوكة</p>
                  <p className="text-white font-black text-sm md:text-lg group-hover:scale-105 transition-transform inline-block">{capitalSummary?.products.owned || 0}</p>
                </div>
              </Link>
              <Link href="/vendor/products?type=consignment" className="block">
                <div className="text-center bg-pink-600/30 rounded-lg p-2 md:p-3 border border-pink-500/50 hover:bg-pink-600/40 hover:border-pink-400/70 transition-all cursor-pointer group shadow-lg">
                  <p className="text-pink-200 text-[10px] md:text-xs font-bold mb-1 group-hover:text-pink-100">منتجات وسيط</p>
                  <p className="text-white font-black text-sm md:text-lg group-hover:scale-105 transition-transform inline-block">{capitalSummary?.products.consignment || 0}</p>
                </div>
              </Link>
            </div>

            {/* تحذير الموردين - responsive */}
            {(capitalSummary?.suppliers.pendingPayments || 0) > 0 && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400 animate-pulse flex-shrink-0" />
                  <span className="text-red-200 text-xs md:text-sm font-semibold">
                    مستحق للموردين: <strong>{capitalSummary?.suppliers.pendingPayments?.toLocaleString()} ج</strong>
                  </span>
                </div>
                <Link href="/vendor/capital">
                  <Button size="sm" className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs md:text-sm w-full sm:w-auto">
                    دفع الآن
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* إشعار الطلبات المعلقة - responsive */}
        {(stats?.pendingOrders || 0) > 0 && (
          <div className="mb-4">
            <Link href="/vendor/orders">
              <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 shadow-lg hover:scale-[1.02] transition-all cursor-pointer">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                      <div className="bg-orange-500 p-1.5 md:p-2 rounded-full animate-pulse flex-shrink-0">
                        <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm md:text-lg truncate">لديك {stats?.pendingOrders || 0} طلب جديد!</p>
                        <p className="text-orange-200 text-xs md:text-sm truncate">انقر لعرض الطلبات</p>
                      </div>
                    </div>
                    <div className="bg-orange-500 text-white font-bold text-lg md:text-xl px-3 md:px-4 py-1.5 md:py-2 rounded-full flex-shrink-0">
                      {stats?.pendingOrders || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}

        {/* إحصائيات بسيطة - responsive */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6">
          <Card className="backdrop-blur-sm bg-slate-950/90 border-purple-500/50 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/60">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="relative inline-block bg-purple-500 text-white p-2 md:p-3 rounded-lg shadow-xl w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-2">
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                {(stats?.pendingOrders || 0) > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center animate-pulse">
                    {stats?.pendingOrders}
                  </div>
                )}
              </div>
              <p className="text-2xl md:text-3xl font-black text-white">{stats?.totalOrders || 0}</p>
              <p className="text-xs md:text-sm text-gray-300 font-semibold">الطلبات</p>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-sm bg-slate-950/90 border-purple-500/50 shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/60">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="bg-pink-500 text-white p-2 md:p-3 rounded-lg shadow-xl w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-2">
                <Package className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <p className="text-2xl md:text-3xl font-black text-white">{stats?.totalProducts || 0}</p>
              <p className="text-xs md:text-sm text-gray-300 font-semibold">المنتجات</p>
            </CardContent>
          </Card>
          <Link href="/vendor/suppliers" className="col-span-2 md:col-span-1">
            <Card className="backdrop-blur-sm bg-slate-950/90 border-purple-500/50 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/60 cursor-pointer group h-full">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="bg-orange-500 text-white p-2 md:p-3 rounded-lg shadow-xl w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <p className="text-2xl md:text-3xl font-black text-white">{capitalSummary?.suppliers.pendingCount || 0}</p>
                <p className="text-xs md:text-sm text-gray-300 font-semibold">موردين</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* روابط سريعة - responsive */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <Link href="/vendor/capital">
            <Card className="backdrop-blur-sm bg-slate-950/90 border-purple-500/50 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 cursor-pointer h-full hover:-translate-y-2 hover:bg-slate-900/95 hover:border-yellow-500/60 group">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-yellow-400 mb-1 md:mb-2 transform group-hover:scale-110 transition-transform duration-300 w-10 h-10 md:w-12 md:h-12 mx-auto flex items-center justify-center">
                  <Wallet className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <p className="text-white font-black group-hover:text-yellow-300 transition-all text-sm md:text-base">الحسابات</p>
                <p className="text-gray-200 text-[10px] md:text-xs mt-1 group-hover:text-gray-100 transition-colors font-medium hidden md:block">كل المعاملات</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor/pos">
            <Card className="backdrop-blur-sm bg-slate-950/90 border-purple-500/50 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 cursor-pointer h-full hover:-translate-y-2 hover:bg-slate-900/95 hover:border-green-500/60 group">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-green-400 mb-1 md:mb-2 transform group-hover:scale-110 transition-transform duration-300 w-10 h-10 md:w-12 md:h-12 mx-auto flex items-center justify-center">
                  <Receipt className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <p className="text-white font-black group-hover:text-green-300 transition-all text-sm md:text-base">نقطة البيع</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor/notifications">
            <Card className="backdrop-blur-sm bg-slate-950/90 border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer h-full hover:-translate-y-2 hover:bg-slate-900/95 hover:border-purple-500/60 group">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="relative inline-block text-purple-400 mb-1 md:mb-2 transform group-hover:scale-110 transition-transform duration-300 w-10 h-10 md:w-12 md:h-12 mx-auto flex items-center justify-center">
                  <Bell className="w-6 h-6 md:w-8 md:h-8" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full w-4 h-4 md:w-6 md:h-6 flex items-center justify-center animate-pulse shadow-lg">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </div>
                <p className="text-white font-black group-hover:text-purple-300 transition-all text-sm md:text-base">الإشعارات</p>
                {unreadCount > 0 && (
                  <p className="text-gray-200 text-[10px] md:text-xs mt-1 group-hover:text-gray-100 transition-colors font-medium hidden md:block">{unreadCount} جديد</p>
                )}
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor/inventory">
            <Card className="backdrop-blur-sm bg-slate-950/90 border-purple-500/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer h-full hover:-translate-y-2 hover:bg-slate-900/95 hover:border-blue-500/60 group">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-blue-400 mb-1 md:mb-2 transform group-hover:scale-110 transition-transform duration-300 w-10 h-10 md:w-12 md:h-12 mx-auto flex items-center justify-center">
                  <Package className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <p className="text-white font-black group-hover:text-blue-300 transition-all text-sm md:text-base">المخزون</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor/orders">
            <Card className="backdrop-blur-sm bg-slate-950/90 border-purple-500/50 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 cursor-pointer h-full hover:-translate-y-2 hover:bg-slate-900/95 hover:border-red-500/60 group">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="relative inline-block text-red-400 mb-1 md:mb-2 transform group-hover:scale-110 transition-transform duration-300 w-10 h-10 md:w-12 md:h-12 mx-auto flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 md:w-8 md:h-8" />
                  {(stats?.pendingOrders || 0) > 0 && (
                    <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full w-4 h-4 md:w-6 md:h-6 flex items-center justify-center animate-pulse shadow-lg">
                      {stats?.pendingOrders}
                    </div>
                  )}
                </div>
                <p className="text-white font-black group-hover:text-red-300 transition-all text-sm md:text-base">الطلبات</p>
                {(stats?.pendingOrders || 0) > 0 && (
                  <p className="text-gray-200 text-[10px] md:text-xs mt-1 group-hover:text-gray-100 transition-colors font-medium hidden md:block">{stats?.pendingOrders} جديد</p>
                )}
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor/partners">
            <Card className="backdrop-blur-sm bg-slate-950/90 border-purple-500/50 hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 cursor-pointer h-full hover:-translate-y-2 hover:bg-slate-900/95 hover:border-pink-500/60 group">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-pink-400 mb-1 md:mb-2 transform group-hover:scale-110 transition-transform duration-300 w-10 h-10 md:w-12 md:h-12 mx-auto flex items-center justify-center">
                  <Users className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <p className="text-white font-black group-hover:text-pink-300 transition-all text-sm md:text-base">الشركاء</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor/products">
            <Card className="backdrop-blur-sm bg-slate-950/90 border-purple-500/50 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 cursor-pointer h-full hover:-translate-y-2 hover:bg-slate-900/95 hover:border-indigo-500/60 group">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-indigo-400 mb-1 md:mb-2 transform group-hover:scale-110 transition-transform duration-300 w-10 h-10 md:w-12 md:h-12 mx-auto flex items-center justify-center">
                  <Package className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <p className="text-white font-black group-hover:text-indigo-300 transition-all text-sm md:text-base">المنتجات</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor/suppliers">
            <Card className="backdrop-blur-sm bg-slate-950/90 border-purple-500/50 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 cursor-pointer h-full hover:-translate-y-2 hover:bg-slate-900/95 hover:border-orange-500/60 group">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-orange-400 mb-1 md:mb-2 transform group-hover:scale-110 transition-transform duration-300 w-10 h-10 md:w-12 md:h-12 mx-auto flex items-center justify-center">
                  <Truck className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <p className="text-white font-black group-hover:text-orange-300 transition-all text-sm md:text-base">الموردين</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor/purchases">
            <Card className="backdrop-blur-sm bg-slate-950/90 border-purple-500/50 hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-300 cursor-pointer h-full hover:-translate-y-2 hover:bg-slate-900/95 hover:border-teal-500/60 group">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-teal-400 mb-1 md:mb-2 transform group-hover:scale-110 transition-transform duration-300 w-10 h-10 md:w-12 md:h-12 mx-auto flex items-center justify-center">
                  <FileText className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <p className="text-white font-black group-hover:text-teal-300 transition-all text-sm md:text-base">الفواتير</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor/sub-users">
            <Card className="backdrop-blur-sm bg-slate-950/90 border-purple-500/50 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 cursor-pointer h-full hover:-translate-y-2 hover:bg-slate-900/95 hover:border-indigo-500/60 group">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-indigo-400 mb-1 md:mb-2 transform group-hover:scale-110 transition-transform duration-300 w-10 h-10 md:w-12 md:h-12 mx-auto flex items-center justify-center">
                  <UserPlus className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <p className="text-white font-black group-hover:text-indigo-300 transition-all text-sm md:text-base">فريق العمل</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor/reports">
            <Card className="backdrop-blur-sm bg-slate-950/90 border-purple-500/50 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 cursor-pointer h-full hover:-translate-y-2 hover:bg-slate-900/95 hover:border-cyan-500/60 group">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-cyan-400 mb-1 md:mb-2 transform group-hover:scale-110 transition-transform duration-300 w-10 h-10 md:w-12 md:h-12 mx-auto flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <p className="text-white font-black group-hover:text-cyan-300 transition-all text-sm md:text-base">التقارير</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor/activity-logs">
            <Card className="backdrop-blur-sm bg-slate-950/90 border-purple-500/50 hover:shadow-2xl hover:shadow-rose-500/20 transition-all duration-300 cursor-pointer h-full hover:-translate-y-2 hover:bg-slate-900/95 hover:border-rose-500/60 group">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-rose-400 mb-1 md:mb-2 transform group-hover:scale-110 transition-transform duration-300 w-10 h-10 md:w-12 md:h-12 mx-auto flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <p className="text-white font-black group-hover:text-rose-300 transition-all text-sm md:text-base">سجل النشاط</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor/delivery-agents">
            <Card className="backdrop-blur-sm bg-slate-950/90 border-purple-500/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer h-full hover:-translate-y-2 hover:bg-slate-900/95 hover:border-blue-500/60 group">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-blue-400 mb-1 md:mb-2 transform group-hover:scale-110 transition-transform duration-300 w-10 h-10 md:w-12 md:h-12 mx-auto flex items-center justify-center">
                  <Truck className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <p className="text-white font-black group-hover:text-blue-300 transition-all text-sm md:text-base">المناديب</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor/shipping-companies">
            <Card className="backdrop-blur-sm bg-slate-950/90 border-purple-500/50 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 cursor-pointer h-full hover:-translate-y-2 hover:bg-slate-900/95 hover:border-amber-500/60 group">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-amber-400 mb-1 md:mb-2 transform group-hover:scale-110 transition-transform duration-300 w-10 h-10 md:w-12 md:h-12 mx-auto flex items-center justify-center">
                  <Package className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <p className="text-white font-black group-hover:text-amber-300 transition-all text-sm md:text-base">شركات الشحن</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor/settings">
            <Card className="backdrop-blur-sm bg-slate-950/90 border-purple-500/50 hover:shadow-2xl hover:shadow-gray-500/20 transition-all duration-300 cursor-pointer h-full hover:-translate-y-2 hover:bg-slate-900/95 hover:border-gray-500/60 group">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-gray-400 mb-1 md:mb-2 transform group-hover:scale-110 transition-transform duration-300 w-10 h-10 md:w-12 md:h-12 mx-auto flex items-center justify-center">
                  <Settings className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <p className="text-white font-black group-hover:text-gray-300 transition-all text-sm md:text-base">الإعدادات</p>
              </CardContent>
            </Card>
          </Link>
        </div>

      </div>
      
      {/* المساعد الذكي */}
      <SmartAssistant />
    </div>
  )
}
