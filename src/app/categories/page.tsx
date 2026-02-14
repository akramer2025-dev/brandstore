'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  Shirt, 
  ShoppingBag, 
  Search, 
  Grid3x3, 
  List,
  Loader2,
  ArrowLeft,
  Package,
  TrendingUp,
  Sparkles
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BackButton } from '@/components/BackButton'

interface Category {
  id: string
  name: string
  description: string | null
  image: string | null
  _count?: {
    products: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // جلب التصنيفات من API
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  // فلترة التصنيفات حسب البحث
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // الحصول على أيقونة التصنيف
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    if (name.includes('قميص') || name.includes('بلوز')) return <Shirt className="w-6 h-6" />
    if (name.includes('حقيب') || name.includes('شنط')) return <ShoppingBag className="w-6 h-6" />
    if (name.includes('اكسسوار')) return <Sparkles className="w-6 h-6" />
    return <Package className="w-6 h-6" />
  }

  // ألوان متنوعة للتصنيفات
  const getGradientClass = (index: number) => {
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500',
      'from-teal-500 to-green-500',
      'from-yellow-500 to-orange-500',
    ]
    return gradients[index % gradients.length]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white py-6 md:py-8 px-4 shadow-xl">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-4">
            <BackButton showHomeButton />
          </div>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
              <Grid3x3 className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">التصنيفات 📂</h1>
              <p className="text-sm md:text-base text-purple-100 mt-1">
                تصفح جميع التصنيفات المتاحة
              </p>
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="flex items-center gap-4 mt-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <p className="text-xs text-purple-100">إجمالي التصنيفات</p>
              <p className="text-xl font-bold">{categories.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <p className="text-xs text-purple-100">إجمالي المنتجات</p>
              <p className="text-xl font-bold">
                {categories.reduce((sum, cat) => sum + (cat._count?.products || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6">
        {/* شريط البحث والفلاتر */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* البحث */}
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="ابحث عن تصنيف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 h-11 rounded-xl"
                />
              </div>

              {/* أزرار عرض */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-xl transition-all ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="عرض شبكي"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-xl transition-all ${
                    viewMode === 'list'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="عرض قائمة"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* عدد النتائج */}
            {searchQuery && (
              <div className="mt-3 text-sm text-gray-600">
                عُثر على <span className="font-bold text-purple-600">{filteredCategories.length}</span> تصنيف
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
            <p className="text-gray-600">جاري تحميل التصنيفات...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCategories.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid3x3 className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {searchQuery ? 'لم يتم العثور على تصنيفات' : 'لا توجد تصنيفات متاحة'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'جرب كلمات بحث أخرى' : 'سيتم إضافة التصنيفات قريباً'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Grid View */}
        {!loading && filteredCategories.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/products?category=${category.id}`}>
                  <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden h-full">
                    <CardContent className="p-0">
                      {/* صورة التصنيف */}
                      <div className="relative aspect-square overflow-hidden">
                        {category.image ? (
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${getGradientClass(index)} flex items-center justify-center`}>
                            <div className="text-white">
                              {getCategoryIcon(category.name)}
                            </div>
                          </div>
                        )}
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* عدد المنتجات */}
                        {category._count && category._count.products > 0 && (
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                            <Package className="w-3 h-3 text-purple-600" />
                            <span className="text-xs font-bold text-gray-800">
                              {category._count.products}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* تفاصيل التصنيف */}
                      <div className="p-3">
                        <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                        
                        {/* زر المشاهدة */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-purple-600 font-medium">
                            تصفح المنتجات
                          </span>
                          <ArrowLeft className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* List View */}
        {!loading && filteredCategories.length > 0 && viewMode === 'list' && (
          <div className="space-y-4">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/products?category=${category.id}`}>
                  <Card className="group hover:shadow-2xl transition-all duration-300 hover:border-purple-300 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-4 p-4">
                        {/* صورة التصنيف */}
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
                          {category.image ? (
                            <Image
                              src={category.image}
                              alt={category.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${getGradientClass(index)} flex items-center justify-center text-white`}>
                              {getCategoryIcon(category.name)}
                            </div>
                          )}
                        </div>

                        {/* تفاصيل التصنيف */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-purple-600 transition-colors">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {category.description}
                            </p>
                          )}
                          
                          {/* معلومات إضافية */}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {category._count && category._count.products > 0 && (
                              <div className="flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                <span>{category._count.products} منتج</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* سهم */}
                        <div className="flex-shrink-0">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl group-hover:scale-110 transition-transform">
                            <ArrowLeft className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
