'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Factory,
  Package,
  Scissors,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Eye,
  Settings,
  BarChart3,
  LogOut,
  Layers,
  Ruler,
  Shirt,
  Calendar,
  Sparkles,
  Zap,
  Target,
  Award,
  Cog
} from 'lucide-react'

interface ManufacturerStats {
  totalProductions: number
  completedProductions: number
  pendingProductions: number
  totalFabrics: number
  totalMaterials: number
  monthlyOutput: number
  weeklyOutput: number
  todayOutput: number
  lowStockMaterials: number
}

interface RecentProduction {
  id: string
  productName: string
  quantity: number
  status: string
  createdAt: string
}

export default function ManufacturerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<ManufacturerStats | null>(null)
  const [recentProductions, setRecentProductions] = useState<RecentProduction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'MANUFACTURER') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, session, router])

  const fetchData = async () => {
    try {
      const [statsRes, productionsRes] = await Promise.all([
        fetch('/api/manufacturer/stats'),
        fetch('/api/manufacturer/productions?limit=5')
      ])
      
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
      
      if (productionsRes.ok) {
        const data = await productionsRes.json()
        setRecentProductions(data.productions || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (productionStatus: string) => {
    const statusConfig: Record<string, { color: string; text: string; icon: any }> = {
      PENDING: { color: 'bg-amber-500/30 text-amber-300 border border-amber-500/50', text: 'قيد الانتظار', icon: Clock },
      IN_PROGRESS: { color: 'bg-blue-500/30 text-blue-300 border border-blue-500/50', text: 'قيد التصنيع', icon: Factory },
      COMPLETED: { color: 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50', text: 'مكتمل', icon: CheckCircle },
      CANCELLED: { color: 'bg-red-500/30 text-red-300 border border-red-500/50', text: 'ملغي', icon: XCircle }
    }
    const config = statusConfig[productionStatus] || statusConfig.PENDING
    const Icon = config.icon
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-cyan-500 border-r-blue-500 mx-auto"></div>
            <Cog className="w-8 h-8 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="mt-6 text-cyan-300 text-lg font-medium">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-cyan-900/50 via-blue-900/30 to-cyan-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 p-4 rounded-2xl shadow-2xl">
                  <Factory className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                  لوحة تحكم المصنع
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-cyan-300">مرحباً، {session?.user?.username || session?.user?.email}</span>
                  <Badge className="bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border border-cyan-400/30">
                    <Award className="w-3 h-3 ml-1" />
                    مصنع معتمد
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link href="/manufacturer/productions/new">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/25 border-0 font-semibold">
                  <Plus className="w-4 h-4 ml-2" />
                  أمر إنتاج جديد
                </Button>
              </Link>
              <Button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
              >
                <LogOut className="w-4 h-4 ml-2" />
                خروج
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* أوامر الإنتاج */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-500/20 via-cyan-600/10 to-blue-600/20 backdrop-blur-xl border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/20 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl group-hover:bg-cyan-400/20 transition-all"></div>
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-cyan-300/80 text-sm font-medium">أوامر الإنتاج</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats?.totalProductions || 0}</p>
                  <p className="text-amber-400 text-sm mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {stats?.pendingProductions || 0} قيد الانتظار
                  </p>
                </div>
                <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-3 rounded-xl shadow-lg shadow-cyan-500/30">
                  <Layers className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* مكتمل */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-teal-600/20 backdrop-blur-xl border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/20 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl group-hover:bg-emerald-400/20 transition-all"></div>
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-emerald-300/80 text-sm font-medium">مكتمل</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats?.completedProductions || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-3 rounded-xl shadow-lg shadow-emerald-500/30">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الأقمشة */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-violet-500/20 via-violet-600/10 to-purple-600/20 backdrop-blur-xl border-violet-500/30 hover:border-violet-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/20 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-400/10 rounded-full blur-2xl group-hover:bg-violet-400/20 transition-all"></div>
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-violet-300/80 text-sm font-medium">الأقمشة</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats?.totalFabrics || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-violet-400 to-purple-500 p-3 rounded-xl shadow-lg shadow-violet-500/30">
                  <Scissors className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الخامات */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-orange-600/20 backdrop-blur-xl border-amber-500/30 hover:border-amber-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/20 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-all"></div>
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-amber-300/80 text-sm font-medium">الخامات</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats?.totalMaterials || 0}</p>
                  {(stats?.lowStockMaterials || 0) > 0 && (
                    <p className="text-orange-400 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {stats?.lowStockMaterials} مخزون منخفض
                    </p>
                  )}
                </div>
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-3 rounded-xl shadow-lg shadow-amber-500/30">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* إحصائيات الإنتاج */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-600/30 to-teal-700/30 backdrop-blur-xl border-emerald-400/40 group hover:border-emerald-300/60 transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-4 rounded-2xl shadow-xl shadow-emerald-500/40">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-emerald-200 text-sm font-medium">إنتاج اليوم</p>
                  <p className="text-4xl font-bold text-white mt-1">
                    {stats?.todayOutput || 0}
                    <span className="text-xl text-emerald-300 mr-1">قطعة</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600/30 to-cyan-700/30 backdrop-blur-xl border-blue-400/40 group hover:border-blue-300/60 transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-400 to-cyan-500 p-4 rounded-2xl shadow-xl shadow-blue-500/40">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-blue-200 text-sm font-medium">إنتاج الأسبوع</p>
                  <p className="text-4xl font-bold text-white mt-1">
                    {stats?.weeklyOutput || 0}
                    <span className="text-xl text-blue-300 mr-1">قطعة</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-600/30 to-pink-700/30 backdrop-blur-xl border-purple-400/40 group hover:border-purple-300/60 transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-4 rounded-2xl shadow-xl shadow-purple-500/40">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-purple-200 text-sm font-medium">إنتاج الشهر</p>
                  <p className="text-4xl font-bold text-white mt-1">
                    {stats?.monthlyOutput || 0}
                    <span className="text-xl text-purple-300 mr-1">قطعة</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* آخر أوامر الإنتاج */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-slate-700/50 mb-8">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700/50 pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <div className="bg-cyan-500/20 p-2 rounded-lg">
                <Factory className="w-5 h-5 text-cyan-400" />
              </div>
              آخر أوامر الإنتاج
            </CardTitle>
            <Link href="/manufacturer/productions">
              <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                عرض الكل
                <Eye className="w-4 h-4 mr-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {recentProductions.length > 0 ? (
              <div className="space-y-3">
                {recentProductions.map((production, index) => (
                  <div 
                    key={production.id} 
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-700/40 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-cyan-500 to-blue-500 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                        <Shirt className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{production.productName}</p>
                        <p className="text-slate-400 text-sm">{production.quantity} قطعة • {formatDate(production.createdAt)}</p>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(production.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Factory className="w-10 h-10 text-slate-500" />
                </div>
                <p className="text-slate-400 text-lg">لا توجد أوامر إنتاج حتى الآن</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* القائمة السريعة */}
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Target className="w-6 h-6 text-cyan-400" />
          الوصول السريع
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link href="/manufacturer/productions">
            <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-600/40 to-blue-700/40 backdrop-blur-xl border-cyan-400/40 hover:border-cyan-300/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 cursor-pointer group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
              <CardContent className="p-6 text-center relative">
                <div className="bg-gradient-to-br from-cyan-400 to-blue-500 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-cyan-500/40 group-hover:scale-110 transition-transform">
                  <Factory className="w-7 h-7 text-white" />
                </div>
                <p className="text-white font-semibold">أوامر الإنتاج</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/manufacturer/fabrics">
            <Card className="relative overflow-hidden bg-gradient-to-br from-violet-600/40 to-purple-700/40 backdrop-blur-xl border-violet-400/40 hover:border-violet-300/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/30 cursor-pointer group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
              <CardContent className="p-6 text-center relative">
                <div className="bg-gradient-to-br from-violet-400 to-purple-500 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-violet-500/40 group-hover:scale-110 transition-transform">
                  <Scissors className="w-7 h-7 text-white" />
                </div>
                <p className="text-white font-semibold">الأقمشة</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/manufacturer/materials">
            <Card className="relative overflow-hidden bg-gradient-to-br from-amber-600/40 to-orange-700/40 backdrop-blur-xl border-amber-400/40 hover:border-amber-300/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/30 cursor-pointer group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
              <CardContent className="p-6 text-center relative">
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-amber-500/40 group-hover:scale-110 transition-transform">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <p className="text-white font-semibold">الخامات</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/manufacturer/cutting">
            <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-600/40 to-teal-700/40 backdrop-blur-xl border-emerald-400/40 hover:border-emerald-300/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30 cursor-pointer group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
              <CardContent className="p-6 text-center relative">
                <div className="bg-gradient-to-br from-emerald-400 to-teal-500 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-emerald-500/40 group-hover:scale-110 transition-transform">
                  <Ruler className="w-7 h-7 text-white" />
                </div>
                <p className="text-white font-semibold">القص</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/manufacturer/reports">
            <Card className="relative overflow-hidden bg-gradient-to-br from-pink-600/40 to-rose-700/40 backdrop-blur-xl border-pink-400/40 hover:border-pink-300/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/30 cursor-pointer group">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
              <CardContent className="p-6 text-center relative">
                <div className="bg-gradient-to-br from-pink-400 to-rose-500 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-pink-500/40 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <p className="text-white font-semibold">التقارير</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/manufacturer/settings">
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-600/40 to-slate-700/40 backdrop-blur-xl border-slate-400/40 hover:border-slate-300/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-slate-500/30 cursor-pointer group">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
              <CardContent className="p-6 text-center relative">
                <div className="bg-gradient-to-br from-slate-400 to-slate-500 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-slate-500/40 group-hover:scale-110 transition-transform">
                  <Settings className="w-7 h-7 text-white" />
                </div>
                <p className="text-white font-semibold">الإعدادات</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* تنبيهات */}
        {((stats?.lowStockMaterials || 0) > 0 || (stats?.pendingProductions || 0) > 0) && (
          <div className="mt-10">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-400" />
              تنبيهات هامة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(stats?.lowStockMaterials || 0) > 0 && (
                <Card className="bg-gradient-to-br from-amber-900/40 to-amber-800/30 backdrop-blur-xl border-amber-500/40 hover:border-amber-400/60 transition-all">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="bg-amber-500/30 p-3 rounded-xl">
                      <AlertCircle className="w-8 h-8 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">خامات منخفضة المخزون</p>
                      <p className="text-amber-300">{stats?.lowStockMaterials} خامة تحتاج إعادة طلب</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {(stats?.pendingProductions || 0) > 0 && (
                <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/30 backdrop-blur-xl border-blue-500/40 hover:border-blue-400/60 transition-all">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="bg-blue-500/30 p-3 rounded-xl">
                      <Clock className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">أوامر إنتاج معلقة</p>
                      <p className="text-blue-300">{stats?.pendingProductions} أمر ينتظر البدء</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
