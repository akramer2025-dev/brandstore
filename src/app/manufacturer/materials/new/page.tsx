'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import {
  Package,
  ArrowRight,
  Save,
  Loader2
} from 'lucide-react'

export default function NewMaterialPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    quantity: '',
    unit: 'قطعة',
    minQuantity: '10',
    pricePerUnit: '',
    supplier: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/raw-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseFloat(formData.quantity),
          minQuantity: parseFloat(formData.minQuantity),
          pricePerUnit: parseFloat(formData.pricePerUnit)
        })
      })

      if (res.ok) {
        alert('تم إضافة الخامة بنجاح')
        router.push('/manufacturer/materials')
      } else {
        const error = await res.json()
        alert(error.error || 'حدث خطأ')
      }
    } catch (error) {
      alert('حدث خطأ أثناء إضافة الخامة')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-400"></div>
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
          <Link href="/manufacturer/materials" className="hover:text-blue-300">الخامات</Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-white">إضافة خامة</span>
        </div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Package className="w-8 h-8 text-orange-400" />
          إضافة خامة جديدة
        </h1>
      </div>

      <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-white">بيانات الخامة</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">اسم الخامة (عربي)</Label>
                <Input
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="أزرار، سوست، خيوط..."
                  className="bg-white/5 border-white/20 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">اسم الخامة (إنجليزي)</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Buttons, Zippers, Thread..."
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-white">الكمية</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="100"
                  className="bg-white/5 border-white/20 text-white"
                  min="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">الوحدة</Label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white"
                >
                  <option value="قطعة" className="bg-gray-800">قطعة</option>
                  <option value="متر" className="bg-gray-800">متر</option>
                  <option value="كيلو" className="bg-gray-800">كيلو</option>
                  <option value="لفة" className="bg-gray-800">لفة</option>
                  <option value="علبة" className="bg-gray-800">علبة</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">الحد الأدنى</Label>
                <Input
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                  placeholder="10"
                  className="bg-white/5 border-white/20 text-white"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">السعر لكل وحدة (ج.م)</Label>
                <Input
                  type="number"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                  placeholder="5"
                  className="bg-white/5 border-white/20 text-white"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">المورد (اختياري)</Label>
                <Input
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="اسم المورد"
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Save className="w-4 h-4 ml-2" />
                )}
                حفظ الخامة
              </Button>
              <Link href="/manufacturer/materials">
                <Button type="button" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  إلغاء
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
