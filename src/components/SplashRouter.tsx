'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashRouter() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  
  useEffect(() => {
    // انتظر قليلاً للتأكد من تحميل DOM
    const checkTimer = setTimeout(() => {
      // التحقق من إذا كان المستخدم شاهد الفيديو الترحيبي قبل كده
      const splashViewed = localStorage.getItem('splashViewed');
      
      console.log('🔍 SplashRouter checking...');
      console.log('📋 splashViewed:', splashViewed);
      console.log('📍 Current path:', window.location.pathname);
      
      if (!splashViewed && window.location.pathname !== '/splash') {
        console.log('➡️ Redirecting to /splash');
        router.push('/splash');
      } else if (splashViewed) {
        console.log('✅ Splash already viewed, staying on current page');
      }
      
      setChecking(false);
    }, 100);

    return () => clearTimeout(checkTimer);
  }, [router]);

  // عرض شاشة تحميل صغيرة أثناء الفحص
  if (checking) {
    return (
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse z-50"></div>
    );
  }

  return null;
}