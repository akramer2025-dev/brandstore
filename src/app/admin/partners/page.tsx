'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { BackButton } from '@/components/BackButton'
import {
  Plus,
  Users,
  DollarSign,
  Percent,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Edit,
  UserPlus,
  Shield,
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

export default function AdminPartnersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false)
  const [isSuspensionDialogOpen, setIsSuspensionDialogOpen] = useState(false)
  const [suspensionReason, setSuspensionReason] = useState('')
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    canManageProducts: true,
    canManageOrders: true,
    canViewReports: true,
    canManageInventory: false,
  })
  const [formData, setFormData] = useState({
    partnerName: '',
    email: '',
    phone: '',
    password: '',
    capitalAmount: '',
    capitalPercent: '',
    partnerType: 'PARTNER',
    notes: '',
    createUserAccount: false,
    canDeleteOrders: true,
    canUploadShein: false,
    canAddOfflineProducts: false,
  })

  const [editFormData, setEditFormData] = useState({
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
      fetchPartners()
    }
  }, [status, session, router])

  const fetchPartners = async () => {
    try {
      console.log('🔄 جاري جلب الشركاء...')
      const response = await fetch('/api/admin/partners')
      const data = await response.json()
      
      if (response.ok) {
        console.log('✅ تم جلب الشركاء بنجاح:', data.partners.length)
        console.log('📋 الشركاء:', data.partners)
        setPartners(data.partners)
      } else {
        console.error('❌ خطأ في جلب الشركاء:', data.error)
        toast.error(data.error || 'حدث خطأ أثناء جلب الشركاء')
      }
    } catch (error) {
      console.error('❌ Error fetching partners:', error)
      toast.error('حدث خطأ أثناء جلب الشركاء')
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = async (partner: Partner) => {
    setSelectedPartner(partner)
    
    // جلب بيانات الحساب إذا وُجد
    const response = await fetch(`/api/admin/partners/${partner.id}`)
    const data = await response.json()
    
    setEditFormData({
      partnerName: partner.partnerName,
      capitalAmount: partner.capitalAmount.toString(),
      capitalPercent: partner.capitalPercent.toString(),
      partnerType: partner.partnerType,
      notes: partner.notes || '',
      isActive: partner.isActive,
      changePassword: false,
      newPassword: '',
      email: data.email || '',
      hasAccount: data.hasAccount || false,
      canDeleteOrders: data.canDeleteOrders || false,
      canUploadShein: data.canUploadShein || false,
      canAddOfflineProducts: data.canAddOfflineProducts || false,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdatePartner = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPartner) return
    
    try {
      const response = await fetch(`/api/admin/partners/${selectedPartner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('تم تحديث بيانات الشريك بنجاح')
        setIsEditDialogOpen(false)
        fetchPartners()
      } else {
        toast.error(data.error || 'حدث خطأ أثناء تحديث الشريك')
      }
    } catch (error) {
      console.error('Error updating partner:', error)
      toast.error('حدث خطأ أثناء تحديث الشريك')
    }
  }

  const togglePartnerStatus = async (partnerId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/partners/${partnerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(currentStatus ? 'تم إيقاف الشريك' : 'تم تفعيل الشريك')
        fetchPartners()
      } else {
        toast.error(data.error || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error toggling partner status:', error)
      toast.error('حدث خطأ')
    }
  }

  const openSuspensionDialog = (partner: Partner) => {
    setSelectedPartner(partner)
    setSuspensionReason(`${partner.partnerName} يا أهلاً وسهلاً! من فضلك تواصل معايا على الواتساب لتفعيل حسابك.\n\n01555512778\nم : اكــرم المــصرى`)
    setIsSuspensionDialogOpen(true)
  }

  const handleToggleSuspension = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPartner) return
    
    try {
      // تعليق الحساب (partner.id هو نفسه vendor.id)
      const response = await fetch(`/api/admin/vendors/${selectedPartner.id}/toggle-suspension`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suspend: true,
          reason: suspensionReason,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setIsSuspensionDialogOpen(false)
        setSuspensionReason('')
        fetchPartners()
      } else {
        toast.error(data.error || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error toggling suspension:', error)
      toast.error('حدث خطأ')
    }
  }

  const handleActivateAccount = async (partner: Partner) => {
    if (!confirm(`هل أنت متأكد من تفعيل حساب "${partner.partnerName}"؟`)) {
      return
    }
    
    try {
      // تفعيل الحساب (partner.id هو نفسه vendor.id)
      const response = await fetch(`/api/admin/vendors/${partner.id}/toggle-suspension`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suspend: false,
          reason: null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        fetchPartners()
      } else {
        toast.error(data.error || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error activating account:', error)
      toast.error('حدث خطأ')
    }
  }

  const handleDeletePartner = async () => {
    if (!partnerToDelete) return
    
    try {
      const response = await fetch(`/api/admin/partners/${partnerToDelete.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('تم حذف الشريك بنجاح')
        setIsDeleteDialogOpen(false)
        setPartnerToDelete(null)
        fetchPartners()
      } else {
        toast.error(data.error || 'حدث خطأ أثناء حذف الشريك')
      }
    } catch (error) {
      console.error('Error deleting partner:', error)
      toast.error('حدث خطأ أثناء حذف الشريك')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // عرض رسالة نجاح مع بيانات الدخول إذا تم إنشاء حساب
        if (formData.createUserAccount && formData.password) {
          toast.success(
            `تم إضافة الشريك بنجاح\n\nبيانات الدخول:\nالبريد: ${formData.email}\nكلمة المرور: ${formData.password}`,
            { duration: 10000 }
          )
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.log('✅ تم إنشاء حساب شريك جديد:')
          console.log(`   الاسم: ${formData.partnerName}`)
          console.log(`   البريد: ${formData.email}`)
          console.log(`   كلمة المرور: ${formData.password}`)
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        } else {
          toast.success('تم إضافة الشريك بنجاح')
        }
        
        setIsDialogOpen(false)
        setFormData({
          partnerName: '',
          email: '',
          phone: '',
          password: '',
          capitalAmount: '',
          capitalPercent: '',
          partnerType: 'PARTNER',
          notes: '',
          createUserAccount: false,
          canDeleteOrders: true,
          canUploadShein: false,
          canAddOfflineProducts: false,
        })
        fetchPartners()
      } else {
        toast.error(data.error || 'حدث خطأ أثناء إضافة الشريك')
      }
    } catch (error) {
      console.error('Error adding partner:', error)
      toast.error('حدث خطأ أثناء إضافة الشريك')
    }
  }

  const openStaffDialog = (partner: Partner) => {
    setSelectedPartner(partner)
    setStaffFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      canManageProducts: true,
      canManageOrders: true,
      canViewReports: true,
      canManageInventory: false,
    })
    setIsStaffDialogOpen(true)
  }

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPartner) return
    
    try {
      const permissions = {
        canManageProducts: staffFormData.canManageProducts,
        canManageOrders: staffFormData.canManageOrders,
        canViewReports: staffFormData.canViewReports,
        canManageInventory: staffFormData.canManageInventory,
      }

      const response = await fetch(`/api/admin/partners/${selectedPartner.id}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: staffFormData.name,
          email: staffFormData.email,
          password: staffFormData.password,
          phone: staffFormData.phone,
          permissions,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(
          `تم إضافة الموظف بنجاح\n\nبيانات الدخول:\nالبريد: ${staffFormData.email}\nكلمة المرور: ${staffFormData.password}`,
          { duration: 10000 }
        )
        setIsStaffDialogOpen(false)
        setStaffFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          canManageProducts: true,
          canManageOrders: true,
          canViewReports: true,
          canManageInventory: false,
        })
      } else {
        toast.error(data.error || 'حدث خطأ أثناء إضافة الموظف')
      }
    } catch (error) {
      console.error('Error adding staff:', error)
      toast.error('حدث خطأ أثناء إضافة الموظف')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    )
  }

  const totalCapital = partners.reduce((sum, p) => sum + p.currentAmount, 0)
  const activePartners = partners.filter(p => p.isActive).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BackButton fallbackUrl="/admin" />
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-400" />
                إدارة الشركاء
              </h1>
              <p className="text-gray-400 mt-1">إضافة وإدارة شركاء النظام</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                إضافة شريك
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-purple-500/30 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-white">إضافة شريك جديد</DialogTitle>
                <DialogDescription className="text-gray-400">
                  أدخل بيانات الشريك الجديد
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="space-y-4">
                  {/* الاسم */}
                  <div>
                    <Label htmlFor="partnerName" className="text-white">
                      اسم الشريك *
                    </Label>
                    <Input
                      id="partnerName"
                      value={formData.partnerName}
                      onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>

                  {/* البريد الإلكتروني */}
                  <div>
                    <Label htmlFor="email" className="text-white">
                      البريد الإلكتروني *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>

                  {/* رقم الهاتف */}
                  <div>
                    <Label htmlFor="phone" className="text-white">
                      رقم الهاتف
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  {/* مبلغ رأس المال */}
                  <div>
                    <Label htmlFor="capitalAmount" className="text-white">
                      مبلغ رأس المال (جنيه) *
                    </Label>
                    <Input
                      id="capitalAmount"
                      type="number"
                      step="0.01"
                      value={formData.capitalAmount}
                      onChange={(e) => setFormData({ ...formData, capitalAmount: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>

                  {/* نسبة المساهمة */}
                  <div>
                    <Label htmlFor="capitalPercent" className="text-white">
                      نسبة المساهمة (%) *
                    </Label>
                    <Input
                      id="capitalPercent"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.capitalPercent}
                      onChange={(e) => setFormData({ ...formData, capitalPercent: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                    <div className="flex items-start gap-2 mt-2">
                      <div className="text-blue-400 mt-0.5">ℹ️</div>
                      <p className="text-xs text-blue-300">
                        سيتم حساب النسبة الفعلية تلقائياً بناءً على إجمالي رأس المال
                      </p>
                    </div>
                  </div>

                  {/* نوع الشريك */}
                  <div>
                    <Label htmlFor="partnerType" className="text-white">
                      نوع الشريك
                    </Label>
                    <select
                      id="partnerType"
                      value={formData.partnerType}
                      onChange={(e) => setFormData({ ...formData, partnerType: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-md p-2"
                    >
                      <option value="PARTNER">شريك</option>
                      <option value="OWNER">مالك</option>
                      <option value="INVESTOR">مستثمر</option>
                    </select>
                  </div>

                  {/* ملاحظات */}
                  <div>
                    <Label htmlFor="notes" className="text-white">
                      ملاحظات
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      rows={3}
                    />
                  </div>

                  {/* إنشاء حساب */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                      <input
                        type="checkbox"
                        id="createUserAccount"
                        checked={formData.createUserAccount}
                        onChange={(e) => setFormData({ ...formData, createUserAccount: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="createUserAccount" className="text-white cursor-pointer">
                        إنشاء حساب VENDOR للشريك
                      </Label>
                    </div>
                    
                    <div className="flex items-start gap-2 px-3">
                      <div className="text-yellow-400 mt-0.5">⚠️</div>
                      <div className="text-xs text-yellow-300 space-y-1">
                        <p><strong>مع إنشاء حساب:</strong> البريد يجب أن يكون غير مستخدم في النظام</p>
                        <p><strong>بدون إنشاء حساب:</strong> البريد للتواصل فقط (يمكن استخدام بريد موجود)</p>
                      </div>
                    </div>
                  </div>

                  {/* صلاحية حذف الطلبات */}
                  {formData.createUserAccount && (
                    <div className="flex items-center gap-2 p-3 bg-red-900/30 rounded-lg border border-red-500/30">
                      <input
                        type="checkbox"
                        id="canDeleteOrders"
                        checked={formData.canDeleteOrders}
                        onChange={(e) => setFormData({ ...formData, canDeleteOrders: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="canDeleteOrders" className="text-white cursor-pointer">
                        🗑️ السماح بحذف الطلبات
                      </Label>
                    </div>
                  )}

                  {/* صلاحية رفع منتجات شي إن */}
                  {formData.createUserAccount && (
                    <div className="flex items-center gap-2 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                      <input
                        type="checkbox"
                        id="canUploadShein"
                        checked={formData.canUploadShein}
                        onChange={(e) => setFormData({ ...formData, canUploadShein: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="canUploadShein" className="text-white cursor-pointer">
                        🛍️ السماح برفع منتجات شي إن
                      </Label>
                    </div>
                  )}

                  {/* صلاحية إضافة بضاعة خارج النظام */}
                  {formData.createUserAccount && (
                    <div className="flex items-center gap-2 p-3 bg-orange-900/30 rounded-lg border border-orange-500/30">
                      <input
                        type="checkbox"
                        id="canAddOfflineProducts"
                        checked={formData.canAddOfflineProducts}
                        onChange={(e) => setFormData({ ...formData, canAddOfflineProducts: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="canAddOfflineProducts" className="text-white cursor-pointer">
                        📦 السماح بإضافة بضاعة خارج النظام
                      </Label>
                    </div>
                  )}

                  {/* كلمة المرور - تظهر فقط إذا تم تفعيل إنشاء الحساب */}
                  {formData.createUserAccount && (
                    <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
                      <Label htmlFor="password" className="text-white mb-2 block">
                        كلمة المرور *
                      </Label>
                      <Input
                        id="password"
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                        required={formData.createUserAccount}
                        minLength={6}
                      />
                      <div className="flex items-start gap-2 mt-2">
                        <div className="text-yellow-400 mt-0.5">⚠️</div>
                        <p className="text-xs text-yellow-300">
                          احفظ كلمة المرور هذه! ستحتاجها لإعطائها للشريك للدخول إلى حسابه
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                    إضافة الشريك
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">إجمالي الشركاء</p>
                  <p className="text-3xl font-bold text-white mt-2">{partners.length}</p>
                </div>
                <Users className="h-12 w-12 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">الشركاء النشطون</p>
                  <p className="text-3xl font-bold text-white mt-2">{activePartners}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">إجمالي رأس المال</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {totalCapital.toLocaleString()} ج
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partners List */}
        <div className="space-y-4">
          {partners.length === 0 ? (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="py-16 text-center">
                <Users className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400 text-lg">لا يوجد شركاء حتى الآن</p>
                <p className="text-gray-500 text-sm mt-2">قم بإضافة شريك جديد للبدء</p>
              </CardContent>
            </Card>
          ) : (
            partners.map((partner) => (
              <Card
                key={partner.id}
                className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-white">{partner.partnerName}</h3>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {partner.partnerType}
                        </span>
                        {partner.isActive ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            نشط
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            غير نشط
                          </span>
                        )}
                        {partner.isSuspended && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1 animate-pulse">
                            <Shield className="h-3 w-3" />
                            موقوف مؤقتاً
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <DollarSign className="h-4 w-4 text-green-400" />
                          <div>
                            <p className="text-xs text-gray-400">رأس المال الأولي</p>
                            <p className="font-semibold">{partner.initialAmount.toLocaleString()} ج</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-300">
                          <DollarSign className="h-4 w-4 text-blue-400" />
                          <div>
                            <p className="text-xs text-gray-400">رأس المال الحالي</p>
                            <p className="font-semibold">{partner.currentAmount.toLocaleString()} ج</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-300">
                          <Percent className="h-4 w-4 text-purple-400" />
                          <div>
                            <p className="text-xs text-gray-400">نسبة المساهمة</p>
                            <p className="font-semibold">{partner.capitalPercent}%</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="h-4 w-4 text-yellow-400" />
                          <div>
                            <p className="text-xs text-gray-400">تاريخ الانضمام</p>
                            <p className="font-semibold text-sm">
                              {new Date(partner.joinDate).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {partner.notes && (
                        <div className="mt-4 p-3 bg-white/5 rounded-lg">
                          <p className="text-gray-400 text-sm">{partner.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Link href={`/admin/partners/${partner.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          التفاصيل
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openStaffDialog(partner)}
                        className="bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        إضافة موظف
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(partner)}
                        className="bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePartnerStatus(partner.id, partner.isActive)}
                        className={partner.isActive 
                          ? "bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20"
                          : "bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20"
                        }
                      >
                        {partner.isActive ? 'إيقاف' : 'تفعيل'}
                      </Button>
                      
                      {/* زر الإيقاف المؤقت أو التفعيل */}
                      {partner.isSuspended ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleActivateAccount(partner)}
                          className="bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          تفعيل الحساب
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openSuspensionDialog(partner)}
                          className="bg-yellow-500/10 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          إيقاف مؤقت
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPartnerToDelete(partner)
                          setIsDeleteDialogOpen(true)
                        }}
                        className="bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Partner Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-900 border-purple-500/30 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">تعديل بيانات الشريك</DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedPartner?.partnerName}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdatePartner} className="space-y-6 mt-4">
              <div className="space-y-4">
                {/* الاسم */}
                <div>
                  <Label htmlFor="edit_partnerName" className="text-white">
                    اسم الشريك *
                  </Label>
                  <Input
                    id="edit_partnerName"
                    value={editFormData.partnerName}
                    onChange={(e) => setEditFormData({ ...editFormData, partnerName: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>

                {/* مبلغ رأس المال */}
                <div>
                  <Label htmlFor="edit_capitalAmount" className="text-white">
                    مبلغ رأس المال (جنيه) *
                  </Label>
                  <Input
                    id="edit_capitalAmount"
                    type="number"
                    step="0.01"
                    value={editFormData.capitalAmount}
                    onChange={(e) => setEditFormData({ ...editFormData, capitalAmount: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>

                {/* نسبة المساهمة */}
                <div>
                  <Label htmlFor="edit_capitalPercent" className="text-white">
                    نسبة المساهمة (%) *
                  </Label>
                  <Input
                    id="edit_capitalPercent"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={editFormData.capitalPercent}
                    onChange={(e) => setEditFormData({ ...editFormData, capitalPercent: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>

                {/* نوع الشريك */}
                <div>
                  <Label htmlFor="edit_partnerType" className="text-white">
                    نوع الشريك
                  </Label>
                  <select
                    id="edit_partnerType"
                    value={editFormData.partnerType}
                    onChange={(e) => setEditFormData({ ...editFormData, partnerType: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-md p-2"
                  >
                    <option value="PARTNER">شريك</option>
                    <option value="OWNER">مالك</option>
                    <option value="INVESTOR">مستثمر</option>
                  </select>
                </div>

                {/* ملاحظات */}
                <div>
                  <Label htmlFor="edit_notes" className="text-white">
                    ملاحظات
                  </Label>
                  <Textarea
                    id="edit_notes"
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    rows={3}
                  />
                </div>

                {/* حالة الشريك */}
                <div className="flex items-center gap-2 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                  <input
                    type="checkbox"
                    id="edit_isActive"
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="edit_isActive" className="text-white cursor-pointer">
                    الحساب نشط
                  </Label>
                </div>

                {/* بيانات الحساب */}
                <div className="border-t border-white/10 pt-4 mt-4">
                  <h4 className="text-lg font-semibold text-white mb-3">بيانات الدخول</h4>
                  
                  {editFormData.hasAccount ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                        <p className="text-green-300 text-sm flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          الشريك لديه حساب دخول
                        </p>
                        {editFormData.email && (
                          <p className="text-gray-300 text-sm mt-1">
                            البريد: {editFormData.email}
                          </p>
                        )}
                      </div>
                      
                      {/* تغيير كلمة المرور */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="edit_changePassword"
                          checked={editFormData.changePassword}
                          onChange={(e) => setEditFormData({ ...editFormData, changePassword: e.target.checked, newPassword: '' })}
                          className="rounded"
                        />
                        <Label htmlFor="edit_changePassword" className="text-white cursor-pointer">
                          تغيير كلمة المرور
                        </Label>
                      </div>

                      {editFormData.changePassword && (
                        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                          <Label htmlFor="edit_newPassword" className="text-white mb-2 block">
                            كلمة المرور الجديدة *
                          </Label>
                          <Input
                            id="edit_newPassword"
                            type="text"
                            value={editFormData.newPassword}
                            onChange={(e) => setEditFormData({ ...editFormData, newPassword: e.target.value })}
                            className="bg-white/10 border-white/20 text-white"
                            placeholder="أدخل كلمة المرور الجديدة (6+ أحرف)"
                            required={editFormData.changePassword}
                            minLength={6}
                          />
                          <p className="text-xs text-blue-300 mt-2">
                            ⚠️ سيتم تغيير كلمة مرور التسجيل للشريك
                          </p>
                        </div>
                      )}

                      {/* صلاحية حذف الطلبات */}
                      <div className="flex items-center gap-2 p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                        <input
                          type="checkbox"
                          id="edit_canDeleteOrders"
                          checked={editFormData.canDeleteOrders}
                          onChange={(e) => setEditFormData({ ...editFormData, canDeleteOrders: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="edit_canDeleteOrders" className="text-white cursor-pointer flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          السماح بحذف الطلبات
                        </Label>
                      </div>

                      {/* صلاحية رفع منتجات شي إن */}
                      <div className="flex items-center gap-2 p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                        <input
                          type="checkbox"
                          id="edit_canUploadShein"
                          checked={editFormData.canUploadShein}
                          onChange={(e) => setEditFormData({ ...editFormData, canUploadShein: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="edit_canUploadShein" className="text-white cursor-pointer flex items-center gap-2">
                          🛍️ السماح برفع منتجات شي إن
                        </Label>
                      </div>

                      {/* صلاحية إضافة بضاعة خارج النظام */}
                      <div className="flex items-center gap-2 p-3 bg-orange-900/20 rounded-lg border border-orange-500/30">
                        <input
                          type="checkbox"
                          id="edit_canAddOfflineProducts"
                          checked={editFormData.canAddOfflineProducts}
                          onChange={(e) => setEditFormData({ ...editFormData, canAddOfflineProducts: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="edit_canAddOfflineProducts" className="text-white cursor-pointer flex items-center gap-2">
                          📦 السماح بإضافة بضاعة خارج النظام
                        </Label>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                      <p className="text-yellow-300 text-sm flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        هذا الشريك ليس لديه حساب دخول
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        لإنشاء حساب جديد، قم بحذف الشريك وإضافته مرة أخرى مع تفعيل "إنشاء حساب"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                  حفظ التعديلات
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-gray-900 border-red-500/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl text-red-400 flex items-center gap-2">
                <Trash2 className="h-6 w-6" />
                تأكيد حذف الشريك
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-base mt-4">
                هل أنت متأكد من حذف الشريك <strong className="text-white">{partnerToDelete?.partnerName}</strong>؟
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 font-semibold mb-2">⚠️ تحذير:</p>
                  <ul className="text-sm text-red-200 space-y-1 list-disc list-inside">
                    <li>سيتم حذف جميع بيانات الشريك</li>
                    <li>سيتم حذف حساب تسجيل الدخول (إن وُجد)</li>
                    <li>لا يمكن التراجع عن هذا الإجراء</li>
                  </ul>
                </div>
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleDeletePartner}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                نعم، احذف الشريك
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setPartnerToDelete(null)
                }}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                إلغاء
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Staff Dialog */}
        <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
          <DialogContent className="bg-gray-900 border-green-500/30 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-green-400" />
                إضافة موظف جديد
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                إضافة موظف للشريك: <strong className="text-white">{selectedPartner?.partnerName}</strong>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddStaff} className="space-y-6 mt-4">
              <div className="space-y-4">
                {/* الاسم */}
                <div>
                  <Label htmlFor="staff_name" className="text-white">
                    اسم الموظف *
                  </Label>
                  <Input
                    id="staff_name"
                    value={staffFormData.name}
                    onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>

                {/* البريد الإلكتروني */}
                <div>
                  <Label htmlFor="staff_email" className="text-white">
                    البريد الإلكتروني (Gmail) *
                  </Label>
                  <Input
                    id="staff_email"
                    type="email"
                    value={staffFormData.email}
                    onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="example@gmail.com"
                    required
                  />
                </div>

                {/* كلمة المرور */}
                <div>
                  <Label htmlFor="staff_password" className="text-white">
                    كلمة المرور *
                  </Label>
                  <Input
                    id="staff_password"
                    type="text"
                    value={staffFormData.password}
                    onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="أدخل كلمة مرور قوية"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    💡 سيتم عرض كلمة المرور مرة واحدة فقط، احفظها في مكان آمن
                  </p>
                </div>

                {/* رقم الهاتف */}
                <div>
                  <Label htmlFor="staff_phone" className="text-white">
                    رقم الهاتف
                  </Label>
                  <Input
                    id="staff_phone"
                    type="tel"
                    value={staffFormData.phone}
                    onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                {/* الصلاحيات */}
                <div className="space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-green-400" />
                    <Label className="text-white font-semibold">صلاحيات الموظف</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="canManageProducts"
                        checked={staffFormData.canManageProducts}
                        onChange={(e) => setStaffFormData({ ...staffFormData, canManageProducts: e.target.checked })}
                        className="w-4 h-4 rounded border-white/20"
                      />
                      <Label htmlFor="canManageProducts" className="text-gray-300 cursor-pointer">
                        إدارة المنتجات (إضافة، تعديل، حذف)
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="canManageOrders"
                        checked={staffFormData.canManageOrders}
                        onChange={(e) => setStaffFormData({ ...staffFormData, canManageOrders: e.target.checked })}
                        className="w-4 h-4 rounded border-white/20"
                      />
                      <Label htmlFor="canManageOrders" className="text-gray-300 cursor-pointer">
                        إدارة الطلبات (معالجة، تحديث الحالة)
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="canViewReports"
                        checked={staffFormData.canViewReports}
                        onChange={(e) => setStaffFormData({ ...staffFormData, canViewReports: e.target.checked })}
                        className="w-4 h-4 rounded border-white/20"
                      />
                      <Label htmlFor="canViewReports" className="text-gray-300 cursor-pointer">
                        عرض التقارير والإحصائيات
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="canManageInventory"
                        checked={staffFormData.canManageInventory}
                        onChange={(e) => setStaffFormData({ ...staffFormData, canManageInventory: e.target.checked })}
                        className="w-4 h-4 rounded border-white/20"
                      />
                      <Label htmlFor="canManageInventory" className="text-gray-300 cursor-pointer">
                        إدارة المخزون
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <p className="text-blue-300 text-sm">
                    ℹ️ سيتم إرسال بيانات الدخول بعد إنشاء الحساب. احفظها في مكان آمن.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  إضافة الموظف
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsStaffDialogOpen(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Suspension Dialog - إيقاف مؤقت */}
        <Dialog open={isSuspensionDialogOpen} onOpenChange={setIsSuspensionDialogOpen}>
          <DialogContent className="bg-gray-900 border-yellow-500/30 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-yellow-400 flex items-center gap-2">
                <Shield className="h-6 w-6" />
                إيقاف مؤقت للحساب
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedPartner?.partnerName}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleToggleSuspension} className="space-y-6 mt-4">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-300 text-sm">
                  ⚠️ عند الإيقاف المؤقت، لن يتمكن الشريك من الدخول إلى حسابه وستظهر له رسالة مخصصة
                </p>
              </div>

              <div>
                <Label htmlFor="suspensionReason" className="text-white mb-2 block">
                  رسالة الإيقاف المؤقت *
                </Label>
                <Textarea
                  id="suspensionReason"
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="اكتب الرسالة التي ستظهر للشريك عند محاولة الدخول..."
                  className="bg-white/10 border-white/20 text-white min-h-[150px]"
                  required
                />
                <p className="text-gray-400 text-xs mt-2">
                  💡 الرسالة الافتراضية تحتوي على اسم المتجر ورابط الواتساب
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  تطبيق الإيقاف المؤقت
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsSuspensionDialogOpen(false)
                    setSuspensionReason('')
                  }}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
