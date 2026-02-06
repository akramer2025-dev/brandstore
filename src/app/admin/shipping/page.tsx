"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Truck, Package, Clock, CheckCircle, XCircle, AlertCircle, Send, Edit } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  orderNumber: string;
  finalAmount: number;
  deliveryAddress: string;
  deliveryPhone: string;
  customerNotes?: string;
  bustaStatus?: string;
  bustaShipmentId?: string;
  bustaNotes?: string;
  bustaTrackingUrl?: string;
  bustaSentAt?: string;
  customer: {
    name: string;
    phone?: string;
  };
  items: Array<{
    quantity: number;
    product: {
      titleAr?: string;
      title: string;
    };
  }>;
}

const STATUS_COLORS: { [key: string]: string } = {
  PENDING: "bg-yellow-500",
  SENT_TO_BUSTA: "bg-blue-500", 
  PICKED_UP: "bg-indigo-500",
  IN_TRANSIT: "bg-purple-500",
  OUT_FOR_DELIVERY: "bg-orange-500",
  DELIVERED: "bg-green-500",
  ATTEMPTED: "bg-red-500",
  RETURNED: "bg-gray-500",
  CANCELLED: "bg-black",
  EXCEPTION: "bg-red-600",
};

const STATUS_LABELS: { [key: string]: string } = {
  PENDING: "في الانتظار",
  SENT_TO_BUSTA: "مُرسل لبوسطة",
  PICKED_UP: "تم الاستلام",
  IN_TRANSIT: "في الطريق", 
  OUT_FOR_DELIVERY: "خرج للتوصيل",
  DELIVERED: "تم التوصيل",
  ATTEMPTED: "فشل التوصيل",
  RETURNED: "مُرجع", 
  CANCELLED: "ملغي",
  EXCEPTION: "استثناء",
};

export default function BustaShippingPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // بيانات التحديث  
  const [newStatus, setNewStatus] = useState("");
  const [shipmentId, setShipmentId] = useState("");
  const [notes, setNotes] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  useEffect(() => {
    fetchBustaOrders();
  }, []);

  const fetchBustaOrders = async () => {
    try {
      const response = await fetch("/api/shipping/busta");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("فشل في جلب طلبات الشحن");
    } finally {
      setLoading(false);
    }
  };

  const sendToBusta = async (orderId: string) => {
    try {
      setUpdateLoading(true);
      const response = await fetch("/api/shipping/busta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        toast.success("تم إرسال الطلب لشركة بوسطة بنجاح!");
        fetchBustaOrders();
      } else {
        const error = await response.json();
        toast.error(error.error || "فشل في الإرسال");
      }
    } catch (error) {
      toast.error("فشل في إرسال الطلب");
    } finally {
      setUpdateLoading(false);
    }
  };

  const updateShippingStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      setUpdateLoading(true);
      const response = await fetch("/api/shipping/update-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          bustaStatus: newStatus,
          bustaShipmentId: shipmentId,
          bustaNotes: notes,
          bustaTrackingUrl: trackingUrl,
        }),
      });

      if (response.ok) {
        toast.success("تم تحديث حالة الشحنة بنجاح!");
        fetchBustaOrders();
        setSelectedOrder(null);
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.error || "فشل في التحديث");
      }
    } catch (error) {
      toast.error("فشل في تحديث الحالة");
    } finally {
      setUpdateLoading(false);
    }
  };

  const resetForm = () => {
    setNewStatus("");
    setShipmentId("");
    setNotes("");
    setTrackingUrl("");
  };

  const openUpdateDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.bustaStatus || "");
    setShipmentId(order.bustaShipmentId || "");
    setNotes(order.bustaNotes || "");
    setTrackingUrl(order.bustaTrackingUrl || "");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Truck className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">إدارة شحنات بوسطة</h1>
          <p className="text-gray-600">متابعة وإدارة طلبات الشحن مع شركة بوسطة</p>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{orders.length}</div>
            <div className="text-sm text-gray-600">إجمالي الطلبات</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {orders.filter(o => ["PENDING", "SENT_TO_BUSTA"].includes(o.bustaStatus || "")).length}
            </div>
            <div className="text-sm text-gray-600">في الانتظار</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {orders.filter(o => o.bustaStatus === "DELIVERED").length}
            </div>
            <div className="text-sm text-gray-600">تم التوصيل</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {orders.filter(o => ["RETURNED", "CANCELLED"].includes(o.bustaStatus || "")).length}
            </div>
            <div className="text-sm text-gray-600">مرجع/ملغي</div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الطلبات */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg">طلب #{order.orderNumber}</h3>
                  <Badge className={`${STATUS_COLORS[order.bustaStatus || "PENDING"]} text-white`}>
                    {STATUS_LABELS[order.bustaStatus || "PENDING"]}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {!order.bustaStatus && (
                    <Button
                      onClick={() => sendToBusta(order.id)}
                      disabled={updateLoading}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      إرسال لبوسطة
                    </Button>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => openUpdateDialog(order)}
                        size="sm"
                        variant="outline"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        تحديث الحالة
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>تحديث حالة الشحنة</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>الحالة الجديدة</Label>
                          <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الحالة" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>رقم الشحنة</Label>
                          <Input
                            value={shipmentId}
                            onChange={(e) => setShipmentId(e.target.value)}
                            placeholder="رقم الشحنة من بوسطة"
                          />
                        </div>

                        <div>
                          <Label>رابط التتبع</Label>
                          <Input
                            value={trackingUrl}
                            onChange={(e) => setTrackingUrl(e.target.value)}
                            placeholder="https://..."
                          />
                        </div>

                        <div>
                          <Label>ملاحظات</Label>
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="ملاحظات من شركة بوسطة..."
                            rows={3}
                          />
                        </div>

                        <Button
                          onClick={updateShippingStatus}
                          disabled={updateLoading || !newStatus}
                          className="w-full"
                        >
                          {updateLoading ? "جارٍ التحديث..." : "تحديث الحالة"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* بيانات العميل */}
                <div>
                  <h4 className="font-semibold mb-2 text-gray-700">بيانات العميل</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>الاسم:</strong> {order.customer.name}</p>
                    <p><strong>الهاتف:</strong> {order.deliveryPhone}</p>
                    <p><strong>العنوان:</strong> {order.deliveryAddress}</p>
                    {order.customerNotes && (
                      <p><strong>ملاحظات:</strong> {order.customerNotes}</p>
                    )}
                  </div>
                </div>

                {/* معلومات الشحنة */}
                <div>
                  <h4 className="font-semibold mb-2 text-gray-700">معلومات الشحنة</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>المبلغ:</strong> {order.finalAmount} جنيه</p>
                    {order.bustaShipmentId && (
                      <p><strong>رقم الشحنة:</strong> {order.bustaShipmentId}</p>
                    )}
                    {order.bustaTrackingUrl && (
                      <p>
                        <strong>التتبع:</strong>{" "}
                        <a 
                          href={order.bustaTrackingUrl} 
                          target="_blank" 
                          className="text-blue-600 hover:underline"
                        >
                          فتح رابط التتبع
                        </a>
                      </p>
                    )}
                    {order.bustaSentAt && (
                      <p>
                        <strong>تاريخ الإرسال:</strong>{" "}
                        {new Date(order.bustaSentAt).toLocaleDateString("ar-EG")}
                      </p>
                    )}
                    {order.bustaNotes && (
                      <p><strong>ملاحظات بوسطة:</strong> {order.bustaNotes}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* المنتجات */}
              <div className="mt-4">
                <h4 className="font-semibold mb-2 text-gray-700">المنتجات</h4>
                <div className="text-sm text-gray-600">
                  {order.items.map((item, index) => (
                    <span key={index}>
                      {item.product.titleAr || item.product.title} (×{item.quantity})
                      {index < order.items.length - 1 && ", "}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {orders.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                لا توجد طلبات شحن
              </h3>
              <p className="text-gray-500">
                لم يتم إرسال أي طلبات لشركة بوسطة بعد
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}