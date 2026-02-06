import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MessageSquare,
  Navigation
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { OrderActions } from "./OrderActions";
import { DeliveryLocationMap } from "./DeliveryLocationMap";
import { BackButton } from "@/components/BackButton";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const resolvedParams = await params;

  const order = await prisma.order.findUnique({
    where: { id: resolvedParams.id },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
      deliveryStaff: true,
    },
  });

  if (!order) {
    redirect("/admin/orders");
  }

  const deliveryStaffList = await prisma.deliveryStaff.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  // Filter and map to ensure required fields
  const staffList = deliveryStaffList
    .filter(staff => staff.name && staff.phone)
    .map(staff => ({
      id: staff.id,
      name: staff.name!,
      phone: staff.phone!,
    }));

  const statusConfig = {
    PENDING: {
      label: "قيد الانتظار",
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    CONFIRMED: {
      label: "تم التأكيد",
      icon: CheckCircle,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    PREPARING: {
      label: "قيد التحضير",
      icon: Package,
      color: "text-cyan-600",
      bg: "bg-cyan-100",
    },
    OUT_FOR_DELIVERY: {
      label: "جاري التوصيل",
      icon: Truck,
      color: "text-teal-600",
      bg: "bg-teal-100",
    },
    DELIVERED: {
      label: "تم التوصيل",
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    REJECTED: {
      label: "تم الرفض",
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    CANCELLED: {
      label: "ملغي",
      icon: XCircle,
      color: "text-gray-600",
      bg: "bg-gray-100",
    },
  };

  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

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
          <BackButton fallbackUrl="/admin/orders" label="العودة للطلبات" className="mb-4" />
          <h1 className="text-4xl font-bold drop-shadow-lg flex items-center gap-3">
            <Package className="w-10 h-10" />
            تفاصيل الطلب #{order.orderNumber.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-teal-100 mt-2">
            تاريخ الطلب: {new Date(order.createdAt).toLocaleDateString("ar-EG", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>حالة الطلب</span>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${config.bg}`}>
                    <StatusIcon className={`w-5 h-5 ${config.color}`} />
                    <span className={`font-bold ${config.color}`}>{config.label}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OrderActions 
                  orderId={order.id}
                  currentStatus={order.status}
                  deliveryStaffList={staffList}
                  currentDeliveryStaffId={order.deliveryStaffId}
                />
              </CardContent>
            </Card>

            {/* Products */}
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-6 h-6 text-teal-600" />
                  المنتجات ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                      {item.product.images ? (
                        <Image
                          src={item.product.images.split(',')[0]?.trim() || '/placeholder.jpg'}
                          alt={item.product.nameAr}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1">{item.product.nameAr}</h4>
                      <p className="text-sm text-gray-600 mb-2">{item.product.descriptionAr}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span>الكمية: {item.quantity}</span>
                          <span className="mx-2">×</span>
                          <span>{item.price.toFixed(2)} جنيه</span>
                        </div>
                        <div className="text-xl font-bold text-teal-600">
                          {(item.quantity * item.price).toFixed(2)} جنيه
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>المجموع الفرعي:</span>
                    <span className="font-bold">{order.totalAmount.toFixed(2)} جنيه</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>رسوم التوصيل:</span>
                    <span className="font-bold">
                      {order.deliveryFee > 0 ? `${order.deliveryFee.toFixed(2)} جنيه` : "مجاناً"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-teal-600 pt-2 border-t">
                    <span>الإجمالي:</span>
                    <span>{order.finalAmount.toFixed(2)} جنيه</span>
                  </div>
                </div>

                {/* Payment Status */}
                <div className={`p-3 rounded-lg ${
                  order.paymentStatus === "PAID" 
                    ? "bg-green-100 text-green-700"
                    : order.paymentStatus === "REJECTED"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">حالة الدفع:</span>
                    <span className="font-bold">
                      {order.paymentStatus === "PAID" ? "✅ مدفوع" : 
                       order.paymentStatus === "REJECTED" ? "❌ مرفوض" : 
                       "⏳ قيد الانتظار"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {order.customerNotes && (
              <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-teal-600" />
                    ملاحظات العميل
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">{order.customerNotes}</p>
                </CardContent>
              </Card>
            )}

            {order.rejectionReason && (
              <Card className="backdrop-blur-sm bg-white/80 border-red-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-6 h-6" />
                    سبب الرفض
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 bg-red-50 p-4 rounded-lg">{order.rejectionReason}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-6 h-6 text-teal-600" />
                  معلومات العميل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">الاسم</p>
                  <p className="font-bold">{order.customer.name || order.customer.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                  <p className="font-medium">{order.customer.email}</p>
                </div>
                {order.customer.phone && (
                  <div>
                    <p className="text-sm text-gray-600">رقم الهاتف المسجل</p>
                    <p className="font-medium">{order.customer.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-teal-600" />
                  معلومات التوصيل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">العنوان</p>
                  <p className="font-medium text-gray-800">{order.deliveryAddress}</p>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4 text-teal-600" />
                  <span className="font-medium">{order.deliveryPhone}</span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Staff */}
            {order.deliveryStaff && (
              <>
                <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-6 h-6 text-teal-600" />
                      موظف التوصيل
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <p className="font-bold text-lg mb-1">{order.deliveryStaff.name}</p>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{order.deliveryStaff.phone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location Tracking */}
                {order.deliveryStaff.name && (
                  <DeliveryLocationMap 
                    deliveryStaff={{
                      id: order.deliveryStaff.id,
                      name: order.deliveryStaff.name,
                      currentLat: order.deliveryStaff.currentLat,
                      currentLng: order.deliveryStaff.currentLng,
                      lastLocationUpdate: order.deliveryStaff.lastLocationUpdate,
                    }} 
                    orderId={order.id} 
                  />
                )}
              </>
            )}

            {/* Timeline */}
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-6 h-6 text-teal-600" />
                  التواريخ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">تاريخ الإنشاء:</span>
                  <span className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">آخر تحديث:</span>
                  <span className="font-medium">
                    {new Date(order.updatedAt).toLocaleDateString("ar-EG")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
