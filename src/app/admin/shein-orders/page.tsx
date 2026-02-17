'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Eye, 
  DollarSign, 
  Package, 
  CheckCircle, 
  XCircle,
  Clock,
  Truck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface SheinOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  productLinks: string[];
  productImages: string[];
  selectedColors: string[];
  notes: string | null;
  status: string;
  estimatedTotal: number | null;
  advancePayment: number | null;
  finalPayment: number | null;
  advancePaid: boolean;
  finalPaid: boolean;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  REVIEWING: 'bg-blue-500',
  QUOTED: 'bg-purple-500',
  ADVANCE_PAID: 'bg-green-500',
  ORDERING: 'bg-indigo-500',
  SHIPPED: 'bg-cyan-500',
  DELIVERED: 'bg-teal-500',
  COMPLETED: 'bg-green-700',
  CANCELLED: 'bg-red-500',
};

const statusArabic: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  REVIEWING: 'قيد المراجعة',
  QUOTED: 'تم التسعير',
  ADVANCE_PAID: 'تم دفع المقدم',
  ORDERING: 'جاري الطلب',
  SHIPPED: 'تم الشحن',
  DELIVERED: 'تم التوصيل',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
};

export default function AdminSheinOrdersPage() {
  const [orders, setOrders] = useState<SheinOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<SheinOrder | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/shein/orders');
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.error || 'فشل في جلب الطلبات');
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('حدث خطأ أثناء جلب الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/shein/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('تم تحديث حالة الطلب بنجاح');
        fetchOrders();
      } else {
        toast.error(data.error || 'فشل في تحديث حالة الطلب');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('حدث خطأ أثناء تحديث الحالة');
    } finally {
      setUpdating(false);
    }
  };

  const submitQuote = async (orderId: string) => {
    if (!estimatedPrice || parseFloat(estimatedPrice) <= 0) {
      toast.error('الرجاء إدخال السعر المتوقع');
      return;
    }

    try {
      setUpdating(true);
      const total = parseFloat(estimatedPrice);
      const advance = total * 0.5;
      const final = total * 0.5;

      const response = await fetch(`/api/admin/shein/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estimatedTotal: total,
          advancePayment: advance,
          finalPayment: final,
          status: 'QUOTED',
          adminNotes,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('تم إرسال التسعير بنجاح');
        setEstimatedPrice('');
        setAdminNotes('');
        setSelectedOrder(null);
        fetchOrders();
      } else {
        toast.error(data.error || 'فشل في إرسال التسعير');
      }
    } catch (error: any) {
      console.error('Error submitting quote:', error);
      toast.error('حدث خطأ أثناء إرسال التسعير');
    } finally {
      setUpdating(false);
    }
  };

  const markPaymentReceived = async (orderId: string, paymentType: 'advance' | 'final') => {
    try {
      setUpdating(true);
      const updateData: any = {};
      
      if (paymentType === 'advance') {
        updateData.advancePaid = true;
        updateData.status = 'ADVANCE_PAID';
      } else {
        updateData.finalPaid = true;
        updateData.status = 'COMPLETED';
      }

      const response = await fetch(`/api/admin/shein/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('تم تحديث حالة الدفع بنجاح');
        fetchOrders();
      } else {
        toast.error(data.error || 'فشل في تحديث حالة الدفع');
      }
    } catch (error: any) {
      console.error('Error updating payment:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الدفع');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = filterStatus === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة طلبات شي إن</h1>
        <p className="text-gray-600">مراجعة وإدارة جميع طلبات المنتجات من شي إن</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="فلترة حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">كل الطلبات</SelectItem>
            <SelectItem value="PENDING">قيد الانتظار</SelectItem>
            <SelectItem value="REVIEWING">قيد المراجعة</SelectItem>
            <SelectItem value="QUOTED">تم التسعير</SelectItem>
            <SelectItem value="ADVANCE_PAID">تم دفع المقدم</SelectItem>
            <SelectItem value="ORDERING">جاري الطلب</SelectItem>
            <SelectItem value="SHIPPED">تم الشحن</SelectItem>
            <SelectItem value="DELIVERED">تم التوصيل</SelectItem>
            <SelectItem value="COMPLETED">مكتمل</SelectItem>
            <SelectItem value="CANCELLED">ملغي</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={fetchOrders} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>

        <div className="mr-auto">
          <Badge variant="secondary">
            إجمالي الطلبات: {filteredOrders.length}
          </Badge>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{order.customerName}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{order.customerPhone}</p>
                </div>
                <Badge className={statusColors[order.status]}>
                  {statusArabic[order.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Order Info */}
                <div className="text-sm space-y-1">
                  <p className="text-gray-600">
                    <strong>عدد الروابط:</strong> {order.productLinks.filter(l => l).length}
                  </p>
                  <p className="text-gray-600">
                    <strong>عدد الصور:</strong> {order.productImages.length}
                  </p>
                  <p className="text-gray-600">
                    <strong>تاريخ الطلب:</strong> {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>

                {/* Price Info */}
                {order.estimatedTotal && (
                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    <p className="font-semibold">الإجمالي: {order.estimatedTotal} ج.م</p>
                    <p className="text-gray-600">
                      المقدم ({order.advancePaid ? '✓ مدفوع' : 'غير مدفوع'}): {order.advancePayment} ج.م
                    </p>
                    <p className="text-gray-600">
                      المتبقي ({order.finalPaid ? '✓ مدفوع' : 'غير مدفوع'}): {order.finalPayment} ج.م
                    </p>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4 ml-2" />
                        عرض التفاصيل
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-3xl lg:max-w-4xl max-h-[85vh] overflow-y-auto" dir="rtl">
                      <DialogHeader>
                        <DialogTitle>تفاصيل الطلب</DialogTitle>
                        <DialogDescription>
                          رقم الطلب: {order.id.slice(0, 8)}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 mt-4">
                        {/* Customer Info */}
                        <div>
                          <h3 className="font-semibold mb-2">معلومات العميل</h3>
                          <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                            <p><strong>الاسم:</strong> {order.customerName}</p>
                            <p><strong>الهاتف:</strong> {order.customerPhone}</p>
                            {order.customerEmail && (
                              <p><strong>البريد الإلكتروني:</strong> {order.customerEmail}</p>
                            )}
                          </div>
                        </div>

                        {/* Product Links */}
                        {order.productLinks.filter(l => l).length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-2">روابط المنتجات</h3>
                            <div className="space-y-2">
                              {order.productLinks.filter(l => l).map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  رابط المنتج {idx + 1}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Product Images */}
                        {order.productImages.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-2">صور المنتجات</h3>
                            <div className="grid grid-cols-3 gap-2">
                              {order.productImages.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt={`Product ${idx + 1}`}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Selected Colors */}
                        {order.selectedColors && order.selectedColors.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-2">الألوان المطلوبة</h3>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                              <div className="flex flex-wrap gap-2">
                                {order.selectedColors.map((color, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 bg-white border border-purple-300 rounded-full px-3 py-1 text-sm font-medium"
                                  >
                                    🎨 {color}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {order.notes && (
                          <div>
                            <h3 className="font-semibold mb-2">ملاحظات العميل</h3>
                            <p className="bg-gray-50 p-4 rounded-lg">{order.notes}</p>
                          </div>
                        )}

                        {/* Admin Notes */}
                        {order.adminNotes && (
                          <div>
                            <h3 className="font-semibold mb-2">ملاحظات الإدارة</h3>
                            <p className="bg-blue-50 p-4 rounded-lg">{order.adminNotes}</p>
                          </div>
                        )}

                        {/* Quote Form */}
                        {order.status === 'PENDING' || order.status === 'REVIEWING' ? (
                          <div className="border-t pt-4">
                            <h3 className="font-semibold mb-4">إرسال تسعير للعميل</h3>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  السعر الإجمالي (ج.م)
                                </label>
                                <Input
                                  type="number"
                                  placeholder="مثال: 1000"
                                  value={estimatedPrice}
                                  onChange={(e) => setEstimatedPrice(e.target.value)}
                                />
                                {estimatedPrice && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    المقدم: {(parseFloat(estimatedPrice) * 0.5).toFixed(2)} ج.م | 
                                    المتبقي: {(parseFloat(estimatedPrice) * 0.5).toFixed(2)} ج.م
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  ملاحظات (اختياري)
                                </label>
                                <Textarea
                                  placeholder="ملاحظات للعميل عن المنتجات أو التوصيل..."
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  rows={3}
                                />
                              </div>
                              <Button
                                onClick={() => submitQuote(order.id)}
                                disabled={updating || !estimatedPrice}
                                className="w-full"
                              >
                                <DollarSign className="h-4 w-4 ml-2" />
                                إرسال التسعير
                              </Button>
                            </div>
                          </div>
                        ) : null}

                        {/* Status Update */}
                        <div className="border-t pt-4">
                          <h3 className="font-semibold mb-3">تحديث حالة الطلب</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {order.status === 'QUOTED' && !order.advancePaid && (
                              <Button
                                onClick={() => markPaymentReceived(order.id, 'advance')}
                                disabled={updating}
                                variant="outline"
                                className="col-span-2"
                              >
                                <CheckCircle className="h-4 w-4 ml-2" />
                                تأكيد استلام المقدم
                              </Button>
                            )}
                            
                            {order.status === 'ADVANCE_PAID' && (
                              <Button
                                onClick={() => updateOrderStatus(order.id, 'ORDERING')}
                                disabled={updating}
                                variant="outline"
                              >
                                <Package className="h-4 w-4 ml-2" />
                                بدء الطلب
                              </Button>
                            )}

                            {order.status === 'ORDERING' && (
                              <Button
                                onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
                                disabled={updating}
                                variant="outline"
                              >
                                <Truck className="h-4 w-4 ml-2" />
                                تم الشحن
                              </Button>
                            )}

                            {order.status === 'SHIPPED' && (
                              <Button
                                onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                                disabled={updating}
                                variant="outline"
                              >
                                <CheckCircle className="h-4 w-4 ml-2" />
                                تم التوصيل
                              </Button>
                            )}

                            {order.status === 'DELIVERED' && !order.finalPaid && (
                              <Button
                                onClick={() => markPaymentReceived(order.id, 'final')}
                                disabled={updating}
                                variant="outline"
                                className="col-span-2"
                              >
                                <DollarSign className="h-4 w-4 ml-2" />
                                تأكيد استلام المبلغ المتبقي
                              </Button>
                            )}

                            {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                              <Button
                                onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                                disabled={updating}
                                variant="destructive"
                              >
                                <XCircle className="h-4 w-4 ml-2" />
                                إلغاء الطلب
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد طلبات</h3>
          <p className="text-gray-600">لم يتم العثور على طلبات بهذا الفلتر</p>
        </div>
      )}
    </div>
  );
}
