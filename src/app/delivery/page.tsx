"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Navigation,
  User
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  deliveryAddress: string;
  deliveryPhone: string;
  finalAmount: number;
  deliveryFee: number;
  inspectionResult: string | null;
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
    };
  }[];
}

export default function DeliveryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (session?.user?.role !== "DELIVERY_STAFF") {
      router.push("/");
      return;
    }

    fetchOrders();
  }, [session, status, router]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/delivery/orders");
      if (!res.ok) throw new Error("فشل تحميل الطلبات");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, inspectionResult: string | null) => {
    if (status === "DELIVERED" && inspectionResult === "ACCEPTED") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-full text-sm font-bold">
          <CheckCircle2 className="w-4 h-4" />
          تم القبول
        </span>
      );
    }
    if (status === "RETURNED" && inspectionResult === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-full text-sm font-bold">
          <XCircle className="w-4 h-4" />
          تم الرفض
        </span>
      );
    }
    if (status === "OUT_FOR_DELIVERY") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold animate-pulse">
          <Package className="w-4 h-4" />
          قيد التوصيل
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded-full text-sm">
        <Clock className="w-4 h-4" />
        {status}
      </span>
    );
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "pending") return order.status === "OUT_FOR_DELIVERY";
    if (filter === "completed") return order.status === "DELIVERED" || order.status === "RETURNED";
    return true;
  });

  const pendingCount = orders.filter(o => o.status === "OUT_FOR_DELIVERY").length;
  const completedCount = orders.filter(o => o.status === "DELIVERED" || o.status === "RETURNED").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-teal-500" />
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent mb-2">
            طلبات التوصيل
          </h1>
          <p className="text-gray-400">مرحباً {session?.user?.name || session?.user?.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800/80 border-teal-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">إجمالي الطلبات</p>
                  <p className="text-3xl font-bold text-white">{orders.length}</p>
                </div>
                <div className="w-12 h-12 bg-teal-600/20 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-teal-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/80 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">قيد التوصيل</p>
                  <p className="text-3xl font-bold text-white">{pendingCount}</p>
                </div>
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <Navigation className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/80 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">مكتملة</p>
                  <p className="text-3xl font-bold text-white">{completedCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
            className={filter === "all" ? "bg-teal-600 hover:bg-teal-700" : "border-teal-500/50 text-gray-300"}
          >
            الكل ({orders.length})
          </Button>
          <Button
            onClick={() => setFilter("pending")}
            variant={filter === "pending" ? "default" : "outline"}
            className={filter === "pending" ? "bg-blue-600 hover:bg-blue-700" : "border-blue-500/50 text-gray-300"}
          >
            قيد التوصيل ({pendingCount})
          </Button>
          <Button
            onClick={() => setFilter("completed")}
            variant={filter === "completed" ? "default" : "outline"}
            className={filter === "completed" ? "bg-green-600 hover:bg-green-700" : "border-green-500/50 text-gray-300"}
          >
            مكتملة ({completedCount})
          </Button>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card className="bg-gray-800/80 border-teal-500/20 p-12 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400">لا توجد طلبات</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="bg-gray-800/80 border-teal-500/20 hover:border-teal-500/50 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Package className="w-5 h-5 text-teal-400" />
                      طلب #{order.orderNumber}
                    </CardTitle>
                    {getStatusBadge(order.status, order.inspectionResult)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Customer Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-300">
                        <User className="w-4 h-4 text-teal-400" />
                        <span className="font-medium">العميل:</span>
                        <span>{order.customer.name || order.customer.username}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Phone className="w-4 h-4 text-teal-400" />
                        <span className="font-medium">الهاتف:</span>
                        <a href={`tel:${order.deliveryPhone}`} className="text-teal-400 hover:underline">
                          {order.deliveryPhone}
                        </a>
                      </div>
                      <div className="flex items-start gap-2 text-gray-300">
                        <MapPin className="w-4 h-4 text-teal-400 mt-1" />
                        <div>
                          <span className="font-medium">العنوان:</span>
                          <p className="text-sm">{order.deliveryAddress}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-gray-300">
                        <span>عدد المنتجات:</span>
                        <span className="font-bold">{order.items.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-300">
                        <span>رسوم التوصيل:</span>
                        <span className="font-bold text-teal-400">{order.deliveryFee} جنيه</span>
                      </div>
                      <div className="flex items-center justify-between text-white">
                        <span className="font-bold">المبلغ الإجمالي:</span>
                        <span className="text-2xl font-bold text-teal-400">{order.finalAmount} جنيه</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-3 pt-4 border-t border-gray-700">
                    <Link href={`/delivery/${order.id}`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
                        <Package className="w-4 h-4 ml-2" />
                        {order.status === "OUT_FOR_DELIVERY" ? "تسجيل نتيجة التوصيل" : "عرض التفاصيل"}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="border-teal-500/50 hover:bg-teal-500/10"
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.deliveryAddress)}`, '_blank')}
                    >
                      <Navigation className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
