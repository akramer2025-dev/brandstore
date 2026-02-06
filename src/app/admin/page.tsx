import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, Truck, Users, TrendingUp, AlertCircle, Factory, Package2, Receipt, BarChart3, Megaphone, MessageCircle, Settings, LogOut } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <div className="relative z-10 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <img 
                src="/logo.png" 
                alt="Remostore" 
                className="h-16 w-16 object-contain drop-shadow-2xl"
              />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold drop-shadow-lg">لوحة الإدارة</h1>
                <p className="text-purple-100 mt-1 text-base md:text-lg">مرحبًا {session.user?.name || "المدير"}</p>
              </div>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/auth/login" });
              }}
            >
              <Button
                type="submit"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <LogOut className="ml-2 h-5 w-5" />
                تسجيل الخروج
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="إجمالي المنتجات"
            value={totalProducts.toString()}
            icon={<Package className="w-8 h-8" />}
            color="bg-purple-500"
          />
          <StatCard
            title="إجمالي الطلبات"
            value={totalOrders.toString()}
            icon={<ShoppingBag className="w-8 h-8" />}
            color="bg-pink-500"
          />
          <StatCard
            title="طلبات قيد الانتظار"
            value={pendingOrders.toString()}
            icon={<TrendingUp className="w-8 h-8" />}
            color="bg-orange-500"
          />
          <StatCard
            title="موظفي التوصيل"
            value={totalDeliveryStaff.toString()}
            icon={<Truck className="w-8 h-8" />}
            color="bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts > 0 && (
          <Card className="mb-8 border-orange-500 border-2 bg-gray-800/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <AlertCircle />
                تحذير: منتجات على وشك النفاد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                يوجد {lowStockProducts} منتج بكمية قليلة في المخزون
              </p>
              <Button asChild className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
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
            title="🚚 شحنات بوسطة"
            description="إدارة ومتابعة شحنات شركة بوسطة"
            href="/admin/shipping"
            icon={<Truck className="w-12 h-12" />}
            color="text-blue-600"
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
            title="👥 إدارة الشركاء"
            description="إضافة وإدارة الشركاء ورأس المال"
            href="/admin/partners"
            icon={<Users className="w-12 h-12" />}
            color="text-emerald-600"
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
    <Card className="backdrop-blur-sm bg-gray-800/80 border-purple-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">{value}</p>
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
      <Card className="backdrop-blur-sm bg-gray-800/80 border-purple-500/30 hover:shadow-2xl transition-all duration-300 cursor-pointer h-full hover:-translate-y-2 hover:bg-gray-800/90 hover:border-pink-500/50 group">
        <CardHeader>
          <div className={`${color} mb-4 transform group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
          <CardTitle className="text-xl text-white group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent transition-all">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 group-hover:text-gray-200 transition-colors">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

