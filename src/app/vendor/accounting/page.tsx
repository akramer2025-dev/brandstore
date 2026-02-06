import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle,
  FileText,
  Receipt,
  CreditCard,
  Wallet,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  Filter,
  Search
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function VendorAccountingPage() {
  const session = await auth();

  if (!session || session.user?.role !== "VENDOR") {
    redirect("/auth/login");
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
    include: { payouts: true }
  });

  if (!vendor) {
    redirect("/");
  }

  // جلب جميع البيانات المحاسبية
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

  // جلب المشتريات
  const purchases = await prisma.purchase.findMany({
    where: { vendorId: vendor.id },
    orderBy: { purchaseDate: 'desc' }
  });

  // جلب المصروفات
  const expenses = await prisma.capitalTransaction.findMany({
    where: { 
      vendorId: vendor.id,
      type: 'WITHDRAWAL'
    },
    orderBy: { createdAt: 'desc' }
  });

  // جلب الإيداعات
  const deposits = await prisma.capitalTransaction.findMany({
    where: { 
      vendorId: vendor.id,
      type: 'DEPOSIT'
    },
    orderBy: { createdAt: 'desc' }
  });

  // حسابات مفصلة
  const completedRevenue = orders
    .filter(o => o.status === 'DELIVERED')
    .reduce((sum, order) => {
      const vendorItems = order.items.filter(item => item.product.vendorId === vendor.id);
      const orderTotal = vendorItems.reduce((s, item) => s + (item.price * item.quantity), 0);
      return sum + (orderTotal * (1 - vendor.commissionRate / 100));
    }, 0);

  const pendingRevenue = orders
    .filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'REJECTED')
    .reduce((sum, order) => {
      const vendorItems = order.items.filter(item => item.product.vendorId === vendor.id);
      const orderTotal = vendorItems.reduce((s, item) => s + (item.price * item.quantity), 0);
      return sum + (orderTotal * (1 - vendor.commissionRate / 100));
    }, 0);

  const totalCommission = orders
    .filter(o => o.status === 'DELIVERED')
    .reduce((sum, order) => {
      const vendorItems = order.items.filter(item => item.product.vendorId === vendor.id);
      const orderTotal = vendorItems.reduce((s, item) => s + (item.price * item.quantity), 0);
      return sum + (orderTotal * (vendor.commissionRate / 100));
    }, 0);

  const totalPurchases = purchases.reduce((sum, p) => sum + p.totalCost, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);

  const totalPaidOut = vendor.payouts
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayout = vendor.payouts
    .filter(p => p.status === 'PENDING' || p.status === 'PROCESSING')
    .reduce((sum, p) => sum + p.amount, 0);

  const netProfit = completedRevenue - totalPurchases - totalExpenses;
  const availableBalance = completedRevenue - totalPaidOut;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-2 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Link href="/vendor">
              <Button variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-white/20 text-white h-8 w-8 sm:h-10 sm:w-10">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-lg sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <FileText className="h-5 w-5 sm:h-8 sm:w-8 text-indigo-400" />
                نظام الحسابات المتكامل
              </h1>
              <p className="text-gray-400 mt-0.5 text-xs sm:text-sm">إدارة مالية شاملة وتقارير محاسبية</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-xs sm:text-sm h-8 sm:h-10 flex-1 sm:flex-none">
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              تقرير Excel
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-xs sm:text-sm h-8 sm:h-10 flex-1 sm:flex-none">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              فلتر
            </Button>
          </div>
        </div>

        {/* بطاقة الإيرادات الرئيسية */}
        <Card className="mb-4 sm:mb-6 bg-gradient-to-r from-emerald-600/35 to-green-600/35 border-emerald-500/50 shadow-xl shadow-emerald-500/30 backdrop-blur-xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-emerald-500/30 p-3 sm:p-4 rounded-2xl">
                  <DollarSign className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-300" />
                </div>
                <div>
                  <p className="text-emerald-200 text-xs sm:text-sm font-semibold mb-1">إجمالي الإيرادات</p>
                  <p className="text-2xl sm:text-5xl font-bold text-white">{completedRevenue.toLocaleString()}</p>
                  <p className="text-emerald-300 text-sm sm:text-base mt-1">جنيه مصري</p>
                </div>
              </div>
              <div className="text-left">
                <div className="bg-blue-500/20 px-3 sm:px-4 py-2 rounded-lg border border-blue-500/30 mb-2">
                  <p className="text-blue-300 text-[10px] sm:text-xs">معلق</p>
                  <p className="text-white font-bold text-sm sm:text-lg">{pendingRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-green-500/20 px-3 sm:px-4 py-2 rounded-lg border border-green-500/30">
                  <p className="text-green-300 text-[10px] sm:text-xs">مكتمل</p>
                  <p className="text-white font-bold text-sm sm:text-lg">{completedRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* إحصائيات مالية شاملة */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <Card className="bg-gradient-to-br from-emerald-600/30 to-green-600/30 border-emerald-500/40 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-6">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-300 mb-1.5 sm:mb-3" />
              <p className="text-emerald-200 text-[10px] sm:text-sm mb-0.5 sm:mb-1">صافي الربح</p>
              <p className="text-lg sm:text-3xl font-bold text-white">{netProfit.toFixed(0)}</p>
              <p className="text-emerald-300 text-[10px] sm:text-xs mt-0.5 sm:mt-1">ج.م</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-purple-500/40 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-6">
              <Receipt className="h-6 w-6 sm:h-8 sm:w-8 text-purple-300 mb-1.5 sm:mb-3" />
              <p className="text-purple-200 text-[10px] sm:text-sm mb-0.5 sm:mb-1">المشتريات</p>
              <p className="text-lg sm:text-3xl font-bold text-white">{totalPurchases.toFixed(0)}</p>
              <p className="text-purple-300 text-[10px] sm:text-xs mt-0.5 sm:mt-1">ج.م</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-600/30 to-rose-600/30 border-red-500/40 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-6">
              <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-300 mb-1.5 sm:mb-3" />
              <p className="text-red-200 text-[10px] sm:text-sm mb-0.5 sm:mb-1">المصروفات</p>
              <p className="text-lg sm:text-3xl font-bold text-white">{totalExpenses.toFixed(0)}</p>
              <p className="text-red-300 text-[10px] sm:text-xs mt-0.5 sm:mt-1">ج.م</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-600/30 to-amber-600/30 border-yellow-500/40 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-6">
              <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-300 mb-1.5 sm:mb-3" />
              <p className="text-yellow-200 text-[10px] sm:text-sm mb-0.5 sm:mb-1">الإيداعات</p>
              <p className="text-lg sm:text-3xl font-bold text-white">{totalDeposits.toFixed(0)}</p>
              <p className="text-yellow-300 text-[10px] sm:text-xs mt-0.5 sm:mt-1">ج.م</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600/30 to-amber-600/30 border-orange-500/40 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-6">
              <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-orange-300 mb-1.5 sm:mb-3" />
              <p className="text-orange-200 text-[10px] sm:text-sm mb-0.5 sm:mb-1">العمولات</p>
              <p className="text-lg sm:text-3xl font-bold text-white">{totalCommission.toFixed(0)}</p>
              <p className="text-orange-300 text-[10px] sm:text-xs mt-0.5 sm:mt-1">ج.م</p>
            </CardContent>
          </Card>
        </div>

        {/* التقارير والتحليلات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
          {/* قائمة الدخل */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-400" />
                قائمة الدخل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <span className="text-green-200 text-sm">إيرادات المبيعات</span>
                <span className="text-white font-bold">+{completedRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <span className="text-blue-200 text-sm">إيرادات معلقة</span>
                <span className="text-white font-bold">+{pendingRevenue.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/10 my-2"></div>
              <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <span className="text-red-200 text-sm">تكلفة المشتريات</span>
                <span className="text-white font-bold">-{totalPurchases.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <span className="text-orange-200 text-sm">المصروفات</span>
                <span className="text-white font-bold">-{totalExpenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <span className="text-yellow-200 text-sm">العمولات</span>
                <span className="text-white font-bold">-{totalCommission.toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-white/20 my-2"></div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-lg border-2 border-emerald-500/40">
                <span className="text-emerald-200 font-bold text-lg">صافي الربح</span>
                <span className="text-white font-black text-2xl">{netProfit.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* الميزانية */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-400" />
                الميزانية العمومية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">الأصول</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <span className="text-blue-200 text-sm">الرصيد المتاح</span>
                    <span className="text-white font-bold">{availableBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <span className="text-cyan-200 text-sm">مدفوعات معلقة</span>
                    <span className="text-white font-bold">{pendingPayout.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <span className="text-green-200 text-sm">إيرادات معلقة</span>
                    <span className="text-white font-bold">{pendingRevenue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-white/10 my-3"></div>
              <div>
                <p className="text-gray-400 text-sm mb-2">الخصوم</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <span className="text-red-200 text-sm">عمولات مستحقة</span>
                    <span className="text-white font-bold">{totalCommission.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <span className="text-orange-200 text-sm">مدفوعات منجزة</span>
                    <span className="text-white font-bold">{totalPaidOut.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="border-t-2 border-white/20 my-3"></div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg border-2 border-indigo-500/40">
                <span className="text-indigo-200 font-bold text-lg">صافي القيمة</span>
                <span className="text-white font-black text-2xl">{(availableBalance + pendingRevenue - totalCommission).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* سجل المدفوعات والمعاملات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* سجل المدفوعات */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-teal-400" />
                  سجل المدفوعات
                </CardTitle>
                <Button size="sm" className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-xs sm:text-sm h-7 sm:h-9">
                  طلب سحب
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {vendor.payouts.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400">لا توجد مدفوعات حتى الآن</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {vendor.payouts.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-white/5">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-bold text-sm">{payout.amount.toFixed(2)} ج.م</p>
                          {payout.status === 'COMPLETED' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 text-xs">
                              <CheckCircle className="h-2.5 w-2.5" />
                              مكتمل
                            </span>
                          ) : payout.status === 'PENDING' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-xs">
                              <Clock className="h-2.5 w-2.5" />
                              معلق
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs">
                              <Clock className="h-2.5 w-2.5" />
                              قيد المعالجة
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs">{new Date(payout.createdAt).toLocaleDateString('ar-EG')}</p>
                        {payout.reference && (
                          <p className="text-gray-500 text-xs">#{payout.reference}</p>
                        )}
                        <p className="text-gray-400 text-xs mt-1">{payout.method}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* أحدث المعاملات */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Receipt className="h-5 w-5 text-purple-400" />
                أحدث المعاملات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {orders.slice(0, 15).map((order) => {
                  const vendorItems = order.items.filter(item => item.product.vendorId === vendor.id);
                  const orderTotal = vendorItems.reduce((s, item) => s + (item.price * item.quantity), 0);
                  const commission = orderTotal * (vendor.commissionRate / 100);
                  const netAmount = orderTotal - commission;

                  return (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-white/5">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-medium text-sm">#{order.id.slice(0, 8)}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-300' :
                            order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {order.status === 'DELIVERED' ? 'مكتمل' : 
                             order.status === 'CANCELLED' ? 'ملغي' : 'معلق'}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs">{order.customer?.name || 'عميل'}</p>
                        <p className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-emerald-400 font-bold text-sm">{netAmount.toFixed(2)} ج.م</p>
                        <p className="text-gray-500 text-xs">عمولة: {commission.toFixed(2)}</p>
                        <p className="text-gray-600 text-xs">الإجمالي: {orderTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* تقارير إضافية */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Link href="/vendor/reports/financial">
            <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/30 hover:border-indigo-400/50 transition-all cursor-pointer">
              <CardContent className="p-4 sm:p-6 text-center">
                <FileText className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-indigo-400" />
                <h3 className="text-white font-bold text-sm sm:text-base mb-1">التقارير المالية</h3>
                <p className="text-gray-400 text-xs sm:text-sm">تقارير تفصيلية شاملة</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/vendor/purchases">
            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer">
              <CardContent className="p-4 sm:p-6 text-center">
                <Receipt className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-purple-400" />
                <h3 className="text-white font-bold text-sm sm:text-base mb-1">فواتير المشتريات</h3>
                <p className="text-gray-400 text-xs sm:text-sm">عرض جميع الفواتير</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/vendor/capital">
            <Card className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-500/30 hover:border-yellow-400/50 transition-all cursor-pointer">
              <CardContent className="p-4 sm:p-6 text-center">
                <Wallet className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-yellow-400" />
                <h3 className="text-white font-bold text-sm sm:text-base mb-1">إدارة رأس المال</h3>
                <p className="text-gray-400 text-xs sm:text-sm">الودائع والسحوبات</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
