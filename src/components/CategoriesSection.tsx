"use client";

import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp } from 'lucide-react';

interface Category {
  id: string;
  nameAr: string;
  image: string | null;
}

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section className="py-12 bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-100">تسوق حسب الفئة</h2>
          <Link href="/products" className="text-cyan-400 font-semibold hover:text-cyan-300 flex items-center gap-1 md:gap-2 text-sm md:text-base">
            <span className="hidden sm:inline">عرض الكل</span>
            <span className="sm:hidden">الكل</span>
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {categories.map((category) => {
            return (
              <Link 
                key={category.id} 
                href={`/products?category=${category.id}`}
                className="group"
              >
                <div className="bg-gradient-to-br from-gray-800/50 to-teal-900/30 rounded-xl md:rounded-2xl p-3 md:p-4 text-center hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-2 border-2 border-gray-700 hover:border-cyan-500 backdrop-blur-sm overflow-hidden animate-card-float">
                  <div className="relative w-full aspect-square mb-3 rounded-xl overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                    <Image
                      src={category.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400'}
                      alt={category.nameAr}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                  </div>
                  <h3 className="font-bold text-sm md:text-base text-gray-200 group-hover:text-cyan-400 transition-colors">
                    {category.nameAr}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
