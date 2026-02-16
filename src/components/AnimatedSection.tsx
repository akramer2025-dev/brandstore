"use client";

import { ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  animation?: 'fadeInUp' | 'fadeInDown' | 'scaleIn' | 'slideInRight';
  delay?: number;
  className?: string;
}

export function AnimatedSection({ 
  children, 
  animation = 'fadeInUp', 
  delay = 0,
  className = '' 
}: AnimatedSectionProps) {
  // ⚡ الأنيميشن معطل تماماً لتحسين الأداء وسرعة التحميل
  // عرض المحتوى مباشرة بدون أي تأخير أو انتظار
  return <div className={className}>{children}</div>;
}
