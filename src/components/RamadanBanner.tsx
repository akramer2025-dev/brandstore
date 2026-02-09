'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RamadanBanner() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('ramadanBannerDismissed');
    if (dismissed) setIsVisible(false);
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('ramadanBannerDismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-[#1a0a2e] via-[#16213e] to-[#1a0a2e] overflow-hidden">
      {/* نجوم خلفية */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {[...Array(20)].map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-yellow-200"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.3,
              animation: `starTwinkle ${Math.random() * 2 + 1}s ease-in-out ${Math.random() * 2}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* المحتوى */}
      <div className="container mx-auto px-4 py-3 sm:py-4 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-center">
          
          {/* فانوس يسار */}
          <div className="hidden md:block text-3xl lg:text-4xl animate-bounce" style={{ animationDuration: '2s' }}>
            🏮
          </div>

          {/* النص الرئيسي */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl md:text-3xl">🌙</span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 drop-shadow-lg" style={{ textShadow: '0 0 20px rgba(255,200,0,0.3)' }}>
                رمضان كريم
              </h2>
              <span className="text-xl sm:text-2xl md:text-3xl">🌙</span>
            </div>
            <p className="text-amber-200/80 text-xs sm:text-sm font-medium">
              ✨ كل عام وأنتم بخير • عروض رمضان الحصرية ✨
            </p>
          </div>

          {/* فانوس يمين */}
          <div className="hidden md:block text-3xl lg:text-4xl animate-bounce" style={{ animationDuration: '2.5s' }}>
            🏮
          </div>

          {/* زر الإغلاق */}
          <button
            onClick={dismiss}
            className="absolute top-2 left-2 text-amber-300/50 hover:text-amber-200 transition-colors text-base sm:text-lg leading-none"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>
      </div>

      {/* زخرفة سفلية */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"></div>
    </div>
  );
}
