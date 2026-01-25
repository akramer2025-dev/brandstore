"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck,
  MapPin,
  Phone,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  deliveryFee: number;
  finalAmount: number;
  deliveryAddress: string;
  deliveryPhone: string;
  customerNotes?: string;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      nameAr: string;
      image?: string;
    };
  }>;
  deliveryStaff?: {
    name: string;
    phone: string;
  };
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("يجب تسجيل الدخول أولاً");
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("حدث خطأ أثناء تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const statusConfig = {
    PENDING: {
      label: "قيد الانتظار",
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      description: "طلبك قيد المراجعة من قبل الإدارة",
    },
    CONFIRMED: {
      label: "تم التأكيد",
      icon: CheckCircle,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      description: "تم تأكيد طلبك وجاري التحضير",
    },
    PREPARING: {
      label: "قيد التحضير",
      icon: Package,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      description: "جاري تجهيز منتجاتك",
    },
    OUT_FOR_DELIVERY: {
      label: "جاري التوصيل",
      icon: Truck,
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/30",
      description: "الطلب في الطريق إليك",
    },
    DELIVERED: {
      label: "تم التوصيل",
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      description: "تم تسليم طلبك بنجاح",
    },
    REJECTED: {
      label: "تم الرفض",
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      description: "تم رفض الطلب عند التسليم",
    },
    CANCELLED: {
      label: "ملغي",
      icon: XCircle,
      color: "text-gray-400",
      bg: "bg-gray-500/10",
      border: "border-gray-500/30",
      description: "تم إلغاء الطلب",
    },
  };

  const getOrderProgress = (status: string) => {
    const steps = ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
    const currentIndex = steps.indexOf(status);
    return currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 py-12">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent mb-4">
            طلباتي
          </h1>
          <p className="text-gray-400 text-lg">
            مرحباً {session?.user?.name || session?.user?.username}، لديك {orders.length} طلب
          </p>
        </div>

        {orders.length === 0 ? (
          /* No Orders */
          <Card className="max-w-2xl mx-auto bg-gray-800/80 border-teal-500/20">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-teal-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">لا توجد طلبات</h2>
              <p className="text-gray-400 mb-8">
                لم تقم بإنشاء أي طلبات بعد
              </p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white">
                  <ArrowRight className="w-5 h-5 ml-2" />
                  تصفح المنتجات
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Orders List */
          <div className="space-y-6 max-w-5xl mx-auto">
            {orders.map((order) => {
              const config = statusConfig[order.status as keyof typeof statusConfig];
              const StatusIcon = config?.icon || Clock;
              const progress = getOrderProgress(order.status);

              return (
                <Card key={order.id} className="bg-gray-800/80 border-teal-500/20 hover:border-teal-500/40 transition-all">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-2xl font-bold text-white mb-2">
                          طلب رقم #{order.orderNumber.slice(0, 8).toUpperCase()}
                        </CardTitle>
                        <p className="text-sm text-gray-400">
                          تاريخ الطلب: {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      
                      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${config?.bg} ${config?.border} border`}>
                        <StatusIcon className={`w-6 h-6 ${config?.color}`} />
                        <div>
                          <p className={`font-bold ${config?.color}`}>{config?.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{config?.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {!["REJECTED", "CANCELLED", "DELIVERED"].includes(order.status) && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-teal-600 to-cyan-600 h-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Products */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <Package className="w-5 h-5 text-teal-400" />
                        المنتجات ({order.items.length})
                      </h3>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex gap-4 bg-gray-900/50 p-3 rounded-lg">
                            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-700">
                              {item.product.image ? (
                                <Image
                                  src={item.product.image}
                                  alt={item.product.nameAr}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-8 h-8 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 flex justify-between items-center">
                              <div>
                                <p className="text-white font-medium">{item.product.nameAr}</p>
                                <p className="text-sm text-gray-400">
                                  {item.quantity} × {item.price.toFixed(2)} جنيه
                                </p>
                              </div>
                              <p className="text-teal-400 font-bold text-lg">
                                {(item.quantity * item.price).toFixed(2)} جنيه
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-900/50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-teal-400 flex-shrink-0 mt-1" />
                          <div>
                            <p className="text-sm text-gray-400 mb-1">عنوان التوصيل</p>
                            <p className="text-white">{order.deliveryAddress}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-900/50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-teal-400 flex-shrink-0 mt-1" />
                          <div>
                            <p className="text-sm text-gray-400 mb-1">رقم الهاتف</p>
                            <p className="text-white">{order.deliveryPhone}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Staff Info */}
                    {order.deliveryStaff && (
                      <div className="bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border border-teal-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <Truck className="w-6 h-6 text-teal-400" />
                          <div>
                            <p className="text-sm text-gray-400">موظف التوصيل</p>
                            <p className="text-white font-medium">{order.deliveryStaff.name}</p>
                            <p className="text-sm text-gray-400">{order.deliveryStaff.phone}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {order.customerNotes && (
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-1">ملاحظاتك</p>
                        <p className="text-white">{order.customerNotes}</p>
                      </div>
                    )}

                    {/* Price Summary */}
                    <div className="border-t border-gray-700 pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-gray-300">
                          <span>المجموع الفرعي:</span>
                          <span className="font-bold">{order.totalAmount.toFixed(2)} جنيه</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>رسوم التوصيل:</span>
                          <span className="font-bold">
                            {order.deliveryFee > 0 ? `${order.deliveryFee.toFixed(2)} جنيه` : "مجاناً"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                          <span className="text-xl font-bold text-white">الإجمالي:</span>
                          <span className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                            {order.finalAmount.toFixed(2)} جنيه
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg">
                      <span className="text-gray-400">حالة الدفع:</span>
                      <span className={`font-bold ${
                        order.paymentStatus === "PAID" 
                          ? "text-green-400" 
                          : order.paymentStatus === "REJECTED"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}>
                        {order.paymentStatus === "PAID" ? "مدفوع" : 
                         order.paymentStatus === "REJECTED" ? "مرفوض" : "قيد الانتظار"}
                      </span>
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
