"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Check, CheckCheck, Package, MessageCircle, AlertTriangle, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/BackButton";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}

export default function VendorNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // جلب الإشعارات كل 30 ثانية
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/vendor/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    setMarkingRead(notificationId);
    try {
      const response = await fetch("/api/vendor/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("فشل تحديث الإشعار");
    } finally {
      setMarkingRead(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/vendor/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
        toast.success("تم تحديد جميع الإشعارات كمقروءة");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("فشل تحديث الإشعارات");
    }
  };

  const deleteNotification = async (notificationId: string) => {
    setDeleting(notificationId);
    try {
      const response = await fetch("/api/vendor/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notificationId)
        );
        // تقليل العداد إذا كان الإشعار غير مقروء
        const notification = notifications.find((n) => n.id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        toast.success("تم حذف الإشعار");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("فشل حذف الإشعار");
    } finally {
      setDeleting(null);
    }
  };

  const deleteAllNotifications = async () => {
    if (!confirm("هل أنت متأكد من حذف جميع الإشعارات؟")) {
      return;
    }

    setDeletingAll(true);
    try {
      const response = await fetch("/api/vendor/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteAll: true }),
      });

      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
        toast.success("تم حذف جميع الإشعارات");
      }
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      toast.error("فشل حذف الإشعارات");
    } finally {
      setDeletingAll(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.orderId) {
      router.push(`/vendor/orders/${notification.orderId}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "NEW_ORDER":
        return <Package className="h-5 w-5 text-green-500" />;
      case "ORDER_STATUS":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "LOW_STOCK":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "NEW_MESSAGE":
        return <MessageCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString("ar-EG");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-8">
        <div className="container mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل الإشعارات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BackButton fallbackUrl="/vendor/dashboard" className="bg-white/10 backdrop-blur-sm border-white/30" />
              <Bell className="h-8 w-8" />
              <div>
                <h1 className="text-2xl md:text-4xl font-bold drop-shadow-lg">الإشعارات</h1>
                <p className="text-teal-100 mt-1 md:mt-2 text-sm md:text-base">
                  لديك {unreadCount} إشعار غير مقروء
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 text-xs md:text-sm"
                >
                  <CheckCheck className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden sm:inline">تحديد الكل كمقروء</span>
                  <span className="sm:hidden">✓ الكل</span>
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  onClick={deleteAllNotifications}
                  disabled={deletingAll}
                  variant="outline"
                  className="bg-red-500/20 backdrop-blur-sm border-red-300/30 text-white hover:bg-red-500/30 text-xs md:text-sm"
                >
                  <Trash2 className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden sm:inline">{deletingAll ? "جاري المسح..." : "مسح الكل"}</span>
                  <span className="sm:hidden">🗑️</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        {notifications.length === 0 ? (
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
            <CardContent className="p-12 text-center">
              <BellOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                لا توجد إشعارات
              </h3>
              <p className="text-gray-500">
                سيتم عرض الإشعارات الجديدة هنا
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 ${
                  notification.isRead
                    ? "bg-white/60"
                    : "bg-white/90 border-l-4 border-l-teal-500"
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {formatTime(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <Badge
                              variant="destructive"
                              className="bg-teal-500"
                            >
                              جديد
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          disabled={markingRead === notification.id}
                          className="flex-shrink-0 hover:bg-green-100"
                          title="تحديد كمقروء"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        disabled={deleting === notification.id}
                        className="flex-shrink-0 hover:bg-red-100"
                        title="حذف الإشعار"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
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
