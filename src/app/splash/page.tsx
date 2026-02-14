'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SplashPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    setMounted(true);
    
    console.log('🎬 Splash page loaded');
    
    // تحديث شريط التقدم بشكل سلس
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 4; // يزيد 4% كل 100ms = 2.5 ثانية للوصول 100%
      });
    }, 100);
    
    // الانتقال للصفحة الرئيسية بعد 2.5 ثانية (سريع وخفيف)
    const timer = setTimeout(() => {
      console.log('⏰ 2.5 seconds passed, redirecting...');
      localStorage.setItem('splashViewed', 'true');
      router.push('/');
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [router]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center overflow-hidden">
      {/* خلفية متحركة خفيفة */}
      <div className="absolute inset-0">
        {/* دوائر متحركة خفيفة */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* المحتوى الرئيسي */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        {/* اللوجو مع أنيميشن */}
        <div className="relative w-40 h-40 mx-auto mb-8 animate-bounce-slow">
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl rounded-full border-4 border-white/40 shadow-2xl flex items-center justify-center p-6">
            <Image
              src="/logo.png"
              alt="Remo Store"
              width={140}
              height={140}
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
          {/* دوائر متوهجة حول اللوجو */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-xl animate-pulse"></div>
        </div>
        
        {/* النص الترحيبي */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl animate-fade-in-up">
            مرحباً بك! 🎉
          </h1>
          
          <p className="text-2xl md:text-3xl text-white/95 font-bold drop-shadow-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            أهلاً وسهلاً في{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              ريمو ستور
            </span>
          </p>
          
          <p className="text-xl md:text-2xl text-white/80 font-medium drop-shadow-lg animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            ✨ أفضل المنتجات بأرخص الأسعار ✨
          </p>
        </div>
        
        {/* نقاط التحميل المتحركة */}
        <div className="flex items-center justify-center gap-3 mt-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        {/* شريط التقدم */}
        <div className="mt-10 w-72 mx-auto">
          <div className="bg-white/20 backdrop-blur-sm rounded-full h-2.5 overflow-hidden shadow-lg border border-white/30">
            <div 
              className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 h-full rounded-full transition-all duration-100 ease-linear shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/70 text-sm mt-3 font-medium">{Math.round(progress)}%</p>
        </div>
      </div>
      
      {/* زر تخطي اختياري */}
      <button
        onClick={() => {
          localStorage.setItem('splashViewed', 'true');
          router.push('/');
        }}
        className="absolute top-6 right-6 text-white/90 hover:text-white text-sm font-bold bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-full transition-all duration-300 backdrop-blur-md border border-white/30 shadow-lg hover:scale-105"
      >
        تخطي ⏩
      </button>

      {/* Custom CSS للأنيميشن */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.05);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}