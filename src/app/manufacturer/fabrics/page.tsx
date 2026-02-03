'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import {
  Scissors,
  Plus,
  Search,
  ArrowRight,
  Ruler,
  Palette,
  Package
} from 'lucide-react'

interface Fabric {
  id: string
  name: string
  nameAr: string
  color: string
  quantity: number
  unit: string
  pricePerUnit: number
  supplier?: string
  createdAt: string
}

export default function FabricsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'MANUFACTURER') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchFabrics()
    }
  }, [status, session, router])

  const fetchFabrics = async () => {
    try {
      const res = await fetch('/api/fabrics')
      if (res.ok) {
        const data = await res.json()
        setFabrics(data.fabrics || [])
      }
    } catch (error) {
      console.error('Failed to fetch fabrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFabrics = fabrics.filter(f =>
    f.nameAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.color?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-purple-300">جاري التحميل...</p>
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
            <span className="text-white">الأقمشة</span>
          </div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Scissors className="w-8 h-8 text-purple-400" />
            إدارة الأقمشة
          </h1>
        </div>
        <Link href="/manufacturer/fabrics/new">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="w-4 h-4 ml-2" />
            إضافة قماش جديد
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
              placeholder="ابحث عن قماش..."
              className="pr-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Fabrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFabrics.length > 0 ? (
          filteredFabrics.map((fabric) => (
            <Card key={fabric.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-purple-500/20 p-3 rounded-xl">
                    <Scissors className="w-6 h-6 text-purple-400" />
                  </div>
                  <Badge className={fabric.quantity > 10 ? 'bg-green-500/20 text-green-400' : fabric.quantity > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}>
                    {fabric.quantity > 0 ? `${fabric.quantity} ${fabric.unit}` : 'نفذ'}
                  </Badge>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{fabric.nameAr || fabric.name}</h3>
                <div className="space-y-2 text-gray-400 text-sm">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    <span>اللون: {fabric.color}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    <span>السعر: {fabric.pricePerUnit} ج/{fabric.unit}</span>
                  </div>
                  {fabric.supplier && (
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span>المورد: {fabric.supplier}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10">
                    تعديل
                  </Button>
                  <Link href="/manufacturer/cutting" className="flex-1">
                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                      قص
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 col-span-full">
            <CardContent className="p-12 text-center">
              <Scissors className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">لا توجد أقمشة</p>
              <Link href="/manufacturer/fabrics/new">
                <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة قماش
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
