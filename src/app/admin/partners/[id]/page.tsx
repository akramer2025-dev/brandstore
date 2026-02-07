'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BackButton } from '@/components/BackButton'
import {
  Users,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Edit,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface PartnerDetails {
  id: string
  partnerName: string
  partnerType: string
  capitalAmount: number
  initialAmount: number
  currentAmount: number
  capitalPercent: number
  joinDate: string
  isActive: boolean
  notes: string | null
  email: string | null
  phone: string | null
  user: {
    email: string
    name: string
  } | null
  // إحصائيات
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalProfit: number
  // المعاملات
  transactions: Array<{
    id: string
    type: string
    amount: number
    description: string
    createdAt: string
  }>
  // المنتجات
  products: Array<{
    id: string
    name: string
    nameAr: string
    price: number
    stock: number
    sold: number
    createdAt: string
  }>
  // الطلبات الأخيرة
  recentOrders: Array<{
    id: string
    orderNumber: string
    total: number
    status: string
    createdAt: string
  }>
}

export default function PartnerDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const partnerId = params.id as string
  
  const [partner, setPartner] = useState<PartnerDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'transactions'>('overview')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchPartnerDetails()
    }
  }, [status, session, router, partnerId])

  const fetchPartnerDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/partners/${partnerId}`)
      
      if (!response.ok) {
        throw new Error('فشل في جلب بيانات الشريك')
      }
      
      const data = await response.json()
      setPartner(data)
    } catch (error) {
      console.error('Error fetching partner details:', error)
      toast.error('فشل في جلب بيانات الشريك')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <BackButton fallbackUrl="/admin/partners" />
          <Card className="bg-gray-800/50 border-red-500/20 mt-4">
            <CardContent className="p-6 text-center">
              <p className="text-red-400">لم يتم العثور على الشريك</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const profitPercent = partner.initialAmount > 0 
    ? ((partner.currentAmount - partner.initialAmount) / partner.initialAmount * 100).toFixed(2)
    : '0'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <BackButton fallbackUrl="/admin/partners" />
            <h1 className="text-3xl font-bold text-white mt-4 mb-2">
              {partner.partnerName}
            </h1>
            <p className="text-gray-400">
              {partner.partnerType === 'PARTNER' ? 'شريك' : 'مستثمر'} • انضم في{' '}
              {new Date(partner.joinDate).toLocaleDateString('ar-EG')}
            </p>
          </div>
          
          <Link href={`/admin/partners/${partnerId}/edit`}>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Edit className="w-4 h-4 mr-2" />
              تعديل البيانات
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* رأس المال الحالي */}
          <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-400" />
                <span className={`text-sm px-2 py-1 rounded ${
                  parseFloat(profitPercent) >= 0 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {profitPercent}%
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-1">رأس المال الحالي</p>
              <p className="text-2xl font-bold text-white">
                {partner.currentAmount.toLocaleString()} جنيه
              </p>
              <p className="text-xs text-gray-500 mt-1">
                من {partner.initialAmount.toLocaleString()} جنيه
              </p>
            </CardContent>
          </Card>

          {/* نسبة الشراكة */}
          <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">نسبة الشراكة</p>
              <p className="text-2xl font-bold text-white">
                {partner.capitalPercent}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                من إجمالي رأس المال
              </p>
            </CardContent>
          </Card>

          {/* إجمالي المنتجات */}
          <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">إجمالي المنتجات</p>
              <p className="text-2xl font-bold text-white">
                {partner.totalProducts}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                منتج نشط
              </p>
            </CardContent>
          </Card>

          {/* إجمالي المبيعات */}
          <Card className="bg-gradient-to-br from-orange-900/50 to-red-900/50 border-orange-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <ShoppingCart className="w-8 h-8 text-orange-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-white">
                {partner.totalRevenue.toLocaleString()} جنيه
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {partner.totalOrders} طلب
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            نظرة عامة
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'products'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            المنتجات ({partner.totalProducts})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'orders'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            الطلبات ({partner.totalOrders})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'transactions'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            المعاملات ({partner.transactions.length})
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* معلومات الحساب */}
            <Card className="bg-gray-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  معلومات الحساب
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {partner.user && (
                  <>
                    <div>
                      <p className="text-gray-400 text-sm">البريد الإلكتروني</p>
                      <p className="text-white font-semibold">{partner.user.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">الاسم</p>
                      <p className="text-white font-semibold">{partner.user.name}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-gray-400 text-sm">نوع الشراكة</p>
                  <p className="text-white font-semibold">
                    {partner.partnerType === 'PARTNER' ? 'شريك' : 'مستثمر'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">تاريخ الانضمام</p>
                  <p className="text-white font-semibold">
                    {new Date(partner.joinDate).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">الحالة</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                    partner.isActive
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {partner.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
                {partner.notes && (
                  <div>
                    <p className="text-gray-400 text-sm">ملاحظات</p>
                    <p className="text-white">{partner.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* الملخص المالي */}
            <Card className="bg-gray-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  الملخص المالي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                  <span className="text-gray-400">رأس المال الأولي</span>
                  <span className="text-white font-bold">
                    {partner.initialAmount.toLocaleString()} جنيه
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                  <span className="text-gray-400">رأس المال الحالي</span>
                  <span className="text-white font-bold">
                    {partner.currentAmount.toLocaleString()} جنيه
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                  <span className="text-gray-400">الفرق</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    partner.currentAmount >= partner.initialAmount
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}>
                    {partner.currentAmount >= partner.initialAmount ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {Math.abs(partner.currentAmount - partner.initialAmount).toLocaleString()} جنيه
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                  <span className="text-gray-400">إجمالي الإيرادات</span>
                  <span className="text-white font-bold">
                    {partner.totalRevenue.toLocaleString()} جنيه
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">نسبة الربح</span>
                  <span className={`font-bold ${
                    parseFloat(profitPercent) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {profitPercent}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'products' && (
          <Card className="bg-gray-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">المنتجات</CardTitle>
            </CardHeader>
            <CardContent>
              {partner.products.length > 0 ? (
                <div className="space-y-3">
                  {partner.products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-gray-700/30 rounded-lg p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{product.nameAr || product.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                          <span>السعر: {product.price} جنيه</span>
                          <span>المخزون: {product.stock}</span>
                          <span>المباع: {product.sold}</span>
                        </div>
                      </div>
                      <Link href={`/products/${product.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-8">لا توجد منتجات</p>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'orders' && (
          <Card className="bg-gray-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">الطلبات الأخيرة</CardTitle>
            </CardHeader>
            <CardContent>
              {partner.recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {partner.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-gray-700/30 rounded-lg p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                    >
                      <div>
                        <h3 className="text-white font-semibold">#{order.orderNumber}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                          <span>{order.total} جنيه</span>
                          <span className={`px-2 py-0.5 rounded ${
                            order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                            order.status === 'SHIPPED' ? 'bg-blue-500/20 text-blue-400' :
                            order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {order.status}
                          </span>
                          <span>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-8">لا توجد طلبات</p>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'transactions' && (
          <Card className="bg-gray-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">سجل المعاملات</CardTitle>
            </CardHeader>
            <CardContent>
              {partner.transactions.length > 0 ? (
                <div className="space-y-3">
                  {partner.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="bg-gray-700/30 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            transaction.type === 'DEPOSIT' ? 'bg-green-500/20 text-green-400' :
                            transaction.type === 'WITHDRAWAL' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {transaction.type === 'DEPOSIT' ? 'إيداع' :
                             transaction.type === 'WITHDRAWAL' ? 'سحب' : 'تعديل'}
                          </span>
                          <span className="text-white font-semibold">
                            {transaction.amount.toLocaleString()} جنيه
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{transaction.description}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(transaction.createdAt).toLocaleString('ar-EG')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-8">لا توجد معاملات</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
