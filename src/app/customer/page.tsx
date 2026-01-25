import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { ShoppingBag, Heart, Package, User, CreditCard, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function CustomerDashboard() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'CUSTOMER') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            مرحباً، {session.user.name}
          </h1>
          <p className="text-gray-300">لوحة تحكم العميل</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* طلباتي */}
          <Link href="/orders">
            <Card className="hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-800 to-teal-900 border-cyan-500/30 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <Package className="w-6 h-6 text-cyan-400" />
                  طلباتي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">تتبع طلباتك وحالتها</p>
              </CardContent>
            </Card>
          </Link>

          {/* المفضلة */}
          <Link href="/wishlist">
            <Card className="hover:shadow-xl hover:shadow-pink-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-800 to-pink-900 border-pink-500/30 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <Heart className="w-6 h-6 text-pink-400" />
                  المفضلة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">المنتجات المفضلة لديك</p>
              </CardContent>
            </Card>
          </Link>

          {/* السلة */}
          <Link href="/cart">
            <Card className="hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-800 to-blue-900 border-blue-500/30 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <ShoppingBag className="w-6 h-6 text-blue-400" />
                  سلة التسوق
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">أكمل عملية الشراء</p>
              </CardContent>
            </Card>
          </Link>

          {/* الملف الشخصي */}
          <Link href="/profile">
            <Card className="hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-800 to-purple-900 border-purple-500/30 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <User className="w-6 h-6 text-purple-400" />
                  الملف الشخصي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">إدارة بياناتك الشخصية</p>
              </CardContent>
            </Card>
          </Link>

          {/* المنتجات */}
          <Link href="/products">
            <Card className="hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-800 to-green-900 border-green-500/30 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <ShoppingBag className="w-6 h-6 text-green-400" />
                  تصفح المنتجات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">اكتشف منتجات جديدة</p>
              </CardContent>
            </Card>
          </Link>

          {/* العناوين */}
          <Link href="/profile#addresses">
            <Card className="hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-800 to-orange-900 border-orange-500/30 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <MapPin className="w-6 h-6 text-orange-400" />
                  عناويني
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">إدارة عناوين التوصيل</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
