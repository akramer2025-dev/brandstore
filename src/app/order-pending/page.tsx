"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Clock, Package, Home, Loader2 } from "lucide-react";

export default function OrderPendingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (orderNumber && session?.user) {
      fetchOrder();
    }
  }, [orderNumber, session]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderNumber}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error("خطأ في جلب بيانات الطلب:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="text-center border-b border-gray-700">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-yellow-400" />
            </div>
            <CardTitle className="text-3xl text-white">
              جاري مراجعة طلبك
            </CardTitle>
            <p className="text-gray-400 mt-2">
              تم استلام طلبك بنجاح وجاري مراجعة إيصال التحويل
            </p>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Order Details */}
            {order && (
              <div className="space-y-4">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">رقم الطلب</span>
                    <span className="text-white font-bold">{order.orderNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">المبلغ الإجمالي</span>
                    <span className="text-white font-bold">{order.finalAmount} جنيه</span>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">تم إنشاء الطلب</p>
                      <p className="text-sm text-gray-400">تم استلام طلبك بنجاح</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">مراجعة إيصال التحويل</p>
                      <p className="text-sm text-gray-400">جاري التحقق من صورة الإيصال التي قمت برفعها</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 opacity-50">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-600 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-500 font-semibold">تأكيد الطلب</p>
                      <p className="text-sm text-gray-600">سيتم تأكيد طلبك بعد التحقق من الإيصال</p>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-300 text-sm">
                    <strong>معلومة:</strong> سيتم مراجعة إيصال التحويل خلال 24 ساعة. 
                    سيصلك إشعار فوري عند تأكيد الطلب أو في حالة وجود أي ملاحظات.
                  </p>
                </div>

                {/* Receipt Preview */}
                {order.bankTransferReceipt && (
                  <div className="space-y-2">
                    <Label className="text-white">صورة الإيصال المرفقة</Label>
                    <img 
                      src={order.bankTransferReceipt} 
                      alt="إيصال التحويل" 
                      className="w-full rounded-lg border-2 border-gray-700"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => router.push("/orders")}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Package className="w-5 h-5 ml-2" />
                متابعة طلباتي
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="flex-1 border-gray-600 text-white hover:bg-gray-700"
              >
                <Home className="w-5 h-5 ml-2" />
                الصفحة الرئيسية
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
