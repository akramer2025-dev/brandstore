import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  // Build where clause based on status filter
  const whereClause: any = {};
  if (searchParams.status) {
    whereClause.status = searchParams.status;
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
      deliveryStaff: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const statusColors = {
    PENDING: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
    CONFIRMED: { bg: "bg-blue-100", text: "text-blue-800", icon: Package },
    PREPARING: { bg: "bg-cyan-100", text: "text-cyan-800", icon: Package },
    OUT_FOR_DELIVERY: { bg: "bg-teal-100", text: "text-teal-800", icon: Truck },
    DELIVERED: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
    REJECTED: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
    CANCELLED: { bg: "bg-gray-100", text: "text-gray-800", icon: XCircle },
  };

  const statusLabels = {
    PENDING: "قيد الانتظار",
    CONFIRMED: "تم التأكيد",
    PREPARING: "قيد التحضير",
    OUT_FOR_DELIVERY: "جاري التوصيل",
    DELIVERED: "تم التوصيل",
    REJECTED: "تم الرفض",
    CANCELLED: "ملغي",
    RETURNED: "مرتجعة",
    PROCESSING: "قيد المعالجة",
  };

  // Get filter status label
  const filterStatusLabel = searchParams.status ? statusLabels[searchParams.status as keyof typeof statusLabels] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <Link href="/admin" className="inline-flex items-center gap-2 text-teal-100 hover:text-white mb-2 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            العودة للوحة الإدارة
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold drop-shadow-lg flex items-center gap-3">
                <ShoppingBag className="w-10 h-10" />
                إدارة الطلبات
                {filterStatusLabel && (
                  <span className="text-2xl font-normal text-teal-100">- {filterStatusLabel}</span>
                )}
              </h1>
              <p className="text-teal-100 mt-2 text-lg">إجمالي الطلبات: {orders.length}</p>
            </div>
            {searchParams.status && (
              <Link href="/admin/orders">
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <XCircle className="w-4 h-4 ml-2" />
                  عرض جميع الطلبات
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusColors[order.status];
            const StatusIcon = status.icon;
            
            return (
              <Card key={order.id} className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">طلب رقم #{order.orderNumber.slice(0, 8)}</CardTitle>
                      <p className="text-sm text-gray-500">
                        العميل: {order.customer.name || order.customer.username} | {order.customer.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        الهاتف: {order.deliveryPhone}
                      </p>
                      <p className="text-sm text-gray-500">
                        العنوان: {order.deliveryAddress}
                      </p>
                    </div>
                    <div className="text-left space-y-2">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${status.bg} ${status.text} font-bold`}>
                        <StatusIcon className="w-5 h-5" />
                        {statusLabels[order.status]}
                      </div>
                      
                      {/* Badge التقسيط */}
                      {order.paymentMethod?.startsWith('INSTALLMENT_') && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 font-bold border-2 border-purple-400 ml-2">
                          <span className="text-xl">🏦</span>
                          تقسيط
                        </div>
                      )}
                      
                      <p className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        {order.finalAmount.toFixed(2)} جنيه
                      </p>
                      <p className="text-xs text-gray-500">
                        ({order.totalAmount.toFixed(2)} + {order.deliveryFee.toFixed(2)} توصيل)
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{item.product.nameAr}</p>
                            <p className="text-sm text-gray-500">الكمية: {item.quantity} × {item.price.toFixed(2)} جنيه</p>
                          </div>
                        </div>
                        <p className="font-bold">{(item.price * item.quantity).toFixed(2)} جنيه</p>
                      </div>
                    ))}
                  </div>
                  
                  {order.customerNotes && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-600">
                        <Package className="w-4 h-4 inline ml-1" />
                        ملاحظات العميل: {order.customerNotes}
                      </p>
                    </div>
                  )}
                  
                  {order.deliveryStaff && (
                    <div className="bg-teal-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-600">
                        <Truck className="w-4 h-4 inline ml-1" />
                        موظف التوصيل: {order.deliveryStaff.name} | {order.deliveryStaff.phone}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="outline" size="sm">عرض التفاصيل</Button>
                    </Link>
                    {order.status === "PENDING" && (
                      <>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          تأكيد الطلب
                        </Button>
                        <Button variant="destructive" size="sm">إلغاء الطلب</Button>
                      </>
                    )}
                    {order.status === "CONFIRMED" && (
                      <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                        بدء التحضير
                      </Button>
                    )}
                    {order.status === "PREPARING" && (
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                        تعيين موظف توصيل
                      </Button>
                    )}
                    {order.status === "OUT_FOR_DELIVERY" && (
                      <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded text-sm font-medium">
                        جاري التوصيل - بانتظار التسليم
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {orders.length === 0 && (
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold mb-2">لا توجد طلبات</h3>
              <p className="text-gray-600">لم يتم إنشاء أي طلبات حتى الآن</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

