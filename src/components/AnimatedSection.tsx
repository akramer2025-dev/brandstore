"use client";

import { useEffect, useRef, useState, ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  animation?: 'fadeInUp' | 'fadeInDown' | 'scaleIn' | 'slideInRight';
  delay?: number;
  className?: string;
}

// دالة للتحقق من الجهاز (للأجهزة الضعيفة نعطل الأنيميشن)
const isLowEndDevice = () => {
  if (typeof window === 'undefined') return false;
  
  // التحقق من عدد cores
  const cores = navigator.hardwareConcurrency || 2;
  
  // التحقق من memory (إذا متاح)
  const memory = (navigator as any).deviceMemory;
  
  // جهاز ضعيف إذا: cores أقل من 4 أو memory أقل من 4GB
  return cores < 4 || (memory && memory < 4);
};

export function AnimatedSection({ 
  children, 
  animation = 'fadeInUp', 
  delay = 0,
  className = '' 
}: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // تعطيل الأنيميشن على الأجهزة الضعيفة
    if (isLowEndDevice()) {
      setShouldAnimate(false);
      setIsVisible(true); // أظهر المحتوى مباشرة
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // إذا كان جهاز ضعيف، أظهر المحتوى مباشرة بدون أنيميشن
  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={sectionRef}
      className={`transition-all duration-700 ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : animation === 'fadeInUp' 
            ? 'opacity-0 translate-y-8'
            : animation === 'fadeInDown'
            ? 'opacity-0 -translate-y-8'
            : animation === 'scaleIn'
            ? 'opacity-0 scale-90'
            : animation === 'slideInRight'
            ? 'opacity-0 -translate-x-8'
            : 'opacity-0'
      } ${className}`}
      style={{
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}
