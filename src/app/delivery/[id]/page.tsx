"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Package,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  deliveryAddress: string;
  deliveryPhone: string;
  finalAmount: number;
  deliveryFee: number;
  customerNotes: string | null;
  inspectionResult: string | null;
  inspectionNotes: string | null;
  createdAt: string;
  customer: {
    name: string | null;
    username: string;
  };
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      nameAr: string;
      image: string | null;
    };
  }[];
}

export default function DeliveryOrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inspectionNotes, setInspectionNotes] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (session?.user?.role !== "DELIVERY_STAFF") {
      router.push("/");
      return;
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, session, status, router]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/delivery/orders/${orderId}`);
      if (!res.ok) throw new Error("فشل تحميل الطلب");
      const data = await res.json();
      setOrder(data);
      setInspectionNotes(data.inspectionNotes || "");
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("فشل تحميل الطلب");
    } finally {
      setLoading(false);
    }
  };

  const handleInspection = async (result: "ACCEPTED" | "REJECTED") => {
    if (!order) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/delivery/orders/${order.id}/inspect`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inspectionResult: result,
          inspectionNotes,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "فشل تسجيل النتيجة");
      }

      const updatedOrder = await res.json();
      setOrder(updatedOrder);

      if (result === "ACCEPTED") {
        toast.success("تم قبول الطلب بنجاح", {
          description: `المبلغ المحصل: ${order.finalAmount} جنيه`,
        });
      } else {
        toast.success("تم رفض الطلب وإرجاعه للمخزون", {
          description: `المبلغ المحصل: ${order.deliveryFee} جنيه (رسوم التوصيل)`,
        });
      }

      setTimeout(() => router.push("/delivery"), 2000);
    } catch (error: any) {
      console.error("Error submitting inspection:", error);
      toast.error(error.message || "فشل تسجيل النتيجة");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800/80 border-teal-500/20 p-12 text-center">
          <p className="text-xl text-gray-400 mb-4">الطلب غير موجود</p>
          <Link href="/delivery">
            <Button className="bg-teal-600 hover:bg-teal-700">
              العودة للطلبات
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isCompleted = order.status === "DELIVERED" || order.status === "RETURNED";
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link href="/delivery" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 mb-4">
            <ArrowRight className="w-5 h-5 rotate-180" />
            العودة للطلبات
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent mb-2">
                طلب #{order.orderNumber}
              </h1>
              <p className="text-gray-400">
                {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            {isCompleted && (
              <div className={`px-6 py-3 rounded-lg font-bold text-lg ${
                order.inspectionResult === "ACCEPTED"
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}>
                {order.inspectionResult === "ACCEPTED" ? "✓ تم القبول" : "✗ تم الرفض"}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card className="bg-gray-800/80 border-teal-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-400" />
                  معلومات العميل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <User className="w-5 h-5 text-teal-400" />
                  <div>
                    <p className="text-sm text-gray-500">الاسم</p>
                    <p className="font-medium">{order.customer.name || order.customer.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-5 h-5 text-teal-400" />
                  <div>
                    <p className="text-sm text-gray-500">رقم الهاتف</p>
                    <a href={`tel:${order.deliveryPhone}`} className="font-medium text-teal-400 hover:underline">
                      {order.deliveryPhone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-teal-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">عنوان التوصيل</p>
                    <p className="font-medium">{order.deliveryAddress}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 border-teal-500/50 hover:bg-teal-500/10"
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.deliveryAddress)}`, '_blank')}
                    >
                      <MapPin className="w-4 h-4 ml-2" />
                      فتح في خرائط Google
                    </Button>
                  </div>
                </div>
                {order.customerNotes && (
                  <div className="flex items-start gap-3 text-gray-300 p-3 bg-yellow-600/10 border border-yellow-600/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-400 mb-1 font-medium">ملاحظات العميل</p>
                      <p className="text-sm">{order.customerNotes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Products */}
            <Card className="bg-gray-800/80 border-teal-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-teal-400" />
                  المنتجات ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-900">
                      <Image
                        src={item.product.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600'}
                        alt={item.product.nameAr}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{item.product.nameAr}</h4>
                      <p className="text-sm text-gray-400">
                        الكمية: {item.quantity} × {item.price.toLocaleString()} جنيه
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-teal-400 font-bold">
                        {(item.price * item.quantity).toLocaleString()} جنيه
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Inspection Form */}
            {!isCompleted && order.status === "OUT_FOR_DELIVERY" && (
              <Card className="bg-gray-800/80 border-teal-500/20">
                <CardHeader>
                  <CardTitle className="text-white">تسجيل نتيجة الفحص</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-gray-300 text-sm font-medium mb-2 block">
                      ملاحظات الفحص (اختياري)
                    </label>
                    <Textarea
                      value={inspectionNotes}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInspectionNotes(e.target.value)}
                      placeholder="أضف أي ملاحظات عن حالة المنتج أو سبب الرفض..."
                      className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 pt-4">
                    <Button
                      onClick={() => handleInspection("ACCEPTED")}
                      disabled={submitting}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg"
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin ml-2" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 ml-2" />
                      )}
                      قبول الطلب
                      <span className="block text-sm font-normal mt-1">
                        ({order.finalAmount} جنيه)
                      </span>
                    </Button>

                    <Button
                      onClick={() => handleInspection("REJECTED")}
                      disabled={submitting}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-lg"
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin ml-2" />
                      ) : (
                        <XCircle className="w-5 h-5 ml-2" />
                      )}
                      رفض الطلب
                      <span className="block text-sm font-normal mt-1">
                        ({order.deliveryFee} جنيه فقط)
                      </span>
                    </Button>
                  </div>

                  <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div className="text-sm text-blue-300">
                        <p className="font-medium mb-1">معلومات هامة:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-300/80">
                          <li>عند القبول: سيتم تحصيل المبلغ الكامل ({order.finalAmount} جنيه)</li>
                          <li>عند الرفض: سيتم تحصيل رسوم التوصيل فقط ({order.deliveryFee} جنيه)</li>
                          <li>في حالة الرفض، سيتم إرجاع المنتجات للمخزون تلقائياً</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Inspection Result */}
            {isCompleted && (
              <Card className={`border-2 ${
                order.inspectionResult === "ACCEPTED"
                  ? "bg-green-600/10 border-green-600/50"
                  : "bg-red-600/10 border-red-600/50"
              }`}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    {order.inspectionResult === "ACCEPTED" ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400" />
                    )}
                    نتيجة الفحص
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-lg font-bold mb-2 ${
                    order.inspectionResult === "ACCEPTED" ? "text-green-400" : "text-red-400"
                  }`}>
                    {order.inspectionResult === "ACCEPTED" ? "تم قبول الطلب" : "تم رفض الطلب"}
                  </p>
                  {order.inspectionNotes && (
                    <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">ملاحظات:</p>
                      <p className="text-white">{order.inspectionNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card className="bg-gray-800/80 border-teal-500/20 sticky top-24">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-teal-400" />
                  ملخص الدفع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-gray-300">
                  <span>المجموع الفرعي</span>
                  <span className="font-bold">{subtotal.toLocaleString()} جنيه</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>رسوم التوصيل</span>
                  <span className="font-bold">{order.deliveryFee.toLocaleString()} جنيه</span>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center justify-between text-white text-lg">
                    <span className="font-bold">الإجمالي</span>
                    <span className="text-2xl font-bold text-teal-400">
                      {order.finalAmount.toLocaleString()} جنيه
                    </span>
                  </div>
                </div>

                {order.inspectionResult === "REJECTED" && (
                  <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-3">
                    <p className="text-sm text-red-400 font-medium mb-1">المبلغ المحصل</p>
                    <p className="text-xl font-bold text-red-400">{order.deliveryFee} جنيه</p>
                    <p className="text-xs text-red-300/70 mt-1">رسوم التوصيل فقط</p>
                  </div>
                )}

                <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-700">
                  <p>الدفع نقداً عند الاستلام</p>
                  <p className="text-xs mt-1">Cash on Delivery (COD)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
