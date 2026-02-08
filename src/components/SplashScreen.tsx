"use client";

import { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // إخفاء الـ splash screen بعد 3 ثواني
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 animate-fade-in">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        {/* Logo */}
        <div className="mb-8 animate-bounce">
          <div className="w-40 h-40 mx-auto bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30 p-4">
            <Image 
              src="/logo.png" 
              alt="ريمو ستور" 
              width={120}
              height={120}
              className="object-contain animate-pulse drop-shadow-2xl"
              priority
            />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-4 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl animate-scale-in">
            مرحباً بك! 🎉
          </h1>
          <p className="text-2xl md:text-3xl text-white/90 font-bold drop-shadow-lg animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            أهلاً وسهلاً في ريمو ستور 
          </p>
          <p className="text-xl md:text-2xl text-white/80 drop-shadow-lg animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            🛍️ أفضل المنتجات بأرخص الأسعار! ✨
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex items-center justify-center gap-3 mt-12 animate-fade-in" style={{animationDelay: '0.9s'}}>
          <div className="w-4 h-4 bg-white rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/20">
        <div 
          className="h-full bg-white"
          style={{
            animation: 'progress 3s linear forwards'
          }}
        />
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
