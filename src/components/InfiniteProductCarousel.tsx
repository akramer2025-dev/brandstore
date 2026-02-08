'use client';

import { useState, useEffect, useRef } from 'react';
import { ProductCardPro } from './ProductCardPro';
import { Sparkles } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  images: string[];
  category: {
    id: string;
    name: string;
    nameAr: string;
  } | null;
  rating?: number;
  reviewCount?: number;
}

interface InfiniteProductCarouselProps {
  products: Product[];
  speed?: number;
}

export function InfiniteProductCarousel({ 
  products, 
  speed = 80 // pixels per second - سرعة أعلى للحركة الواضحة
}: InfiniteProductCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());

  // مضاعفة المنتجات 5 مرات للـ infinite loop سلس أكثر
  const duplicatedProducts = [...products, ...products, ...products, ...products, ...products];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || products.length === 0) return;

    lastTimeRef.current = Date.now();

    const animate = () => {
      if (!isPaused && scrollContainer) {
        const now = Date.now();
        const deltaTime = (now - lastTimeRef.current) / 1000; // Convert to seconds
        lastTimeRef.current = now;

        const distance = speed * deltaTime;
        scrollContainer.scrollLeft += distance;

        // حساب نقطة إعادة التعيين للـ infinite loop (بما أننا ضاعفنا 5 مرات)
        const maxScroll = scrollContainer.scrollWidth / 5;
        
        if (scrollContainer.scrollLeft >= maxScroll) {
          scrollContainer.scrollLeft = 0;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, speed, products.length]);

  if (products.length === 0) return null;

  return (
    <section className="py-8 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 overflow-hidden relative">
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 via-transparent to-orange-100/20 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              منتجات مميزة
            </h2>
            <Sparkles className="w-6 h-6 text-orange-600 animate-pulse" />
          </div>
        </div>

        {/* Infinite Scroll Container */}
        <div 
          ref={scrollRef}
          className="overflow-x-hidden scroll-smooth cursor-grab active:cursor-grabbing"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div className="flex gap-4" style={{ width: 'fit-content' }}>
            {duplicatedProducts.map((product, index) => (
              <div 
                key={`${product.id}-${index}`}
                className="flex-shrink-0 transform transition-transform duration-300 hover:scale-105"
                style={{ 
                  width: '280px',
                  minWidth: '280px'
                }}
              >
                <ProductCardPro product={product} index={0} />
              </div>
            ))}
          </div>
        </div>

        {/* Hint Text */}
        <p className="text-center text-sm text-gray-500 mt-4 animate-pulse">
          🖱️ حوم على المنتج لإيقاف الحركة
        </p>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
