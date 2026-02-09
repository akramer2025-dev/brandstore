"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bell, Send, Users, CheckCircle, XCircle, Loader2, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { toast } from "sonner";

interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  url?: string;
  recipientCount: number;
  successCount: number;
  failedCount: number;
  createdAt: string;
}

export default function PushNotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [icon, setIcon] = useState("/logo.png");
  const [image, setImage] = useState("");
  const [url, setUrl] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // جلب عدد المشتركين
  useEffect(() => {
    fetch("/api/push/subscribers-count")
      .then((res) => res.json())
      .then((data) => setSubscribersCount(data.count || 0))
      .catch(() => setSubscribersCount(0));
  }, []);

  // جلب سجل الإشعارات
  useEffect(() => {
    setIsLoadingHistory(true);
    fetch("/api/push/history")
      .then((res) => res.json())
      .then((data) => {
        setHistory(data.notifications || []);
        setIsLoadingHistory(false);
      })
      .catch(() => {
        setIsLoadingHistory(false);
      });
  }, []);

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("الرجاء إدخال العنوان والمحتوى");
      return;
    }

    if (subscribersCount === 0) {
      toast.error("لا يوجد مشتركين لإرسال الإشعارات لهم");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          icon: icon || "/logo.png",
          image: image || undefined,
          url: url || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل إرسال الإشعار");
      }

      toast.success(`تم إرسال الإشعار بنجاح إلى ${data.successCount} مستخدم`);
      
      // إعادة تعيين النموذج
      setTitle("");
      setBody("");
      setImage("");
      setUrl("");
      setIcon("/logo.png");

      // تحديث السجل
      const historyRes = await fetch("/api/push/history");
      const historyData = await historyRes.json();
      setHistory(historyData.notifications || []);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء إرسال الإشعار");
    } finally {
      setIsSending(false);
    }
  };

  const testNotification = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("الرجاء إدخال العنوان والمحتوى أولاً");
      return;
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || "/logo.png",
        image: image || undefined,
        badge: "/logo.png",
        vibrate: [200, 100, 200],
      });
      toast.success("تم إرسال إشعار تجريبي");
    } else {
      toast.error("الرجاء السماح بالإشعارات أولاً");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <BackButton fallbackUrl="/admin" label="العودة للوحة الإدارة" className="mb-4" />
          <div className="flex items-center gap-4">
            <Bell className="w-12 h-12" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">إدارة الإشعارات</h1>
              <p className="text-purple-100 mt-1">إرسال إشعارات للعملاء مباشرة على أجهزتهم</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* إحصائيات */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="backdrop-blur-sm bg-gray-800/80 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">المشتركين</p>
                  <p className="text-3xl font-bold text-purple-400">{subscribersCount}</p>
                </div>
                <Users className="w-12 h-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-gray-800/80 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">إجمالي الإشعارات</p>
                  <p className="text-3xl font-bold text-green-400">{history.length}</p>
                </div>
                <Bell className="w-12 h-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-gray-800/80 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">معدل النجاح</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {history.length > 0
                      ? Math.round(
                          (history.reduce((acc, n) => acc + n.successCount, 0) /
                            history.reduce((acc, n) => acc + n.recipientCount, 0)) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* نموذج إرسال إشعار جديد */}
          <Card className="backdrop-blur-sm bg-gray-800/80 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Send className="w-6 h-6" />
                إرسال إشعار جديد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white mb-2 block">
                  عنوان الإشعار *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: عرض خاص 🎉"
                  className="bg-gray-700/50 border-gray-600 text-white"
                  maxLength={60}
                />
                <p className="text-xs text-gray-400 mt-1">{title.length}/60 حرف</p>
              </div>

              <div>
                <Label htmlFor="body" className="text-white mb-2 block">
                  محتوى الإشعار *
                </Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="مثال: خصم 50% على جميع المنتجات لمدة 24 ساعة فقط! 🛍️"
                  className="bg-gray-700/50 border-gray-600 text-white min-h-[100px]"
                  maxLength={200}
                />
                <p className="text-xs text-gray-400 mt-1">{body.length}/200 حرف</p>
              </div>

              <div>
                <Label htmlFor="icon" className="text-white mb-2 block flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  أيقونة الإشعار
                </Label>
                <Input
                  id="icon"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="رابط الأيقونة (افتراضي: شعار الموقع)"
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="image" className="text-white mb-2 block flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  صورة الإشعار (اختياري)
                </Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="رابط الصورة (للإشعارات المصورة)"
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="url" className="text-white mb-2 block flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  رابط التوجيه (اختياري)
                </Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="مثال: /products أو /offers"
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSendNotification}
                  disabled={isSending || !title.trim() || !body.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="ml-2 h-5 w-5" />
                      إرسال لكل المشتركين ({subscribersCount})
                    </>
                  )}
                </Button>
                <Button
                  onClick={testNotification}
                  variant="outline"
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                >
                  <Bell className="ml-2 h-5 w-5" />
                  تجربة
                </Button>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  💡 <strong>نصيحة:</strong> سيتم إرسال الإشعار لجميع المستخدمين الذين فعّلوا الإشعارات على
                  أجهزتهم. تأكد من كتابة محتوى واضح وجذاب.
                </p>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mt-3">
                <p className="text-orange-300 text-sm font-semibold mb-2">⚠️ لماذا قد تفشل بعض الإشعارات؟</p>
                <ul className="text-orange-200 text-xs space-y-1 mr-4 list-disc">
                  <li><strong>المتصفح مغلق:</strong> بعض المتصفحات لا تستقبل إشعارات عند الإغلاق الكامل</li>
                  <li><strong>الاشتراك منتهي (410):</strong> يتم حذفه تلقائياً من قاعدة البيانات</li>
                  <li><strong>أذونات ملغية:</strong> المستخدم ألغى السماح بالإشعارات بعد الاشتراك</li>
                  <li><strong>Service Worker متوقف:</strong> تم إيقافه من إعدادات المتصفح</li>
                </ul>
                <p className="text-orange-200 text-xs mt-2">
                  ✅ الحل: المستخدمون يحتاجون إعادة الاشتراك من زر "فعّل الإشعارات"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* سجل الإشعارات */}
          <Card className="backdrop-blur-sm bg-gray-800/80 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-6 h-6" />
                سجل الإشعارات المرسلة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>لم يتم إرسال أي إشعارات بعد</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {history.map((notification) => (
                    <div key={notification.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50">
                      <div className="flex items-start gap-3">
                        {notification.icon && (
                          <img src={notification.icon} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold truncate">{notification.title}</h4>
                          <p className="text-gray-300 text-sm line-clamp-2 mt-1">{notification.body}</p>
                          {notification.url && (
                            <p className="text-purple-400 text-xs mt-1 truncate">
                              🔗 {notification.url}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-xs flex-wrap">
                            <span className="text-green-400 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              {notification.successCount} نجح
                            </span>
                            {notification.failedCount > 0 && (
                              <>
                                <span className="text-red-400 flex items-center gap-1">
                                  <XCircle className="w-3 h-3" />
                                  {notification.failedCount} فشل
                                </span>
                                <span className="text-yellow-400 text-xs">
                                  ({Math.round((notification.successCount / notification.recipientCount) * 100)}% نجاح)
                                </span>
                              </>
                            )}
                            <span className="text-gray-400">
                              {new Date(notification.createdAt).toLocaleDateString("ar-EG", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
