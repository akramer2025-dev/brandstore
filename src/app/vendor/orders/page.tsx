import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function VendorOrdersPage() {
  const session = await auth();

  if (!session || session.user?.role !== "VENDOR") {
    redirect("/auth/login");
  }

  // الحصول على معلومات الـ Vendor
  const vendor = await prisma.vendor.findUnique({
    where: {
      userId: session.user.id
    }
  });

  if (!vendor) {
    redirect("/");
  }

  // جلب الطلبات التي تحتوي على منتجات هذا الشريك فقط
  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: {
            vendorId: vendor.id
          }
        }
      }
    },
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
  };

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
                <ShoppingBag className="h-8 w-8 text-teal-400" />
                إدارة الطلبات
              </h1>
              <p className="text-gray-400 mt-1">عرض وإدارة طلبات منتجاتك</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
            <p className="text-sm text-gray-300">إجمالي الطلبات</p>
            <p className="text-3xl font-bold text-white">{orders.length}</p>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="py-16 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400 text-lg">لا توجد طلبات حتى الآن</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = statusColors[order.status as keyof typeof statusColors]?.icon || Package;
              
              // حساب المنتجات الخاصة بهذا الشريك فقط
              const vendorItems = order.items.filter(item => item.product.vendorId === vendor.id);
              const vendorTotal = vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

              return (
                <Card key={order.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-white font-bold text-lg">طلب #{order.id.slice(0, 8)}</span>
                          <div className={`px-3 py-1 rounded-full flex items-center gap-2 ${statusColors[order.status as keyof typeof statusColors]?.bg || 'bg-gray-100'} ${statusColors[order.status as keyof typeof statusColors]?.text || 'text-gray-800'}`}>
                            <StatusIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {statusLabels[order.status as keyof typeof statusLabels] || order.status}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-300">
                            <span className="text-gray-400">العميل:</span>
                            <span className="font-medium">{order.customer?.name || 'غير محدد'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <span className="text-gray-400">منتجاتك:</span>
                            <span className="font-medium">{vendorItems.length} منتج</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <span className="text-gray-400">التاريخ:</span>
                            <span>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                          </div>
                          {order.deliveryStaff && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <Truck className="h-4 w-4 text-teal-400" />
                              <span className="text-gray-400">مندوب التوصيل:</span>
                              <span className="font-medium">{order.deliveryStaff.name}</span>
                            </div>
                          )}
                        </div>

                        {/* Vendor Items */}
                        <div className="mt-4 space-y-2">
                          {vendorItems.map((item) => (
                            <div key={item.id} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                              <div>
                                <p className="text-white font-medium">{item.product.nameAr}</p>
                                <p className="text-gray-400 text-sm">الكمية: {item.quantity}</p>
                              </div>
                              <p className="text-teal-400 font-bold">{item.price * item.quantity} ج.م</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total */}
                      <div className="text-left md:text-right">
                        <p className="text-gray-400 text-sm mb-1">إجمالي منتجاتك</p>
                        <p className="text-3xl font-bold text-teal-400">{vendorTotal.toFixed(2)} ج.م</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
