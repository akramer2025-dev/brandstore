"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 animate-fade-out" style={{ animationDelay: '2.5s', animationFillMode: 'forwards' }}>
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Logo Container */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Hexagon Logo with Advanced Animation */}
        <div className="relative">
          {/* Rotating Rings */}
          <div className="absolute inset-0 w-40 h-40 md:w-52 md:h-52">
            <div className="absolute inset-0 border-4 border-cyan-400/30 rounded-full animate-spin-slow"></div>
            <div className="absolute inset-4 border-4 border-purple-400/30 rounded-full animate-spin-reverse"></div>
            <div className="absolute inset-8 border-4 border-blue-400/30 rounded-full animate-spin-slow"></div>
          </div>

          {/* Main Logo */}
          <div 
            className="relative w-40 h-40 md:w-52 md:h-52 bg-white/95 backdrop-blur-md shadow-2xl animate-logo-splash overflow-hidden" 
            style={{ clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-transparent to-purple-400/20 animate-pulse"></div>
            <img 
              src="/logo.png" 
              alt="BS Brand Store" 
              className="w-full h-full scale-150 -translate-y-3 object-contain"
            />
          </div>

          {/* Sparkles */}
          <div className="absolute -top-2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
          <div className="absolute top-1/4 -right-2 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
          <div className="absolute bottom-1/4 -left-2 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
          <div className="absolute -bottom-2 left-1/4 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>
        </div>

        {/* Brand Text */}
        <div className="text-center space-y-2 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            براند ستور
          </h1>
          <p className="text-gray-300 text-lg md:text-xl animate-fade-in" style={{ animationDelay: '1s' }}>
            متجرك الإلكتروني الأول
          </p>
        </div>

        {/* Loading Bar */}
        <div className="w-64 h-1.5 bg-gray-700/50 rounded-full overflow-hidden animate-fade-in" style={{ animationDelay: '1.5s' }}>
          <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-loading-bar rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
