"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Database, 
  ArrowLeft,
  Table,
  Users,
  Package,
  ShoppingCart,
  RefreshCw,
  CheckCircle,
  Activity
} from "lucide-react"
import Link from "next/link"

interface DatabaseStats {
  users: number
  products: number
  orders: number
  vendors: number
  customers: number
  revenue: number
}

export default function DeveloperDatabasePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/login")
      return
    }

    if (session.user.role !== "DEVELOPER") {
      router.push("/")
      return
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user.role === "DEVELOPER") {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/developer/database-stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "DEVELOPER") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/developer">
              <Button variant="outline" size="icon" className="bg-gray-800 border-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                🗄️ إدارة قاعدة البيانات
              </h1>
              <p className="text-gray-400">عرض إحصائيات وأدوات قاعدة البيانات</p>
            </div>
          </div>

          <Button
            onClick={fetchStats}
            variant="outline"
            className="bg-gray-800 border-gray-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            تحديث
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">إجمالي المستخدمين</p>
                  <p className="text-4xl font-bold text-blue-400">{stats?.users || 0}</p>
                  <div className="mt-2 space-y-1 text-xs text-gray-400">
                    <p>• عملاء: {stats?.customers || 0}</p>
                    <p>• شركاء: {stats?.vendors || 0}</p>
                  </div>
                </div>
                <Users className="w-16 h-16 text-blue-400 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">إجمالي المنتجات</p>
                  <p className="text-4xl font-bold text-green-400">{stats?.products || 0}</p>
                </div>
                <Package className="w-16 h-16 text-green-400 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">إجمالي الطلبات</p>
                  <p className="text-4xl font-bold text-purple-400">{stats?.orders || 0}</p>
                </div>
                <ShoppingCart className="w-16 h-16 text-purple-400 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Database Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-green-500" />
                حالة قاعدة البيانات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">الاتصال</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-400">متصل</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">نوع القاعدة</span>
                <span className="text-purple-400">PostgreSQL</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">المزود</span>
                <span className="text-blue-400">Neon</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="w-6 h-6 text-blue-500" />
                الجداول الرئيسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-3 bg-gray-800/50 rounded-lg flex items-center justify-between">
                <span className="text-gray-400">👥 User</span>
                <span className="text-blue-400">{stats?.users || 0} سجل</span>
              </div>

              <div className="p-3 bg-gray-800/50 rounded-lg flex items-center justify-between">
                <span className="text-gray-400">📦 Product</span>
                <span className="text-green-400">{stats?.products || 0} سجل</span>
              </div>

              <div className="p-3 bg-gray-800/50 rounded-lg flex items-center justify-between">
                <span className="text-gray-400">🛒 Order</span>
                <span className="text-purple-400">{stats?.orders || 0} سجل</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6 bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle>⚡ إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="bg-gray-800 border-gray-700 justify-start"
                onClick={() => window.open('https://console.neon.tech', '_blank')}
              >
                <Database className="w-5 h-5 mr-2" />
                فتح Neon Console
              </Button>

              <Button 
                variant="outline" 
                className="bg-gray-800 border-gray-700 justify-start"
                asChild
              >
                <Link href="/developer/users">
                  <Users className="w-5 h-5 mr-2" />
                  عرض المستخدمين
                </Link>
              </Button>

              <Button 
                variant="outline" 
                className="bg-gray-800 border-gray-700 justify-start"
                asChild
              >
                <Link href="/admin/products">
                  <Package className="w-5 h-5 mr-2" />
                  عرض المنتجات
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
