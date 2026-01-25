import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowLeft, TrendingUp, DollarSign, ShoppingCart, Package } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function VendorReportsPage() {
  const session = await auth();

  if (!session || session.user?.role !== "VENDOR") {
    redirect("/auth/login");
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id }
  });

  if (!vendor) {
    redirect("/");
  }

  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id },
    include: { category: true }
  });

  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: { vendorId: vendor.id }
        }
      }
    },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  // حساب الإحصائيات
  const totalRevenue = orders
    .filter(o => o.status === 'DELIVERED')
    .reduce((sum, order) => {
      const vendorItems = order.items.filter(item => item.product.vendorId === vendor.id);
      return sum + vendorItems.reduce((s, item) => s + (item.price * item.quantity), 0);
    }, 0);

  const pendingRevenue = orders
    .filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'REJECTED')
    .reduce((sum, order) => {
      const vendorItems = order.items.filter(item => item.product.vendorId === vendor.id);
      return sum + vendorItems.reduce((s, item) => s + (item.price * item.quantity), 0);
    }, 0);

  const totalSales = orders
    .filter(o => o.status === 'DELIVERED')
    .reduce((sum, order) => {
      const vendorItems = order.items.filter(item => item.product.vendorId === vendor.id);
      return sum + vendorItems.reduce((s, item) => s + item.quantity, 0);
    }, 0);

  const topProducts = products
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 5);

  const lowStockProducts = products
    .filter(p => p.stock <= 10 && p.stock > 0)
    .sort((a, b) => a.stock - b.stock);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/vendor">
              <Button variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-teal-400" />
                التقارير والإحصائيات
              </h1>
              <p className="text-gray-400 mt-1">تقارير شاملة عن أداء متجرك</p>
            </div>
          </div>
        </div>

        {/* Revenue Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-200 text-sm">إجمالي الإيرادات</p>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{totalRevenue.toFixed(2)} ج.م</p>
              <p className="text-green-300 text-xs">من الطلبات المكتملة</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-orange-200 text-sm">إيرادات معلقة</p>
                <TrendingUp className="h-8 w-8 text-orange-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{pendingRevenue.toFixed(2)} ج.م</p>
              <p className="text-orange-300 text-xs">من الطلبات الجارية</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-200 text-sm">إجمالي المبيعات</p>
                <ShoppingCart className="h-8 w-8 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{totalSales}</p>
              <p className="text-blue-300 text-xs">قطعة مباعة</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-400" />
              أكثر المنتجات مبيعاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">لا توجد مبيعات حتى الآن</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-bold">{product.nameAr}</p>
                        <p className="text-gray-400 text-sm">{product.category?.nameAr}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-teal-400 font-bold">{product.soldCount} مبيعات</p>
                      <p className="text-gray-400 text-sm">{product.price} ج.م</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-red-400" />
                تنبيه: مخزون منخفض
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{product.nameAr}</p>
                      <p className="text-gray-400 text-sm">{product.category?.nameAr}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-red-400 font-bold">{product.stock} قطعة</p>
                      <p className="text-gray-400 text-sm">متبقي</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
