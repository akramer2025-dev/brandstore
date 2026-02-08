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
  Loader2,
  Building2,
  Car,
  Bike,
  X,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  area: string;
  vehicleType: string;
  deliveryFee: number;
  isActive: boolean;
  totalDeliveries: number;
}

interface ShippingCompany {
  id: string;
  name: string;
  phone: string;
  website?: string;
  trackingUrl?: string;
  defaultFee: number;
  estimatedDays: string;
  areas: string;
  isActive: boolean;
}

export default function VendorOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>([]);
  const [shippingCompanies, setShippingCompanies] = useState<ShippingCompany[]>([]);
  const [selectedTab, setSelectedTab] = useState<'agents' | 'companies'>('agents');
  const [assigningDelivery, setAssigningDelivery] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingOrder, setRejectingOrder] = useState(false);
  
  const { id } = use(params);

  useEffect(() => {
    fetchOrder();
    fetchDeliveryOptions();
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

  const fetchDeliveryOptions = async () => {
    try {
      const [agentsRes, companiesRes] = await Promise.all([
        fetch('/api/vendor/delivery-agents'),
        fetch('/api/vendor/shipping-companies')
      ]);
      
      if (agentsRes.ok) {
        const agents = await agentsRes.json();
        setDeliveryAgents(agents.filter((a: DeliveryAgent) => a.isActive));
      }
      
      if (companiesRes.ok) {
        const companies = await companiesRes.json();
        setShippingCompanies(companies.filter((c: ShippingCompany) => c.isActive));
      }
    } catch (error) {
      console.error('Error fetching delivery options:', error);
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

  const handleShipWithBosta = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/orders/${id}/ship`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'فشل في إرسال الطلب لبوسطة');
      }
      
      toast.success('تم إرسال الطلب لشركة بوسطة بنجاح! ✅');
      if (data.shipment?.trackingUrl) {
        toast.info(`رقم التتبع: ${data.shipment.trackingNumber}`);
      }
      fetchOrder();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ في إرسال الطلب لبوسطة');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectionReason.trim()) {
      toast.error('يرجى إدخال سبب الرفض');
      return;
    }

    setRejectingOrder(true);
    try {
      const response = await fetch(`/api/orders/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejectionReason: rejectionReason.trim() }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'فشل في رفض الطلب');
      }
      
      toast.success('تم رفض الطلب بنجاح');
      setShowRejectModal(false);
      setRejectionReason('');
      fetchOrder();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ في رفض الطلب');
    } finally {
      setRejectingOrder(false);
    }
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
    setShowDeliveryModal(true);
  };

  const handleAssignAgent = async (agent: DeliveryAgent) => {
    setAssigningDelivery(true);
    try {
      const response = await fetch(`/api/vendor/orders/${id}/assign-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryType: 'AGENT',
          agentId: agent.id,
          agentName: agent.name,
          agentPhone: agent.phone,
          deliveryFee: agent.deliveryFee
        })
      });
      
      if (!response.ok) throw new Error('فشل في تعيين المندوب');
      
      toast.success(`تم تعيين ${agent.name} كمندوب توصيل`);
      setShowDeliveryModal(false);
      fetchOrder();
    } catch (error) {
      toast.error('حدث خطأ في تعيين المندوب');
    } finally {
      setAssigningDelivery(false);
    }
  };

  const handleAssignCompany = async (company: ShippingCompany) => {
    setAssigningDelivery(true);
    try {
      const response = await fetch(`/api/vendor/orders/${id}/assign-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryType: 'COMPANY',
          companyId: company.id,
          companyName: company.name,
          companyPhone: company.phone,
          deliveryFee: company.defaultFee,
          trackingUrl: company.trackingUrl
        })
      });
      
      if (!response.ok) throw new Error('فشل في تعيين شركة الشحن');
      
      toast.success(`تم تعيين ${company.name} كشركة شحن`);
      setShowDeliveryModal(false);
      fetchOrder();
    } catch (error) {
      toast.error('حدث خطأ في تعيين شركة الشحن');
    } finally {
      setAssigningDelivery(false);
    }
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
                  {order.items.map((item: any) => (
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

            {/* معلومات شحنة بوسطة */}
            {order.bustaShipmentId && (
              <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border-blue-400/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-400" />
                    شحنة بوسطة 🚚
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-gray-300 text-sm mb-1">رقم الشحنة</p>
                    <p className="text-white font-mono text-lg">{order.bustaShipmentId}</p>
                  </div>
                  {order.bustaStatus && (
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-gray-300 text-sm mb-1">الحالة</p>
                      <p className="text-white font-medium">{order.bustaStatus}</p>
                    </div>
                  )}
                  {order.bustaTrackingUrl && (
                    <a 
                      href={order.bustaTrackingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      تتبع الشحنة
                    </a>
                  )}
                  {order.bustaSentAt && (
                    <p className="text-gray-400 text-sm text-center">
                      تم الإرسال: {new Date(order.bustaSentAt).toLocaleDateString('ar-EG')}
                    </p>
                  )}
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
                  
                  {/* عرض صورة إيصال التحويل البنكي */}
                  {order.paymentMethod === 'BANK_TRANSFER' && order.bankTransferReceipt && (
                    <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-blue-300 text-sm mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        إيصال التحويل البنكي
                      </p>
                      <a 
                        href={order.bankTransferReceipt} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block relative group"
                      >
                        <img 
                          src={order.bankTransferReceipt} 
                          alt="إيصال التحويل البنكي" 
                          className="w-full rounded-lg border-2 border-blue-500 hover:border-blue-400 transition-all cursor-pointer"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <ExternalLink className="h-8 w-8 text-white" />
                        </div>
                      </a>
                      <p className="text-xs text-gray-400 mt-2">اضغط على الصورة للعرض بالحجم الكامل</p>
                    </div>
                  )}
                  
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
                            onClick={handleShipWithBosta}
                            disabled={actionLoading || order.bustaShipmentId}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                          >
                            {actionLoading ? (
                              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            ) : (
                              <Truck className="w-4 h-4 ml-2" />
                            )}
                            {order.bustaShipmentId ? '✅ تم الإرسال لبوسطة' : '🚚 إرسال لبوسطة'}
                          </Button>
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
                      <Button 
                        onClick={() => setShowRejectModal(true)}
                        disabled={actionLoading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                      >
                        <X className="w-4 h-4 ml-2" />
                        رفض الطلب
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* أزرار الشحن - بعد قبول الطلب */}
            {(order.status === 'CONFIRMED' || order.status === 'PREPARING') && order.deliveryMethod === 'HOME_DELIVERY' && (
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-400" />
                    إرسال الطلب للشحن
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-blue-200 text-sm mb-3">
                      اختر طريقة الشحن المناسبة
                    </p>
                    <div className="space-y-2">
                      <Button 
                        onClick={handleShipWithBosta}
                        disabled={actionLoading || order.bustaShipmentId}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                      >
                        {actionLoading ? (
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        ) : (
                          <Truck className="w-4 h-4 ml-2" />
                        )}
                        {order.bustaShipmentId ? '✅ تم الإرسال لبوسطة' : '🚚 إرسال لبوسطة'}
                      </Button>
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

      {/* Modal اختيار التوصيل */}
      <AnimatePresence>
        {showDeliveryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeliveryModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-white/20 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <Truck className="h-6 w-6" />
                  اختيار طريقة التوصيل
                </h3>
                <button
                  onClick={() => setShowDeliveryModal(false)}
                  className="text-white/80 hover:text-white p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => setSelectedTab('agents')}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                    selectedTab === 'agents'
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Truck className="h-5 w-5 inline-block ml-2" />
                  مناديب التوصيل ({deliveryAgents.length})
                </button>
                <button
                  onClick={() => setSelectedTab('companies')}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                    selectedTab === 'companies'
                      ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Building2 className="h-5 w-5 inline-block ml-2" />
                  شركات الشحن ({shippingCompanies.length})
                </button>
              </div>

              {/* Content */}
              <div className="p-5 max-h-[50vh] overflow-y-auto">
                {selectedTab === 'agents' ? (
                  deliveryAgents.length === 0 ? (
                    <div className="text-center py-10">
                      <Truck className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                      <p className="text-gray-400 mb-4">لا يوجد مناديب توصيل مسجلين</p>
                      <Link href="/vendor/delivery-agents">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          إضافة مندوب توصيل
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {deliveryAgents.map((agent) => (
                        <motion.div
                          key={agent.id}
                          whileHover={{ scale: 1.01 }}
                          className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-blue-500/50 transition-all cursor-pointer"
                          onClick={() => !assigningDelivery && handleAssignAgent(agent)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="bg-blue-500/20 p-2 rounded-full">
                                  {agent.vehicleType === 'دراجة نارية' ? (
                                    <Bike className="h-5 w-5 text-blue-400" />
                                  ) : (
                                    <Car className="h-5 w-5 text-blue-400" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-white font-bold">{agent.name}</h4>
                                  <p className="text-gray-400 text-sm">{agent.phone}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-xs">
                                  📍 {agent.area}
                                </span>
                                <span className="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-xs">
                                  🚗 {agent.vehicleType}
                                </span>
                                <span className="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-xs">
                                  📦 {agent.totalDeliveries} توصيلة
                                </span>
                              </div>
                            </div>
                            <div className="text-left">
                              <p className="text-green-400 font-bold text-lg">{agent.deliveryFee} ج.م</p>
                              <p className="text-gray-500 text-xs">رسوم التوصيل</p>
                            </div>
                          </div>
                          <Button
                            className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                            disabled={assigningDelivery}
                          >
                            {assigningDelivery ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 ml-2" />
                                اختيار هذا المندوب
                              </>
                            )}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )
                ) : (
                  shippingCompanies.length === 0 ? (
                    <div className="text-center py-10">
                      <Building2 className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                      <p className="text-gray-400 mb-4">لا توجد شركات شحن مسجلة</p>
                      <Link href="/vendor/shipping-companies">
                        <Button className="bg-amber-600 hover:bg-amber-700">
                          إضافة شركة شحن
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {shippingCompanies.map((company) => (
                        <motion.div
                          key={company.id}
                          whileHover={{ scale: 1.01 }}
                          className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-amber-500/50 transition-all cursor-pointer"
                          onClick={() => !assigningDelivery && handleAssignCompany(company)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="bg-amber-500/20 p-2 rounded-full">
                                  <Building2 className="h-5 w-5 text-amber-400" />
                                </div>
                                <div>
                                  <h4 className="text-white font-bold">{company.name}</h4>
                                  <p className="text-gray-400 text-sm">{company.phone}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-xs">
                                  📍 {company.areas || 'جميع المناطق'}
                                </span>
                                <span className="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-xs">
                                  📅 {company.estimatedDays}
                                </span>
                                {company.website && (
                                  <a
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-700/50 text-blue-300 px-3 py-1 rounded-full text-xs flex items-center gap-1 hover:bg-blue-600/50"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    الموقع
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="text-left">
                              <p className="text-green-400 font-bold text-lg">{company.defaultFee} ج.م</p>
                              <p className="text-gray-500 text-xs">رسوم الشحن</p>
                            </div>
                          </div>
                          <Button
                            className="w-full mt-3 bg-amber-600 hover:bg-amber-700"
                            disabled={assigningDelivery}
                          >
                            {assigningDelivery ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Package className="h-4 w-4 ml-2" />
                                اختيار هذه الشركة
                              </>
                            )}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )
                )}
              </div>

              {/* Footer */}
              <div className="bg-white/5 border-t border-white/10 p-4 flex justify-between items-center">
                <Link href={selectedTab === 'agents' ? '/vendor/delivery-agents' : '/vendor/shipping-companies'}>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    إدارة {selectedTab === 'agents' ? 'المناديب' : 'شركات الشحن'}
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowDeliveryModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  إلغاء
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal رفض الطلب */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !rejectingOrder && setShowRejectModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-red-500/30 rounded-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-orange-600 p-5">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <X className="h-6 w-6" />
                  رفض الطلب
                </h3>
                <p className="text-red-100 text-sm mt-1">
                  يرجى إدخال سبب رفض الطلب
                </p>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                  <p className="text-red-200 text-sm">
                    ⚠️ سيتم إعادة المخزون وإشعار العميل بسبب الرفض
                  </p>
                </div>

                <label className="block text-white text-sm font-medium mb-2">
                  سبب الرفض *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="اكتب سبب رفض الطلب..."
                  rows={4}
                  disabled={rejectingOrder}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
                />

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleRejectOrder}
                    disabled={rejectingOrder || !rejectionReason.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {rejectingOrder ? (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <X className="w-4 h-4 ml-2" />
                    )}
                    تأكيد الرفض
                  </Button>
                  <Button
                    onClick={() => setShowRejectModal(false)}
                    disabled={rejectingOrder}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
