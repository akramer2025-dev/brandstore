import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ShoppingCart, Package, Users, DollarSign } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BackButton } from "@/components/BackButton";

export default async function AdminReportsPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  // Fetch statistics
  const [
    totalOrders,
    totalRevenue,
    totalProducts,
    totalCustomers,
    recentOrders,
    topProducts,
    lowStockProducts,
  ] = await Promise.all([
    // Total orders
    prisma.order.count(),
    
    // Total revenue (only completed orders)
    prisma.order.aggregate({
      where: { status: "DELIVERED" },
      _sum: { totalAmount: true },
    }),
    
    // Total products
    prisma.product.count(),
    
    // Total customers
    prisma.user.count({
      where: { role: "CUSTOMER" },
    }),
    
    // Recent orders with details
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, email: true } },
        items: { include: { product: true } },
      },
    }),
    
    // Top selling products
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
    
    // Low stock products
    prisma.product.findMany({
      where: { stock: { lt: 10 } },
      orderBy: { stock: "asc" },
      take: 10,
    }),
  ]);

  // Get product details for top products
  const topProductsWithDetails = await Promise.all(
    topProducts.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { category: true },
      });
      return {
        ...product,
        totalSold: item._sum.quantity || 0,
      };
    })
  );

  // Calculate order statistics by status
  const ordersByStatus = await prisma.order.groupBy({
    by: ["status"],
    _count: true,
  });

  const statusCounts = {
    PENDING: 0,
    PROCESSING: 0,
    OUT_FOR_DELIVERY: 0,
    DELIVERED: 0,
    CANCELLED: 0,
    RETURNED: 0,
  };

  ordersByStatus.forEach((item) => {
    statusCounts[item.status as keyof typeof statusCounts] = item._count;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <BackButton fallbackUrl="/admin" label="العودة للوحة الإدارة" className="mb-2" />
          <h1 className="text-4xl font-bold drop-shadow-lg flex items-center gap-3">
            <TrendingUp className="w-10 h-10" />
            التقارير والإحصائيات
          </h1>
          <p className="text-teal-100 mt-2 text-lg">نظرة شاملة على أداء المتجر</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 relative z-10 space-y-8">
        {/* Main Statistics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">إجمالي الإيرادات</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {totalRevenue._sum.totalAmount?.toFixed(2) || 0} جنيه
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">إجمالي الطلبات</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {totalOrders}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Products */}
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">إجمالي المنتجات</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {totalProducts}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Customers */}
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">إجمالي العملاء</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {totalCustomers}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders by Status */}
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle>الطلبات حسب الحالة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-600 mb-1">قيد الانتظار</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.PENDING}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">قيد المعالجة</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.PROCESSING}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600 mb-1">قيد التوصيل</p>
                <p className="text-2xl font-bold text-purple-600">{statusCounts.OUT_FOR_DELIVERY}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1">تم التوصيل</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.DELIVERED}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-gray-600 mb-1">ملغاة</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.CANCELLED}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-gray-600 mb-1">مرتجعة</p>
                <p className="text-2xl font-bold text-orange-600">{statusCounts.RETURNED}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Products & Low Stock */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Selling Products */}
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle>المنتجات الأكثر مبيعًا</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProductsWithDetails.slice(0, 5).map((product: any, index: number) => (
                  <div
                    key={product?.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{product?.name}</p>
                        <p className="text-sm text-gray-600">{product?.category?.name}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-teal-600">{product?.totalSold} قطعة</p>
                      <p className="text-sm text-gray-600">{product?.price} جنيه</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Products */}
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle>منتجات قليلة المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.price} جنيه</p>
                      </div>
                      <div className="text-left">
                        <p className={`font-bold ${
                          product.stock === 0 ? 'text-red-600' :
                          product.stock < 5 ? 'text-orange-600' : 'text-yellow-600'
                        }`}>
                          {product.stock} قطعة
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.stock === 0 ? 'نفذ المخزون' : 'مخزون منخفض'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">جميع المنتجات متوفرة بكميات كافية</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle>أحدث الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-2">رقم الطلب</th>
                    <th className="text-right py-3 px-2">العميل</th>
                    <th className="text-right py-3 px-2">المبلغ</th>
                    <th className="text-right py-3 px-2">الحالة</th>
                    <th className="text-right py-3 px-2">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-teal-50/50 transition-colors">
                      <td className="py-3 px-2 font-mono text-sm">#{order.id.slice(0, 8)}</td>
                      <td className="py-3 px-2">{order.customer.name}</td>
                      <td className="py-3 px-2 font-bold">{order.totalAmount} جنيه</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                          order.status === "OUT_FOR_DELIVERY" ? "bg-purple-100 text-purple-700" :
                          order.status === "PREPARING" ? "bg-blue-100 text-blue-700" :
                          order.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                          order.status === "REJECTED" ? "bg-orange-100 text-orange-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {order.status === "DELIVERED" ? "تم التوصيل" :
                           order.status === "OUT_FOR_DELIVERY" ? "قيد التوصيل" :
                           order.status === "PREPARING" ? "قيد التحضير" :
                           order.status === "CANCELLED" ? "ملغى" :
                           order.status === "REJECTED" ? "مرفوض" : "قيد الانتظار"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
