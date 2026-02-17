'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { BackButton } from '@/components/BackButton'
import {
  Save,
  UserCog,
  DollarSign,
  Percent,
  FileText,
  Mail,
  Lock,
  CheckCircle,
  XCircle,
  Loader2,
  Shield,
  Trash2,
  Upload,
  ShoppingCart,
} from 'lucide-react'

interface Partner {
  id: string
  partnerName: string
  partnerType: string
  capitalAmount: number
  initialAmount: number
  currentAmount: number
  capitalPercent: number
  joinDate: string
  isActive: boolean
  isSuspended?: boolean
  suspensionReason?: string | null
  notes: string | null
  createdAt: string
}

export default function EditPartnerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const partnerId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [partner, setPartner] = useState<Partner | null>(null)
  
  const [formData, setFormData] = useState({
    partnerName: '',
    capitalAmount: '',
    capitalPercent: '',
    partnerType: 'PARTNER',
    notes: '',
    isActive: true,
    changePassword: false,
    newPassword: '',
    email: '',
    hasAccount: false,
    canDeleteOrders: false,
    canUploadShein: false,
    canAddOfflineProducts: false,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchPartner()
    }
  }, [status, session, router])

  const fetchPartner = async () => {
    try {
      setLoading(true)
      console.log('🔄 جاري جلب بيانات الشريك...', partnerId)
      
      const response = await fetch(`/api/admin/partners/${partnerId}`)
      const data = await response.json()
      
      if (response.ok) {
        console.log('✅ تم جلب بيانات الشريك:', data)
        setPartner(data.partner)
        
        setFormData({
          partnerName: data.partner.partnerName,
          capitalAmount: data.partner.capitalAmount.toString(),
          capitalPercent: data.partner.capitalPercent.toString(),
          partnerType: data.partner.partnerType,
          notes: data.partner.notes || '',
          isActive: data.partner.isActive,
          changePassword: false,
          newPassword: '',
          email: data.email || '',
          hasAccount: data.hasAccount || false,
          canDeleteOrders: data.canDeleteOrders || false,
          canUploadShein: data.canUploadShein || false,
          canAddOfflineProducts: data.canAddOfflineProducts || false,
        })
      } else {
        console.error('❌ خطأ في جلب الشريك:', data.error)
        toast.error(data.error || 'حدث خطأ أثناء جلب بيانات الشريك')
        router.push('/admin/partners')
      }
    } catch (error) {
      console.error('❌ Error fetching partner:', error)
      toast.error('حدث خطأ أثناء جلب بيانات الشريك')
      router.push('/admin/partners')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // التحقق من البيانات
    const capitalAmount = parseFloat(formData.capitalAmount)
    const capitalPercent = parseFloat(formData.capitalPercent)

    if (isNaN(capitalAmount) || capitalAmount < 0) {
      toast.error('مبلغ رأس المال غير صحيح')
      return
    }

    if (isNaN(capitalPercent) || capitalPercent < 0 || capitalPercent > 100) {
      toast.error('نسبة المساهمة يجب أن تكون بين 0 و 100')
      return
    }

    if (formData.changePassword && !formData.newPassword) {
      toast.error('الرجاء إدخال كلمة المرور الجديدة')
      return
    }

    if (formData.changePassword && formData.newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/admin/partners/${partnerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('✅ تم تحديث بيانات الشريك بنجاح')
        router.push('/admin/partners')
      } else {
        toast.error(data.error || 'حدث خطأ أثناء تحديث الشريك')
      }
    } catch (error) {
      console.error('Error updating partner:', error)
      toast.error('حدث خطأ أثناء تحديث الشريك')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white text-lg">جاري تحميل بيانات الشريك...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* الهيدر */}
      <div className="relative z-10 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <BackButton fallbackUrl="/admin/partners" label="العودة لقائمة الشركاء" className="mb-2" />
          <h1 className="text-4xl font-bold drop-shadow-lg flex items-center gap-3">
            <UserCog className="w-10 h-10" />
            تعديل بيانات الشريك
          </h1>
          {partner && (
            <p className="text-purple-100 mt-2">
              {partner.partnerName} • رأس المال: {partner.capitalAmount.toLocaleString()} ج • النسبة: {partner.capitalPercent}%
            </p>
          )}
        </div>
      </div>

      {/* المحتوى */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
          {/* معلومات أساسية */}
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <UserCog className="w-6 h-6" />
                المعلومات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* اسم الشريك */}
              <div>
                <Label htmlFor="partnerName" className="text-white text-base">
                  اسم الشريك *
                </Label>
                <Input
                  id="partnerName"
                  type="text"
                  value={formData.partnerName}
                  onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                  className="bg-white/10 border-white/20 text-white text-lg h-12"
                  placeholder="أدخل اسم الشريك"
                  required
                />
              </div>

              {/* نوع الشريك */}
              <div>
                <Label htmlFor="partnerType" className="text-white text-base">
                  نوع الشريك
                </Label>
                <select
                  id="partnerType"
                  value={formData.partnerType}
                  onChange={(e) => setFormData({ ...formData, partnerType: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-md p-3 text-lg h-12"
                >
                  <option value="PARTNER">شريك</option>
                  <option value="OWNER">مالك</option>
                  <option value="INVESTOR">مستثمر</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* رأس المال */}
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-green-900/90 to-emerald-900/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <DollarSign className="w-6 h-6" />
                رأس المال والنسبة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* مبلغ رأس المال */}
                <div>
                  <Label htmlFor="capitalAmount" className="text-white text-base">
                    مبلغ رأس المال (جنيه) *
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                    <Input
                      id="capitalAmount"
                      type="number"
                      step="0.01"
                      value={formData.capitalAmount}
                      onChange={(e) => setFormData({ ...formData, capitalAmount: e.target.value })}
                      className="bg-white/10 border-white/20 text-white text-lg h-12 pr-12"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* نسبة المساهمة */}
                <div>
                  <Label htmlFor="capitalPercent" className="text-white text-base">
                    نسبة المساهمة (%) *
                  </Label>
                  <div className="relative">
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                    <Input
                      id="capitalPercent"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.capitalPercent}
                      onChange={(e) => setFormData({ ...formData, capitalPercent: e.target.value })}
                      className="bg-white/10 border-white/20 text-white text-lg h-12 pr-12"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* معلومة توضيحية */}
              <div className="p-4 bg-white/10 rounded-lg border border-white/20">
                <p className="text-white/80 text-sm">
                  💡 النسبة المئوية من إجمالي رأس المال في المشروع
                </p>
              </div>
            </CardContent>
          </Card>

          {/* الصلاحيات */}
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-blue-900/90 to-cyan-900/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="w-6 h-6" />
                الصلاحيات والإعدادات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* حالة الحساب */}
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20">
                <div className="flex items-center gap-3">
                  <CheckCircle className={`h-5 w-5 ${formData.isActive ? 'text-green-400' : 'text-red-400'}`} />
                  <div>
                    <Label className="text-white text-base cursor-pointer">الحساب نشط</Label>
                    <p className="text-white/60 text-sm">
                      {formData.isActive ? 'الشريك يمكنه الدخول للنظام' : 'الشريك لا يمكنه الدخول'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              {/* صلاحية حذف الطلبات */}
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20">
                <div className="flex items-center gap-3">
                  <Trash2 className={`h-5 w-5 ${formData.canDeleteOrders ? 'text-red-400' : 'text-gray-400'}`} />
                  <div>
                    <Label className="text-white text-base cursor-pointer">صلاحية حذف الطلبات</Label>
                    <p className="text-white/60 text-sm">السماح للشريك بحذف الطلبات</p>
                  </div>
                </div>
                <Switch
                  checked={formData.canDeleteOrders}
                  onCheckedChange={(checked) => setFormData({ ...formData, canDeleteOrders: checked })}
                />
              </div>

              {/* صلاحية رفع منتجات شي إن */}
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20">
                <div className="flex items-center gap-3">
                  <Upload className={`h-5 w-5 ${formData.canUploadShein ? 'text-purple-400' : 'text-gray-400'}`} />
                  <div>
                    <Label className="text-white text-base cursor-pointer">رفع منتجات شي إن</Label>
                    <p className="text-white/60 text-sm">السماح برفع منتجات من موقع شي إن</p>
                  </div>
                </div>
                <Switch
                  checked={formData.canUploadShein}
                  onCheckedChange={(checked) => setFormData({ ...formData, canUploadShein: checked })}
                />
              </div>

              {/* صلاحية إضافة بضاعة خارجية */}
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20">
                <div className="flex items-center gap-3">
                  <ShoppingCart className={`h-5 w-5 ${formData.canAddOfflineProducts ? 'text-orange-400' : 'text-gray-400'}`} />
                  <div>
                    <Label className="text-white text-base cursor-pointer">إضافة بضاعة خارج النظام</Label>
                    <p className="text-white/60 text-sm">السماح بإضافة منتجات من موردين خارجيين</p>
                  </div>
                </div>
                <Switch
                  checked={formData.canAddOfflineProducts}
                  onCheckedChange={(checked) => setFormData({ ...formData, canAddOfflineProducts: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* بيانات الدخول */}
          {formData.hasAccount && (
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Lock className="w-6 h-6" />
                  بيانات الدخول
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                  <p className="text-green-300 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    الشريك لديه حساب دخول
                  </p>
                  {formData.email && (
                    <div className="mt-2 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-white/60" />
                      <p className="text-gray-300">{formData.email}</p>
                    </div>
                  )}
                </div>

                {/* تغيير كلمة المرور */}
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20">
                  <div>
                    <Label className="text-white text-base cursor-pointer">تغيير كلمة المرور</Label>
                    <p className="text-white/60 text-sm">تفعيل لتغيير كلمة مرور الشريك</p>
                  </div>
                  <Switch
                    checked={formData.changePassword}
                    onCheckedChange={(checked) => setFormData({ ...formData, changePassword: checked })}
                  />
                </div>

                {formData.changePassword && (
                  <div>
                    <Label htmlFor="newPassword" className="text-white text-base">
                      كلمة المرور الجديدة *
                    </Label>
                    <Input
                      id="newPassword"
                      type="text"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="bg-white/10 border-white/20 text-white text-lg h-12"
                      placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                      minLength={6}
                    />
                    <p className="text-yellow-300 text-sm mt-2">
                      ⚠️ سيتم تغيير كلمة المرور فوراً بعد الحفظ
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ملاحظات */}
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-slate-800/90 to-gray-900/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="w-6 h-6" />
                ملاحظات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-white/10 border-white/20 text-white text-base min-h-[120px]"
                placeholder="أضف أي ملاحظات إضافية عن الشريك..."
                rows={5}
              />
            </CardContent>
          </Card>

          {/* أزرار التحكم */}
          <div className="flex gap-4 sticky bottom-4">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-6 shadow-2xl"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 ml-2" />
                  حفظ التعديلات
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/partners')}
              disabled={saving}
              className="px-8 bg-white/10 border-white/20 text-white hover:bg-white/20 text-lg py-6"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
