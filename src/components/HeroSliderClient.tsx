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

  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
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
    return null;
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden group">
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
            
            {/* Brand Logo Watermark - Top Left */}
            <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
              <div className="bg-white/95 backdrop-blur-md px-4 py-2 md:px-6 md:py-3 rounded-xl shadow-2xl border-2 border-teal-500/30 hover:scale-105 transition-transform">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 md:w-14 md:h-14 flex-shrink-0">
                    <Image
                      src="/logo.png?v=2026"
                      alt="Brand Store Logo"
                      fill
                      sizes="(max-width: 768px) 40px, 56px"
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900">براند ستور</h3>
                    <p className="text-xs md:text-sm text-gray-600">Brand Store</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Badge - Top Right */}
            <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 md:p-4 rounded-full shadow-2xl animate-pulse">
                <Award className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-full shadow-lg">
                <p className="text-xs font-bold text-orange-600 whitespace-nowrap">صُنع في مصر</p>
              </div>
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/50 to-transparent"></div>
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4 md:px-8">
              <div className="max-w-xl md:max-w-2xl">
                {/* Category Badge with Logo */}
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full mb-4 animate-fade-in-down border border-white/30">
                  <div className="relative w-5 h-5 flex-shrink-0">
                    <Image
                      src="/logo.png?v=2026"
                      alt="SP"
                      fill
                      sizes="20px"
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm md:text-base font-semibold">من مصانع براند ستور</span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 animate-fade-in-up leading-tight drop-shadow-2xl">
                  {slide.titleAr}
                </h1>

                {/* Subtitle */}
                {slide.subtitleAr && (
                  <p className="text-lg md:text-xl lg:text-2xl text-gray-100 mb-6 animate-fade-in-up animation-delay-200 drop-shadow-lg">
                    {slide.subtitleAr}
                  </p>
                )}

                {/* Made in Egypt Badge */}
                <div className="flex flex-wrap gap-3 mb-6 animate-fade-in-up animation-delay-300">
                  <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                    <p className="text-sm md:text-base font-semibold text-gray-800">
                      🏭 صناعة محلية بجودة عالمية
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-lg shadow-lg">
                    <p className="text-sm md:text-base font-bold text-white">
                      ✅ ضمان الجودة
                    </p>
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href={slide.link || '/products'}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8 py-4 rounded-xl text-base md:text-lg font-bold shadow-2xl hover:shadow-teal-500/50 transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-400"
                >
                  <span>{slide.buttonTextAr || 'تسوق الآن'}</span>
                  <ChevronLeft className="w-5 h-5 animate-bounce-x" />
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

      {/* Dots */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-12 md:w-16 h-3 md:h-4 bg-gradient-to-r from-teal-500 to-cyan-500'
                : 'w-3 md:w-4 h-3 md:h-4 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="bg-white/20 backdrop-blur-md px-3 py-1 md:px-4 md:py-2 rounded-full text-white text-xs md:text-sm hover:bg-white/30 transition-all"
        >
          {isAutoPlaying ? '⏸️ إيقاف' : '▶️ تشغيل'}
        </button>
      </div>
    </div>
  );
}
