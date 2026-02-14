'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  Gift, 
  Tag, 
  Clock, 
  TrendingUp, 
  Heart,
  ShoppingCart,
  Loader2,
  Sparkles,
  Percent,
  Star,
  Zap,
  Filter,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/BackButton'
import { ProductCardPro } from '@/components/ProductCardPro'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  originalPrice: number | null
  images: string | null
  category: {
    id: string
    name: string
  } | null
  stock: number
  discount: number | null
  isPromoted: boolean
}

export default function OffersPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'discount' | 'promoted'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'discount'>('discount')

  // جلب المنتجات المخفضة والعروض الخاصة
  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products?hasDiscount=true&take=100')
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching offers:', error)
    } finally {
      setLoading(false)
    }
  }

  // فلترة المنتجات
  const filteredProducts = products.filter(product => {
    if (filterType === 'all') return true
    if (filterType === 'discount') return product.discount && product.discount > 0
    if (filterType === 'promoted') return product.isPromoted
    return true
  })

  // ترتيب المنتجات
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'discount':
        return (b.discount || 0) - (a.discount || 0)
      case 'newest':
      default:
        return 0
    }
  })

  // حساب الوفورات الكلية
  const totalSavings = sortedProducts.reduce((sum, product) => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return sum + (product.originalPrice - product.price)
    }
    return sum
  }, 0)

  // متوسط الخصم
  const avgDiscount = sortedProducts.reduce((sum, product) => sum + (product.discount || 0), 0) / 
                       (sortedProducts.filter(p => p.discount).length || 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 text-white py-6 md:py-10 px-4 shadow-xl relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <BackButton showHomeButton />
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl animate-bounce">
              <Gift className="w-6 h-6 md:w-10 md:h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-black">العروض الخاصة</h1>
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-sm md:text-lg text-red-100 font-medium">
                🔥 خصومات حصرية وعروض لا تُفوّت!
              </p>
            </div>
          </div>

          {/* إحصائيات العروض */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 md:p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Tag className="w-4 h-4 md:w-5 md:h-5" />
                <p className="text-xs md:text-sm text-red-100">العروض المتاحة</p>
              </div>
              <p className="text-xl md:text-3xl font-black">{sortedProducts.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 md:p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Percent className="w-4 h-4 md:w-5 md:h-5" />
                <p className="text-xs md:text-sm text-red-100">متوسط الخصم</p>
              </div>
              <p className="text-xl md:text-3xl font-black">{avgDiscount.toFixed(0)}%</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 md:p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-4 h-4 md:w-5 md:h-5" />
                <p className="text-xs md:text-sm text-red-100">وفّر حتى</p>
              </div>
              <p className="text-lg md:text-2xl font-black">{totalSavings.toFixed(0)} ج</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6">
        {/* شريط الفلاتر والترتيب */}
        <Card className="mb-6 shadow-lg border-2 border-red-200">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* فلاتر النوع */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">نوع العرض:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      filterType === 'all'
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      الكل
                    </span>
                  </button>
                  <button
                    onClick={() => setFilterType('discount')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      filterType === 'discount'
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Percent className="w-4 h-4" />
                      خصومات
                    </span>
                  </button>
                  <button
                    onClick={() => setFilterType('promoted')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      filterType === 'promoted'
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      مميزة
                    </span>
                  </button>
                </div>
              </div>

              {/* الترتيب */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">ترتيب حسب:</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-sm"
                >
                  <option value="discount">أعلى خصم</option>
                  <option value="price-low">السعر: من الأقل للأعلى</option>
                  <option value="price-high">السعر: من الأعلى للأقل</option>
                  <option value="newest">الأحدث</option>
                </select>
              </div>
            </div>

            {/* عدد النتائج */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                عرض <span className="font-bold text-red-600">{sortedProducts.length}</span> منتج من العروض الخاصة
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
            <p className="text-gray-600">جاري تحميل العروض...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && sortedProducts.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="py-20 text-center">
              <div className="bg-gradient-to-br from-red-100 to-pink-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-12 h-12 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                لا توجد عروض متاحة حالياً 🎁
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                ترقب العروض الحصرية القادمة! سنضيف عروضاً مميزة قريباً
              </p>
              <Link href="/products">
                <Button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
                  <ShoppingCart className="w-4 h-4 ml-2" />
                  تصفح جميع المنتجات
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* قائمة المنتجات */}
        {!loading && sortedProducts.length > 0 && (
          <>
            {/* Banner ترويجي */}
            <div className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 text-white rounded-2xl p-6 mb-6 text-center shadow-2xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-6 h-6 animate-bounce" />
                <h3 className="text-xl md:text-2xl font-bold">🎉 عروض محدودة!</h3>
                <Zap className="w-6 h-6 animate-bounce" />
              </div>
              <p className="text-sm md:text-base text-red-100">
                استفد من خصومات تصل إلى {Math.max(...sortedProducts.map(p => p.discount || 0))}% على منتجات مختارة
              </p>
            </div>

            {/* Grid المنتجات */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCardPro product={product} />
                </motion.div>
              ))}
            </div>

            {/* معلومات إضافية */}
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200">
                <CardContent className="p-6 text-center">
                  <div className="bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Tag className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">خصومات حصرية</h4>
                  <p className="text-sm text-gray-600">عروض مميزة لفترة محدودة</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-50 to-orange-50 border-2 border-pink-200">
                <CardContent className="p-6 text-center">
                  <div className="bg-pink-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Gift className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">هدايا مجانية</h4>
                  <p className="text-sm text-gray-600">مع الطلبات الكبيرة</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
                <CardContent className="p-6 text-center">
                  <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">شحن مجاني</h4>
                  <p className="text-sm text-gray-600">للطلبات +500 جنيه</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
