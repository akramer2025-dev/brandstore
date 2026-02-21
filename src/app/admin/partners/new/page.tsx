'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { BackButton } from '@/components/BackButton'
import {
  Users,
  DollarSign,
  Percent,
  Phone,
  Mail,
  Shield,
  Store,
  Pill,
  Factory,
  Globe,
  Car,
  Bike,
  Code,
  MoreHorizontal,
  Save,
  ArrowRight,
} from 'lucide-react'

const PARTNER_TYPES = [
  { value: 'STORE', label: 'شريك محل تجاري', icon: Store, color: 'blue' },
  { value: 'PHARMACY', label: 'شريك صيدلية', icon: Pill, color: 'green' },
  { value: 'FACTORY', label: 'شريك مصنع', icon: Factory, color: 'orange' },
  { value: 'ONLINE', label: 'شريك أونلاين', icon: Globe, color: 'purple' },
  { value: 'CARS', label: 'شريك سيارات', icon: Car, color: 'red' },
  { value: 'MOTORCYCLES', label: 'شريك موتوسيكلات', icon: Bike, color: 'yellow' },
  { value: 'SOFTWARE', label: 'شريك برامج سوفت وير', icon: Code, color: 'cyan' },
  { value: 'OTHER', label: 'شريك آخر', icon: MoreHorizontal, color: 'gray' },
]

export default function NewPartnerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [accountMode, setAccountMode] = useState<'PARTNER' | 'MARKETING_STAFF'>('PARTNER')
  const [formData, setFormData] = useState({
    partnerName: '',
    email: '',
    phone: '',
    password: '',
    capitalAmount: '',
    capitalPercent: '',
    partnerType: 'STORE',
    notes: '',
    createUserAccount: false,
    canDeleteOrders: true,
    canUploadShein: false,
    canAddOfflineProducts: false,
    // Media Buyer fields
    commissionRate: '',
    baseSalary: '',
    performanceBonus: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // التحقق من الحقول المطلوبة
    if (!formData.partnerName || !formData.partnerName.trim()) {
      toast.error(`⚠️ ${accountMode === 'PARTNER' ? 'اسم الشريك' : 'اسم Media Buyer'} مطلوب`)
      return
    }

    if (!formData.email || !formData.email.trim()) {
      toast.error('⚠️ البريد الإلكتروني مطلوب')
      return
    }

    if (accountMode === 'PARTNER') {
      if (!formData.capitalAmount || formData.capitalAmount.trim() === '') {
        toast.error('⚠️ مبلغ رأس المال مطلوب')
        return
      }

      if (!formData.capitalPercent || formData.capitalPercent.trim() === '') {
        toast.error('⚠️ نسبة المساهمة مطلوبة')
        return
      }
    }

    // التحقق من صحة الأرقام
    if (accountMode === 'PARTNER') {
      const capitalAmount = parseFloat(formData.capitalAmount)
      const capitalPercent = parseFloat(formData.capitalPercent)

      if (isNaN(capitalAmount) || capitalAmount < 0) {
        toast.error('⚠️ المبلغ يجب أن يكون رقم صحيح')
        return
      }

      if (isNaN(capitalPercent) || capitalPercent < 0 || capitalPercent > 100) {
        toast.error('⚠️ النسبة يجب أن تكون بين 0 و 100')
        return
      }
    }

    if (!formData.password || formData.password.length < 6) {
      toast.error('⚠️ كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)

    try {
      const endpoint = accountMode === 'PARTNER' ? '/api/admin/partners' : '/api/admin/marketing-staff'
      
      const payload: any = {
        name: formData.partnerName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        notes: formData.notes.trim(),
      }

      if (accountMode === 'PARTNER') {
        payload.capitalAmount = parseFloat(formData.capitalAmount)
        payload.capitalPercent = parseFloat(formData.capitalPercent)
        payload.partnerType = formData.partnerType
        payload.partnerName = formData.partnerName.trim()
        payload.createUserAccount = true // Always create for partner
        payload.canDeleteOrders = formData.canDeleteOrders
        payload.canUploadShein = formData.canUploadShein
        payload.canAddOfflineProducts = formData.canAddOfflineProducts
      } else {
        // Media Buyer
        payload.commissionRate = formData.commissionRate ? parseFloat(formData.commissionRate) : 0
        payload.baseSalary = formData.baseSalary ? parseFloat(formData.baseSalary) : 0
        payload.performanceBonus = formData.performanceBonus ? parseFloat(formData.performanceBonus) : 0
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `فشل في إضافة ${accountMode === 'PARTNER' ? 'الشريك' : 'Media Buyer'}`)
      }

      toast.success(`تم إضافة ${accountMode === 'PARTNER' ? 'الشريك' : 'Media Buyer'} بنجاح! 🎉`)
      router.push('/admin/partners')
      router.refresh()
    } catch (error: any) {
      console.error(`خطأ في إضافة ${accountMode === 'PARTNER' ? 'الشريك' : 'Media Buyer'}:`, error)
      toast.error(error.message || `حدث خطأ أثناء إضافة ${accountMode === 'PARTNER' ? 'الشريك' : 'Media Buyer'}`)
    } finally {
      setLoading(false)
    }
  }

  const selectedType = PARTNER_TYPES.find(t => t.value === formData.partnerType) || PARTNER_TYPES[0]
  const TypeIcon = selectedType.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <BackButton fallbackUrl="/admin/partners" />
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              إضافة {accountMode === 'PARTNER' ? 'شريك' : 'Media Buyer'} جديد
            </h1>
            <p className="text-gray-400 mt-1 text-sm sm:text-base">
              {accountMode === 'PARTNER' ? 'أدخل جميع بيانات الشريك بالتفصيل' : 'أدخل بيانات موظف التسويق (Media Buyer)'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اختيار نوع الحساب */}
          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/50 shadow-xl">
            <CardHeader className="border-b border-white/20">
              <CardTitle className="text-white text-xl flex items-center gap-2">
                🎯 اختر نوع الحساب
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAccountMode('PARTNER')}
                  className={`
                    relative p-6 rounded-xl border-2 transition-all duration-300
                    ${accountMode === 'PARTNER'
                      ? 'bg-gradient-to-br from-purple-600/40 to-blue-600/40 border-purple-400 shadow-lg shadow-purple-500/50'
                      : 'bg-white/5 border-white/20 hover:border-white/40 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className={`
                      h-16 w-16 rounded-full mx-auto mb-4 flex items-center justify-center
                      ${accountMode === 'PARTNER' ? 'bg-purple-500/30' : 'bg-white/10'}
                    `}>
                      <Store className={`h-8 w-8 ${accountMode === 'PARTNER' ? 'text-purple-300' : 'text-gray-400'}`} />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${accountMode === 'PARTNER' ? 'text-white' : 'text-gray-300'}`}>
                      👤 شريك (Partner)
                    </h3>
                    <p className={`text-sm ${accountMode === 'PARTNER' ? 'text-purple-200' : 'text-gray-400'}`}>
                      شريك تجاري مع رأس مال ونسبة مساهمة
                    </p>
                  </div>
                  {accountMode === 'PARTNER' && (
                    <div className="absolute top-3 right-3 h-6 w-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-white rotate-180" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setAccountMode('MARKETING_STAFF')}
                  className={`
                    relative p-6 rounded-xl border-2 transition-all duration-300
                    ${accountMode === 'MARKETING_STAFF'
                      ? 'bg-gradient-to-br from-pink-600/40 to-purple-600/40 border-pink-400 shadow-lg shadow-pink-500/50'
                      : 'bg-white/5 border-white/20 hover:border-white/40 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className={`
                      h-16 w-16 rounded-full mx-auto mb-4 flex items-center justify-center
                      ${accountMode === 'MARKETING_STAFF' ? 'bg-pink-500/30' : 'bg-white/10'}
                    `}>
                      <Users className={`h-8 w-8 ${accountMode === 'MARKETING_STAFF' ? 'text-pink-300' : 'text-gray-400'}`} />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${accountMode === 'MARKETING_STAFF' ? 'text-white' : 'text-gray-300'}`}>
                      📊 Media Buyer
                    </h3>
                    <p className={`text-sm ${accountMode === 'MARKETING_STAFF' ? 'text-pink-200' : 'text-gray-400'}`}>
                      موظف تسويق مع نظام عمولة وراتب
                    </p>
                  </div>
                  {accountMode === 'MARKETING_STAFF' && (
                    <div className="absolute top-3 right-3 h-6 w-6 bg-pink-500 rounded-full flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-white rotate-180" />
                    </div>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* نوع الشريك - فقط للـ PARTNER */}
          {accountMode === 'PARTNER' && (
            <Card className="bg-white/5 backdrop-blur-sm border-purple-500/30">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-400" />
                  نوع الشريك
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {PARTNER_TYPES.map((type) => {
                    const Icon = type.icon
                    const isSelected = formData.partnerType === type.value
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, partnerType: type.value })}
                        className={`
                          relative p-4 rounded-xl border-2 transition-all duration-300
                          flex flex-col items-center gap-3 text-center
                          ${isSelected 
                            ? 'bg-gradient-to-br from-purple-600/30 to-blue-600/30 border-purple-400 shadow-lg shadow-purple-500/50' 
                            : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                          }
                        `}
                      >
                        <div className={`
                          h-12 w-12 rounded-full flex items-center justify-center
                          ${isSelected ? 'bg-purple-500/30' : 'bg-white/10'}
                        `}>
                          <Icon className={`h-6 w-6 ${isSelected ? 'text-purple-300' : 'text-gray-400'}`} />
                        </div>
                        <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                          {type.label}
                        </span>
                        {isSelected && (
                          <div className="absolute top-2 right-2 h-5 w-5 bg-purple-500 rounded-full flex items-center justify-center">
                            <ArrowRight className="h-3 w-3 text-white rotate-180" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* البيانات الأساسية */}
          <Card className="bg-white/5 backdrop-blur-sm border-purple-500/30">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                البيانات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* اسم الشخص */}
                <div className="space-y-2">
                  <Label htmlFor="partnerName" className="text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-400" />
                    {accountMode === 'PARTNER' ? 'اسم الشريك *' : 'اسم Media Buyer *'}
                  </Label>
                  <Input
                    id="partnerName"
                    value={formData.partnerName}
                    onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-11"
                    placeholder={accountMode === 'PARTNER' ? 'أدخل اسم الشريك الكامل' : 'أدخل اسم موظف التسويق'}
                    required
                  />
                </div>

                {/* البريد الإلكتروني */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-400" />
                    البريد الإلكتروني *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-11"
                    placeholder="example@domain.com"
                    required
                  />
                </div>

                {/* رقم الهاتف */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-400" />
                    رقم الهاتف
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-11"
                    placeholder="01xxxxxxxxx"
                  />
                </div>

                {/* كلمة المرور */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white flex items-center gap-2">
                    🔑 كلمة المرور *
                  </Label>
                  <Input
                    id="password"
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-11"
                    placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                    required
                    minLength={6}
                  />
                </div>

                {/* نوع الشريك المحدد - فقط للـ PARTNER */}
                {accountMode === 'PARTNER' && selectedType && (
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <TypeIcon className="h-4 w-4 text-yellow-400" />
                      نوع الشراكة
                    </Label>
                    <div className="h-11 bg-purple-600/20 border-2 border-purple-400/40 rounded-md px-4 flex items-center gap-3">
                      <TypeIcon className="h-5 w-5 text-purple-300" />
                      <span className="text-white font-medium">{selectedType.label}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* البيانات المالية */}
          <Card className="bg-white/5 backdrop-blur-sm border-green-500/30">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                {accountMode === 'PARTNER' ? 'البيانات المالية' : 'بيانات الراتب والعمولة'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {accountMode === 'PARTNER' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* مبلغ رأس المال */}
                  <div className="space-y-2">
                    <Label htmlFor="capitalAmount" className="text-white flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      مبلغ رأس المال (جنيه) *
                    </Label>
                    <Input
                      id="capitalAmount"
                      type="number"
                      step="0.01"
                      value={formData.capitalAmount}
                      onChange={(e) => setFormData({ ...formData, capitalAmount: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-11"
                      placeholder="0.00"
                      required={accountMode === 'PARTNER'}
                    />
                  </div>

                  {/* نسبة المساهمة */}
                  <div className="space-y-2">
                    <Label htmlFor="capitalPercent" className="text-white flex items-center gap-2">
                      <Percent className="h-4 w-4 text-orange-400" />
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
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-11"
                      placeholder="0.00"
                      required={accountMode === 'PARTNER'}
                    />
                    <p className="text-xs text-blue-300">
                      ℹ️ سيتم حساب النسبة الفعلية تلقائياً
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* الراتب الأساسي */}
                  <div className="space-y-2">
                    <Label htmlFor="baseSalary" className="text-white flex items-center gap-2">
                      💵 الراتب الأساسي (جنيه)
                    </Label>
                    <Input
                      id="baseSalary"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.baseSalary}
                      onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-11"
                      placeholder="0.00"
                    />
                  </div>

                  {/* نسبة العمولة */}
                  <div className="space-y-2">
                    <Label htmlFor="commissionRate" className="text-white flex items-center gap-2">
                      <Percent className="h-4 w-4 text-green-400" />
                      نسبة العمولة (%)
                    </Label>
                    <Input
                      id="commissionRate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.commissionRate}
                      onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-11"
                      placeholder="0.00"
                    />
                  </div>

                  {/* مكافأة الأداء */}
                  <div className="space-y-2">
                    <Label htmlFor="performanceBonus" className="text-white flex items-center gap-2">
                      🎁 مكافأة الأداء (جنيه)
                    </Label>
                    <Input
                      id="performanceBonus"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.performanceBonus}
                      onChange={(e) => setFormData({ ...formData, performanceBonus: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-11"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ملاحظات */}
          <Card className="bg-white/5 backdrop-blur-sm border-purple-500/30">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white">ملاحظات إضافية</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                placeholder="أضف أي ملاحظات إضافية هنا..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* إنشاء حساب VENDOR - فقط للشركاء */}
          {accountMode === 'PARTNER' && (
            <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/50">
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="createUserAccount"
                  checked={formData.createUserAccount}
                  onChange={(e) => setFormData({ ...formData, createUserAccount: e.target.checked })}
                  className="rounded h-5 w-5 cursor-pointer"
                />
                <Label htmlFor="createUserAccount" className="text-white text-lg font-semibold cursor-pointer">
                  🔐 إنشاء حساب VENDOR للشريك
                </Label>
              </div>
              <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-3 mt-4">
                <p className="text-sm text-yellow-200">
                  <strong>⚠️ ملاحظة:</strong>
                </p>
                <p className="text-xs text-yellow-300 mt-1">
                  • <strong>مع حساب:</strong> البريد الإلكتروني يجب ألا يكون مستخدماً من قبل
                </p>
                <p className="text-xs text-yellow-300">
                  • <strong>بدون حساب:</strong> البريد للتواصل فقط
                </p>
              </div>
            </CardHeader>

            {formData.createUserAccount && (
              <CardContent className="pt-6 space-y-6">
                {/* كلمة المرور */}
                <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30 space-y-3">
                  <Label htmlFor="password" className="text-white flex items-center gap-2 font-semibold">
                    🔑 كلمة المرور *
                  </Label>
                  <Input
                    id="password"
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-11"
                    placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                    required={formData.createUserAccount}
                    minLength={6}
                  />
                  <p className="text-xs text-yellow-300">
                    ⚠️ احفظ كلمة المرور لإعطائها للشريك
                  </p>
                </div>

                {/* الصلاحيات */}
                <div className="space-y-3">
                  <h4 className="text-white font-semibold text-lg">🎯 صلاحيات الحساب:</h4>
                  
                  {/* صلاحية حذف الطلبات */}
                  <div className="flex items-center gap-3 p-4 bg-red-900/30 rounded-lg border border-red-500/30 hover:bg-red-900/40 transition-colors">
                    <input
                      type="checkbox"
                      id="canDeleteOrders"
                      checked={formData.canDeleteOrders}
                      onChange={(e) => setFormData({ ...formData, canDeleteOrders: e.target.checked })}
                      className="rounded h-5 w-5"
                    />
                    <Label htmlFor="canDeleteOrders" className="text-white cursor-pointer flex-1 text-base">
                      🗑️ السماح بحذف الطلبات
                    </Label>
                  </div>

                  {/* صلاحية رفع منتجات شي إن */}
                  <div className="flex items-center gap-3 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30 hover:bg-purple-900/40 transition-colors">
                    <input
                      type="checkbox"
                      id="canUploadShein"
                      checked={formData.canUploadShein}
                      onChange={(e) => setFormData({ ...formData, canUploadShein: e.target.checked })}
                      className="rounded h-5 w-5"
                    />
                    <Label htmlFor="canUploadShein" className="text-white cursor-pointer flex-1 text-base">
                      🛍️ رفع منتجات شي إن
                    </Label>
                  </div>

                  {/* صلاحية إضافة بضاعة خارج النظام */}
                  <div className="flex items-center gap-3 p-4 bg-orange-900/30 rounded-lg border border-orange-500/30 hover:bg-orange-900/40 transition-colors">
                    <input
                      type="checkbox"
                      id="canAddOfflineProducts"
                      checked={formData.canAddOfflineProducts}
                      onChange={(e) => setFormData({ ...formData, canAddOfflineProducts: e.target.checked })}
                      className="rounded h-5 w-5"
                    />
                    <Label htmlFor="canAddOfflineProducts" className="text-white cursor-pointer flex-1 text-base">
                      📦 إضافة بضاعة خارج النظام
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 sticky bottom-4 bg-gray-900/95 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <>جاري الحفظ...</>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  إضافة {accountMode === 'PARTNER' ? 'الشريك' : 'Media Buyer'}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-2 border-white/20 text-white hover:bg-white/10 h-12 px-8"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
