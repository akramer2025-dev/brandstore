'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Package, Plus, Edit, Trash2, Phone, Globe,
  Building2, Loader2, CheckCircle2, XCircle, Clock, Search, MapPin
} from 'lucide-react'
import { toast } from 'sonner'
import { BackButton } from '@/components/BackButton'

interface ShippingCompany {
  id: string
  name: string
  phone?: string
  website?: string
  trackingUrl?: string
  accountNumber?: string
  contactPerson?: string
  contactPhone?: string
  defaultFee: number
  estimatedDays?: number
  areas?: string
  isActive: boolean
  totalShipments: number
  notes?: string
  createdAt: string
}

export default function ShippingCompaniesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [companies, setCompanies] = useState<ShippingCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCompany, setEditingCompany] = useState<ShippingCompany | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    website: '',
    trackingUrl: '',
    accountNumber: '',
    contactPerson: '',
    contactPhone: '',
    defaultFee: '',
    estimatedDays: '',
    areas: '',
    notes: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'VENDOR') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchCompanies()
    }
  }, [status, session, router])

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/vendor/shipping-companies')
      if (res.ok) {
        const data = await res.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      toast.error('اسم الشركة مطلوب')
      return
    }

    setSubmitting(true)
    try {
      const url = editingCompany 
        ? `/api/vendor/shipping-companies/${editingCompany.id}`
        : '/api/vendor/shipping-companies'
      
      const res = await fetch(url, {
        method: editingCompany ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success(editingCompany ? 'تم تحديث الشركة' : 'تم إضافة الشركة')
        resetForm()
        fetchCompanies()
      } else {
        toast.error('حدث خطأ')
      }
    } catch (error) {
      toast.error('خطأ في الاتصال')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (company: ShippingCompany) => {
    setEditingCompany(company)
    setFormData({
      name: company.name,
      phone: company.phone || '',
      website: company.website || '',
      trackingUrl: company.trackingUrl || '',
      accountNumber: company.accountNumber || '',
      contactPerson: company.contactPerson || '',
      contactPhone: company.contactPhone || '',
      defaultFee: company.defaultFee.toString(),
      estimatedDays: company.estimatedDays?.toString() || '',
      areas: company.areas || '',
      notes: company.notes || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الشركة؟')) return

    try {
      const res = await fetch(`/api/vendor/shipping-companies/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('تم حذف الشركة')
        fetchCompanies()
      } else {
        toast.error('حدث خطأ')
      }
    } catch (error) {
      toast.error('خطأ في الاتصال')
    }
  }

  const toggleActive = async (company: ShippingCompany) => {
    try {
      const res = await fetch(`/api/vendor/shipping-companies/${company.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...company, isActive: !company.isActive }),
      })

      if (res.ok) {
        toast.success(company.isActive ? 'تم إيقاف الشركة' : 'تم تفعيل الشركة')
        fetchCompanies()
      }
    } catch (error) {
      toast.error('خطأ في الاتصال')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      website: '',
      trackingUrl: '',
      accountNumber: '',
      contactPerson: '',
      contactPhone: '',
      defaultFee: '',
      estimatedDays: '',
      areas: '',
      notes: '',
    })
    setEditingCompany(null)
    setShowForm(false)
  }

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.phone?.includes(searchTerm) ||
    company.areas?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BackButton fallbackUrl="/vendor/dashboard" className="bg-white/10 backdrop-blur-sm border-white/30 hover:bg-white/20 text-gray-200" />
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">شركات الشحن</h1>
              <p className="text-gray-400 text-sm">إدارة شركات الشحن الخاصة بك</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة شركة
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="bg-slate-900/90 border-purple-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {editingCompany ? 'تعديل الشركة' : 'إضافة شركة شحن جديدة'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">اسم الشركة *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-800/50 border-gray-700 text-white mt-1"
                    placeholder="مثال: أرامكس، DHL"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">رقم الهاتف</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-gray-800/50 border-gray-700 text-white mt-1"
                    placeholder="رقم خدمة العملاء"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">الموقع الإلكتروني</Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="bg-gray-800/50 border-gray-700 text-white mt-1"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label className="text-gray-300">رابط تتبع الشحنات</Label>
                  <Input
                    value={formData.trackingUrl}
                    onChange={(e) => setFormData({ ...formData, trackingUrl: e.target.value })}
                    className="bg-gray-800/50 border-gray-700 text-white mt-1"
                    placeholder="استخدم {tracking_number} للرقم"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">رقم حسابك لدى الشركة</Label>
                  <Input
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="bg-gray-800/50 border-gray-700 text-white mt-1"
                    placeholder="رقم العميل أو الحساب"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">اسم المسؤول</Label>
                  <Input
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="bg-gray-800/50 border-gray-700 text-white mt-1"
                    placeholder="الشخص المسؤول للتواصل"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">هاتف المسؤول</Label>
                  <Input
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="bg-gray-800/50 border-gray-700 text-white mt-1"
                    placeholder="01xxxxxxxxx"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">رسوم الشحن الافتراضية (جنيه)</Label>
                  <Input
                    type="number"
                    value={formData.defaultFee}
                    onChange={(e) => setFormData({ ...formData, defaultFee: e.target.value })}
                    className="bg-gray-800/50 border-gray-700 text-white mt-1"
                    placeholder="75"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">أيام التوصيل المتوقعة</Label>
                  <Input
                    type="number"
                    value={formData.estimatedDays}
                    onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                    className="bg-gray-800/50 border-gray-700 text-white mt-1"
                    placeholder="3"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-gray-300">المناطق المغطاة</Label>
                  <Input
                    value={formData.areas}
                    onChange={(e) => setFormData({ ...formData, areas: e.target.value })}
                    className="bg-gray-800/50 border-gray-700 text-white mt-1"
                    placeholder="القاهرة، الإسكندرية، الجيزة..."
                  />
                </div>
                <div className="lg:col-span-1">
                  <Label className="text-gray-300">ملاحظات</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="bg-gray-800/50 border-gray-700 text-white mt-1"
                    placeholder="أي ملاحظات إضافية..."
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-3 flex gap-3">
                  <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                    {editingCompany ? 'تحديث' : 'إضافة'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} className="border-gray-600">
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800/50 border-gray-700 text-white pr-10"
              placeholder="بحث باسم الشركة أو المناطق..."
            />
          </div>
        </div>

        {/* Companies List */}
        {filteredCompanies.length === 0 ? (
          <Card className="bg-slate-900/90 border-purple-500/30">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400 text-lg mb-4">لا يوجد شركات شحن</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-orange-600 to-red-600"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة أول شركة
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((company) => (
              <Card key={company.id} className={`bg-slate-900/90 border-purple-500/30 ${!company.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${company.isActive ? 'bg-orange-500/20' : 'bg-gray-500/20'}`}>
                        <Building2 className={`w-5 h-5 ${company.isActive ? 'text-orange-400' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{company.name}</h3>
                        {company.accountNumber && (
                          <p className="text-gray-400 text-xs">حساب: {company.accountNumber}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleActive(company)}
                      className={`p-1 rounded-full ${company.isActive ? 'text-green-400' : 'text-gray-400'}`}
                    >
                      {company.isActive ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    {company.phone && (
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span dir="ltr">{company.phone}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate">
                          {company.website.replace('https://', '').replace('http://', '')}
                        </a>
                      </div>
                    )}
                    {company.areas && (
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="truncate">{company.areas}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">رسوم الشحن:</span>
                      <span className="text-green-400 font-bold">{company.defaultFee} جنيه</span>
                    </div>
                    {company.estimatedDays && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">مدة التوصيل:</span>
                        <span className="text-blue-400 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {company.estimatedDays} أيام
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">الشحنات:</span>
                      <span className="text-orange-400 font-bold">{company.totalShipments}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(company)}
                      className="flex-1 border-gray-600"
                    >
                      <Edit className="w-4 h-4 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(company.id)}
                      className="border-red-600/50 text-red-400 hover:bg-red-600/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
