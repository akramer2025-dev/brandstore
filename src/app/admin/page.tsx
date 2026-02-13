import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, Truck, Users, TrendingUp, AlertCircle, Factory, Package2, Receipt, BarChart3, Megaphone, MessageCircle, Settings, LogOut, MapPin, Bell, Bot, Eye, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { BackButton } from "@/components/BackButton";
import VisitorStatsCard from "@/components/VisitorStatsCard";

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
    totalUsers,
    totalCustomers,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }), // عد المنتجات النشطة فقط
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { stock: { lte: 10 }, isActive: true } }), // منتجات قليلة المخزون والنشطة
    prisma.deliveryStaff.count(),
    prisma.user.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  // حساب العملاء اللي اشتروا فعلاً (عملوا order)
  const actualBuyers = await prisma.order.findMany({
    select: { customerId: true },
    distinct: ['customerId'],
  });
  const actualBuyersCount = actualBuyers.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <div className="relative z-10 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white py-4 sm:py-6 md:py-8 shadow-2xl">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex justify-between items-center flex-wrap gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              {/* Logo */}
              <img 
                src="/logo.png" 
                alt="Remostore" 
                className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 object-contain drop-shadow-2xl"
              />
              <div>
                <BackButton fallbackUrl="/" label="العودة" className="mb-1 sm:mb-2 text-xs sm:text-sm" />
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold drop-shadow-lg">لوحة الإدارة</h1>
                <p className="text-purple-100 mt-0.5 sm:mt-1 text-xs sm:text-sm md:text-base lg:text-lg">مرحبًا {session.user?.name || "المدير"}</p>
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
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                <LogOut className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
                <span className="sm:hidden">خروج</span>
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 relative z-10">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
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

        {/* Visitor & Users Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <VisitorStatsCard />
          <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/40 backdrop-blur-sm rounded-xl p-4 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-emerald-500/30 rounded-lg">
                <Users className="w-5 h-5 text-emerald-300" />
              </div>
              <h3 className="text-lg font-bold text-white">المستخدمين المسجلين</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 rounded-lg p-3 text-center border border-emerald-400/30">
                <p className="text-emerald-200 text-xs mb-1">الإجمالي</p>
                <p className="text-2xl font-black text-white">{totalUsers}</p>
              </div>
              <div className="bg-gradient-to-br from-teal-500/30 to-teal-600/30 rounded-lg p-3 text-center border border-teal-400/30">
                <p className="text-teal-200 text-xs mb-1">العملاء</p>
                <p className="text-2xl font-black text-white">{totalCustomers}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/40 backdrop-blur-sm rounded-xl p-4 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-orange-500/30 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-orange-300" />
              </div>
              <h3 className="text-lg font-bold text-white">اشتروا فعلياً</h3>
            </div>
            <div className="space-y-2">
              <div className="text-center">
                <p className="text-4xl font-black text-white mb-1">{actualBuyersCount}</p>
                <p className="text-orange-200 text-xs">عميل قام بالشراء</p>
              </div>
              <div className="bg-orange-500/20 rounded-lg p-2 text-center border border-orange-400/30">
                <p className="text-orange-300 text-xs mb-1">نسبة التحويل</p>
                <p className="text-2xl font-black text-white">
                  {totalCustomers > 0 ? Math.round((actualBuyersCount / totalCustomers) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
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
            title="🚀 مركز التسويق المتكامل"
            description="جميع أدوات التسويق والذكاء الاصطناعي في مكان واحد - AI Marketing, Campaign Manager, Ads Fixer, Preview, Traditional Marketing والتحليلات"
            href="/admin/marketing-center"
            icon={<Megaphone className="w-12 h-12" />}
            color="text-purple-600"
          />
          <ActionCard
            title="🎯 Media Buyer + مساعد الحملات"
            description="مساعد ذكي يعطيك كل إعدادات ونصوص الحملات جاهزة للنسخ لـ Facebook Ads - إنشاء إعلانات احترافية في دقائق!"
            href="/admin/media-buyer"
            icon={<Target className="w-12 h-12" />}
            color="text-pink-600"
          />
          <ActionCard
            title="💬 مركز المحادثات والرسائل"
            description="جميع أنواع المحادثات والرسائل في مكان واحد - محادثات العملاء المباشرة مع رسائل المساعد الذكي AI"
            href="/admin/messages-center"
            icon={<MessageCircle className="w-12 h-12" />}
            color="text-green-600"
          />
          <ActionCard
            title="إدارة المخزون"
            description="متابعة وتحديث كميات المخزون"
            href="/admin/inventory"
            icon={<Package className="w-12 h-12" />}
            color="text-yellow-600"
          />
          <ActionCard
            title="🤖 بوت Messenger"
            description="رد تلقائي ذكي 24/7 على رسائل Facebook Messenger"
            href="/admin/messenger-bot"
            icon={<Bot className="w-12 h-12" />}
            color="text-blue-600"
          />
          <ActionCard
            title="� إدارة الإشعارات"
            description="إرسال إشعارات للعملاء مباشرة على أجهزتهم"
            href="/admin/push-notifications"
            icon={<Bell className="w-12 h-12" />}
            color="text-purple-600"
          />
          <ActionCard
            title="�🚚 شحنات بوسطة"
            description="إدارة ومتابعة شحنات شركة بوسطة"
            href="/admin/shipping"
            icon={<Truck className="w-12 h-12" />}
            color="text-blue-600"
          />
          <ActionCard            title="📦 كتالوج المنتجات (Product Feed)"
            description="كتالوج XML/CSV لاستخدامه في Facebook Ads و Google Shopping"
            href="/admin/product-catalog"
            icon={<Package2 className="w-12 h-12" />}
            color="text-green-600"
          />
          <ActionCard            title="🗺️ أسعار التوصيل"
            description="إدارة وتعديل رسوم التوصيل لكل محافظة"
            href="/admin/delivery-zones"
            icon={<MapPin className="w-12 h-12" />}
            color="text-cyan-600"
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
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">{title}</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">{value}</p>
          </div>
          <div className={`${color} text-white p-2 sm:p-3 rounded-lg shadow-lg`}>
            <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8">{icon}</div>
          </div>
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
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <div className={`${color} mb-2 sm:mb-3 md:mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">{icon}</div>
          </div>
          <CardTitle className="text-sm sm:text-base md:text-lg lg:text-xl text-white group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent transition-all">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          <p className="text-xs sm:text-sm text-gray-300 group-hover:text-gray-200 transition-colors line-clamp-2">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

