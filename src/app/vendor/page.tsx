import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ShoppingCart, BarChart3, Users, Settings, Warehouse, DollarSign, TrendingUp, Clock, CheckCircle, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function VendorDashboard() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'VENDOR' || !session.user.vendorType) {
    redirect('/');
  }

  // الحصول على معلومات الـ Vendor
  const vendor = await prisma.vendor.findUnique({
    where: {
      userId: session.user.id
    }
  });

  if (!vendor) {
    redirect('/');
  }

  // جلب منتجات الشريك
  const products = await prisma.product.findMany({
    where: {
      vendorId: vendor.id
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // جلب الطلبات
  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: {
            vendorId: vendor.id
          }
        }
      }
    },
    include: {
      items: {
        include: {
          product: true
        }
      },
      customer: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // حساب الإحصائيات
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;
  const totalRevenue = orders
    .filter(o => o.status === 'DELIVERED')
    .reduce((sum, order) => sum + order.totalAmount, 0);
  const lowStockProducts = products.filter(p => p.stock <= 10 && p.stock > 0).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;

  const vendorTypeArabic = {
    store: 'متجر',
    factory: 'مصنع',
    stationery: 'مكتبة',
    pharmacy: 'صيدلية',
    general: 'عام'
  }[session.user.vendorType] || session.user.vendorType;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400 font-semibold">نشط</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {session.user.name} - {vendorTypeArabic}
          </h1>
          <p className="text-gray-300">لوحة تحكم الشريك</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* إجمالي المنتجات */}
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/20 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">إجمالي المنتجات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-white">{totalProducts}</p>
                  <p className="text-xs text-gray-400 mt-1">منتج نشط</p>
                </div>
                <Package className="w-12 h-12 text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* إجمالي الطلبات */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/20 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">إجمالي الطلبات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-white">{totalOrders}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    <span className="text-orange-400">{pendingOrders} قيد الانتظار</span>
                  </p>
                </div>
                <ShoppingCart className="w-12 h-12 text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* إجمالي الإيرادات */}
          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 hover:shadow-xl hover:shadow-green-500/20 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">إجمالي الإيرادات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-white">{totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">جنيه مصري</p>
                </div>
                <DollarSign className="w-12 h-12 text-green-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* المخزون */}
          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/20 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">حالة المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-white">{lowStockProducts + outOfStockProducts}</p>
                  <p className="text-xs text-red-400 mt-1">
                    {outOfStockProducts} نفذ • {lowStockProducts} قليل
                  </p>
                </div>
                <Warehouse className="w-12 h-12 text-orange-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/vendor/products">
            <Card className="hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-800 to-purple-900 border-purple-500/30 cursor-pointer animate-card-float">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <Package className="w-6 h-6 text-purple-400" />
                  إدارة المنتجات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">إضافة وتعديل المنتجات</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/vendor/orders">
            <Card className="hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-800 to-cyan-900 border-cyan-500/30 cursor-pointer animate-card-float">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <ShoppingCart className="w-6 h-6 text-cyan-400" />
                  إدارة الطلبات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">متابعة وتنفيذ الطلبات</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/vendor/inventory">
            <Card className="hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-800 to-orange-900 border-orange-500/30 cursor-pointer animate-card-float">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <Warehouse className="w-6 h-6 text-orange-400" />
                  إدارة المخزون
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">متابعة حالة المخزون</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/vendor/accounting">
            <Card className="hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-800 to-green-900 border-green-500/30 cursor-pointer animate-card-float">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <DollarSign className="w-6 h-6 text-green-400" />
                  المحاسبة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">الإيرادات والمدفوعات</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/vendor/vouchers">
            <Card className="hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-800 to-purple-900 border-purple-500/30 cursor-pointer animate-card-float">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <Receipt className="w-6 h-6 text-purple-400" />
                  السندات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">سندات القبض والصرف</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Reports Link */}
        <Link href="/vendor/reports">
          <Card className="hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-800 to-blue-900 border-blue-500/30 cursor-pointer mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <BarChart3 className="w-6 h-6 text-blue-400" />
                التقارير والإحصائيات الشاملة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">تحليل مفصل للمبيعات والأداء والمنتجات الأكثر مبيعاً</p>
            </CardContent>
          </Card>
        </Link>

        {/* Recent Products */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              أحدث المنتجات ({products.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.slice(0, 6).map((product) => {
                  const firstImage = product.images?.split(',')[0]?.trim() || '/placeholder.jpg';
                  return (
                    <Link key={product.id} href={`/products/${product.id}`}>
                      <div className="bg-gray-900/50 rounded-lg p-4 hover:bg-gray-900 transition-all hover:shadow-lg hover:shadow-purple-500/20 group">
                        <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden">
                          <Image
                            src={firstImage}
                            alt={product.nameAr}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {product.stock === 0 && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                              <span className="text-red-400 font-bold">نفذ من المخزون</span>
                            </div>
                          )}
                        </div>
                        <h3 className="text-white font-semibold mb-1 line-clamp-1">{product.nameAr}</h3>
                        <p className="text-gray-400 text-sm mb-2">{product.category.nameAr}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-green-400 font-bold">{product.price} ج.م</span>
                          <span className={`text-sm ${product.stock <= 10 ? 'text-orange-400' : 'text-gray-400'}`}>
                            المخزون: {product.stock}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 mb-4">لا توجد منتجات حتى الآن</p>
                <Link href="/admin/products">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                    إضافة منتج جديد
                  </button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-cyan-400" />
              أحدث الطلبات ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="bg-gray-900/50 rounded-lg p-4 hover:bg-gray-900 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          order.status === 'PENDING' ? 'bg-orange-400' :
                          order.status === 'DELIVERED' ? 'bg-green-400' :
                          'bg-blue-400'
                        } animate-pulse`}></div>
                        <span className="text-white font-semibold">طلب #{order.id.slice(0, 8)}</span>
                        <span className="text-gray-400 text-sm">{order.customer?.name || 'عميل'}</span>
                      </div>
                      <span className="text-green-400 font-bold">{order.totalAmount} ج.م</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {order.status === 'PENDING' ? (
                          <>
                            <Clock className="w-4 h-4 text-orange-400" />
                            <span className="text-orange-400">قيد الانتظار</span>
                          </>
                        ) : order.status === 'DELIVERED' ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-green-400">مكتمل</span>
                          </>
                        ) : (
                          <span className="text-blue-400">{order.status}</span>
                        )}
                      </div>
                      <span className="text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      {order.items.length} منتج
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">لا توجد طلبات حتى الآن</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
