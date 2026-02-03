import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { 
  Truck, 
  MapPin, 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Navigation,
  Phone,
  Star,
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function DeliveryDashboard() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'DELIVERY_STAFF') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-violet-600 p-4 rounded-2xl shadow-2xl">
                  <Truck className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                  <Badge className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                    متاح للتوصيل
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-indigo-200 to-violet-200 bg-clip-text text-transparent">
                  مرحباً، {session.user.name}
                </h1>
                <p className="text-indigo-300 mt-1">لوحة تحكم مندوب التوصيل</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-indigo-600/20 backdrop-blur-xl border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition-all"></div>
              <CardContent className="p-5 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-blue-300/80 text-sm font-medium">طلبات اليوم</p>
                    <p className="text-3xl font-bold text-white mt-2">12</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-3 rounded-xl shadow-lg shadow-blue-500/30">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-orange-600/20 backdrop-blur-xl border-amber-500/30 hover:border-amber-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/20 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-all"></div>
              <CardContent className="p-5 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-amber-300/80 text-sm font-medium">قيد التوصيل</p>
                    <p className="text-3xl font-bold text-white mt-2">3</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-3 rounded-xl shadow-lg shadow-amber-500/30">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-teal-600/20 backdrop-blur-xl border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/20 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl group-hover:bg-emerald-400/20 transition-all"></div>
              <CardContent className="p-5 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-emerald-300/80 text-sm font-medium">مكتمل</p>
                    <p className="text-3xl font-bold text-white mt-2">8</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-3 rounded-xl shadow-lg shadow-emerald-500/30">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-violet-500/20 via-violet-600/10 to-purple-600/20 backdrop-blur-xl border-violet-500/30 hover:border-violet-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/20 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-400/10 rounded-full blur-2xl group-hover:bg-violet-400/20 transition-all"></div>
              <CardContent className="p-5 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-violet-300/80 text-sm font-medium">التقييم</p>
                    <p className="text-3xl font-bold text-white mt-2 flex items-center gap-1">
                      4.8
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-violet-400 to-purple-500 p-3 rounded-xl shadow-lg shadow-violet-500/30">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Access Title */}
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Target className="w-6 h-6 text-indigo-400" />
            الوصول السريع
          </h3>

          {/* Main Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* طلبات التوصيل */}
            <Link href="/delivery">
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600/40 to-indigo-700/40 backdrop-blur-xl border-blue-400/40 hover:border-blue-300/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 cursor-pointer group h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-3 rounded-xl shadow-xl shadow-blue-500/40 group-hover:scale-110 transition-transform">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    طلبات التوصيل
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-blue-200">الطلبات المخصصة لك</p>
                  <Badge className="mt-3 bg-blue-500/30 text-blue-200 border border-blue-400/30">
                    12 طلب جديد
                  </Badge>
                </CardContent>
              </Card>
            </Link>

            {/* الطلبات قيد التنفيذ */}
            <Link href="/delivery?status=in-progress">
              <Card className="relative overflow-hidden bg-gradient-to-br from-amber-600/40 to-orange-700/40 backdrop-blur-xl border-amber-400/40 hover:border-amber-300/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/30 cursor-pointer group h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl"></div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-3 rounded-xl shadow-xl shadow-amber-500/40 group-hover:scale-110 transition-transform">
                      <Clock className="w-6 h-6 text-white animate-pulse" />
                    </div>
                    قيد التوصيل
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-amber-200">الطلبات الجاري توصيلها</p>
                  <Badge className="mt-3 bg-amber-500/30 text-amber-200 border border-amber-400/30">
                    3 طلبات نشطة
                  </Badge>
                </CardContent>
              </Card>
            </Link>

            {/* الطلبات المكتملة */}
            <Link href="/delivery?status=completed">
              <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-600/40 to-teal-700/40 backdrop-blur-xl border-emerald-400/40 hover:border-emerald-300/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30 cursor-pointer group h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl"></div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-3 rounded-xl shadow-xl shadow-emerald-500/40 group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    مكتملة
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-emerald-200">الطلبات المكتملة</p>
                  <Badge className="mt-3 bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                    8 طلبات اليوم
                  </Badge>
                </CardContent>
              </Card>
            </Link>

            {/* المواقع */}
            <Link href="/delivery?view=map">
              <Card className="relative overflow-hidden bg-gradient-to-br from-violet-600/40 to-purple-700/40 backdrop-blur-xl border-violet-400/40 hover:border-violet-300/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/30 cursor-pointer group h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-400/20 rounded-full blur-3xl"></div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="bg-gradient-to-br from-violet-400 to-purple-500 p-3 rounded-xl shadow-xl shadow-violet-500/40 group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6 text-white animate-bounce" />
                    </div>
                    المواقع
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-violet-200">عرض مواقع التوصيل</p>
                  <Badge className="mt-3 bg-violet-500/30 text-violet-200 border border-violet-400/30">
                    <Navigation className="w-3 h-3 ml-1" />
                    خريطة تفاعلية
                  </Badge>
                </CardContent>
              </Card>
            </Link>

            {/* جميع الطلبات */}
            <Link href="/delivery?view=all">
              <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-600/40 to-teal-700/40 backdrop-blur-xl border-cyan-400/40 hover:border-cyan-300/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 cursor-pointer group h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl"></div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="bg-gradient-to-br from-cyan-400 to-teal-500 p-3 rounded-xl shadow-xl shadow-cyan-500/40 group-hover:scale-110 transition-transform">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    جميع الطلبات
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-cyan-200">عرض كل الطلبات</p>
                  <Badge className="mt-3 bg-cyan-500/30 text-cyan-200 border border-cyan-400/30">
                    السجل الكامل
                  </Badge>
                </CardContent>
              </Card>
            </Link>

            {/* المشاكل */}
            <Link href="/delivery?status=issues">
              <Card className="relative overflow-hidden bg-gradient-to-br from-red-600/40 to-rose-700/40 backdrop-blur-xl border-red-400/40 hover:border-red-300/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30 cursor-pointer group h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-400/20 rounded-full blur-3xl"></div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="bg-gradient-to-br from-red-400 to-rose-500 p-3 rounded-xl shadow-xl shadow-red-500/40 group-hover:scale-110 transition-transform">
                      <AlertCircle className="w-6 h-6 text-white animate-pulse" />
                    </div>
                    المشاكل
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-red-200">طلبات بها مشاكل</p>
                  <Badge className="mt-3 bg-red-500/30 text-red-200 border border-red-400/30">
                    1 مشكلة معلقة
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader className="border-b border-slate-700/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  اتصال سريع
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-all cursor-pointer">
                  <span className="text-white">الدعم الفني</span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    24/7
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-all cursor-pointer">
                  <span className="text-white">إدارة التوصيل</span>
                  <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    متاح الآن
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader className="border-b border-slate-700/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  أداؤك هذا الأسبوع
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <p className="text-3xl font-bold text-emerald-400">56</p>
                    <p className="text-sm text-emerald-300">طلب مكتمل</p>
                  </div>
                  <div className="text-center p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <p className="text-3xl font-bold text-amber-400">98%</p>
                    <p className="text-sm text-amber-300">نسبة النجاح</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
