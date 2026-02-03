'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { Upload, FileText, CheckCircle2 } from 'lucide-react'

function PartnerRegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const partnerType = searchParams.get('type') || 'store'

  const [formData, setFormData] = useState({
    // بيانات الحساب
    email: '',
    password: '',
    username: '',
    
    // بيانات الشركة/المحل
    businessName: '',
    businessNameAr: '',
    businessType: partnerType,
    
    // بيانات التواصل
    phone: '',
    alternativePhone: '',
    whatsapp: '',
    
    // العنوان
    address: '',
    city: '',
    region: '',
    postalCode: '',
    
    // التفاصيل
    description: '',
    descriptionAr: '',
    
    // المجال والتخصص
    category: '',
    subCategory: '',
    yearsOfExperience: '',
    
    // بيانات بنكية (اختيارية)
    bankName: '',
    accountNumber: '',
    iban: '',
    accountHolderName: '',
    
    // المحافظ الإلكترونية (اختيارية)
    instaPay: '',
    etisalatCash: '',
    vodafoneCash: '',
    wePay: '',
    
    // الأوراق الرسمية (اختيارية)
    commercialRegister: '',
    taxCard: '',
    nationalId: '',
    businessLicense: '',
    
    // للمندوبين
    vehicleType: '',
    vehicleNumber: '',
    drivingLicense: '',
  })

  const [documents, setDocuments] = useState({
    commercialRegister: null as File | null,
    taxCard: null as File | null,
    nationalId: null as File | null,
    businessLicense: null as File | null,
    drivingLicense: null as File | null,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getTypeInfo = () => {
    const types: Record<string, { title: string; titleAr: string; color: string }> = {
      store: { title: 'Store Owner', titleAr: 'صاحب محل', color: 'purple' },
      factory: { title: 'Factory Owner', titleAr: 'صاحب مصنع', color: 'blue' },
      delivery: { title: 'Delivery Driver', titleAr: 'مندوب توصيل', color: 'green' },
      stationery: { title: 'Stationery Store', titleAr: 'مكتبة أدوات مدرسية', color: 'orange' },
      pharmacy: { title: 'Pharmacy', titleAr: 'صيدلية', color: 'red' },
      general: { title: 'General Store', titleAr: 'محل عام', color: 'indigo' },
    }
    return types[partnerType] || types.store
  }

  const handleFileChange = (field: string, file: File | null) => {
    setDocuments(prev => ({ ...prev, [field]: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // رفع الملفات أولاً
      const uploadedDocs: Record<string, string> = {}
      
      for (const [key, file] of Object.entries(documents)) {
        if (file) {
          const formData = new FormData()
          formData.append('file', file)
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })
          
          if (uploadResponse.ok) {
            const { url } = await uploadResponse.json()
            uploadedDocs[key] = url
          }
        }
      }

      // إرسال بيانات التسجيل
      const response = await fetch('/api/auth/partner-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          documents: uploadedDocs,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'فشل التسجيل')
      }

      alert('تم التسجيل بنجاح! سيتم مراجعة طلبك والموافقة عليه خلال 24-48 ساعة')
      router.push('/auth/login')
    } catch (error: any) {
      setError(error.message || 'حدث خطأ ما')
    } finally {
      setLoading(false)
    }
  }

  const typeInfo = getTypeInfo()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/auth/join-us" className="inline-flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity group">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-2xl border-2 border-purple-200 transition-all duration-300 group-hover:scale-110">
              <img 
                src="/logo.png" 
                alt="BS Brand Store" 
                className="w-24 h-24 rounded-full object-contain drop-shadow-lg"
              />
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                براند ستور
              </h1>
              <p className="text-sm text-gray-600">نموذج انضمام الشركاء</p>
            </div>
          </Link>
          
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
            تسجيل {typeInfo.titleAr}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            يرجى ملء جميع البيانات بدقة. سيتم مراجعة طلبك والتواصل معك خلال 24-48 ساعة
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* معلومات الحساب */}
            <section className="border-b pb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-${typeInfo.color}-100 flex items-center justify-center`}>
                  <span className="text-lg">🔐</span>
                </div>
                معلومات الحساب
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="email">البريد الإلكتروني *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@mail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="username">اسم المستخدم *</Label>
                  <Input
                    id="username"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="username"
                  />
                </div>
                <div>
                  <Label htmlFor="password">كلمة المرور *</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </section>

            {/* معلومات العمل/المحل */}
            <section className="border-b pb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-${typeInfo.color}-100 flex items-center justify-center`}>
                  <span className="text-lg">🏢</span>
                </div>
                معلومات {typeInfo.titleAr}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">الاسم التجاري (English) *</Label>
                  <Input
                    id="businessName"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Business Name"
                  />
                </div>
                <div>
                  <Label htmlFor="businessNameAr">الاسم التجاري (العربية) *</Label>
                  <Input
                    id="businessNameAr"
                    required
                    value={formData.businessNameAr}
                    onChange={(e) => setFormData({ ...formData, businessNameAr: e.target.value })}
                    placeholder="الاسم التجاري"
                  />
                </div>
                <div>
                  <Label htmlFor="category">المجال/التخصص *</Label>
                  <select
                    id="category"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">اختر المجال</option>
                    <option value="ملابس">ملابس</option>
                    <option value="إلكترونيات">إلكترونيات</option>
                    <option value="أدوات منزلية">أدوات منزلية</option>
                    <option value="أدوات مدرسية">أدوات مدرسية</option>
                    <option value="أدوية ومستحضرات">أدوية ومستحضرات</option>
                    <option value="أغذية">أغذية</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="yearsOfExperience">سنوات الخبرة *</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    required
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                    placeholder="5"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="description">وصف العمل (English)</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your business..."
                  />
                </div>
                <div>
                  <Label htmlFor="descriptionAr">وصف العمل (العربية)</Label>
                  <Textarea
                    id="descriptionAr"
                    rows={3}
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    placeholder="صف عملك..."
                  />
                </div>
              </div>
            </section>

            {/* بيانات التواصل */}
            <section className="border-b pb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-${typeInfo.color}-100 flex items-center justify-center`}>
                  <span className="text-lg">📞</span>
                </div>
                بيانات التواصل
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="phone">رقم الهاتف الأساسي *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+20 100 000 0000"
                  />
                </div>
                <div>
                  <Label htmlFor="alternativePhone">رقم بديل</Label>
                  <Input
                    id="alternativePhone"
                    type="tel"
                    value={formData.alternativePhone}
                    onChange={(e) => setFormData({ ...formData, alternativePhone: e.target.value })}
                    placeholder="+20 100 000 0000"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">واتساب</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="+20 100 000 0000"
                  />
                </div>
              </div>
            </section>

            {/* العنوان */}
            <section className="border-b pb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-${typeInfo.color}-100 flex items-center justify-center`}>
                  <span className="text-lg">📍</span>
                </div>
                العنوان التفصيلي
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="city">المدينة *</Label>
                  <Input
                    id="city"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="القاهرة"
                  />
                </div>
                <div>
                  <Label htmlFor="region">المنطقة *</Label>
                  <Input
                    id="region"
                    required
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="مدينة نصر"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">الرمز البريدي</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="11511"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">العنوان التفصيلي *</Label>
                <Textarea
                  id="address"
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="رقم العقار، اسم الشارع، أقرب معلم"
                />
              </div>
            </section>

            {/* البيانات البنكية */}
            <section className="border-b pb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-${typeInfo.color}-100 flex items-center justify-center`}>
                  <span className="text-lg">🏦</span>
                </div>
                البيانات البنكية (اختيارية - للمدفوعات)
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">اسم البنك</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="البنك الأهلي المصري"
                  />
                </div>
                <div>
                  <Label htmlFor="accountHolderName">اسم صاحب الحساب</Label>
                  <Input
                    id="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                    placeholder="الاسم الكامل"
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">رقم الحساب</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="123456789"
                  />
                </div>
                <div>
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    value={formData.iban}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    placeholder="EG123456789012345678901234"
                  />
                </div>
              </div>
            </section>

            {/* المحافظ الإلكترونية */}
            <section className="border-b pb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-${typeInfo.color}-100 flex items-center justify-center`}>
                  <span className="text-lg">💳</span>
                </div>
                المحافظ الإلكترونية (اختيارية)
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instaPay">انستا باي</Label>
                  <Input
                    id="instaPay"
                    value={formData.instaPay}
                    onChange={(e) => setFormData({ ...formData, instaPay: e.target.value })}
                    placeholder="رقم المحفظة أو المعرف"
                  />
                </div>
                <div>
                  <Label htmlFor="etisalatCash">اتصالات كاش</Label>
                  <Input
                    id="etisalatCash"
                    type="tel"
                    value={formData.etisalatCash}
                    onChange={(e) => setFormData({ ...formData, etisalatCash: e.target.value })}
                    placeholder="+20 100 000 0000"
                  />
                </div>
                <div>
                  <Label htmlFor="vodafoneCash">فودافون كاش</Label>
                  <Input
                    id="vodafoneCash"
                    type="tel"
                    value={formData.vodafoneCash}
                    onChange={(e) => setFormData({ ...formData, vodafoneCash: e.target.value })}
                    placeholder="+20 100 000 0000"
                  />
                </div>
                <div>
                  <Label htmlFor="wePay">وي باي (WE Pay)</Label>
                  <Input
                    id="wePay"
                    type="tel"
                    value={formData.wePay}
                    onChange={(e) => setFormData({ ...formData, wePay: e.target.value })}
                    placeholder="+20 100 000 0000"
                  />
                </div>
              </div>
            </section>

            {/* الأوراق الرسمية */}
            <section className="border-b pb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-${typeInfo.color}-100 flex items-center justify-center`}>
                  <span className="text-lg">📄</span>
                </div>
                الأوراق الرسمية (اختيارية)
              </h3>
              
              <div className="space-y-4">
                {partnerType !== 'delivery' && (
                  <>
                    <div>
                      <Label className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        السجل التجاري (PDF أو صورة)
                      </Label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('commercialRegister', e.target.files?.[0] || null)}
                        className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                      />
                    </div>
                    
                    <div>
                      <Label className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        البطاقة الضريبية (PDF أو صورة)
                      </Label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('taxCard', e.target.files?.[0] || null)}
                        className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    بطاقة الرقم القومي (PDF أو صورة)
                  </Label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('nationalId', e.target.files?.[0] || null)}
                    className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                </div>
                
                {partnerType !== 'delivery' && (
                  <div>
                    <Label className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      ترخيص مزاولة المهنة (اختياري)
                    </Label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('businessLicense', e.target.files?.[0] || null)}
                      className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* بيانات خاصة بالمندوبين */}
            {partnerType === 'delivery' && (
              <section className="border-b pb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <span className="text-lg">🚗</span>
                  </div>
                  بيانات وسيلة التوصيل
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="vehicleType">نوع المركبة *</Label>
                    <select
                      id="vehicleType"
                      required
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">اختر نوع المركبة</option>
                      <option value="دراجة نارية">دراجة نارية</option>
                      <option value="سيارة ملاكي">سيارة ملاكي</option>
                      <option value="سيارة نقل">سيارة نقل</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="vehicleNumber">رقم المركبة *</Label>
                    <Input
                      id="vehicleNumber"
                      required
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      placeholder="ABC 1234"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    رخصة القيادة * (PDF أو صورة)
                  </Label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                    onChange={(e) => handleFileChange('drivingLicense', e.target.files?.[0] || null)}
                    className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </div>
              </section>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6">
              <Link
                href="/auth/join-us"
                className="text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                ← العودة للخلف
              </Link>

              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-6 text-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    جاري التسجيل...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 ml-2" />
                    إرسال الطلب
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center pt-4 border-t">
              * بإرسال هذا النموذج، أنت توافق على شروط وأحكام الشراكة وسيتم مراجعة طلبك خلال 24-48 ساعة عمل
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function PartnerRegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PartnerRegisterForm />
    </Suspense>
  )
}
