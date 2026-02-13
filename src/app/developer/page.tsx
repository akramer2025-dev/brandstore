"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Bell, 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Database,
  MessageCircle,
  Settings,
  BarChart3,
  FileText
} from "lucide-react"
import Link from "next/link"

interface ActionCardProps {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  color: string
}

function ActionCard({ title, description, href, icon, color }: ActionCardProps) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-purple-500/50 bg-gradient-to-br from-gray-900 to-gray-800">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 sm:gap-3">
            <div className={`${color}`}>
              <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10">{icon}</div>
            </div>
            <span className="text-sm sm:text-base md:text-lg lg:text-xl">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function DeveloperDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

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

  if (status === "loading") {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            👨‍💻 لوحة تحكم المطور
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg">
            مرحباً {session.user.name} - إدارة كاملة للنظام
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">إجمالي العملاء</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-400">9</p>
                </div>
                <Users className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/30">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">إجمالي المنتجات</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-400">-</p>
                </div>
                <Package className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/30">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">إجمالي الطلبات</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-400">-</p>
                </div>
                <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-green-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 border-pink-500/30">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">الإيرادات</p>
                  <p className="text-2xl sm:text-3xl font-bold text-pink-400">-</p>
                </div>
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-pink-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <ActionCard
            title="🔔 إرسال إشعارات"
            description="إرسال إشعارات Push للعملاء مباشرة على أجهزتهم"
            href="/developer/notifications"
            icon={<Bell className="w-12 h-12" />}
            color="text-purple-600"
          />

          <ActionCard
            title="👥 إدارة المستخدمين"
            description="عرض وإدارة جميع المستخدمين في النظام"
            href="/developer/users"
            icon={<Users className="w-12 h-12" />}
            color="text-blue-600"
          />

          <ActionCard
            title="📦 إدارة المنتجات"
            description="عرض وتعديل جميع المنتجات في المتجر"
            href="/admin/products"
            icon={<Package className="w-12 h-12" />}
            color="text-green-600"
          />

          <ActionCard
            title="🛒 إدارة الطلبات"
            description="متابعة جميع الطلبات في النظام"
            href="/admin/orders"
            icon={<ShoppingCart className="w-12 h-12" />}
            color="text-yellow-600"
          />

          <ActionCard
            title="💬 الرسائل"
            description="عرض وإدارة رسائل العملاء"
            href="/admin/messages"
            icon={<MessageCircle className="w-12 h-12" />}
            color="text-teal-600"
          />

          <ActionCard
            title="📊 التقارير والإحصائيات"
            description="عرض تقارير مفصلة عن أداء المتجر"
            href="/admin/reports"
            icon={<BarChart3 className="w-12 h-12" />}
            color="text-orange-600"
          />

          <ActionCard
            title="🗄️ قاعدة البيانات"
            description="أدوات إدارة وفحص قاعدة البيانات"
            href="/developer/database"
            icon={<Database className="w-12 h-12" />}
            color="text-red-600"
          />

          <ActionCard
            title="📝 سجلات النظام"
            description="عرض سجلات وأخطاء النظام"
            href="/developer/logs"
            icon={<FileText className="w-12 h-12" />}
            color="text-indigo-600"
          />

          <ActionCard
            title="⚙️ إعدادات النظام"
            description="إعدادات متقدمة للنظام والتطبيق"
            href="/developer/settings"
            icon={<Settings className="w-12 h-12" />}
            color="text-gray-600"
          />
        </div>

        {/* Footer Note */}
        <div className="mt-4 sm:mt-6 md:mt-8 text-center">
          <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/30">
            <CardContent className="p-3 sm:p-4">
              <p className="text-gray-400 text-xs sm:text-sm">
                🔒 أنت تصل كمطور - لديك صلاحيات كاملة على النظام
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
