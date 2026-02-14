'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Award, Factory } from 'lucide-react';

interface SliderImageData {
  id: string;
  titleAr: string;
  subtitleAr: string | null;
  imageUrl: string;
  link: string | null;
  buttonTextAr: string | null;
  order: number;
  isActive: boolean;
}

export default function HeroSliderClient({ slides }: { slides: SliderImageData[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Debug: Log slider state
  useEffect(() => {
    console.log('🎬 Slider Auto-Play:', isAutoPlaying, '| Current Slide:', currentSlide, '| Total Slides:', slides.length);
  }, [currentSlide, isAutoPlaying, slides.length]);

  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = (prev + 1) % slides.length;
        console.log('🔄 Auto-switching to slide:', nextSlide);
        return nextSlide;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  if (slides.length === 0) {
    // عرض placeholder إذا لم توجد صور
    return (
      <div className="relative w-full h-[240px] sm:h-[320px] md:h-[380px] lg:h-[440px] overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">مرحباً بك في ريمو ستور</h2>
            <p className="text-lg md:text-xl mb-6">أفضل المنتجات بأفضل الأسعار</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all"
            >
              <span>تسوق الآن</span>
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[240px] sm:h-[320px] md:h-[380px] lg:h-[440px] overflow-hidden group">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide
              ? 'opacity-100 translate-x-0'
              : index < currentSlide
              ? 'opacity-0 -translate-x-full'
              : 'opacity-0 translate-x-full'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={slide.imageUrl}
              alt={slide.titleAr}
              fill
              sizes="100vw"
              className="object-cover brightness-90"
              priority={index === 0}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/50 to-transparent"></div>
            
            {/* Logo Watermark - Professional Branding */}
            <div className="absolute top-4 md:top-6 left-4 md:left-8 z-20 animate-fade-in">
              <div className="relative w-16 h-16 md:w-24 md:h-24 lg:w-28 lg:h-28 hover:scale-110 transition-all duration-300">
                <Image
                  src="/logo.png"
                  alt="ريمو ستور"
                  fill
                  sizes="(max-width: 768px) 64px, (max-width: 1024px) 96px, 112px"
                  className="object-contain drop-shadow-2xl"
                  priority={index === 0}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-3 md:px-8">
              <div className="max-w-xl md:max-w-2xl">
                {/* Category Badge with Logo */}
                <div className="inline-flex items-center gap-1 md:gap-2 bg-white/20 backdrop-blur-md text-white px-2 py-1 md:px-4 md:py-2 rounded-full mb-1.5 md:mb-3 animate-fade-in-down border border-white/30">
                  <div className="relative w-3.5 h-3.5 md:w-5 md:h-5 flex-shrink-0">
                    <Image
                      src="/logo.png"
                      alt="SP"
                      fill
                      sizes="(max-width: 768px) 14px, 20px"
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[10px] md:text-sm font-semibold">من مصانع ريمو ستور</span>
                </div>

                {/* Title */}
                <h1 className="text-base sm:text-xl md:text-4xl lg:text-5xl font-bold text-white mb-1.5 md:mb-3 animate-fade-in-up leading-tight drop-shadow-2xl">
                  {slide.titleAr}
                </h1>

                {/* Subtitle */}
                {slide.subtitleAr && (
                  <p className="text-xs sm:text-sm md:text-lg lg:text-xl text-gray-100 mb-2 md:mb-5 animate-fade-in-up animation-delay-200 drop-shadow-lg line-clamp-1 md:line-clamp-none">
                    {slide.subtitleAr}
                  </p>
                )}

                {/* Made in Egypt Badge */}
                <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-5 animate-fade-in-up animation-delay-300">
                  <div className="bg-white/95 backdrop-blur-sm px-2 py-1 md:px-4 md:py-2 rounded-lg shadow-lg">
                    <p className="text-[9px] sm:text-xs md:text-sm font-semibold text-gray-800">
                      🏭 صناعة محلية بجودة عالمية
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-2 py-1 md:px-4 md:py-2 rounded-lg shadow-lg">
                    <p className="text-[9px] sm:text-xs md:text-sm font-bold text-white">
                      ✅ ضمان الجودة
                    </p>
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href={slide.link || '/products'}
                  className="inline-flex items-center gap-1.5 md:gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 py-1.5 sm:px-4 sm:py-2.5 md:px-7 md:py-3.5 rounded-lg md:rounded-xl text-xs sm:text-sm md:text-base font-bold shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-400"
                >
                  <span>{slide.buttonTextAr || 'تسوق الآن'}</span>
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-bounce-x" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md p-3 md:p-4 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 z-30"
        aria-label="Previous slide"
      >
        <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md p-3 md:p-4 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 z-30"
        aria-label="Next slide"
      >
        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white" />
      </button>

      {/* Single Wave Only - موجة واحدة فقط بدون مساحة مستقيمة */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none overflow-hidden" style={{ height: '60px' }}>
        <svg
          className="absolute bottom-0 w-full"
          style={{ height: '60px' }}
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,60 L0,30 Q240,10 480,30 T960,30 Q1200,10 1440,30 L1440,60 Z"
            fill="rgb(255, 255, 255)"
          />
        </svg>
      </div>
    </div>
  );
}
