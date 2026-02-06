'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Truck, Plus, Edit, Trash2, Phone, MapPin,
  User, Loader2, CheckCircle2, XCircle, Car, Bike, Search
} from 'lucide-react'
import { toast } from 'sonner'
import { BackButton } from '@/components/BackButton'

interface DeliveryAgent {
  id: string
  name: string
  phone: string
  alternativePhone?: string
  whatsapp?: string
  address?: string
  area?: string
  vehicleType?: string
  vehicleNumber?: string
  deliveryFee: number
  isActive: boolean
  totalDeliveries: number
  notes?: string
  createdAt: string
}

export default function DeliveryAgentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [agents, setAgents] = useState<DeliveryAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAgent, setEditingAgent] = useState<DeliveryAgent | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    alternativePhone: '',
    whatsapp: '',
    address: '',
    area: '',
    vehicleType: 'موتوسيكل',
    vehicleNumber: '',
    deliveryFee: '',
    notes: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'VENDOR') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchAgents()
    }
  }, [status, session, router])

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/vendor/delivery-agents')
      if (res.ok) {
        const data = await res.json()
        setAgents(data)
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone) {
      toast.error('الاسم ورقم الهاتف مطلوبان')
      return
    }

    setSubmitting(true)
    try {
      const url = editingAgent 
        ? `/api/vendor/delivery-agents/${editingAgent.id}`
        : '/api/vendor/delivery-agents'
      
      const res = await fetch(url, {
        method: editingAgent ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success(editingAgent ? 'تم تحديث المندوب' : 'تم إضافة المندوب')
        resetForm()
        fetchAgents()
      } else {
        toast.error('حدث خطأ')
      }
    } catch (error) {
      toast.error('خطأ في الاتصال')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (agent: DeliveryAgent) => {
    setEditingAgent(agent)
    setFormData({
      name: agent.name,
      phone: agent.phone,
      alternativePhone: agent.alternativePhone || '',
      whatsapp: agent.whatsapp || '',
      address: agent.address || '',
      area: agent.area || '',
      vehicleType: agent.vehicleType || 'موتوسيكل',
      vehicleNumber: agent.vehicleNumber || '',
      deliveryFee: agent.deliveryFee.toString(),
      notes: agent.notes || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المندوب؟')) return

    try {
      const res = await fetch(`/api/vendor/delivery-agents/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('تم حذف المندوب')
        fetchAgents()
      } else {
        toast.error('حدث خطأ')
      }
    } catch (error) {
      toast.error('خطأ في الاتصال')
    }
  }

  const toggleActive = async (agent: DeliveryAgent) => {
    try {
      const res = await fetch(`/api/vendor/delivery-agents/${agent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...agent, isActive: !agent.isActive }),
      })

      if (res.ok) {
        toast.success(agent.isActive ? 'تم إيقاف المندوب' : 'تم تفعيل المندوب')
        fetchAgents()
      }
    } catch (error) {
      toast.error('خطأ في الاتصال')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      alternativePhone: '',
      whatsapp: '',
      address: '',
      area: '',
      vehicleType: 'موتوسيكل',
      vehicleNumber: '',
      deliveryFee: '',
      notes: '',
    })
    setEditingAgent(null)
    setShowForm(false)
  }

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.phone.includes(searchTerm) ||
    agent.area?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">مناديب التوصيل</h1>
              <p className="text-gray-400 text-sm">إدارة مناديب التوصيل الخاصين بك</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة مندوب
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="bg-slate-900/90 border-purple-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                {editingAgent ? 'تعديل المندوب' : 'إضافة مندوب جديد'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">اسم المندوب *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-800/50 border-gray-700 text-white mt-1"
                    placeholder="أحمد محمد"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">رقم الهاتف *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-gray-800/50 border-gray-700 text-white mt-1"
                    placeholder="01xxxxxxxxx"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">رقم بديل</Label>
                  <Input
                    value={formData.alternativePhone}
                    onChange={(e) => setFormData({ ...formData, alternativePhone: e.target.value })}
                    className="bg-gray-800/50 border-gray-700 text-white mt-1"
                    placeholder="01xxxxxxxxx"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">واتساب</Label>
                  <Input
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="bg-gray-800/50 border-gray-700 text-white mt-1"
                    placeholder="01xxxxxxxxx"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">المنطقة التي يغطيها</Label>
                  <Input
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="bg-gray-800/50 border-gray-700 text-white mt-1"
                    placeholder="مثال: القاهرة - المعادي"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">نوع المركبة</Label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-md p-2 mt-1"
                  >
                    <option value="موتوسيكل">موتوسيكل</option>
                    <option value="سيارة">سيارة</option>
                    <option value="دراجة">دراجة</option>
                    <option value="سيرًا">سيرًا على الأقدام</option>
                  </select>
                </div>
                <div>
                  <Label className="text-gray-300">رقم المركبة</Label>
                  <Input
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="bg-gray-800/50 border-gray-700 text-white mt-1"
                    placeholder="أ ب ج 123"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">رسوم التوصيل (جنيه)</Label>
                  <Input
                    type="number"
                    value={formData.deliveryFee}
                    onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
                    className="bg-gray-800/50 border-gray-700 text-white mt-1"
                    placeholder="50"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">العنوان</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="bg-gray-800/50 border-gray-700 text-white mt-1"
                    placeholder="عنوان المندوب"
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
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
                    {editingAgent ? 'تحديث' : 'إضافة'}
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
              placeholder="بحث بالاسم أو الهاتف أو المنطقة..."
            />
          </div>
        </div>

        {/* Agents List */}
        {filteredAgents.length === 0 ? (
          <Card className="bg-slate-900/90 border-purple-500/30">
            <CardContent className="p-12 text-center">
              <Truck className="w-16 h-16 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400 text-lg mb-4">لا يوجد مناديب توصيل</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة أول مندوب
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent) => (
              <Card key={agent.id} className={`bg-slate-900/90 border-purple-500/30 ${!agent.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${agent.isActive ? 'bg-blue-500/20' : 'bg-gray-500/20'}`}>
                        {agent.vehicleType === 'سيارة' ? (
                          <Car className={`w-5 h-5 ${agent.isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                        ) : (
                          <Bike className={`w-5 h-5 ${agent.isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{agent.name}</h3>
                        <p className="text-gray-400 text-sm">{agent.vehicleType}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleActive(agent)}
                      className={`p-1 rounded-full ${agent.isActive ? 'text-green-400' : 'text-gray-400'}`}
                    >
                      {agent.isActive ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span dir="ltr">{agent.phone}</span>
                    </div>
                    {agent.area && (
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{agent.area}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">رسوم التوصيل:</span>
                      <span className="text-green-400 font-bold">{agent.deliveryFee} جنيه</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">التوصيلات:</span>
                      <span className="text-blue-400 font-bold">{agent.totalDeliveries}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(agent)}
                      className="flex-1 border-gray-600"
                    >
                      <Edit className="w-4 h-4 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(agent.id)}
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
