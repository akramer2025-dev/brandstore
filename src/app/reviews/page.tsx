'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, MessageSquare, ThumbsUp, User, Filter, ArrowUpDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Review {
  id: string
  user: {
    name: string | null
    image: string | null
  }
  product: {
    id: string
    name: string
    imageUrl: string | null
  }
  rating: number
  comment: string
  createdAt: string
  helpfulCount: number
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent')

  useEffect(() => {
    fetchReviews()
  }, [filterRating, sortBy])

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams()
      if (filterRating) queryParams.append('rating', filterRating.toString())
      queryParams.append('sort', sortBy)

      const res = await fetch(`/api/reviews?${queryParams}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRatingEmoji = (rating: number) => {
    if (rating === 5) return '🌟'
    if (rating === 4) return '😊'
    if (rating === 3) return '😐'
    if (rating === 2) return '😕'
    return '😞'
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white py-6 md:py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">💬 تقييمات العملاء</h1>
          <p className="text-sm md:text-base text-white/90">شاهد آراء عملائنا في منتجاتنا</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-6 md:py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Rating Filter */}
            <div className="w-full sm:w-auto">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">تصفية حسب التقييم:</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterRating(null)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filterRating === null
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  الكل
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(rating)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                      filterRating === rating
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Star className="w-3 h-3 fill-current" />
                    {rating}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="w-full sm:w-auto">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">ترتيب حسب:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="recent">الأحدث</option>
                <option value="highest">الأعلى تقييماً</option>
                <option value="lowest">الأقل تقييماً</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل التقييمات...</p>
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد تقييمات بعد</h3>
            <p className="text-gray-500 mb-6">كن أول من يقيّم منتجاتنا!</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md p-4 md:p-6 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <Link href={`/products/${review.product.id}`} className="flex-shrink-0">
                    <div className="w-full sm:w-24 h-40 sm:h-24 bg-gray-100 rounded-lg overflow-hidden">
                      {review.product.imageUrl ? (
                        <Image
                          src={review.product.imageUrl}
                          alt={review.product.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <MessageSquare className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Review Content */}
                  <div className="flex-1">
                    {/* User & Rating */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {review.user.image ? (
                          <Image
                            src={review.user.image}
                            alt={review.user.name || 'User'}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{review.user.name || 'عميل'}</p>
                          <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-bold">
                        <span className="text-lg">{getRatingEmoji(review.rating)}</span>
                        <Star className="w-4 h-4 fill-current" />
                        <span>{review.rating}</span>
                      </div>
                    </div>

                    {/* Product Name */}
                    <Link
                      href={`/products/${review.product.id}`}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium mb-2 inline-block"
                    >
                      {review.product.name}
                    </Link>

                    {/* Comment */}
                    <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>

                    {/* Helpful Button */}
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span>مفيد ({review.helpfulCount})</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
