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
  Factory,
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Shirt,
  Calendar,
  Package,
  Play,
  Pause
} from 'lucide-react'

interface Production {
  id: string
  productName: string
  quantity: number
  status: string
  createdAt: string
  completedAt?: string
  notes?: string
}

export default function ProductionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [productions, setProductions] = useState<Production[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'MANUFACTURER') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchProductions()
    }
  }, [status, session, router])

  const fetchProductions = async () => {
    try {
      const res = await fetch('/api/manufacturer/productions?limit=100')
      if (res.ok) {
        const data = await res.json()
        setProductions(data.productions || [])
      }
    } catch (error) {
      console.error('Failed to fetch productions:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/manufacturer/productions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        fetchProductions()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string; icon: any }> = {
      PENDING: { color: 'bg-yellow-500/20 text-yellow-400', text: 'قيد الانتظار', icon: Clock },
      IN_PROGRESS: { color: 'bg-blue-500/20 text-blue-400', text: 'قيد التصنيع', icon: Factory },
      COMPLETED: { color: 'bg-green-500/20 text-green-400', text: 'مكتمل', icon: CheckCircle },
      CANCELLED: { color: 'bg-red-500/20 text-red-400', text: 'ملغي', icon: XCircle }
    }
    const config = statusConfig[status] || statusConfig.PENDING
    const Icon = config.icon
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredProductions = productions.filter(p => {
    const matchesSearch = p.productName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-blue-300">جاري التحميل...</p>
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
            <span className="text-white">أوامر الإنتاج</span>
          </div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Factory className="w-8 h-8 text-blue-400" />
            أوامر الإنتاج
          </h1>
        </div>
        <Link href="/manufacturer/productions/new">
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
            <Plus className="w-4 h-4 ml-2" />
            أمر إنتاج جديد
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن أمر إنتاج..."
                className="pr-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
                <Button
                  key={s}
                  variant={filterStatus === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(s)}
                  className={filterStatus === s ? 'bg-blue-600' : 'bg-white/5 text-white border-white/20'}
                >
                  {s === 'all' ? 'الكل' : s === 'PENDING' ? 'انتظار' : s === 'IN_PROGRESS' ? 'تصنيع' : s === 'COMPLETED' ? 'مكتمل' : 'ملغي'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Productions List */}
      <div className="space-y-4">
        {filteredProductions.length > 0 ? (
          filteredProductions.map((production) => (
            <Card key={production.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500/20 p-3 rounded-xl">
                      <Shirt className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{production.productName}</h3>
                      <div className="flex items-center gap-4 text-gray-400 text-sm mt-1">
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {production.quantity} قطعة
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(production.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(production.status)}
                    {production.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(production.id, 'IN_PROGRESS')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="w-4 h-4 ml-1" />
                        بدء
                      </Button>
                    )}
                    {production.status === 'IN_PROGRESS' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(production.id, 'COMPLETED')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 ml-1" />
                        إنهاء
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-12 text-center">
              <Factory className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">لا توجد أوامر إنتاج</p>
              <Link href="/manufacturer/productions/new">
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء أمر إنتاج
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
