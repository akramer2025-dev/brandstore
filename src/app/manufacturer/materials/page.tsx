'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import {
  Package,
  Plus,
  Search,
  ArrowRight,
  AlertCircle,
  DollarSign
} from 'lucide-react'

interface Material {
  id: string
  name: string
  nameAr: string
  quantity: number
  unit: string
  minQuantity: number
  pricePerUnit: number
  supplier?: string
}

export default function MaterialsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'MANUFACTURER') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchMaterials()
    }
  }, [status, session, router])

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/raw-materials')
      if (res.ok) {
        const data = await res.json()
        setMaterials(data.materials || [])
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMaterials = materials.filter(m =>
    m.nameAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-400 mx-auto"></div>
          <p className="mt-4 text-orange-300">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Link href="/manufacturer/dashboard" className="hover:text-blue-300">لوحة التحكم</Link>
            <ArrowRight className="w-4 h-4" />
            <span className="text-white">الخامات</span>
          </div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-orange-400" />
            إدارة الخامات
          </h1>
        </div>
        <Link href="/manufacturer/materials/new">
          <Button className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700">
            <Plus className="w-4 h-4 ml-2" />
            إضافة خامة جديدة
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن خامة..."
              className="pr-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.length > 0 ? (
          filteredMaterials.map((material) => (
            <Card key={material.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-orange-500/20 p-3 rounded-xl">
                    <Package className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={material.quantity > material.minQuantity ? 'bg-green-500/20 text-green-400' : material.quantity > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}>
                      {material.quantity} {material.unit}
                    </Badge>
                    {material.quantity <= material.minQuantity && material.quantity > 0 && (
                      <span className="text-xs text-yellow-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        مخزون منخفض
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{material.nameAr || material.name}</h3>
                <div className="space-y-2 text-gray-400 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>السعر: {material.pricePerUnit} ج/{material.unit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>الحد الأدنى: {material.minQuantity} {material.unit}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-4 border-white/20 text-white hover:bg-white/10">
                  تعديل
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 col-span-full">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">لا توجد خامات</p>
              <Link href="/manufacturer/materials/new">
                <Button className="mt-4 bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة خامة
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
