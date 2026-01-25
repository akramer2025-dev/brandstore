'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface VendorStats {
  totalOrders: number
  totalRevenue: number
  pendingPayouts: number
  totalProducts: number
}

export default function VendorDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<VendorStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'VENDOR') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchStats()
    }
  }, [status, session, router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/vendor/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold">لوحة تحكم البائع</h1>
          <p className="mt-2 text-purple-100">
            مرحباً، {session?.user?.username || session?.user?.email}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">إجمالي الطلبات</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalOrders || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">إجمالي الإيرادات</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats?.totalRevenue?.toFixed(2) || '0.00'} ج.م
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">مدفوعات معلقة</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats?.pendingPayouts?.toFixed(2) || '0.00'} ج.م
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">إجمالي المنتجات</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats?.totalProducts || 0}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <h3 className="text-xl font-bold mb-4 text-gray-900">إدارة المنتجات</h3>
            <p className="text-gray-600 mb-4">أضف وعدل منتجاتك</p>
            <Link href="/vendor/products">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                إدارة المنتجات
              </Button>
            </Link>
          </Card>

          <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <h3 className="text-xl font-bold mb-4 text-gray-900">الطلبات</h3>
            <p className="text-gray-600 mb-4">شاهد وإدارة طلبات عملائك</p>
            <Link href="/vendor/orders">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                عرض الطلبات
              </Button>
            </Link>
          </Card>

          <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <h3 className="text-xl font-bold mb-4 text-gray-900">المدفوعات</h3>
            <p className="text-gray-600 mb-4">تتبع أرباحك ومدفوعاتك</p>
            <Link href="/vendor/payouts">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                عرض المدفوعات
              </Button>
            </Link>
          </Card>
        </div>

        {/* Store Settings */}
        <Card className="p-6 bg-white shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-gray-900">إعدادات المتجر</h3>
          <p className="text-gray-600 mb-6">
            قم بتحديث معلومات متجرك والإعدادات
          </p>
          <Link href="/vendor/settings">
            <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
              الذهاب إلى الإعدادات
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
