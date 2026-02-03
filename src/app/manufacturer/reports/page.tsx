'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import {
  BarChart3,
  ArrowRight,
  Factory,
  Package,
  Scissors,
  TrendingUp,
  Calendar,
  Download,
  FileText
} from 'lucide-react'

interface Stats {
  totalProductions: number
  completedProductions: number
  pendingProductions: number
  totalFabrics: number
  totalMaterials: number
  todayOutput: number
  weeklyOutput: number
  monthlyOutput: number
}

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'MANUFACTURER') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchStats()
    }
  }, [status, session, router])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/manufacturer/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-400 mx-auto"></div>
          <p className="mt-4 text-teal-300">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Link href="/manufacturer/dashboard" className="hover:text-blue-300">لوحة التحكم</Link>
            <ArrowRight className="w-4 h-4" />
            <span className="text-white">التقارير</span>
          </div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-teal-400" />
            التقارير والإحصائيات
          </h1>
        </div>
        <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
          <Download className="w-4 h-4 ml-2" />
          تصدير التقرير
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-lg border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Factory className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">إجمالي الإنتاج</p>
                <p className="text-2xl font-bold text-white">{stats?.totalProductions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-lg border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-gray-400 text-sm">مكتمل</p>
                <p className="text-2xl font-bold text-white">{stats?.completedProductions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Scissors className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-gray-400 text-sm">الأقمشة</p>
                <p className="text-2xl font-bold text-white">{stats?.totalFabrics || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-600/20 to-amber-600/20 backdrop-blur-lg border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-gray-400 text-sm">الخامات</p>
                <p className="text-2xl font-bold text-white">{stats?.totalMaterials || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-400" />
              إنتاج اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-400">{stats?.todayOutput || 0}</p>
            <p className="text-gray-400">قطعة</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              إنتاج الأسبوع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-400">{stats?.weeklyOutput || 0}</p>
            <p className="text-gray-400">قطعة</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              إنتاج الشهر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-purple-400">{stats?.monthlyOutput || 0}</p>
            <p className="text-gray-400">قطعة</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Types */}
      <h3 className="text-xl font-bold text-white mb-4">التقارير المتاحة</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 p-4 rounded-xl">
                <Factory className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-bold">تقرير الإنتاج</h4>
                <p className="text-gray-400 text-sm">تفاصيل أوامر الإنتاج</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500/20 p-4 rounded-xl">
                <Scissors className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h4 className="text-white font-bold">تقرير الأقمشة</h4>
                <p className="text-gray-400 text-sm">استهلاك ومخزون الأقمشة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500/20 p-4 rounded-xl">
                <Package className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <h4 className="text-white font-bold">تقرير الخامات</h4>
                <p className="text-gray-400 text-sm">استهلاك ومخزون الخامات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/20 p-4 rounded-xl">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h4 className="text-white font-bold">تقرير الأداء</h4>
                <p className="text-gray-400 text-sm">مقارنة الإنتاج</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-teal-500/20 p-4 rounded-xl">
                <FileText className="w-8 h-8 text-teal-400" />
              </div>
              <div>
                <h4 className="text-white font-bold">تقرير شامل</h4>
                <p className="text-gray-400 text-sm">ملخص عام للمصنع</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
