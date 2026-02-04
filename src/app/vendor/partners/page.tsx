'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  DollarSign,
  Percent,
  Calendar,
  Crown,
  UserPlus,
} from 'lucide-react'

interface Partner {
  id: string
  partnerName: string
  partnerType: string
  capitalPercent: number
  currentAmount: number
  joinDate: string
  isActive: boolean
}

export default function VendorPartnersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'VENDOR') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchPartners()
    }
  }, [status, session, router])

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/vendor/partners')
      if (response.ok) {
        const data = await response.json()
        setPartners(data.partners || [])
      }
    } catch (error) {
      console.error('Failed to fetch partners:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-purple-500 mx-auto"></div>
          <p className="mt-4 text-purple-300">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  const totalCapital = partners.reduce((sum, p) => sum + p.currentAmount, 0)
  const totalPercent = partners.reduce((sum, p) => sum + p.capitalPercent, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/vendor/dashboard">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-3 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">الشركاء</h1>
              <p className="text-purple-300 text-sm">عرض قائمة الشركاء في المشروع</p>
            </div>
          </div>
        </div>

        {/* ملخص */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <Card className="bg-white/10 backdrop-blur border-purple-500/30">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{partners.length}</p>
              <p className="text-purple-300 text-sm">إجمالي الشركاء</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-green-500/30">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{totalCapital.toLocaleString()}</p>
              <p className="text-green-300 text-sm">إجمالي رأس المال</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-yellow-500/30 col-span-2 md:col-span-1">
            <CardContent className="p-4 text-center">
              <Percent className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{totalPercent.toFixed(1)}%</p>
              <p className="text-yellow-300 text-sm">إجمالي النسب</p>
            </CardContent>
          </Card>
        </div>

        {/* قائمة الشركاء */}
        <div className="space-y-4">
          {partners.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-8 text-center">
                <UserPlus className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">لا يوجد شركاء</h3>
                <p className="text-gray-400">لم يتم إضافة شركاء للمشروع بعد</p>
              </CardContent>
            </Card>
          ) : (
            partners.map((partner) => (
              <Card 
                key={partner.id}
                className={`bg-white/10 backdrop-blur border-purple-500/30 hover:border-pink-500/50 transition-all ${
                  !partner.isActive ? 'opacity-50' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${
                        partner.partnerType === 'OWNER' 
                          ? 'bg-yellow-500/20' 
                          : 'bg-purple-500/20'
                      }`}>
                        {partner.partnerType === 'OWNER' ? (
                          <Crown className="w-6 h-6 text-yellow-400" />
                        ) : (
                          <Users className="w-6 h-6 text-purple-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{partner.partnerName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            partner.partnerType === 'OWNER'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {partner.partnerType === 'OWNER' ? 'مالك' : 'شريك'}
                          </span>
                          {!partner.isActive && (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-300">
                              غير نشط
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-green-400">
                        {partner.currentAmount.toLocaleString()} ج
                      </p>
                      <p className="text-purple-300 text-sm">
                        {partner.capitalPercent}% نسبة
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center text-gray-400 text-sm">
                    <Calendar className="w-4 h-4 ml-2" />
                    انضم في {new Date(partner.joinDate).toLocaleDateString('ar-EG')}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
