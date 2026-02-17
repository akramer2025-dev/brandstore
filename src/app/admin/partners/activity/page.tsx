'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BackButton } from '@/components/BackButton'
import {
  Activity,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Clock,
  MapPin,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'

interface ActivityStats {
  vendorId: string
  vendorName: string
  userId: string
  email: string | null
  totalLogins: number
  lastLogin: Date | null
  devices: Array<{ name: string; count: number }>
  browsers: Array<{ name: string; count: number }>
  locations: Array<{ name: string; count: number }>
  activityLevel: string
  recentActivities: Array<{
    action: string
    device: string
    browser: string
    location: string | null
    createdAt: Date
  }>
}

interface Summary {
  total: number
  veryActive: number
  active: number
  medium: number
  inactive: number
}

export default function PartnersActivityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [stats, setStats] = useState<ActivityStats[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all') // all, veryActive, active, medium, inactive

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchActivityStats()
    }
  }, [status, session, router])

  const fetchActivityStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/partners/activity')
      
      if (!response.ok) {
        throw new Error('فشل في جلب الإحصائيات')
      }
      
      const data = await response.json()
      setStats(data.stats)
      setSummary(data.summary)
    } catch (error) {
      console.error('Error fetching activity stats:', error)
      toast.error('فشل في جلب إحصائيات النشاط')
    } finally {
      setLoading(false)
    }
  }

  const getActivityLevelColor = (level: string) => {
    switch (level) {
      case 'نشط جداً': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'نشط': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'متوسط': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'خامل': return 'text-red-400 bg-red-500/10 border-red-500/20'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  const getActivityIcon = (level: string) => {
    switch (level) {
      case 'نشط جداً': return <TrendingUp className="w-4 h-4" />
      case 'نشط': return <TrendingUp className="w-4 h-4" />
      case 'متوسط': return <Minus className="w-4 h-4" />
      case 'خامل': return <TrendingDown className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getDeviceIcon = (device: string) => {
    switch (device?.toUpperCase()) {
      case 'MOBILE': return <Smartphone className="w-4 h-4" />
      case 'TABLET': return <Tablet className="w-4 h-4" />
      case 'DESKTOP': return <Monitor className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }

  const filteredStats = stats.filter(stat => {
    if (filter === 'all') return true
    if (filter === 'veryActive') return stat.activityLevel === 'نشط جداً'
    if (filter === 'active') return stat.activityLevel === 'نشط'
    if (filter === 'medium') return stat.activityLevel === 'متوسط'
    if (filter === 'inactive') return stat.activityLevel === 'خامل'
    return true
  })

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'لم يسجل دخول مطلقاً'
    
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'منذ لحظات'
    if (minutes < 60) return `منذ ${minutes} دقيقة`
    if (hours < 24) return `منذ ${hours} ساعة`
    if (days < 7) return `منذ ${days} يوم`
    return new Date(date).toLocaleDateString('ar-EG')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <BackButton fallbackUrl="/admin/partners" />
          <div className="flex items-center gap-3 mt-4 mb-2">
            <Eye className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">
              🕵️ تتبع نشاط الشركاء
            </h1>
          </div>
          <p className="text-gray-400">
            مراقبة كاملة لنشاط الشركاء - تسجيل الدخ ول، الأجهزة، المواقع (بدون علم الشريك)
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card 
              className={`bg-gray-800/50 border-purple-500/20 cursor-pointer hover:border-purple-400/40 transition-all ${
                filter === 'all' ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => setFilter('all')}
            >
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-white">{summary.total}</div>
                <div className="text-sm text-gray-400">إجمالي الشركاء</div>
              </CardContent>
            </Card>
            
            <Card 
              className={`bg-gray-800/50 border-green-500/20 cursor-pointer hover:border-green-400/40 transition-all ${
                filter === 'veryActive' ? 'ring-2 ring-green-500' : ''
              }`}
              onClick={() => setFilter('veryActive')}
            >
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-400">{summary.veryActive}</div>
                <div className="text-sm text-gray-400">نشط جداً</div>
              </CardContent>
            </Card>
            
            <Card 
              className={`bg-gray-800/50 border-blue-500/20 cursor-pointer hover:border-blue-400/40 transition-all ${
                filter === 'active' ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setFilter('active')}
            >
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-400">{summary.active}</div>
                <div className="text-sm text-gray-400">نشط</div>
              </CardContent>
            </Card>
            
            <Card 
              className={`bg-gray-800/50 border-yellow-500/20 cursor-pointer hover:border-yellow-400/40 transition-all ${
                filter === 'medium' ? 'ring-2 ring-yellow-500' : ''
              }`}
              onClick={() => setFilter('medium')}
            >
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-400">{summary.medium}</div>
                <div className="text-sm text-gray-400">متوسط</div>
              </CardContent>
            </Card>
            
            <Card 
              className={`bg-gray-800/50 border-red-500/20 cursor-pointer hover:border-red-400/40 transition-all ${
                filter === 'inactive' ? 'ring-2 ring-red-500' : ''
              }`}
              onClick={() => setFilter('inactive')}
            >
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-400">{summary.inactive}</div>
                <div className="text-sm text-gray-400">خامل</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Partners Activity List */}
        <div className="grid gap-4">
          {filteredStats.map((stat) => (
            <Card key={stat.vendorId} className="bg-gray-800/50 border-gray-700/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-white mb-1">
                      {stat.vendorName}
                    </CardTitle>
                    <p className="text-sm text-gray-400">{stat.email}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${getActivityLevelColor(stat.activityLevel)}`}>
                    {getActivityIcon(stat.activityLevel)}
                    {stat.activityLevel}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Total Logins */}
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-purple-400 text-sm mb-1">
                      <Activity className="w-4 h-4" />
                      <span>تسجيلات الدخول</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stat.totalLogins}</div>
                  </div>
                  
                  {/* Last Login */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-400 text-sm mb-1">
                      <Clock className="w-4 h-4" />
                      <span>آخر دخول</span>
                    </div>
                    <div className="text-sm font-medium text-white">
                      {formatTimeAgo(stat.lastLogin)}
                    </div>
                  </div>
                  
                  {/* Devices */}
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
                      <Smartphone className="w-4 h-4" />
                      <span>الأجهزة</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {stat.devices.map((device, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs text-white">
                          {getDeviceIcon(device.name)}
                          <span>{device.name}</span>
                          <span className="text-gray-400">({device.count})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Locations */}
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-orange-400 text-sm mb-1">
                      <MapPin className="w-4 h-4" />
                      <span>المواقع</span>
                    </div>
                    <div className="space-y-1">
                      {stat.locations.slice(0, 2).map((loc, i) => (
                        <div key={i} className="text-xs text-white truncate">
                          📍 {loc.name} ({loc.count})
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Browsers */}
                {stat.browsers.length > 0 && (
                  <div className="border-t border-gray-700/50 pt-3">
                    <div className="text-sm text-gray-400 mb-2">المتصفحات المستخدمة:</div>
                    <div className="flex flex-wrap gap-2">
                      {stat.browsers.map((browser, i) => (
                        <span 
                          key={i}
                          className="px-2 py-1 bg-gray-700/50 border border-gray-600/30 rounded text-xs text-gray-300"
                        >
                          {browser.name} ({browser.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Activities */}
                {stat.recentActivities.length > 0 && (
                  <details className="border-t border-gray-700/50 pt-3">
                    <summary className="text-sm text-gray-400 cursor-pointer hover:text-white transition-colors">
                      آخر {stat.recentActivities.length} نشاط (انقر للتفاصيل)
                    </summary>
                    <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                      {stat.recentActivities.map((activity, i) => (
                        <div 
                          key={i}
                          className="bg-gray-700/30 border border-gray-600/20 rounded p-2 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-purple-400 font-medium">{activity.action}</span>
                            <span className="text-gray-500">
                              {new Date(activity.createdAt).toLocaleString('ar-EG')}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-gray-400">
                            <span className="flex items-center gap-1">
                              {getDeviceIcon(activity.device)}
                              {activity.device}
                            </span>
                            <span>• {activity.browser}</span>
                            {activity.location && <span>• 📍 {activity.location}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStats.length === 0 && (
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">لا يوجد شركاء في هذا التصنيف</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
