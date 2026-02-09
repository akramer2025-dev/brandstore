"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Bell, 
  Send, 
  Users, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Image as ImageIcon, 
  Link as LinkIcon,
  ArrowLeft
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface NotificationHistory {
  id: string
  title: string
  body: string
  icon?: string
  image?: string
  url?: string
  recipientCount: number
  successCount: number
  failedCount: number
  createdAt: string
}

export default function DeveloperNotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [icon, setIcon] = useState("/logo.png")
  const [image, setImage] = useState("")
  const [url, setUrl] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [subscribersCount, setSubscribersCount] = useState(0)
  const [history, setHistory] = useState<NotificationHistory[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/login")
      return
    }

    if (session.user.role !== "DEVELOPER") {
      router.push("/")
      return
    }
  }, [session, status, router])

  // جلب عدد المشتركين
  useEffect(() => {
    if (session?.user.role === "DEVELOPER") {
      fetch("/api/push/subscribers-count")
        .then((res) => res.json())
        .then((data) => setSubscribersCount(data.count || 0))
        .catch(() => setSubscribersCount(0))
    }
  }, [session])

  // جلب سجل الإشعارات
  useEffect(() => {
    if (session?.user.role === "DEVELOPER") {
      setIsLoadingHistory(true)
      fetch("/api/push/history")
        .then((res) => res.json())
        .then((data) => {
          setHistory(data.notifications || [])
          setIsLoadingHistory(false)
        })
        .catch(() => {
          setIsLoadingHistory(false)
        })
    }
  }, [session])

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("الرجاء إدخال العنوان والمحتوى")
      return
    }

    if (subscribersCount === 0) {
      toast.error("لا يوجد مشتركين لإرسال الإشعارات لهم")
      return
    }

    setIsSending(true)

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
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "فشل إرسال الإشعار")
      }

      toast.success(`تم إرسال الإشعار بنجاح إلى ${data.successCount} مستخدم`)
      
      // إعادة تعيين النموذج
      setTitle("")
      setBody("")
      setImage("")
      setUrl("")
      setIcon("/logo.png")

      // تحديث السجل
      const updatedHistory = await fetch("/api/push/history").then(res => res.json())
      setHistory(updatedHistory.notifications || [])

    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء إرسال الإشعار")
    } finally {
      setIsSending(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "DEVELOPER") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link href="/developer">
            <Button variant="outline" size="icon" className="bg-gray-800 border-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              🔔 إرسال إشعارات للعملاء
            </h1>
            <p className="text-gray-400">إرسال إشعارات Push مباشرة لأجهزة العملاء</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Send Notification Form */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-6 h-6 text-purple-500" />
                  إرسال إشعار جديد
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">عنوان الإشعار *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: عرض خاص اليوم!"
                    className="bg-gray-800 border-gray-700"
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-500 mt-1">{title.length}/50 حرف</p>
                </div>

                <div>
                  <Label htmlFor="body">محتوى الإشعار *</Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="مثال: خصم 50% على جميع المنتجات لفترة محدودة!"
                    className="bg-gray-800 border-gray-700 min-h-[100px]"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">{body.length}/200 حرف</p>
                </div>

                <div>
                  <Label htmlFor="icon" className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    أيقونة الإشعار (اختياري)
                  </Label>
                  <Input
                    id="icon"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="/logo.png"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label htmlFor="image" className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    صورة كبيرة (اختياري)
                  </Label>
                  <Input
                    id="image"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label htmlFor="url" className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    رابط عند الضغط (اختياري)
                  </Label>
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="/products atau https://example.com"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <Button
                  onClick={handleSendNotification}
                  disabled={isSending || !title || !body}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      إرسال الإشعار ({subscribersCount} مستخدم)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Stats & Info */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-12 h-12 text-purple-400" />
                  <div className="text-right">
                    <p className="text-4xl font-bold text-purple-400">{subscribersCount}</p>
                    <p className="text-gray-400 text-sm">مشترك نشط</p>
                  </div>
                </div>
                <p className="text-gray-400 text-xs">
                  عدد المستخدمين المشتركين في خدمة الإشعارات
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">💡 نصائح</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-400">
                <p>• اجعل العنوان جذاباً ومختصراً</p>
                <p>• استخدم رموز تعبيرية (Emoji) للفت الانتباه</p>
                <p>• أضف صورة لزيادة التفاعل</p>
                <p>• حدد رابط مباشر للصفحة المستهدفة</p>
                <p>• أفضل وقت للإرسال: 7-9 مساءً</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notification History */}
        <Card className="mt-6 bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-500" />
              سجل الإشعارات المرسلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500" />
                <p className="text-gray-400 mt-2">جاري التحميل...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Bell className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>لم يتم إرسال أي إشعارات بعد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((notification) => (
                  <div
                    key={notification.id}
                    className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{notification.title}</h3>
                        <p className="text-gray-400 text-sm">{notification.body}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleString('ar-EG')}
                        </p>
                      </div>
                    </div>
                    
                    {notification.image && (
                      <img 
                        src={notification.image} 
                        alt={notification.title}
                        className="rounded-lg mt-2 max-h-40 object-cover"
                      />
                    )}
                    
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1 text-green-500">
                        <CheckCircle className="w-4 h-4" />
                        <span>{notification.successCount} نجح</span>
                      </div>
                      {notification.failedCount > 0 && (
                        <div className="flex items-center gap-1 text-red-500">
                          <XCircle className="w-4 h-4" />
                          <span>{notification.failedCount} فشل</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{notification.recipientCount} مستلم</span>
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
  )
}
