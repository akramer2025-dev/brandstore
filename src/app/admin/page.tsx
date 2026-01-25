import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, Truck, Users, TrendingUp, AlertCircle, Factory, Package2, Receipt, BarChart3, Megaphone, MessageCircle, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  // جلب إحصائيات المتجر
  const [
    totalProducts,
    totalOrders,
    pendingOrders,
    lowStockProducts,
    totalDeliveryStaff,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { stock: { lte: 10 } } }),
    prisma.deliveryStaff.count(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <div className="relative z-10 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold drop-shadow-lg">لوحة الإدارة</h1>
          <p className="text-teal-100 mt-2 text-lg">مرحبًا {session.user?.name || "المدير"}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="إجمالي المنتجات"
            value={totalProducts.toString()}
            icon={<Package className="w-8 h-8" />}
            color="bg-blue-500"
          />
          <StatCard
            title="إجمالي الطلبات"
            value={totalOrders.toString()}
            icon={<ShoppingBag className="w-8 h-8" />}
            color="bg-green-500"
          />
          <StatCard
            title="طلبات قيد الانتظار"
            value={pendingOrders.toString()}
            icon={<TrendingUp className="w-8 h-8" />}
            color="bg-yellow-500"
          />
          <StatCard
            title="موظفي التوصيل"
            value={totalDeliveryStaff.toString()}
            icon={<Truck className="w-8 h-8" />}
            color="bg-teal-500"
          />
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts > 0 && (
          <Card className="mb-8 border-yellow-500 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertCircle />
                تحذير: منتجات على وشك النفاد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                يوجد {lowStockProducts} منتج بكمية قليلة في المخزون
              </p>
              <Button asChild>
                <Link href="/admin/inventory">عرض المخزون</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActionCard
            title="إدارة المنتجات"
            description="إضافة وتعديل وحذف المنتجات"
            href="/admin/products"
            icon={<Package className="w-12 h-12" />}
            color="text-blue-600"
          />
          <ActionCard
            title="إدارة الطلبات"
            description="متابعة وإدارة طلبات العملاء"
            href="/admin/orders"
            icon={<ShoppingBag className="w-12 h-12" />}
            color="text-green-600"
          />
          <ActionCard
            title="🏭 المخزون والإنتاج"
            description="إدارة الأقمشة، المواد الخام، والإنتاج"
            href="/admin/warehouse"
            icon={<Factory className="w-12 h-12" />}
            color="text-indigo-600"
          />
          <ActionCard
            title="الحسابات والمالية"
            description="سندات القبض والصرف والتقارير المالية"
            href="/admin/accounting"
            icon={<Receipt className="w-12 h-12" />}
            color="text-orange-600"
          />
          <ActionCard
            title="التسويق والـ SEO"
            description="إدارة الحملات وGoogle Ads والتحليلات"
            href="/admin/marketing"
            icon={<BarChart3 className="w-12 h-12" />}
            color="text-purple-600"
          />
          <ActionCard
            title="🎯 Media Buyer AI"
            description="تحليل الإعلانات، ROAS، CPA، وتحسين الميزانية بالذكاء الاصطناعي"
            href="/admin/media-buyer"
            icon={<Megaphone className="w-12 h-12" />}
            color="text-pink-600"
          />
          <ActionCard
            title="إدارة المخزون"
            description="متابعة وتحديث كميات المخزون"
            href="/admin/inventory"
            icon={<Package className="w-12 h-12" />}
            color="text-yellow-600"
          />
          <ActionCard
            title="💬 محادثات العملاء"
            description="التواصل مع العملاء والرد على استفساراتهم"
            href="/admin/messages"
            icon={<MessageCircle className="w-12 h-12" />}
            color="text-teal-600"
          />
          <ActionCard
            title="موظفي التوصيل"
            description="إدارة فريق التوصيل"
            href="/admin/delivery-staff"
            icon={<Truck className="w-12 h-12" />}
            color="text-red-600"
          />
          <ActionCard
            title="التقارير والإحصائيات"
            description="تقارير المبيعات والأداء"
            href="/admin/reports"
            icon={<TrendingUp className="w-12 h-12" />}
            color="text-indigo-600"
          />
          <ActionCard
            title="العملاء"
            description="عرض وإدارة بيانات العملاء"
            href="/admin/customers"
            icon={<Users className="w-12 h-12" />}
            color="text-cyan-600"
          />
          <ActionCard
            title="⚙️ إعدادات الموقع"
            description="إعدادات الموقع والسلايدر وSEO"
            href="/admin/settings"
            icon={<Settings className="w-12 h-12" />}
            color="text-gray-600"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">{value}</p>
          </div>
          <div className={`${color} text-white p-3 rounded-lg shadow-lg`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionCard({
  title,
  description,
  href,
  icon,
  color,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Link href={href}>
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 hover:shadow-2xl transition-all duration-300 cursor-pointer h-full hover:-translate-y-2 hover:bg-white/90 group">
        <CardHeader>
          <div className={`${color} mb-4 transform group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
          <CardTitle className="text-xl group-hover:text-teal-600 transition-colors">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 group-hover:text-gray-800 transition-colors">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

