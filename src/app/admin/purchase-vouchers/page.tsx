import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, FileText, DollarSign, Package, TrendingUp, ArrowLeft } from "lucide-react";

export default async function PurchaseVouchersPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  // جلب سندات الصرف
  const vouchers = await prisma.paymentVoucher.findMany({
    where: {
      type: "EXPENSE" // صرف فقط
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 50
  });

  // إحصائيات
  const stats = {
    total: vouchers.length,
    pending: vouchers.filter(v => v.status === "PENDING").length,
    approved: vouchers.filter(v => v.status === "APPROVED").length,
    totalAmount: vouchers
      .filter(v => v.status === "APPROVED")
      .reduce((sum, v) => sum + v.amount, 0)
  };

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800"
  };

  const statusLabels = {
    PENDING: "قيد الانتظار",
    APPROVED: "معتمد",
    REJECTED: "مرفوض"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/accounting">
              <Button variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <FileText className="h-8 w-8 text-teal-400" />
                سندات الصرف
              </h1>
              <p className="text-gray-400 mt-1">إدارة سندات صرف المشتريات والنفقات</p>
            </div>
          </div>
          <Link href="/admin/purchase-vouchers/create">
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
              <Plus className="h-5 w-5 ml-2" />
              سند صرف جديد
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">إجمالي السندات</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <FileText className="h-12 w-12 text-teal-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">قيد الانتظار</p>
                  <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
                </div>
                <Package className="h-12 w-12 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">معتمد</p>
                  <p className="text-3xl font-bold text-green-400">{stats.approved}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">إجمالي المبلغ</p>
                  <p className="text-2xl font-bold text-teal-400">{stats.totalAmount.toFixed(2)} ج.م</p>
                </div>
                <DollarSign className="h-12 w-12 text-teal-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vouchers List */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">قائمة سندات الصرف</CardTitle>
          </CardHeader>
          <CardContent>
            {vouchers.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">لا توجد سندات صرف حتى الآن</p>
                <Link href="/admin/purchase-vouchers/create">
                  <Button className="mt-4 bg-gradient-to-r from-teal-600 to-cyan-600">
                    إنشاء سند صرف
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold">رقم السند</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold">التاريخ</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold">المستلم</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold">التصنيف</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold">المبلغ</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold">الحالة</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vouchers.map((voucher) => (
                      <tr key={voucher.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-white font-medium">{voucher.voucherNumber}</td>
                        <td className="py-3 px-4 text-gray-300">{new Date(voucher.createdAt).toLocaleDateString('ar-EG')}</td>
                        <td className="py-3 px-4 text-gray-300">{voucher.recipientName || '-'}</td>
                        <td className="py-3 px-4 text-gray-300">{voucher.category || '-'}</td>
                        <td className="py-3 px-4 text-teal-400 font-bold">{voucher.amount.toFixed(2)} ج.م</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[voucher.status]}`}>
                            {statusLabels[voucher.status]}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/admin/purchase-vouchers/${voucher.id}`}>
                            <Button size="sm" variant="outline" className="border-teal-600 text-teal-400 hover:bg-teal-600/20">
                              عرض التفاصيل
                            </Button>
                          </Link>
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
