import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Warehouse, ArrowLeft, Package, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function VendorInventoryPage() {
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
    include: { category: true },
    orderBy: { stock: 'asc' }
  });

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;

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
                <Warehouse className="h-8 w-8 text-teal-400" />
                إدارة المخزون
              </h1>
              <p className="text-gray-400 mt-1">متابعة وإدارة مخزون المنتجات</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <Package className="h-8 w-8 text-blue-400 mb-3" />
              <p className="text-blue-200 text-sm mb-1">إجمالي القطع</p>
              <p className="text-3xl font-bold text-white">{totalStock}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <CheckCircle className="h-8 w-8 text-green-400 mb-3" />
              <p className="text-green-200 text-sm mb-1">قيمة المخزون</p>
              <p className="text-2xl font-bold text-white">{totalValue.toFixed(0)} ج.م</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <AlertTriangle className="h-8 w-8 text-orange-400 mb-3" />
              <p className="text-orange-200 text-sm mb-1">مخزون منخفض</p>
              <p className="text-3xl font-bold text-white">{lowStock}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <AlertTriangle className="h-8 w-8 text-red-400 mb-3" />
              <p className="text-red-200 text-sm mb-1">نفذ من المخزن</p>
              <p className="text-3xl font-bold text-white">{outOfStock}</p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">تفاصيل المخزون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-right py-3 px-4 text-gray-300 font-medium">المنتج</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-medium">الفئة</th>
                    <th className="text-center py-3 px-4 text-gray-300 font-medium">الكمية</th>
                    <th className="text-center py-3 px-4 text-gray-300 font-medium">السعر</th>
                    <th className="text-center py-3 px-4 text-gray-300 font-medium">القيمة</th>
                    <th className="text-center py-3 px-4 text-gray-300 font-medium">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <p className="text-white font-medium">{product.nameAr}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-300">{product.category?.nameAr}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <p className="text-white font-bold">{product.stock}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <p className="text-teal-400">{product.price} ج.م</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <p className="text-white font-bold">{(product.stock * product.price).toFixed(0)} ج.م</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {product.stock === 0 ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm">
                            <AlertTriangle className="h-3 w-3" />
                            نفذ
                          </span>
                        ) : product.stock <= 10 ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-sm">
                            <AlertTriangle className="h-3 w-3" />
                            منخفض
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">
                            <CheckCircle className="h-3 w-3" />
                            متوفر
                          </span>
                        )}
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
