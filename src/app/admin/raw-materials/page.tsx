import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Package, AlertCircle, TrendingDown, ArrowLeft } from "lucide-react";

export default async function RawMaterialsPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  // جلب المواد الخام
  const materials = await prisma.rawMaterial.findMany({
    orderBy: {
      nameAr: "asc"
    },
    include: {
      movements: {
        take: 1,
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  // إحصائيات
  const stats = {
    total: materials.length,
    lowStock: materials.filter(m => m.quantity <= m.minQuantity).length,
    totalValue: materials.reduce((sum, m) => sum + (m.totalValue || 0), 0)
  };

  const categoryLabels: Record<string, string> = {
    FABRIC: "أقمشة",
    THREAD: "خيوط",
    BUTTON: "أزرار",
    ZIPPER: "سحابات",
    ACCESSORY: "إكسسوارات",
    PACKAGING: "تغليف",
    OTHER: "أخرى"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Package className="h-8 w-8 text-teal-400" />
                إدارة المواد الخام
              </h1>
              <p className="text-gray-400 mt-1">مخزون الأقمشة والإكسسوارات والمواد</p>
            </div>
          </div>
          <Link href="/admin/raw-materials/create">
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
              <Plus className="h-5 w-5 ml-2" />
              إضافة مادة جديدة
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">إجمالي المواد</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <Package className="h-12 w-12 text-teal-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">قليلة المخزون</p>
                  <p className="text-3xl font-bold text-yellow-400">{stats.lowStock}</p>
                </div>
                <AlertCircle className="h-12 w-12 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">القيمة الإجمالية</p>
                  <p className="text-2xl font-bold text-teal-400">{stats.totalValue.toFixed(2)} ج.م</p>
                </div>
                <TrendingDown className="h-12 w-12 text-teal-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Materials List */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">قائمة المواد الخام</CardTitle>
          </CardHeader>
          <CardContent>
            {materials.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">لا توجد مواد خام حتى الآن</p>
                <Link href="/admin/raw-materials/create">
                  <Button className="mt-4 bg-gradient-to-r from-teal-600 to-cyan-600">
                    إضافة أول مادة
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold">المادة</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold">التصنيف</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold">الكمية</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold">الوحدة</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold">سعر الوحدة</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold">القيمة</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold">المورد</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((material) => (
                      <tr key={material.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-white font-medium">{material.nameAr}</td>
                        <td className="py-3 px-4 text-gray-300">{categoryLabels[material.category]}</td>
                        <td className="py-3 px-4">
                          <span className={`font-bold ${
                            material.quantity <= material.minQuantity 
                              ? 'text-red-400' 
                              : material.quantity <= material.minQuantity * 2
                              ? 'text-yellow-400'
                              : 'text-green-400'
                          }`}>
                            {material.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{material.unit}</td>
                        <td className="py-3 px-4 text-teal-400 font-bold">{material.unitPrice.toFixed(2)} ج.م</td>
                        <td className="py-3 px-4 text-cyan-400 font-bold">{(material.totalValue || 0).toFixed(2)} ج.م</td>
                        <td className="py-3 px-4 text-gray-300">{material.supplier || '-'}</td>
                        <td className="py-3 px-4">
                          {material.quantity <= material.minQuantity ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                              <AlertCircle className="h-3 w-3" />
                              نفذ تقريباً
                            </span>
                          ) : material.quantity <= material.minQuantity * 2 ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                              قليل
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              متوفر
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
