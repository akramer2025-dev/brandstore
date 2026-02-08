'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SplashPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    console.log('🎬 Splash page loaded');
    
    // تشغيل الفيديو والانتقال للصفحة الرئيسية بعد 4 ثواني
    const timer = setTimeout(() => {
      console.log('⏰ 4 seconds passed, redirecting...');
      // حفظ انه شاهد الفيديو الترحيبي
      localStorage.setItem('splashViewed', 'true');
      router.push('/');
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* الفيديو الترحيبي */}
      <div className="relative w-full h-full">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
          preload="auto"
          onPlay={() => {
            setVideoPlaying(true);
            console.log('▶️ Video started playing');
          }}
          onError={(e) => {
            console.error('❌ Video error:', e);
          }}
          onLoadStart={() => console.log('⏳ Video loading started')}
          onLoadedData={() => console.log('✅ Video loaded successfully')}
        >
          <source src="/vid.mp4" type="video/mp4" />
        </video>
        
        {/* شعار مؤقت في حال عدم تشغيل الفيديو */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center">
          <div className="text-center">
            {/* اللوجو */}
            <div className="relative w-32 h-32 mx-auto mb-6 animate-pulse">
              <Image
                src="/logo.png"
                alt="Remo Store"
                fill
                sizes="128px"
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
            
            {/* النص الترحيبي */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in-up">
              مرحباً بك في{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ريمو ستور
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 animate-fade-in-up animation-delay-500">
              أجود المنتجات - أفضل الأسعار - خدمة متميزة
            </p>
            
            {/* شريط التحميل */}
            <div className="mt-8 w-64 mx-auto">
              <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-4000 ease-linear"
                  style={{ 
                    animation: 'progress 4s ease-linear forwards'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* أزرار تحكم للاختبار */}
      <div className="absolute bottom-6 left-6 flex gap-2">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="text-white/60 hover:text-white text-xs bg-black/30 hover:bg-black/50 px-3 py-1.5 rounded-full transition-all duration-300 backdrop-blur-sm"
        >
          🗑️ مسح البيانات
        </button>
        
        <button
          onClick={() => {
            console.log('localStorage.splashViewed:', localStorage.getItem('splashViewed'));
            console.log('Current URL:', window.location.href);
          }}
          className="text-white/60 hover:text-white text-xs bg-black/30 hover:bg-black/50 px-3 py-1.5 rounded-full transition-all duration-300 backdrop-blur-sm"
        >
          🔍 فحص البيانات
        </button>
      </div>

      {/* زر تخطي اختياري */}
      <button
        onClick={() => {
          localStorage.setItem('splashViewed', 'true');
          router.push('/');
        }}
        className="absolute top-6 right-6 text-white/80 hover:text-white text-sm font-medium bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full transition-all duration-300 backdrop-blur-sm"
      >
        تخطي ⏩
      </button>

      {/* Custom CSS للأنيميشن */}
      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        
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
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
        
        .animation-delay-500 {
          animation-delay: 0.5s;
          opacity: 0;
        }
        
        .duration-4000 {
          transition-duration: 4s;
        }
      `}</style>
    </div>
  );
}