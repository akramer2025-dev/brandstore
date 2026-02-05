'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Star } from 'lucide-react';

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

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  // Auto scroll effect (optional - can be enabled/disabled)
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || isDragging) return;

    const autoScroll = () => {
      if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth) {
        slider.scrollLeft = 0;
      } else {
        slider.scrollLeft += 1;
      }
    };

    const interval = setInterval(autoScroll, 30);
    return () => clearInterval(interval);
  }, [isDragging]);

  return (
    <div className="relative">
      <div
        ref={sliderRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide cursor-grab select-none"
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
          <div key={`${direction}-${product.id}-${index}`} className="flex-shrink-0 w-80">
            <Card className="border-2 animate-border-glow shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-500 overflow-hidden group hover:-translate-y-2 bg-white">
              <div className="relative h-72 overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-6">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
              <CardContent className="p-5">
                <h3 className="font-bold text-lg mb-2 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-fuchsia-600 group-hover:bg-clip-text group-hover:text-transparent transition-all line-clamp-1">
                  {product.nameAr}
                </h3>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                    {product.price.toFixed(0)} ج.م
                  </span>
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 shadow-lg pointer-events-auto">
                    <ShoppingBag className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )})}
      </div>

      {/* Scroll Hint */}
      <div className="text-center mt-4 text-sm text-gray-500">
        اسحب للتصفح أو استخدم عجلة الماوس ← →
      </div>
    </div>
  );
}
