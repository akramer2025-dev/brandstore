import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, FileText, ArrowLeft, Download, Plus, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function VendorVouchersPage() {
  const session = await auth();

  if (!session || session.user?.role !== "VENDOR") {
    redirect("/auth/login");
  }

  // Get vendor
  const vendor = await prisma.vendor.findFirst({
    where: {
      user: {
        id: session.user.id
      }
    }
  });

  if (!vendor) {
    redirect("/");
  }

  // جلب سندات القبض (المدفوعات للشريك)
  const receiptVouchers = await prisma.vendorPayout.findMany({
    where: {
      vendorId: vendor.id,
      status: 'COMPLETED'
    },
    orderBy: {
      paidAt: 'desc'
    },
    take: 20
  });

  // جلب سندات الصرف (العمولات والخصومات)
  const paymentVouchers = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: {
            vendorId: vendor.id
          }
        }
      },
      status: 'DELIVERED'
    },
    include: {
      items: {
        where: {
          product: {
            vendorId: vendor.id
          }
        },
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 20
  });

  // حساب الإحصائيات
  const totalReceived = receiptVouchers.reduce((sum, v) => sum + v.amount, 0);
  const totalCommission = paymentVouchers.reduce((sum, order) => {
    const vendorTotal = order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
    return sum + (vendorTotal * (vendor.commissionRate / 100));
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <Link href="/vendor" className="inline-flex items-center gap-2 text-teal-100 hover:text-white mb-2 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            العودة للوحة التحكم
          </Link>
          <h1 className="text-4xl font-bold drop-shadow-lg flex items-center gap-3">
            <Receipt className="w-10 h-10" />
            سندات القبض والصرف
          </h1>
          <p className="text-teal-100 mt-2 text-lg">إدارة السندات المالية</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5 text-green-600" />
                إجمالي المقبوضات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{totalReceived.toFixed(2)} جنيه</p>
              <p className="text-sm text-gray-500 mt-1">{receiptVouchers.length} سند قبض</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5 text-red-600" />
                إجمالي العمولات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{totalCommission.toFixed(2)} جنيه</p>
              <p className="text-sm text-gray-500 mt-1">{paymentVouchers.length} عملية بيع</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                الصافي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{(totalReceived - totalCommission).toFixed(2)} جنيه</p>
              <p className="text-sm text-gray-500 mt-1">الرصيد الحالي</p>
            </CardContent>
          </Card>
        </div>

        {/* Vouchers Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* سندات القبض */}
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownCircle className="w-6 h-6 text-green-600" />
                سندات القبض
              </CardTitle>
              <p className="text-sm text-gray-600">المبالغ المستلمة من المنصة</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {receiptVouchers.map((voucher) => (
                  <div key={voucher.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <p className="font-semibold text-green-800">سند قبض #{voucher.reference}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {voucher.paidAt ? new Date(voucher.paidAt).toLocaleDateString('ar-EG') : 'غير محدد'}
                      </p>
                      {voucher.notes && (
                        <p className="text-xs text-gray-500 mt-1">{voucher.notes}</p>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-xl font-bold text-green-600">+{voucher.amount.toFixed(2)} جنيه</p>
                      <Button size="sm" variant="outline" className="mt-2">
                        <Download className="w-3 h-3 ml-1" />
                        تحميل
                      </Button>
                    </div>
                  </div>
                ))}

                {receiptVouchers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>لا توجد سندات قبض حتى الآن</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* سندات الصرف (العمولات) */}
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpCircle className="w-6 h-6 text-red-600" />
                سندات الصرف (العمولات)
              </CardTitle>
              <p className="text-sm text-gray-600">العمولات المخصومة من المبيعات</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentVouchers.map((order) => {
                  const vendorTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                  const commission = vendorTotal * (vendor.commissionRate / 100);
                  
                  return (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-red-600" />
                          <p className="font-semibold text-red-800">سند صرف #{order.orderNumber}</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          عمولة {vendor.commissionRate}% من {vendorTotal.toFixed(2)} جنيه
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-xl font-bold text-red-600">-{commission.toFixed(2)} جنيه</p>
                        <Button size="sm" variant="outline" className="mt-2">
                          <Download className="w-3 h-3 ml-1" />
                          تحميل
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {paymentVouchers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>لا توجد عمليات بيع حتى الآن</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
