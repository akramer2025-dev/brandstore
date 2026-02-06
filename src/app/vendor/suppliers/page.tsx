'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Store, Package, DollarSign, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { BackButton } from '@/components/BackButton'

interface Supplier {
  id: string
  name: string
  totalPurchases: number
  pendingPayment: number
  paidAmount: number
  lastPurchaseDate: string | null
  productsCount: number
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    totalPending: 0,
    totalPaid: 0,
    totalPurchases: 0,
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/vendor/suppliers')
      if (res.ok) {
        const data = await res.json()
        setSuppliers(data.suppliers || [])
        setStats(data.stats || {})
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BackButton fallbackUrl="/vendor/dashboard" />
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-3 rounded-xl shadow-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">الموردين</h1>
              <p className="text-blue-300 text-sm">إدارة الموردين والمستحقات</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card className="bg-gradient-to-br from-orange-600/35 to-amber-600/35 backdrop-blur-xl border-orange-500/50 shadow-lg shadow-orange-500/20">
            <CardContent className="p-4 text-center">
              <div className="bg-orange-600/30 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Store className="w-6 h-6 text-orange-300" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalSuppliers}</p>
              <p className="text-orange-300 text-xs font-semibold">عدد الموردين</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-600/35 to-rose-600/35 backdrop-blur-xl border-red-500/50 shadow-lg shadow-red-500/20">
            <CardContent className="p-4 text-center">
              <div className="bg-red-600/30 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
                <TrendingDown className="w-6 h-6 text-red-300" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalPending.toLocaleString()}</p>
              <p className="text-red-300 text-xs font-semibold">مستحقات</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/35 to-emerald-600/35 backdrop-blur-xl border-green-500/50 shadow-lg shadow-green-500/20">
            <CardContent className="p-4 text-center">
              <div className="bg-green-600/30 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-green-300" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalPaid.toLocaleString()}</p>
              <p className="text-green-300 text-xs font-semibold">مدفوع</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600/35 to-cyan-600/35 backdrop-blur-xl border-blue-500/50 shadow-lg shadow-blue-500/20">
            <CardContent className="p-4 text-center">
              <div className="bg-blue-600/30 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-6 h-6 text-blue-300" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalPurchases.toLocaleString()}</p>
              <p className="text-blue-300 text-xs font-semibold">إجمالي المشتريات</p>
            </CardContent>
          </Card>
        </div>

        {/* Suppliers List */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white mb-4">قائمة الموردين</h2>
          
          {suppliers.length === 0 ? (
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="p-8 text-center">
                <Store className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/50 text-lg">لا توجد موردين حتى الآن</p>
                <p className="text-white/30 text-sm mt-2">سيتم عرض الموردين بعد إضافة فواتير المشتريات</p>
              </CardContent>
            </Card>
          ) : (
            suppliers.map((supplier) => (
              <Card key={supplier.id} className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-3 rounded-xl">
                        <Store className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">{supplier.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <div className="flex items-center gap-1 text-blue-300">
                            <Package className="w-4 h-4" />
                            <span>{supplier.productsCount} منتج</span>
                          </div>
                          {supplier.lastPurchaseDate && (
                            <div className="flex items-center gap-1 text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(supplier.lastPurchaseDate).toLocaleDateString('ar-EG')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <p className="text-xs text-gray-400">مستحق</p>
                        <p className={`text-lg font-bold ${supplier.pendingPayment > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {supplier.pendingPayment.toLocaleString()} ج
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-gray-400">مدفوع</p>
                        <p className="text-lg font-bold text-green-400">
                          {supplier.paidAmount.toLocaleString()} ج
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-gray-400">إجمالي</p>
                        <p className="text-lg font-bold text-white">
                          {supplier.totalPurchases.toLocaleString()} ج
                        </p>
                      </div>
                    </div>
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
