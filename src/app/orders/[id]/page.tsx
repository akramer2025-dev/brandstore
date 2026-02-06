"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, MapPin, Phone, CreditCard, CheckCircle2, Clock, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    nameAr: string;
    images: string | null;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  deliveryFee: number;
  finalAmount: number;
  deliveryAddress: string;
  deliveryPhone: string;
  customerNotes?: string;
  paymentMethod: string;
  deliveryMethod?: string;
  createdAt: string;
  items: OrderItem[];
  customer: {
    name?: string;
    username?: string;
    email?: string;
  };
}

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  PENDING: { label: "قيد الانتظار", icon: Clock, color: "text-yellow-500" },
  CONFIRMED: { label: "تم التأكيد", icon: CheckCircle2, color: "text-blue-500" },
  PREPARING: { label: "جاري التجهيز", icon: Package, color: "text-purple-500" },
  OUT_FOR_DELIVERY: { label: "في الطريق للتوصيل", icon: Truck, color: "text-orange-500" },
  DELIVERED: { label: "تم التوصيل", icon: CheckCircle2, color: "text-green-500" },
  REJECTED: { label: "مرفوض", icon: XCircle, color: "text-red-500" },
  CANCELLED: { label: "ملغي", icon: XCircle, color: "text-gray-500" },
};

const paymentMethodLabels: Record<string, string> = {
  CASH_ON_DELIVERY: "الدفع عند الاستلام",
  BANK_TRANSFER: "تحويل بنكي",
  E_WALLET_TRANSFER: "محفظة إلكترونية",
  INSTALLMENT_4: "تقسيط 4 شهور",
  INSTALLMENT_6: "تقسيط 6 شهور",
  INSTALLMENT_12: "تقسيط 12 شهر",
  INSTALLMENT_24: "تقسيط 24 شهر",
};

export default function OrderDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("يجب تسجيل الدخول أولاً");
      router.push("/auth/login");
      return;
    }

    if (params.id && status === "authenticated") {
      fetchOrder();
    }
  }, [params.id, status, router]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      
      if (!response.ok) {
        throw new Error("فشل في جلب بيانات الطلب");
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("حدث خطأ في جلب بيانات الطلب");
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-gray-800/80 border-red-500/20">
          <CardContent className="p-12 text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h2 className="text-2xl font-bold text-white mb-4">الطلب غير موجود</h2>
            <Link href="/">
              <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
                <ArrowRight className="w-5 h-5 ml-2" />
                العودة للرئيسية
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatusIcon = statusConfig[order.status]?.icon || Clock;
  const statusLabel = statusConfig[order.status]?.label || order.status;
  const statusColor = statusConfig[order.status]?.color || "text-gray-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent mb-4">
            تفاصيل الطلب
          </h1>
          <p className="text-gray-400 text-lg">
            رقم الطلب: #{order.orderNumber.slice(0, 8).toUpperCase()}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status Card */}
          <Card className="bg-gray-800/80 border-teal-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-4">
                <StatusIcon className={`w-12 h-12 ${statusColor}`} />
                <div className="text-center">
                  <h2 className={`text-2xl font-bold ${statusColor}`}>
                    {statusLabel}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="bg-gray-800/80 border-teal-500/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Package className="w-6 h-6 text-teal-400" />
                المنتجات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => {
                const images = item.product.images ? item.product.images.split(",") : [];
                const mainImage = images[0];

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 rounded-lg bg-gray-700/50 hover:bg-gray-700/70 transition-colors"
                  >
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-600">
                      {mainImage ? (
                        <Image
                          src={mainImage}
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
                      <h3 className="text-lg font-bold text-white mb-1">
                        {item.product.nameAr}
                      </h3>
                      <p className="text-sm text-gray-400">
                        الكمية: {item.quantity} × {item.price.toFixed(2)} ج.م
                      </p>
                      <p className="text-lg font-bold text-teal-400 mt-1">
                        {(item.quantity * item.price).toFixed(2)} ج.م
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card className="bg-gray-800/80 border-teal-500/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-6 h-6 text-teal-400" />
                معلومات التوصيل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">العنوان</p>
                  <p className="text-white font-medium">{order.deliveryAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">رقم الهاتف</p>
                  <p className="text-white font-medium" dir="ltr">{order.deliveryPhone}</p>
                </div>
              </div>
              {order.customerNotes && (
                <div className="p-3 bg-teal-900/20 border border-teal-500/30 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">ملاحظات</p>
                  <p className="text-white">{order.customerNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="bg-gray-800/80 border-teal-500/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-teal-400" />
                ملخص الدفع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-gray-300">
                <span>المجموع الفرعي:</span>
                <span className="font-bold">{order.totalAmount.toFixed(2)} ج.م</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>رسوم التوصيل:</span>
                <span className="font-bold">
                  {order.deliveryFee > 0 ? `${order.deliveryFee.toFixed(2)} ج.م` : "مجاناً"}
                </span>
              </div>
              <div className="border-t border-gray-600 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-white">الإجمالي:</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    {order.finalAmount.toFixed(2)} ج.م
                  </span>
                </div>
              </div>
              <div className="bg-teal-900/20 border border-teal-500/30 rounded-lg p-4 text-center">
                <p className="text-sm text-teal-300 font-medium">
                  💳 {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button
                variant="outline"
                className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10"
              >
                <ArrowRight className="w-5 h-5 ml-2" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
