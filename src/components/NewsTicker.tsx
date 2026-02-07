'use client';

import { Megaphone, Sparkles, Tag, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

const newsItems = [
  {
    id: 1,
    text: '🎉 عروض خاصة على جميع المنتجات - خصم يصل إلى 50%',
    icon: Tag,
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    id: 2,
    text: '✨ منتجات جديدة وصلت للتو - تسوق الآن واحصل على أفضل الأسعار',
    icon: Sparkles,
    gradient: 'from-purple-500 to-indigo-500'
  },
  {
    id: 3,
    text: '🚀 شحن مجاني على جميع الطلبات فوق 500 جنيه',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 4,
    text: '⚡ عروض الفلاش - لا تفوت الفرصة! محدودة المدة',
    icon: Megaphone,
    gradient: 'from-orange-500 to-red-500'
  },
];

export default function NewsTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    }, 5000); // تغيير كل 5 ثوانٍ

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const currentItem = newsItems[currentIndex];
  const Icon = currentItem.icon;

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-gray-900 via-teal-900 to-gray-900 border-b-2 border-teal-500/30 shadow-lg">
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      
      <div className="relative container mx-auto px-4">
        <div className="flex items-center justify-between py-2 md:py-3">
          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white transition-colors p-1 md:p-2 z-10 group"
            aria-label="إغلاق"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* News Content */}
          <div className="flex-1 flex items-center justify-center gap-2 md:gap-4 px-2 md:px-4">
            {/* Icon with Gradient */}
            <div className={`p-2 md:p-2.5 rounded-lg bg-gradient-to-br ${currentItem.gradient} shadow-lg animate-bounce-subtle`}>
              <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>

            {/* Text with Animation */}
            <div className="flex-1 overflow-hidden">
              <p 
                key={currentIndex}
                className="text-xs md:text-base font-bold text-white text-center animate-slide-in whitespace-normal md:whitespace-nowrap"
              >
                {currentItem.text}
              </p>
            </div>

            {/* Indicator Dots */}
            <div className="hidden md:flex items-center gap-1.5">
              {newsItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex 
                      ? 'w-6 h-2 bg-gradient-to-r from-teal-400 to-cyan-400' 
                      : 'w-2 h-2 bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label={`الانتقال إلى الإعلان ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Placeholder for symmetry */}
          <div className="w-6 md:w-9" />
        </div>
      </div>

      {/* Bottom Glow Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/50 to-transparent" />
    </div>
  );
}
