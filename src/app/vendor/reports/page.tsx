import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, ArrowLeft, TrendingUp, DollarSign, ShoppingCart, Package, 
  Users, FileText, Wallet, TrendingDown, Truck, 
  Receipt, Calculator, PieChart, AlertCircle, CheckCircle,
  Archive, UserCheck, Clock, CircleDollarSign, Boxes
} from "lucide-react";
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

  // جلب البيانات
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
      },
      customer: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // معاملات رأس المال
  const capitalTransactions = await prisma.capitalTransaction.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  //  فريق العمل - جميع موظفي التسويق
  const allMarketingStaff = await prisma.user.findMany({
    where: {
      role: 'MARKETING_STAFF'
    },
    include: {
      orders: {
        where: {
          items: {
            some: {
              product: { vendorId: vendor.id }
            }
          }
        },
        select: {
          id: true,
          finalAmount: true,
          status: true
        }
      }
    }
  });

  // فلترة فقط الموظفين Who have orders for this vendor
  const teamMembers = allMarketingStaff.filter((member: any) => 
    member.orders && member.orders.length > 0
  );

  // =================
  // حساب الإحصائيات
  // =================

  // 1. الإيرادات والمبيعات
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
  const totalRevenue = deliveredOrders.reduce((sum, order) => {
    const vendorItems = order.items.filter(item => item.product.vendorId === vendor.id);
    return sum + vendorItems.reduce((s, item) => s + (item.price * item.quantity), 0);
  }, 0);

  const pendingOrders = orders.filter(o => 
    o.status !== 'DELIVERED' && 
    o.status !== 'CANCELLED' && 
    o.status !== 'REJECTED'
  );
  const pendingRevenue = pendingOrders.reduce((sum, order) => {
    const vendorItems = order.items.filter(item => item.product.vendorId === vendor.id);
    return sum + vendorItems.reduce((s, item) => s + (item.price * item.quantity), 0);
  }, 0);

  const totalSales = deliveredOrders.reduce((sum, order) => {
    const vendorItems = order.items.filter(item => item.product.vendorId === vendor.id);
    return sum + vendorItems.reduce((s, item) => s + item.quantity, 0);
  }, 0);

  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED' || o.status === 'REJECTED');

  // 2. المخزون
  const stockStats = {
    totalProducts: products.length,
    inStock: products.filter(p => p.stock > 0).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
    totalValue: products.reduce((sum, p) => {
      const cost = p.supplierCost || p.productionCost || 0;
      return sum + (cost * p.stock);
    }, 0)
  };

  // 3. المقبوضات والمصروفات
  const receipts = capitalTransactions.filter(t => 
    ['DEPOSIT', 'SALE_PROFIT', 'CONSIGNMENT_PROFIT'].includes(t.type)
  );
  const expenses = capitalTransactions.filter(t => 
    ['PURCHASE', 'WITHDRAWAL', 'PAYMENT_TO_SUPPLIER'].includes(t.type)
  );

  const totalReceipts = receipts.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // 4. فريق العمل
  const teamStats = (teamMembers as any[]).map((member: any) => ({
    ...member,
    totalOrders: member.orders?.length || 0,
    totalRevenue: (member.orders || [])
      .filter((o: { status: string }) => o.status === 'DELIVERED')
      .reduce((sum: number, o: { finalAmount: number }) => sum + o.finalAmount, 0),
    pendingOrders: (member.orders || []).filter((o: { status: string }) => 
      o.status !== 'DELIVERED' && 
      o.status !== 'CANCELLED' && 
      o.status !== 'REJECTED'
    ).length
  }));

  // 5. أكثر المنتجات مبيعاً
  const topProducts = products
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 10);

  // 6. المنتجات المنخفضة المخزون
  const lowStockProducts = products
    .filter(p => p.stock > 0 && p.stock <= 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/vendor">
              <Button variant="outline" size="icon" className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 text-white">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="h-6 h-8 md:w-8 text-purple-400" />
                التقارير والإحصائيات الشاملة
              </h1>
              <p className="text-gray-300 mt-1 text-sm">تقارير مفصلة عن كل جوانب عملك</p>
            </div>
          </div>
        </div>

        {/* ========== القسم الأول: نظرة عامة سريعة ========== */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-400" />
            نظرة عامة سريعة
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-200 text-xs md:text-sm font-bold">💰 رأس المال</p>
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-2xl md:text-3xl font-black text-white">{vendor.capitalBalance?.toFixed(0) || 0}</p>
                <p className="text-xs text-green-300">الرصيد الحالي</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-200 text-xs md:text-sm font-bold">📦 المخزون</p>
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-2xl md:text-3xl font-black text-white">{stockStats.inStock}</p>
                <p className="text-xs text-blue-300">من {stockStats.totalProducts} منتج</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-purple-200 text-xs md:text-sm font-bold">🛒 الطلبات</p>
                  <ShoppingCart className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-2xl md:text-3xl font-black text-white">{orders.length}</p>
                <p className="text-xs text-purple-300">إجمالي الطلبات</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-emerald-200 text-xs md:text-sm font-bold">✅ المكتمل</p>
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-2xl md:text-3xl font-black text-white">{deliveredOrders.length}</p>
                <p className="text-xs text-emerald-300">طلب مكتمل</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ========== القسم الثاني: التقرير المحاسبي ========== */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-purple-400" />
            التقرير المحاسبي المفصل
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/5 backdrop-blur-xl border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-200 text-sm font-bold">إجمالي الإيرادات</p>
                  <TrendingUp className="w-7 h-7 text-green-400" />
                </div>
                <p className="text-3xl font-black text-white mb-1">{totalRevenue.toFixed(0)}</p>
                <p className="text-xs text-green-300">من {deliveredOrders.length} طلب مكتمل</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border-orange-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-orange-200 text-sm font-bold">إيرادات معلقة</p>
                  <Clock className="w-7 h-7 text-orange-400" />
                </div>
                <p className="text-3xl font-black text-white mb-1">{pendingRevenue.toFixed(0)}</p>
                <p className="text-xs text-orange-300">من {pendingOrders.length} طلب جاري</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-200 text-sm font-bold">صافي الربح</p>
                  <CircleDollarSign className="w-7 h-7 text-blue-400" />
                </div>
                <p className="text-3xl font-black text-white mb-1">{(totalRevenue - totalExpenses).toFixed(0)}</p>
                <p className="text-xs text-blue-300">بعد المصروفات</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ========== القسم الثالث: المقبوضات والمصروفات ========== */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-400" />
            المقبوضات والمصروفات
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  المقبوضات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <span className="text-green-200">إجمالي المقبوضات</span>
                    <span className="text-green-400 font-bold text-xl">{totalReceipts.toFixed(0)} ج</span>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {receipts.slice(0, 5).map((t, idx) => (
                      <div key={idx} className="flex justify-between text-sm p-2 bg-white/5 rounded">
                        <span className="text-gray-300">{t.descriptionAr || t.type}</span>
                        <span className="text-green-400">+{t.amount.toFixed(0)} ج</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  المصروفات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <span className="text-red-200">إجمالي المصروفات</span>
                    <span className="text-red-400 font-bold text-xl">{totalExpenses.toFixed(0)} ج</span>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {expenses.slice(0, 5).map((t, idx) => (
                      <div key={idx} className="flex justify-between text-sm p-2 bg-white/5 rounded">
                        <span className="text-gray-300">{t.descriptionAr || t.type}</span>
                        <span className="text-red-400">-{Math.abs(t.amount).toFixed(0)} ج</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ========== القسم الرابع: تقرير المخزون ========== */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Archive className="w-5 h-5 text-purple-400" />
            تقرير المخزون
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="p-4">
                <p className="text-gray-300 text-xs mb-1">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-white">{stockStats.totalProducts}</p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-xl border-green-500/20">
              <CardContent className="p-4">
                <p className="text-green-200 text-xs mb-1">متوفر</p>
                <p className="text-2xl font-bold text-green-400">{stockStats.inStock}</p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-xl border-red-500/20">
              <CardContent className="p-4">
                <p className="text-red-200 text-xs mb-1">نفذ</p>
                <p className="text-2xl font-bold text-red-400">{stockStats.outOfStock}</p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-xl border-orange-500/20">
              <CardContent className="p-4">
                <p className="text-orange-200 text-xs mb-1">مخزون منخفض</p>
                <p className="text-2xl font-bold text-orange-400">{stockStats.lowStock}</p>
              </CardContent>
            </Card>
          </div>

          {lowStockProducts.length > 0 && (
            <Card className="bg-white/5 backdrop-blur-xl border-orange-500/20 mt-4">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                  تنبيه: مخزون منخفض
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex justify-between items-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <div>
                        <p className="text-white font-medium text-sm">{product.nameAr}</p>
                        <p className="text-gray-400 text-xs">{product.category?.nameAr}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-orange-400 font-bold">{product.stock} قطعة</p>
                        <p className="text-gray-400 text-xs">متبقي</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ========== القسم الخامس: فريق العمل والموظفين ========== */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            تقرير فريق العمل والموظفين
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamStats.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 col-span-full">
                <CardContent className="p-8 text-center">
                  <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">لا يوجد أعضاء فريق حتى الآن</p>
                  <p className="text-gray-500 text-sm mt-1">يمكنك إضافة موظفين من قسم إدارة الفريق</p>
                </CardContent>
              </Card>
            ) : (
              teamStats.map((member) => (
                <Card key={member.id} className="bg-white/5 backdrop-blur-xl border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                        {member.name?.[0] || '👤'}
                      </div>
                      <div>
                        <p className="text-white font-bold">{member.name}</p>
                        <p className="text-gray-400 text-xs">{member.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">إجمالي الطلبات:</span>
                        <span className="text-white font-bold">{member.totalOrders}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">الطلبات المعلقة:</span>
                        <span className="text-orange-400 font-bold">{member.pendingOrders}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">الإيرادات:</span>
                        <span className="text-green-400 font-bold">{member.totalRevenue.toFixed(0)} ج</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* ========== القسم الثامن: أكثر المنتجات مبيعاً ========== */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            أكثر المنتجات مبيعاً
          </h2>
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-4">
              {topProducts.length === 0 ? (
                <p className="text-gray-400 text-center py-8">لا توجد مبيعات حتى الآن</p>
              ) : (
                <div className="space-y-2">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{product.nameAr}</p>
                          <p className="text-gray-400 text-xs">{product.category?.nameAr}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-bold">{product.soldCount} مبيعات</p>
                        <p className="text-gray-400 text-xs">{product.price.toFixed(0)} ج</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ========== القسم التاسع: آخر الفواتير/الطلبات ========== */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-purple-400" />
            آخر الفواتير والطلبات
          </h2>
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-4">
              <div className="space-y-2">
                {orders.slice(0, 10).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                    <div>
                      <p className="text-white font-medium text-sm">#{order.orderNumber.slice(0, 8)}</p>
                      <p className="text-gray-400 text-xs">{order.customer?.name || 'عميل'}</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-bold px-2 py-1 rounded ${
                        order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'PENDING' ? 'bg-orange-500/20 text-orange-400' :
                        order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {order.status === 'DELIVERED' ? '✅ مكتمل' :
                         order.status === 'PENDING' ? '⏳ معلق' :
                         order.status === 'CANCELLED' ? '❌ ملغي' :
                         '📦 جاري'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{order.finalAmount.toFixed(0)} ج</p>
                      <p className="text-gray-400 text-xs">{order.items.length} منتج</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========== القسم العاشر: إحصائيات إضافية ========== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Boxes className="w-5 h-5 text-purple-400" />
                حالة الطلبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-green-500/10 rounded">
                  <span className="text-green-200 text-sm">مكتملة</span>
                  <span className="text-green-400 font-bold">{deliveredOrders.length}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-orange-500/10 rounded">
                  <span className="text-orange-200 text-sm">معلقة</span>
                  <span className="text-orange-400 font-bold">{pendingOrders.length}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-500/10 rounded">
                  <span className="text-red-200 text-sm">ملغاة</span>
                  <span className="text-red-400 font-bold">{cancelledOrders.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                ملخص سريع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                  <span className="text-gray-300 text-sm">إجمالي العملاء</span>
                  <span className="text-white font-bold">{new Set(orders.map(o => o.customerId)).size}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                  <span className="text-gray-300 text-sm">متوسط قيمة الطلب</span>
                  <span className="text-white font-bold">
                    {orders.length > 0 ? (totalRevenue / deliveredOrders.length).toFixed(0) : 0} ج
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                  <span className="text-gray-300 text-sm">إجمالي القطع المباعة</span>
                  <span className="text-white font-bold">{totalSales}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
