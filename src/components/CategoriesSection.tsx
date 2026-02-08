"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Grid, Package } from 'lucide-react';

interface Category {
  id: string;
  nameAr: string;
  image: string | null;
  _count?: {
    products: number;
  };
}

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section className="py-4 md:py-5 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 border-b border-purple-500/50 shadow-lg shadow-purple-500/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-purple-300" />
            <h2 className="text-lg md:text-xl font-bold text-white">تسوق حسب الفئة</h2>
          </div>
          <Link 
            href="/products" 
            className="text-purple-300 font-medium hover:text-purple-200 flex items-center gap-1 text-sm transition-colors"
          >
            <span>عرض الكل</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Horizontal Scrollable Categories */}
        <div className="relative">
          {/* Scroll Container */}
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {categories.map((category, index) => {
              const productCount = category._count?.products || 0;
              return (
                <Link 
                  key={category.id} 
                  href={`/products?category=${category.id}`}
                  className="group flex-shrink-0 snap-start"
                >
                  <div className="w-20 md:w-24 lg:w-28">
                    {/* Category Image */}
                    <div className="relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 mb-2 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/80 to-purple-700/50 border-2 border-purple-600/50 group-hover:border-purple-400/70 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-purple-400/30">
                      {/* Badge */}
                      {index === 0 && productCount > 0 && (
                        <div className="absolute top-1 right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold z-10 shadow-md shadow-purple-500/50">
                          🔥
                        </div>
                      )}
                      <Image
                        src={category.image || '/placeholder-category.png'}
                        alt={category.nameAr}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 80px, (max-width: 1024px) 96px, 112px"
                      />
                    </div>
                    
                    {/* Category Name */}
                    <h3 className="text-white font-bold text-xs md:text-sm text-center mb-1 line-clamp-2 group-hover:text-purple-300 transition-colors">
                      {category.nameAr}
                    </h3>
                    
                    {/* Product Count */}
                    {productCount > 0 && (
                      <p className="text-gray-400 text-[10px] md:text-xs text-center">
                        {productCount} منتج
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-full bg-gradient-to-l from-transparent to-purple-900/50 pointer-events-none md:hidden"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-full bg-gradient-to-r from-transparent to-purple-900/50 pointer-events-none md:hidden"></div>
        </div>

        {/* Scroll Hint */}
        <div className="text-center mt-3">
          <p className="text-gray-500 text-xs">
            ← اسحب لرؤية المزيد →
          </p>
        </div>
      </div>
    </section>
  );
}
