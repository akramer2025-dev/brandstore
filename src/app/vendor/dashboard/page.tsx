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
  Zap,
  Receipt,
  AlertCircle,
  Bell,
  Eye
} from 'lucide-react'

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
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  // تحديث عدد الإشعارات كل 30 ثانية
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/vendor/notifications')
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    }, 30000)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header بسيط */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">لوحة الشريك</h1>
              <p className="text-purple-300 text-sm">{session?.user?.username || session?.user?.email}</p>
            </div>
          </div>
          <Button
            onClick={() => signOut({ callbackUrl: '/' })}
            size="sm"
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* زر نقطة البيع */}
        <div className="mb-6">
          <Link href="/vendor/pos">
            <Button className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-lg font-bold">
              <Zap className="w-5 h-5 ml-2" />
              نقطة البيع
            </Button>
          </Link>
        </div>

        {/* كارت رأس المال الرئيسي */}
        <Card className="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 backdrop-blur-xl border-2 border-yellow-500/30 shadow-2xl mb-6 hover:border-yellow-400/50 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500/20 backdrop-blur p-3 rounded-2xl">
                  <Wallet className="w-7 h-7 text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm font-bold">💰 رأس المال المتاح</p>
                  <p className="text-4xl font-black text-yellow-400">
                    {capitalSummary?.capital.current?.toLocaleString() || 0}
                    <span className="text-xl text-yellow-300 mr-1">ج</span>
                  </p>
                </div>
              </div>
              <Link href="/vendor/capital">
                <Button className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <Eye className="w-4 h-4 ml-2" />
                  عرض الحسابات التفصيلية
                </Button>
              </Link>
            </div>
            
            {/* ملخص سريع */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-yellow-500/20">
              <div className="text-center bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                <p className="text-green-300 text-xs font-semibold mb-1">الإيداعات</p>
                <p className="text-white font-bold text-lg">{capitalSummary?.capital.totalDeposits?.toLocaleString() || 0} ج</p>
              </div>
              <div className="text-center bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/20">
                <p className="text-cyan-300 text-xs font-semibold mb-1">منتجات مملوكة</p>
                <p className="text-white font-bold text-lg">{capitalSummary?.products.owned || 0}</p>
              </div>
              <div className="text-center bg-pink-500/10 rounded-lg p-3 border border-pink-500/20">
                <p className="text-pink-300 text-xs font-semibold mb-1">منتجات وسيط</p>
                <p className="text-white font-bold text-lg">{capitalSummary?.products.consignment || 0}</p>
              </div>
            </div>

            {/* تحذير الموردين */}
            {(capitalSummary?.suppliers.pendingPayments || 0) > 0 && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 animate-pulse" />
                  <span className="text-red-200 text-sm font-semibold">
                    مستحق للموردين: <strong>{capitalSummary?.suppliers.pendingPayments?.toLocaleString()} ج</strong>
                  </span>
                </div>
                <Link href="/vendor/capital">
                  <Button size="sm" className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40">
                    دفع الآن
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* إشعار الطلبات المعلقة */}
        {(stats?.pendingOrders || 0) > 0 && (
          <div className="mb-4">
            <Link href="/vendor/orders">
              <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 shadow-lg hover:scale-[1.02] transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-500 p-2 rounded-full animate-pulse">
                        <ShoppingCart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">لديك {stats?.pendingOrders || 0} طلب جديد!</p>
                        <p className="text-orange-200 text-sm">انقر لعرض الطلبات المعلقة</p>
                      </div>
                    </div>
                    <div className="bg-orange-500 text-white font-bold text-xl px-4 py-2 rounded-full">
                      {stats?.pendingOrders || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}

        {/* إحصائيات بسيطة */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-400">{stats?.totalRevenue?.toLocaleString() || 0}</p>
              <p className="text-gray-400 text-xs">الإيرادات</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="relative inline-block">
                <ShoppingCart className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                {(stats?.pendingOrders || 0) > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {stats?.pendingOrders}
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-blue-400">{stats?.totalOrders || 0}</p>
              <p className="text-gray-400 text-xs">الطلبات</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-4 text-center">
              <Package className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-400">{stats?.totalProducts || 0}</p>
              <p className="text-gray-400 text-xs">المنتجات</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-400">{capitalSummary?.suppliers.pendingCount || 0}</p>
              <p className="text-gray-400 text-xs">موردين</p>
            </CardContent>
          </Card>
        </div>

        {/* روابط سريعة */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/vendor/capital">
            <Card className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 backdrop-blur-xl border-yellow-500/30 shadow-lg hover:shadow-yellow-500/20 transition-all cursor-pointer hover:scale-[1.05]">
              <CardContent className="p-4 text-center">
                <Wallet className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-white font-medium">الحسابات</p>
                <p className="text-yellow-300 text-xs mt-1">كل المعاملات</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor/pos">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:bg-white/20 transition-all cursor-pointer hover:scale-[1.02]">
              <CardContent className="p-4 text-center">
                <Receipt className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-white font-medium">نقطة البيع</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor/notifications">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:bg-white/20 transition-all cursor-pointer hover:scale-[1.02]">
              <CardContent className="p-4 text-center">
                <div className="relative inline-block">
                  <Bell className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </div>
                <p className="text-white font-medium">الإشعارات</p>
                {unreadCount > 0 && (
                  <p className="text-red-400 text-xs font-bold mt-1">{unreadCount} جديد</p>
                )}
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor/inventory">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:bg-white/20 transition-all cursor-pointer hover:scale-[1.02]">
              <CardContent className="p-4 text-center">
                <Package className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-white font-medium">المخزون</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor/orders">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:bg-white/20 transition-all cursor-pointer hover:scale-[1.02]">
              <CardContent className="p-4 text-center">
                <div className="relative inline-block">
                  <ShoppingCart className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  {(stats?.pendingOrders || 0) > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                      {stats?.pendingOrders}
                    </div>
                  )}
                </div>
                <p className="text-white font-medium">الطلبات</p>
                {(stats?.pendingOrders || 0) > 0 && (
                  <p className="text-orange-400 text-xs font-bold mt-1">{stats?.pendingOrders} جديد</p>
                )}
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor/capital">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:bg-white/20 transition-all cursor-pointer hover:scale-[1.02]">
              <CardContent className="p-4 text-center">
                <Wallet className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-white font-medium">رأس المال</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/vendor/partners">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:bg-white/20 transition-all cursor-pointer hover:scale-[1.02]">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <p className="text-white font-medium">الشركاء</p>
              </CardContent>
            </Card>
          </Link>
        </div>

      </div>
    </div>
  )
}
