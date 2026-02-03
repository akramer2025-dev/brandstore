'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Ruler,
  ArrowRight,
  Scissors,
  Package,
  Calculator,
  Save,
  Loader2,
  CheckCircle
} from 'lucide-react'

interface Fabric {
  id: string
  name: string
  nameAr: string
  color: string
  quantity: number
  unit: string
}

interface Product {
  id: string
  name: string
  nameAr: string
}

interface CuttingHistory {
  id: string
  fabricName: string
  productName: string
  quantity: number
  date: string
}

export default function CuttingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [cuttingHistory, setCuttingHistory] = useState<CuttingHistory[]>([])
  
  const [formData, setFormData] = useState({
    fabricId: '',
    productId: '',
    quantity: '',
    fabricUsed: '',
    notes: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'MANUFACTURER') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, session, router])

  const fetchData = async () => {
    try {
      const [fabricsRes, productsRes] = await Promise.all([
        fetch('/api/fabrics'),
        fetch('/api/products')
      ])
      
      if (fabricsRes.ok) {
        const data = await fabricsRes.json()
        setFabrics(data.fabrics || [])
      }
      
      if (productsRes.ok) {
        const data = await productsRes.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/fabrics/cut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fabricId: formData.fabricId,
          productId: formData.productId,
          quantity: parseInt(formData.quantity),
          fabricUsed: parseFloat(formData.fabricUsed),
          notes: formData.notes
        })
      })

      if (res.ok) {
        alert('تمت عملية القص بنجاح')
        setFormData({
          fabricId: '',
          productId: '',
          quantity: '',
          fabricUsed: '',
          notes: ''
        })
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || 'حدث خطأ')
      }
    } catch (error) {
      alert('حدث خطأ أثناء عملية القص')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedFabric = fabrics.find(f => f.id === formData.fabricId)

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto"></div>
          <p className="mt-4 text-green-300">جاري التحميل...</p>
        </div>
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
          <span className="text-white">القص</span>
        </div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Ruler className="w-8 h-8 text-green-400" />
          قص الأقمشة
        </h1>
        <p className="text-gray-400 mt-2">قص القماش وإنتاج قطع ملابس جديدة</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cutting Form */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Scissors className="w-5 h-5 text-green-400" />
              عملية قص جديدة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-white">اختر القماش</Label>
                <select
                  value={formData.fabricId}
                  onChange={(e) => setFormData({ ...formData, fabricId: e.target.value })}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white"
                  required
                >
                  <option value="">اختر القماش</option>
                  {fabrics.map((fabric) => (
                    <option key={fabric.id} value={fabric.id} className="bg-gray-800">
                      {fabric.nameAr || fabric.name} - {fabric.color} ({fabric.quantity} {fabric.unit})
                    </option>
                  ))}
                </select>
                {selectedFabric && (
                  <Badge className="bg-purple-500/20 text-purple-400">
                    المتاح: {selectedFabric.quantity} {selectedFabric.unit}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-white">المنتج المراد إنتاجه</Label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white"
                  required
                >
                  <option value="">اختر المنتج</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id} className="bg-gray-800">
                      {product.nameAr || product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">عدد القطع</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="10"
                    className="bg-white/5 border-white/20 text-white"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">القماش المستخدم ({selectedFabric?.unit || 'متر'})</Label>
                  <Input
                    type="number"
                    value={formData.fabricUsed}
                    onChange={(e) => setFormData({ ...formData, fabricUsed: e.target.value })}
                    placeholder="5.5"
                    className="bg-white/5 border-white/20 text-white"
                    min="0.1"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">ملاحظات (اختياري)</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أي ملاحظات..."
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Scissors className="w-4 h-4 ml-2" />
                )}
                تنفيذ عملية القص
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Available Fabrics */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              الأقمشة المتاحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fabrics.length > 0 ? (
              <div className="space-y-3">
                {fabrics.map((fabric) => (
                  <div key={fabric.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{fabric.nameAr || fabric.name}</p>
                      <p className="text-gray-400 text-sm">{fabric.color}</p>
                    </div>
                    <Badge className={fabric.quantity > 10 ? 'bg-green-500/20 text-green-400' : fabric.quantity > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}>
                      {fabric.quantity} {fabric.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Scissors className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد أقمشة متاحة</p>
                <Link href="/manufacturer/fabrics/new">
                  <Button className="mt-4" size="sm">
                    إضافة قماش
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
