'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  nameAr: string;
  price: number;
  images: string | null;
  stock: number;
  category: {
    nameAr: string;
  };
}

interface ProductsSliderProps {
  products: Product[];
  direction?: 'rtl' | 'ltr';
}

export function ProductsSlider({ products, direction = 'rtl' }: ProductsSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
    sliderRef.current.style.cursor = 'grabbing';
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
    }
  };

  // Handle mouse move - optimized
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    requestAnimationFrame(() => {
      if (sliderRef.current) {
        sliderRef.current.scrollLeft = scrollLeft - walk;
      }
    });
  };

  // Scroll buttons
  const scrollTo = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = 340;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative group/slider">
      {/* Navigation Buttons */}
      <button 
        onClick={() => scrollTo('right')}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-orange-500/90 hover:bg-orange-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={() => scrollTo('left')}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-orange-500/90 hover:bg-orange-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div
        ref={sliderRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide cursor-grab select-none pb-4"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{
          scrollBehavior: isDragging ? 'auto' : 'smooth',
        }}
      >
        {products.map((product, index) => {
          const firstImage = product.images 
            ? product.images.split(',')[0]?.trim() 
            : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500';
          
          return (
          <Link href={`/products/${product.id}`} key={`${direction}-${product.id}-${index}`} className="flex-shrink-0 w-72 sm:w-80">
            <Card className="border-2 border-orange-500/50 shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 overflow-hidden group hover:-translate-y-2 bg-white">
              <div className="relative h-64 sm:h-72 overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4 sm:p-6">
                <div className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                  <Image
                    src={firstImage}
                    alt={product.nameAr}
                    fill
                    sizes="224px"
                    className="object-cover group-hover:scale-110 transition-transform duration-700 pointer-events-none"
                    draggable={false}
                  />
                </div>
                <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  {product.category.nameAr}
                </div>
                <div className="absolute bottom-3 left-3 w-14 h-14 bg-white/98 backdrop-blur-md shadow-2xl animate-glow-rotate overflow-hidden" style={{ clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)' }}>
                  <img 
                    src="/logo.png" 
                    alt="BS Brand Store" 
                    className="w-full h-full scale-150 -translate-y-1.5 object-contain"
                  />
                </div>
                {product.stock > 0 && product.stock <= 10 && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                    كمية محدودة
                  </div>
                )}
                {product.stock > 50 && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    متوفر
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <CardContent className="p-4 sm:p-5">
                <h3 className="font-bold text-base sm:text-lg mb-2 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-fuchsia-600 group-hover:bg-clip-text group-hover:text-transparent transition-colors line-clamp-1">
                  {product.nameAr}
                </h3>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                    {product.price.toFixed(0)} ج.م
                  </span>
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 shadow-lg pointer-events-auto text-xs sm:text-sm">
                    <ShoppingBag className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        )})}
      </div>

      {/* Scroll Hint */}
      <div className="text-center mt-4 text-xs sm:text-sm text-gray-500">
        <span className="hidden sm:inline">اسحب للتصفح أو استخدم الأسهم</span>
        <span className="sm:hidden">اسحب للتصفح ←→</span>
      </div>
    </div>
  );
}
