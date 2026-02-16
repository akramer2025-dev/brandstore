"use client";

import { useEffect, useRef, useState } from 'react';
import { ProductCardPro } from './ProductCardPro';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  nameAr: string | null;
  price: number;
  stock: number;
  images: string[];
  category: {
    id: string;
    nameAr: string;
  };
}

interface CategoryProductsCarouselProps {
  categoryId: string;
  categoryName: string;
  initialProducts?: Product[];
}

export function CategoryProductsCarousel({ 
  categoryId, 
  categoryName,
  initialProducts = []
}: CategoryProductsCarouselProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialProducts.length === 0) {
      fetchProducts();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products?categoryId=${categoryId}&limit=8`, {
        next: { revalidate: 60 } // Cache for 60 seconds
      });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="min-w-[160px] h-64 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="relative group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
          {categoryName}
        </h3>
        <Link 
          href={`/categories/${categoryId}`}
          className="text-sm text-purple-600 hover:text-purple-700 font-semibold hover:underline"
        >
          عرض الكل
        </Link>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 hidden sm:block"
          aria-label="التالي"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 hidden sm:block"
          aria-label="السابق"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>

        {/* Products Scroll */}
        <div 
          ref={scrollRef}
          className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {products.map((product, index) => (
            <div key={product.id} className="min-w-[160px] sm:min-w-[200px] md:min-w-[220px] flex-shrink-0">
              <ProductCardPro product={product} index={index} />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
