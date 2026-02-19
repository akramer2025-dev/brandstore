"use client";

import { Star, Quote, ThumbsUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    image?: string | null;
  };
  product: {
    nameAr: string;
  };
}

interface TestimonialsSectionProps {
  reviews: Review[];
}

export function TestimonialsSection({ reviews }: TestimonialsSectionProps) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 lg:py-16 bg-gradient-to-b from-gray-900/50 via-purple-900/10 to-gray-900/50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      
      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 sm:px-6 py-2 rounded-full mb-4 sm:mb-6 border border-purple-500/30">
            <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            <span className="text-purple-300 font-bold text-xs sm:text-sm">آراء حقيقية</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4 leading-tight">
            💬 ماذا يقول عملاؤنا
          </h2>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            تقييمات حقيقية من عملاء راضين عن منتجاتنا وخدماتنا
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {reviews.slice(0, 6).map((review, index) => (
            <Card
              key={review.id}
              className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/70 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 animate-fade-in"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'backwards'
              }}
            >
              <CardContent className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                {/* Quote Icon */}
                <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400/30" />

                {/* Rating Stars */}
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Review Comment */}
                <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed line-clamp-3 sm:line-clamp-4">
                  "{review.comment}"
                </p>

                {/* Product Info */}
                <div className="pt-3 sm:pt-4 border-t border-gray-700/50">
                  <p className="text-teal-400 text-xs sm:text-sm font-medium mb-2">
                    {review.product.nameAr}
                  </p>
                  
                  {/* User Info */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                      {review.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium text-xs sm:text-sm truncate">{review.user.name}</p>
                      <p className="text-gray-500 text-[10px] sm:text-xs truncate" suppressHydrationWarning>
                        {new Date(review.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verified Badge */}
                <div className="flex items-center gap-1 text-green-400 text-[10px] sm:text-xs">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500/20 flex items-center justify-center text-[10px]">
                    ✓
                  </div>
                  <span>عميل موثق</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Stats */}
        <div className="mt-8 sm:mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div className="space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-purple-400">
              {reviews.length}+
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">تقييم إيجابي</p>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-yellow-400">
              4.8
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">متوسط التقييم</p>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-green-400">
              98%
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">رضا العملاء</p>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-teal-400">
              15K+
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">طلب ناجح</p>
          </div>
        </div>
      </div>
    </section>
  );
}
