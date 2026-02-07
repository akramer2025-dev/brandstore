"use client";

import { ProductCardPro } from '@/components/ProductCardPro';
import { TrendingUp, Trophy, Flame } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  nameAr: string;
  descriptionAr?: string | null;
  price: number;
  originalPrice?: number | null;
  stock: number;
  images: string | null;
  badge?: string | null;
  soldCount?: number;
  reviews?: { rating: number }[];
  category?: {
    id: string;
    nameAr: string;
  };
}

interface BestSellersSectionProps {
  products: Product[];
}

export function BestSellersSection({ products }: BestSellersSectionProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-6 md:py-10 bg-gradient-to-b from-gray-900/80 via-orange-900/10 to-gray-900/80 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent"></div>
      <div className="absolute top-10 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-6 py-2 rounded-full mb-4 border border-orange-500/30">
            <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
            <span className="text-orange-300 font-bold text-sm">الأكثر طلباً</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            🔥 المنتجات الأكثر مبيعاً
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            اكتشف المنتجات المفضلة لدى عملائنا - جودة مضمونة وتقييمات عالية
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-in"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'backwards'
              }}
            >
              <ProductCardPro product={product} index={index} />
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10 md:mt-14">
          <Link 
            href="/products?sort=best-seller" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 text-white px-8 py-4 md:px-12 md:py-5 rounded-full font-bold hover:shadow-2xl hover:shadow-orange-500/40 hover:scale-105 transition-all duration-300 text-base md:text-lg group"
          >
            <Trophy className="w-5 h-5" />
            <span>عرض جميع المنتجات الأكثر مبيعاً</span>
            <TrendingUp className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
