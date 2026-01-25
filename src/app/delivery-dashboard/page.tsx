import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Truck, MapPin, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DeliveryDashboard() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'DELIVERY_STAFF') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400 font-semibold">متاح للتوصيل</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            مرحباً، {session.user.name}
          </h1>
          <p className="text-gray-300">لوحة تحكم مندوب التوصيل</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* طلبات التوصيل */}
          <Link href="/delivery">
            <Card className="hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-800 to-blue-900 border-blue-500/30 cursor-pointer animate-card-float">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <Truck className="w-6 h-6 text-blue-400 animate-bounce-scale" />
                  طلبات التوصيل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">الطلبات المخصصة لك</p>
              </CardContent>
            </Card>
          </Link>

          {/* الطلبات قيد التنفيذ */}
          <Link href="/delivery?status=in-progress">
            <Card className="hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-800 to-orange-900 border-orange-500/30 cursor-pointer animate-card-float">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <Clock className="w-6 h-6 text-orange-400 animate-spin-slow" />
                  قيد التوصيل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">الطلبات الجاري توصيلها</p>
              </CardContent>
            </Card>
          </Link>

          {/* الطلبات المكتملة */}
          <Link href="/delivery?status=completed">
            <Card className="hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-800 to-green-900 border-green-500/30 cursor-pointer animate-card-float">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  مكتملة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">الطلبات المكتملة</p>
              </CardContent>
            </Card>
          </Link>

          {/* المواقع */}
          <Link href="/delivery?view=map">
            <Card className="hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-800 to-purple-900 border-purple-500/30 cursor-pointer animate-card-float">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <MapPin className="w-6 h-6 text-purple-400 animate-pulse" />
                  المواقع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">عرض مواقع التوصيل</p>
              </CardContent>
            </Card>
          </Link>

          {/* جميع الطلبات */}
          <Link href="/delivery?view=all">
            <Card className="hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-800 to-cyan-900 border-cyan-500/30 cursor-pointer animate-card-float">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <Package className="w-6 h-6 text-cyan-400" />
                  جميع الطلبات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">عرض كل الطلبات</p>
              </CardContent>
            </Card>
          </Link>

          {/* المشاكل */}
          <Link href="/delivery?status=issues">
            <Card className="hover:shadow-xl hover:shadow-red-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-800 to-red-900 border-red-500/30 cursor-pointer animate-card-float">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <AlertCircle className="w-6 h-6 text-red-400 animate-pulse" />
                  المشاكل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">طلبات بها مشاكل</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
