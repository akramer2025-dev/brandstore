"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export function LogoBanner() {
  return (
    <div className="bg-gradient-to-r from-gray-900 via-teal-900/30 to-gray-900 border-b border-teal-500/20">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <Link href="/" className="flex items-center justify-center gap-4 group">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 transition-all duration-300 group-hover:scale-110 animate-logo-entrance overflow-visible">
            <img 
              src="/logo.png" 
              alt="BS Brand Store Logo" 
              className="w-full h-full object-contain drop-shadow-2xl transition-all duration-300 group-hover:rotate-6"
            />
            <div className="absolute -top-2 -right-2 animate-bounce">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
            </div>
          </div>
          <div className="text-center sm:text-right">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-1 sm:mb-2">
              BS Brand Store
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-400">
              أفضل العلامات التجارية بأسعار مميزة
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
