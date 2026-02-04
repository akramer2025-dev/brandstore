'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Package,
  ShoppingCart,
  RefreshCw,
  ArrowRight,
  ChevronLeft,
  Store,
  Users,
  Receipt,
  Eye,
  X
} from 'lucide-react'

interface CapitalSummary {
  capital: {
    current: number
    totalDeposits: number
    totalWithdrawals: number
  }
  products: {
    owned: number
    consignment: number
    total: number
  }
  suppliers: {
    pendingPayments: number
    pendingCount: number
    consignmentProfits: number
  }
  financials: {
    totalPurchases: number
    totalSales: number
    totalProfit: number
  }
  recentTransactions: any[]
}

interface SupplierPayment {
  id: string
  supplierName: string
  supplierPhone: string | null
  amountDue: number
  amountPaid: number
  profit: number
  status: string
  saleDate: string
  product: {
    id: string
    name: string
    nameAr: string
    images: string | null
  } | null
}

export default function VendorCapitalPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'
  const [summary, setSummary] = useState<CapitalSummary | null>(null)
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>([])
  const [paymentTotals, setPaymentTotals] = useState({ totalDue: 0, totalPaid: 0, pendingAmount: 0, totalProfit: 0 })
  const [loading, setLoading] = useState(true)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'VENDOR') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, session, router])

  const fetchData = async () => {
    try {
      const [summaryRes, paymentsRes] = await Promise.all([
        fetch('/api/vendor/capital/summary'),
        fetch('/api/vendor/supplier-payments?status=PENDING&limit=20')
      ])

      if (summaryRes.ok) {
        const data = await summaryRes.json()
        setSummary(data)
      }

      if (paymentsRes.ok) {
        const data = await paymentsRes.json()
        setSupplierPayments(data.payments || [])
        setPaymentTotals(data.totals || { totalDue: 0, totalPaid: 0, pendingAmount: 0, totalProfit: 0 })
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransaction = async (type: 'DEPOSIT' | 'WITHDRAWAL') => {
    if (!amount || parseFloat(amount) <= 0) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/vendor/capital/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: parseFloat(amount),
          notes
        })
      })

      if (res.ok) {
        setShowDepositModal(false)
        setShowWithdrawModal(false)
        setAmount('')
        setNotes('')
        fetchData()
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaySupplier = async (paymentId: string, amountToPay: number) => {
    try {
      const res = await fetch('/api/vendor/supplier-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          amountPaid: amountToPay,
          paymentMethod: 'CASH'
        })
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return <ArrowUpRight className="w-4 h-4 text-emerald-400" />
      case 'WITHDRAWAL': return <ArrowDownRight className="w-4 h-4 text-red-400" />
      case 'PURCHASE': return <ShoppingCart className="w-4 h-4 text-blue-400" />
      case 'SALE_PROFIT': return <TrendingUp className="w-4 h-4 text-emerald-400" />
      case 'CONSIGNMENT_PROFIT': return <Package className="w-4 h-4 text-violet-400" />
      case 'EXPENSE': return <Minus className="w-4 h-4 text-amber-400" />
      default: return <RefreshCw className="w-4 h-4 text-gray-400" />
    }
  }

  const getTransactionColor = (type: string) => {
    if (['DEPOSIT', 'SALE_PROFIT', 'CONSIGNMENT_PROFIT', 'REFUND'].includes(type)) {
      return 'text-emerald-400'
    }
    return 'text-red-400'
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-purple-500 mx-auto"></div>
          <p className="mt-4 text-purple-300">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Header - Mobile Optimized */}
      <div className="relative bg-gradient-to-r from-purple-900/50 via-pink-900/30 to-purple-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/vendor/dashboard">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10">
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </Link>
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 sm:p-3 rounded-xl">
                <Wallet className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-2xl md:text-3xl font-bold text-white">إدارة رأس المال</h1>
                <p className="text-purple-300 text-[10px] sm:text-sm hidden sm:block">تتبع الإيداعات والأرباح والمستحقات</p>
              </div>
            </div>
            <div className="flex gap-1 sm:gap-2">
              <Button
                onClick={() => setShowDepositModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-[10px] sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                <span className="hidden sm:inline">إيداع</span>
                <span className="sm:hidden">+</span>
              </Button>
              <Button
                onClick={() => setShowWithdrawModal(true)}
                className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-[10px] sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
              >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                <span className="hidden sm:inline">سحب</span>
                <span className="sm:hidden">-</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* الكروت الرئيسية - Mobile Optimized */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
          {/* رصيد رأس المال */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:bg-white/15 transition-all">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                <div className="w-full">
                  <p className="text-gray-300 text-[10px] sm:text-sm font-bold">💰 رصيد رأس المال</p>
                  <p className="text-xl sm:text-4xl font-black text-yellow-400 mt-1 sm:mt-2">
                    {summary?.capital.current?.toLocaleString() || 0}
                    <span className="text-sm sm:text-xl text-yellow-300 mr-1">ج</span>
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur p-2 sm:p-3 rounded-xl hidden sm:block">
                  <Wallet className="w-5 h-5 sm:w-7 sm:h-7 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* إجمالي الإيداعات */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:bg-white/15 transition-all">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                <div className="w-full">
                  <p className="text-gray-300 text-[10px] sm:text-sm font-bold">📈 إجمالي الإيداعات</p>
                  <p className="text-xl sm:text-4xl font-black text-green-400 mt-1 sm:mt-2">
                    {summary?.capital.totalDeposits?.toLocaleString() || 0}
                    <span className="text-sm sm:text-lg text-green-300 mr-1">ج</span>
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur p-2 sm:p-3 rounded-xl hidden sm:block">
                  <ArrowUpRight className="w-5 h-5 sm:w-7 sm:h-7 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* المستحق للموردين */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:bg-white/15 transition-all">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                <div className="w-full">
                  <p className="text-gray-300 text-[10px] sm:text-sm font-bold">⚠️ المستحق للموردين</p>
                  <p className="text-xl sm:text-4xl font-black text-red-400 mt-1 sm:mt-2">
                    {summary?.suppliers.pendingPayments?.toLocaleString() || 0}
                    <span className="text-sm sm:text-lg text-red-300 mr-1">ج</span>
                  </p>
                  <p className="text-gray-400 text-[9px] sm:text-sm mt-1 font-medium">
                    {summary?.suppliers.pendingCount || 0} مورد ينتظر
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur p-2 sm:p-3 rounded-xl hidden sm:block">
                  <Users className="w-5 h-5 sm:w-7 sm:h-7 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* أرباح الوسيط */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:bg-white/15 transition-all">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                <div className="w-full">
                  <p className="text-gray-300 text-[10px] sm:text-sm font-bold">💎 أرباح الوسيط</p>
                  <p className="text-xl sm:text-4xl font-black text-purple-400 mt-1 sm:mt-2">
                    {summary?.suppliers.consignmentProfits?.toLocaleString() || 0}
                    <span className="text-sm sm:text-lg text-purple-300 mr-1">ج</span>
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur p-2 sm:p-3 rounded-xl hidden sm:block">
                  <TrendingUp className="w-5 h-5 sm:w-7 sm:h-7 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* إحصائيات المنتجات - Mobile Optimized */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:bg-white/15 transition-all">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="bg-white/20 backdrop-blur p-2 sm:p-3 rounded-xl">
                  <Package className="w-5 h-5 sm:w-7 sm:h-7 text-cyan-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-[10px] sm:text-sm font-bold">📦 منتجات مملوكة</p>
                  <p className="text-2xl sm:text-4xl font-black text-cyan-400">{summary?.products.owned || 0}</p>
                  <p className="text-gray-400 text-[9px] sm:text-xs font-medium">تم شراؤها من رأس المال</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:bg-white/15 transition-all">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="bg-white/20 backdrop-blur p-2 sm:p-3 rounded-xl">
                  <Store className="w-5 h-5 sm:w-7 sm:h-7 text-pink-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-[10px] sm:text-sm font-bold">🏪 منتجات وسيط</p>
                  <p className="text-2xl sm:text-4xl font-black text-pink-400">{summary?.products.consignment || 0}</p>
                  <p className="text-gray-400 text-[9px] sm:text-xs font-medium">من محلات أخرى</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:bg-white/15 transition-all">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="bg-white/20 backdrop-blur p-2 sm:p-3 rounded-xl">
                  <DollarSign className="w-5 h-5 sm:w-7 sm:h-7 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-[10px] sm:text-sm font-bold">💵 إجمالي الأرباح</p>
                  <p className="text-2xl sm:text-4xl font-black text-green-400">
                    {summary?.financials.totalProfit?.toLocaleString() || 0}
                    <span className="text-sm sm:text-xl text-green-300 mr-1">ج</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs للتنقل */}
        <div className="flex gap-2 mb-6 flex-wrap bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-xl">
          <Link href="/vendor/capital">
            <Button 
              variant={activeTab === 'overview' ? "default" : "ghost"}
              className={activeTab === 'overview'
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" 
                : "text-white hover:bg-white/20"
              }
            >
              <Eye className="w-4 h-4 mr-2" />
              نظرة عامة
            </Button>
          </Link>
          <Link href="/vendor/capital?tab=deposits">
            <Button 
              variant={activeTab === 'deposits' ? "default" : "ghost"}
              className={activeTab === 'deposits'
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" 
                : "text-white hover:bg-white/20"
              }
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              الإيداعات
            </Button>
          </Link>
          <Link href="/vendor/capital?tab=withdrawals">
            <Button 
              variant={activeTab === 'withdrawals' ? "default" : "ghost"}
              className={activeTab === 'withdrawals'
                ? "bg-gradient-to-r from-red-500 to-rose-500 text-white" 
                : "text-white hover:bg-white/20"
              }
            >
              <ArrowDownRight className="w-4 h-4 mr-2" />
              السحوبات
            </Button>
          </Link>
          <Link href="/vendor/capital?tab=transactions">
            <Button 
              variant={activeTab === 'transactions' ? "default" : "ghost"}
              className={activeTab === 'transactions'
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white" 
                : "text-white hover:bg-white/20"
              }
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              كل المعاملات
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* المستحقات للموردين - فقط في نظرة عامة */}
          {activeTab === 'overview' && (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-3 sm:pb-4 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-white flex items-center gap-2 font-bold text-sm sm:text-base">
                <div className="bg-white/20 backdrop-blur p-1.5 sm:p-2 rounded-xl">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                </div>
                مستحقات الموردين
              </CardTitle>
              <Badge className="bg-white/20 text-orange-400 border border-white/30 font-bold px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs">
                {paymentTotals.pendingAmount?.toLocaleString()} ج
              </Badge>
            </CardHeader>
            <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6 pb-3 sm:pb-6">
              {supplierPayments.length > 0 ? (
                <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                  {supplierPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-2 sm:p-4 bg-gradient-to-r from-slate-700/60 to-slate-600/40 rounded-xl border border-slate-500/40 hover:border-orange-400/50 transition-all gap-2"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="bg-amber-500/20 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                          <Store className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-semibold text-xs sm:text-base truncate">{payment.supplierName}</p>
                          <p className="text-slate-400 text-[10px] sm:text-sm truncate">
                            {payment.product?.nameAr || 'منتج'}
                          </p>
                          {payment.supplierPhone && (
                            <p className="text-slate-500 text-[9px] sm:text-xs hidden sm:block">{payment.supplierPhone}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <p className="text-amber-400 font-bold text-xs sm:text-base whitespace-nowrap">{payment.amountDue?.toLocaleString()} ج</p>
                        <p className="text-emerald-400 text-[10px] sm:text-sm whitespace-nowrap">
                          ربحك: {payment.profit?.toLocaleString()} ج
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handlePaySupplier(payment.id, payment.amountDue - payment.amountPaid)}
                          className="mt-1 sm:mt-2 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[9px] sm:text-xs h-6 sm:h-8 px-2 sm:px-3"
                        >
                          <CheckCircle className="w-3 h-3 ml-1" />
                          <span className="hidden sm:inline">تم الدفع</span>
                          <span className="sm:hidden">✓</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-500 mx-auto mb-2" />
                  <p className="text-emerald-400 text-sm sm:text-base">لا توجد مستحقات معلقة</p>
                </div>
              )}
            </CardContent>
          </Card>
          )}

          {/* آخر المعاملات - Mobile Optimized */}
          {(activeTab === 'overview' || activeTab === 'transactions' || activeTab === 'deposits' || activeTab === 'withdrawals') && (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-3 sm:pb-4 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-white flex items-center gap-2 text-sm sm:text-base">
                <div className="bg-white/20 backdrop-blur p-1.5 sm:p-2 rounded-xl">
                  <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                {activeTab === 'deposits' && 'الإيداعات'}
                {activeTab === 'withdrawals' && 'السحوبات'}
                {(activeTab === 'overview' || activeTab === 'transactions') && 'آخر المعاملات'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6 pb-3 sm:pb-6">
              {summary?.recentTransactions && summary.recentTransactions.length > 0 ? (
                <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                  {summary.recentTransactions
                    .filter((tx: any) => {
                      if (activeTab === 'deposits') return tx.type === 'DEPOSIT';
                      if (activeTab === 'withdrawals') return tx.type === 'WITHDRAWAL';
                      return true; // overview and transactions show all
                    })
                    .map((tx: any) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-2 sm:p-3 bg-white/5 rounded-xl border border-white/10 gap-2"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="bg-white/10 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-[10px] sm:text-sm truncate">{tx.descriptionAr || tx.description}</p>
                          <p className="text-slate-500 text-[9px] sm:text-xs">
                            {new Date(tx.createdAt).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <p className={`font-bold text-xs sm:text-base whitespace-nowrap ${getTransactionColor(tx.type)}`}>
                          {['DEPOSIT', 'SALE_PROFIT', 'CONSIGNMENT_PROFIT', 'REFUND'].includes(tx.type) ? '+' : '-'}
                          {tx.amount?.toLocaleString()} ج
                        </p>
                        <p className="text-slate-500 text-[9px] sm:text-xs whitespace-nowrap">
                          الرصيد: {tx.balanceAfter?.toLocaleString()} ج
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm sm:text-base">
                    {activeTab === 'deposits' && 'لا توجد إيداعات حتى الآن'}
                    {activeTab === 'withdrawals' && 'لا توجد سحوبات حتى الآن'}
                    {(activeTab === 'overview' || activeTab === 'transactions') && 'لا توجد معاملات حتى الآن'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          )}
        </div>
      </div>

      {/* Modal - إيداع */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-md border border-slate-700 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                إيداع رأس مال
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowDepositModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">المبلغ (جنيه)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="أدخل المبلغ"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">ملاحظات (اختياري)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات..."
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <Button
                onClick={() => handleTransaction('DEPOSIT')}
                disabled={submitting || !amount}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                {submitting ? 'جاري الإيداع...' : 'إيداع'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - سحب */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-md border border-slate-700 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5 text-red-400" />
                سحب من رأس المال
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowWithdrawModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </Button>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-sm">
                الرصيد المتاح: {summary?.capital.current?.toLocaleString() || 0} جنيه
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">المبلغ (جنيه)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="أدخل المبلغ"
                  className="bg-slate-700 border-slate-600 text-white"
                  max={summary?.capital.current || 0}
                />
              </div>
              <div>
                <Label className="text-slate-300">ملاحظات (اختياري)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات..."
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <Button
                onClick={() => handleTransaction('WITHDRAWAL')}
                disabled={submitting || !amount || parseFloat(amount) > (summary?.capital.current || 0)}
                className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
              >
                {submitting ? 'جاري السحب...' : 'سحب'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
