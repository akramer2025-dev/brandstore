'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import {
  Factory,
  ArrowRight,
  Save,
  Package,
  Loader2
} from 'lucide-react'

interface Product {
  id: string
  name: string
  nameAr: string
}

export default function NewProductionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    notes: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'MANUFACTURER') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchProducts()
    }
  }, [status, session, router])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/manufacturer/productions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: formData.productId,
          quantity: parseInt(formData.quantity),
          notes: formData.notes
        })
      })

      if (res.ok) {
        alert('تم إنشاء أمر الإنتاج بنجاح')
        router.push('/manufacturer/productions')
      } else {
        const error = await res.json()
        alert(error.error || 'حدث خطأ')
      }
    } catch (error) {
      alert('حدث خطأ أثناء إنشاء أمر الإنتاج')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400"></div>
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
          <Link href="/manufacturer/productions" className="hover:text-blue-300">أوامر الإنتاج</Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-white">أمر جديد</span>
        </div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Factory className="w-8 h-8 text-blue-400" />
          أمر إنتاج جديد
        </h1>
      </div>

      <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-white">تفاصيل أمر الإنتاج</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-white">المنتج</Label>
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

            <div className="space-y-2">
              <Label className="text-white">الكمية المطلوبة</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="أدخل الكمية"
                className="bg-white/5 border-white/20 text-white"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">ملاحظات (اختياري)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أي ملاحظات إضافية..."
                className="bg-white/5 border-white/20 text-white min-h-[100px]"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Save className="w-4 h-4 ml-2" />
                )}
                إنشاء أمر الإنتاج
              </Button>
              <Link href="/manufacturer/productions">
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
