'use client';

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Wallet,
  Home,
  Store,
  AlertCircle,
  Send,
  UserCheck,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function VendorOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { id } = use(params);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/vendor/orders/${id}`);
      if (!response.ok) {
        throw new Error('فشل في جلب الطلب');
      }
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      toast.error('حدث خطأ في جلب الطلب');
      router.push('/vendor/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/vendor/orders/${id}/accept`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('فشل في قبول الطلب');
      
      toast.success('تم قبول الطلب بنجاح');
      fetchOrder();
    } catch (error) {
      toast.error('حدث خطأ في قبول الطلب');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSchedulePickup = async () => {
    toast.info('سيتم إضافة نظام جدولة المواعيد قريباً');
  };

  const handleSendToAdmin = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/vendor/orders/${id}/send-to-admin`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('فشل في إرسال الطلب للإدارة');
      
      toast.success('تم إرسال الطلب للإدارة بنجاح');
      fetchOrder();
    } catch (error) {
      toast.error('حدث خطأ في إرسال الطلب');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignDelivery = async () => {
    toast.info('سيتم إضافة نظام تعيين مندوبي التوصيل قريباً');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  // حساب التفاصيل المالية
  const subtotal = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const storeCommission = subtotal * 0.05; // 5% عمولة المتجر
  const vendorEarnings = subtotal - storeCommission; // صافي ربح الشريك
  
  const statusLabels: Record<string, string> = {
    PENDING: "قيد الانتظار",
    CONFIRMED: "تم التأكيد",
    PREPARING: "قيد التحضير",
    OUT_FOR_DELIVERY: "جاري التوصيل",
    DELIVERED: "تم التوصيل",
    REJECTED: "مرفوض",
    CANCELLED: "ملغي",
  };

  const paymentMethodLabels: Record<string, string> = {
    CASH_ON_DELIVERY: "الدفع عند الاستلام",
    BANK_TRANSFER: "تحويل بنكي",
    E_WALLET_TRANSFER: "محفظة إلكترونية",
    INSTALLMENT_4: "تقسيط 4 أشهر",
    INSTALLMENT_6: "تقسيط 6 أشهر",
    INSTALLMENT_12: "تقسيط 12 شهر",
    INSTALLMENT_24: "تقسيط 24 شهر",
  };

  const deliveryMethodLabels: Record<string, string> = {
    HOME_DELIVERY: "توصيل للمنزل",
    STORE_PICKUP: "استلام من الفرع",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/vendor/orders">
            <Button variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Package className="h-8 w-8 text-purple-400" />
              تفاصيل الطلب #{order.id.slice(0, 8)}
            </h1>
            <p className="text-gray-400 mt-1">
              {new Date(order.createdAt).toLocaleDateString('ar-EG', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* المعلومات الأساسية */}
          <div className="md:col-span-2 space-y-6">
            {/* معلومات العميل */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-400" />
                  معلومات العميل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-400 text-sm">الاسم</p>
                    <p className="text-white font-medium">{order.customer?.name || 'غير محدد'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-400 text-sm">رقم الهاتف</p>
                    <p className="text-white font-medium" dir="ltr">{order.deliveryPhone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-400 text-sm">العنوان</p>
                    <p className="text-white">{order.deliveryAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  {order.deliveryMethod === 'STORE_PICKUP' ? (
                    <Store className="h-5 w-5 text-purple-400 mt-0.5" />
                  ) : (
                    <Home className="h-5 w-5 text-green-400 mt-0.5" />
                  )}
                  <div>
                    <p className="text-gray-400 text-sm">طريقة الاستلام</p>
                    <p className="text-white font-medium">
                      {deliveryMethodLabels[order.deliveryMethod || 'HOME_DELIVERY']}
                    </p>
                    {order.deliveryMethod === 'STORE_PICKUP' && order.pickupLocation && (
                      <p className="text-purple-300 text-sm mt-1">{order.pickupLocation}</p>
                    )}
                    {order.deliveryMethod === 'HOME_DELIVERY' && order.governorate && (
                      <p className="text-green-300 text-sm mt-1">المحافظة: {order.governorate}</p>
                    )}
                  </div>
                </div>
                {order.customerNotes && (
                  <div className="flex items-start gap-3 mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <Package className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-blue-300 text-sm font-medium">ملاحظات العميل</p>
                      <p className="text-white mt-1">{order.customerNotes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* المنتجات */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-400" />
                  المنتجات ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1">{item.product.nameAr}</h4>
                        <p className="text-gray-400 text-sm">
                          السعر: {item.price} ج.م × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-bold text-lg">
                          {(item.price * item.quantity).toFixed(2)} ج.م
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* التوصيل */}
            {order.deliveryStaff && (
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Truck className="h-5 w-5 text-purple-400" />
                    معلومات التوصيل
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-500/20 p-3 rounded-full">
                      <Truck className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{order.deliveryStaff.name}</p>
                      <p className="text-gray-400 text-sm" dir="ltr">{order.deliveryStaff.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* الملخص المالي */}
          <div className="space-y-6">
            {/* الحالة */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-400" />
                  الحالة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
                    <p className="text-purple-300 text-sm mb-1">حالة الطلب</p>
                    <p className="text-white font-bold text-lg">
                      {statusLabels[order.status] || order.status}
                    </p>
                  </div>
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
                    <p className="text-blue-300 text-sm mb-1">طريقة الدفع</p>
                    <p className="text-white font-medium">
                      {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
                    </p>
                  </div>
                  {order.paymentStatus && (
                    <div className={`${order.paymentStatus === 'PAID' ? 'bg-green-500/20 border-green-500/30' : 'bg-orange-500/20 border-orange-500/30'} border rounded-lg p-3 text-center`}>
                      <p className={`${order.paymentStatus === 'PAID' ? 'text-green-300' : 'text-orange-300'} text-sm mb-1`}>
                        حالة الدفع
                      </p>
                      <p className="text-white font-medium">
                        {order.paymentStatus === 'PAID' ? 'تم الدفع' : 'معلق'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* الملخص المالي التفصيلي */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-yellow-400" />
                  الملخص المالي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-gray-300">المجموع الفرعي</span>
                  <span className="text-white font-bold">{subtotal.toFixed(2)} ج.م</span>
                </div>
                
                {order.deliveryMethod === 'HOME_DELIVERY' && (
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="text-gray-300">رسوم التوصيل</span>
                    <span className="text-white font-bold">{order.deliveryFee.toFixed(2)} ج.م</span>
                  </div>
                )}

                {order.deliveryMethod === 'STORE_PICKUP' && order.downPayment && (
                  <>
                    <div className="flex justify-between items-center pb-3 border-b border-white/20">
                      <span className="text-purple-300">الدفعة المقدمة (30%)</span>
                      <span className="text-purple-300 font-bold">{order.downPayment.toFixed(2)} ج.م</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-white/20">
                      <span className="text-yellow-300">المبلغ المتبقي</span>
                      <span className="text-yellow-300 font-bold">{(order.remainingAmount || 0).toFixed(2)} ج.م</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-red-300">عمولة المتجر (5%)</span>
                  <span className="text-red-300 font-bold">-{storeCommission.toFixed(2)} ج.م</span>
                </div>

                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-300 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      صافي ربحك
                    </span>
                    <span className="text-green-300 font-bold text-xl">
                      {vendorEarnings.toFixed(2)} ج.م
                    </span>
                  </div>
                  <p className="text-green-200 text-xs">
                    سيضاف إلى رأس مالك عند توصيل الطلب بنجاح
                  </p>
                </div>

                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-300 flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      إجمالي الطلب
                    </span>
                    <span className="text-yellow-300 font-bold text-2xl">
                      {order.finalAmount.toFixed(2)} ج.م
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* أزرار التحكم */}
            {order.status === 'PENDING' && (
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-400" />
                    إجراءات الطلب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-blue-200 text-sm mb-3">
                      الطلب في انتظار الموافقة
                    </p>
                    <div className="space-y-2">
                      <Button 
                        onClick={handleAcceptOrder}
                        disabled={actionLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {actionLoading ? (
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 ml-2" />
                        )}
                        قبول الطلب
                      </Button>
                      {order.deliveryMethod === 'STORE_PICKUP' && (
                        <Button 
                          onClick={handleSchedulePickup}
                          disabled={actionLoading}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Calendar className="w-4 h-4 ml-2" />
                          تحديد موعد الاستلام
                        </Button>
                      )}
                      {order.deliveryMethod === 'HOME_DELIVERY' && (
                        <>
                          <Button 
                            onClick={handleSendToAdmin}
                            disabled={actionLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {actionLoading ? (
                              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4 ml-2" />
                            )}
                            إرسال للإدارة
                          </Button>
                          <Button 
                            onClick={handleAssignDelivery}
                            disabled={actionLoading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <UserCheck className="w-4 h-4 ml-2" />
                            تعيين مندوب توصيل
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {order.deliveryMethod === 'STORE_PICKUP' && order.status === 'CONFIRMED' && (
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Store className="h-5 w-5 text-purple-400" />
                    جاهز للاستلام
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
                    <p className="text-purple-200 text-sm mb-3">
                      الطلب جاهز للاستلام من الفرع
                    </p>
                    <div className="space-y-2 text-white text-sm">
                      <p>💰 تم دفع: {(order.downPayment || 0).toFixed(2)} ج.م</p>
                      <p>💵 المتبقي: {(order.remainingAmount || 0).toFixed(2)} ج.م</p>
                      <p className="text-yellow-300 font-medium mt-3">
                        ⚠️ يتم تحصيل المبلغ المتبقي عند الاستلام
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
