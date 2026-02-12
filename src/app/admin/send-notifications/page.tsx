'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Bell, Send, Users, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationHistory {
  id: string
  title: string
  body: string
  recipientCount: number
  successCount: number
  failedCount: number
  createdAt: string
  sentToAll: boolean
}

export default function SendNotificationsPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sendToAll, setSendToAll] = useState(true)
  const [image, setImage] = useState('')
  const [data, setData] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<NotificationHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/notifications/send')
      if (response.ok) {
        const result = await response.json()
        setHistory(result.notifications || [])
      }
    } catch (error) {
      console.error('خطأ في تحميل السجل:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('الرجاء إدخال عنوان ومحتوى الإشعار')
      return
    }

    setLoading(true)

    try {
      let parsedData = {}
      if (data.trim()) {
        try {
          parsedData = JSON.parse(data)
        } catch {
          toast.error('البيانات الإضافية يجب أن تكون JSON صحيح')
          setLoading(false)
          return
        }
      }

      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          sendToAll,
          image: image || undefined,
          data: parsedData
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(
          `تم الإرسال بنجاح! ✅\n${result.message}`,
          {
            description: `نجح: ${result.details.success} | فشل: ${result.details.failed}`
          }
        )
        
        // مسح الحقول
        setTitle('')
        setBody('')
        setImage('')
        setData('')
        
        // تحديث السجل
        loadHistory()
      } else {
        toast.error(`خطأ في الإرسال: ${result.error}`)
      }
    } catch (error: any) {
      toast.error(`خطأ: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="w-8 h-8 text-purple-600" />
          إرسال إشعارات Push Notification
        </h1>
        <p className="text-muted-foreground mt-2">
          إرسال إشعارات فورية لمستخدمي التطبيق الموبايل
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* نموذج الإرسال */}
        <Card>
          <CardHeader>
            <CardTitle>إنشاء إشعار جديد</CardTitle>
            <CardDescription>
              املأ البيانات أدناه لإرسال إشعار
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">عنوان الإشعار *</Label>
              <Input
                id="title"
                placeholder="مثال: عرض خاص اليوم!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {title.length}/50 حرف
              </p>
            </div>

            <div>
              <Label htmlFor="body">محتوى الإشعار *</Label>
              <Textarea
                id="body"
                placeholder="مثال: خصم 50% على جميع المنتجات لمدة 24 ساعة فقط!"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                maxLength={150}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {body.length}/150 حرف
              </p>
            </div>

            <div>
              <Label htmlFor="image">رابط الصورة (اختياري)</Label>
              <Input
                id="image"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="data">بيانات إضافية JSON (اختياري)</Label>
              <Textarea
                id="data"
                placeholder='{"type": "order", "orderId": "123"}'
                value={data}
                onChange={(e) => setData(e.target.value)}
                rows={2}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <Label htmlFor="sendToAll">إرسال لجميع المستخدمين</Label>
                <p className="text-xs text-muted-foreground">
                  سيتم الإرسال لكل الأجهزة المسجلة
                </p>
              </div>
              <Switch
                id="sendToAll"
                checked={sendToAll}
                onCheckedChange={setSendToAll}
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={loading || !title.trim() || !body.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="ml-2 h-4 w-4" />
                  إرسال الإشعار
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* السجل */}
        <Card>
          <CardHeader>
            <CardTitle>سجل الإشعارات المرسلة</CardTitle>
            <CardDescription>
              آخر 50 إشعار تم إرسالهم
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا يوجد إشعارات مرسلة بعد</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {history.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">
                        {notification.title}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleDateString('ar-EG', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {notification.body}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{notification.recipientCount}</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>{notification.successCount}</span>
                      </div>
                      {notification.failedCount > 0 && (
                        <div className="flex items-center gap-1 text-red-600">
                          <XCircle className="h-3 w-3" />
                          <span>{notification.failedCount}</span>
                        </div>
                      )}
                      {notification.sentToAll && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          الكل
                        </span>
                      )}
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
