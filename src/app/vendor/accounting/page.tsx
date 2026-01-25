import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ArrowLeft, TrendingUp, TrendingDown, Clock, CheckCircle } from "lucide-react";
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

  // حساب الإيرادات
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

  const totalPaidOut = vendor.payouts
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayout = vendor.payouts
    .filter(p => p.status === 'PENDING' || p.status === 'PROCESSING')
    .reduce((sum, p) => sum + p.amount, 0);

  const availableBalance = completedRevenue - totalPaidOut;

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
                <DollarSign className="h-8 w-8 text-teal-400" />
                المحاسبة والمدفوعات
              </h1>
              <p className="text-gray-400 mt-1">إدارة الإيرادات والمدفوعات</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm mb-1">نسبة العمولة</p>
            <p className="text-2xl font-bold text-orange-400">{vendor.commissionRate}%</p>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 text-green-400 mb-3" />
              <p className="text-green-200 text-sm mb-1">الرصيد المتاح</p>
              <p className="text-3xl font-bold text-white">{availableBalance.toFixed(2)}</p>
              <p className="text-green-300 text-xs mt-1">ج.م</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <DollarSign className="h-8 w-8 text-blue-400 mb-3" />
              <p className="text-blue-200 text-sm mb-1">إجمالي الإيرادات</p>
              <p className="text-3xl font-bold text-white">{completedRevenue.toFixed(2)}</p>
              <p className="text-blue-300 text-xs mt-1">ج.م</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <Clock className="h-8 w-8 text-orange-400 mb-3" />
              <p className="text-orange-200 text-sm mb-1">إيرادات معلقة</p>
              <p className="text-3xl font-bold text-white">{pendingRevenue.toFixed(2)}</p>
              <p className="text-orange-300 text-xs mt-1">ج.م</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <TrendingDown className="h-8 w-8 text-red-400 mb-3" />
              <p className="text-red-200 text-sm mb-1">إجمالي العمولات</p>
              <p className="text-3xl font-bold text-white">{totalCommission.toFixed(2)}</p>
              <p className="text-red-300 text-xs mt-1">ج.م</p>
            </CardContent>
          </Card>
        </div>

        {/* Payouts Section */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">سجل المدفوعات</CardTitle>
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
              طلب سحب
            </Button>
          </CardHeader>
          <CardContent>
            {vendor.payouts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">لا توجد مدفوعات حتى الآن</p>
            ) : (
              <div className="space-y-4">
                {vendor.payouts.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                    <div>
                      <p className="text-white font-bold">{payout.amount.toFixed(2)} ج.م</p>
                      <p className="text-gray-400 text-sm">{new Date(payout.createdAt).toLocaleDateString('ar-EG')}</p>
                      {payout.reference && (
                        <p className="text-gray-500 text-xs">رقم المرجع: {payout.reference}</p>
                      )}
                    </div>
                    <div className="text-left">
                      {payout.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">
                          <CheckCircle className="h-3 w-3" />
                          مكتمل
                        </span>
                      ) : payout.status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-sm">
                          <Clock className="h-3 w-3" />
                          معلق
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm">
                          <Clock className="h-3 w-3" />
                          قيد المعالجة
                        </span>
                      )}
                      <p className="text-gray-400 text-xs mt-1">{payout.method}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">المعاملات الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 10).map((order) => {
                const vendorItems = order.items.filter(item => item.product.vendorId === vendor.id);
                const orderTotal = vendorItems.reduce((s, item) => s + (item.price * item.quantity), 0);
                const commission = orderTotal * (vendor.commissionRate / 100);
                const netAmount = orderTotal - commission;

                return (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">طلب #{order.id.slice(0, 8)}</p>
                      <p className="text-gray-400 text-sm">{order.customer?.name || 'عميل'}</p>
                      <p className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-teal-400 font-bold">{netAmount.toFixed(2)} ج.م</p>
                      <p className="text-gray-500 text-xs">العمولة: {commission.toFixed(2)} ج.م</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
