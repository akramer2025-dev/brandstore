'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import {
  Settings,
  ArrowRight,
  User,
  Bell,
  Lock,
  LogOut,
  Save,
  Loader2,
  Factory,
  Mail,
  Phone
} from 'lucide-react'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.username || '',
    email: session?.user?.email || '',
    phone: '',
    factoryName: '',
    address: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate save
    setTimeout(() => {
      alert('تم حفظ الإعدادات بنجاح')
      setLoading(false)
    }, 1000)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-blue-400 mb-2">
          <Link href="/manufacturer/dashboard" className="hover:text-blue-300">لوحة التحكم</Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-white">الإعدادات</span>
        </div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-gray-400" />
          الإعدادات
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4">
              <nav className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 bg-white/5">
                  <User className="w-4 h-4 ml-2" />
                  معلومات الحساب
                </Button>
                <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-white/10 hover:text-white">
                  <Factory className="w-4 h-4 ml-2" />
                  بيانات المصنع
                </Button>
                <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-white/10 hover:text-white">
                  <Bell className="w-4 h-4 ml-2" />
                  الإشعارات
                </Button>
                <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-white/10 hover:text-white">
                  <Lock className="w-4 h-4 ml-2" />
                  الأمان
                </Button>
                <hr className="border-white/10 my-4" />
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Info */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                معلومات الحساب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">الاسم</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="اسمك"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">رقم الهاتف</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01xxxxxxxxx"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  ) : (
                    <Save className="w-4 h-4 ml-2" />
                  )}
                  حفظ التغييرات
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Factory Info */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Factory className="w-5 h-5" />
                بيانات المصنع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">اسم المصنع</Label>
                  <Input
                    value={formData.factoryName}
                    onChange={(e) => setFormData({ ...formData, factoryName: e.target.value })}
                    placeholder="مصنع الملابس الحديثة"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">العنوان</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="المنطقة الصناعية، القاهرة"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <Button
                  type="button"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <Save className="w-4 h-4 ml-2" />
                  حفظ بيانات المصنع
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5" />
                الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">إشعارات أوامر الإنتاج</p>
                    <p className="text-gray-400 text-sm">إشعار عند إنشاء أو تحديث أمر إنتاج</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">تنبيهات المخزون</p>
                    <p className="text-gray-400 text-sm">إشعار عند انخفاض مخزون الخامات</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">تقارير أسبوعية</p>
                    <p className="text-gray-400 text-sm">إرسال ملخص أسبوعي بالبريد</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
