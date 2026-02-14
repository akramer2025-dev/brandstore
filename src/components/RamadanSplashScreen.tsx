'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Sparkles, Moon } from 'lucide-react'

export function RamadanSplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  // Generate random positions once on client side
  const [starPositions, setStarPositions] = useState<Array<{left: number, top: number, duration: number, delay: number}>>([])
  const [sparklePositions, setSparklePositions] = useState<Array<{x: number, y: number, delay: number}>>([])

  useEffect(() => {
    // Mark as mounted to prevent hydration mismatch
    setIsMounted(true)
    
    // Generate positions on client only - تقليل العدد لتحسين الأداء
    setStarPositions(
      Array.from({ length: 20 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
      }))
    )
    
    setSparklePositions(
      Array.from({ length: 8 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: 1 + Math.random()
      }))
    )

    // التحقق من عرض Splash Screen من قبل
    const hasSeenSplash = sessionStorage.getItem('hasSeenRamadanSplash')
    
    if (hasSeenSplash) {
      setIsVisible(false)
      return
    }

    // تحديث progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 50) // زيادة الوقت لكل خطوة

    // إخفاء بعد 5 ثواني
    const timer = setTimeout(() => {
      setIsVisible(false)
      sessionStorage.setItem('hasSeenRamadanSplash', 'true')
    }, 5000)

    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
    }
  }, [])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4a1c6b 0%, #2d1b4e 25%, #1a0f2e 50%, #0d0520 75%, #000000 100%)'
        }}
      >
        {/* النجوم المتحركة الثابتة */}
        {isMounted && (
          <div className="absolute inset-0 overflow-hidden">
            {starPositions.map((star, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0,
                  scale: 0,
                }}
                animate={{ 
                  opacity: 0.8,
                  scale: 1,
                }}
                transition={{
                  duration: 0.5,
                  delay: star.delay,
                }}
                className="absolute w-1 h-1 bg-yellow-200 rounded-full shadow-[0_0_4px_rgba(250,204,21,0.8)]"
                style={{
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                }}
              />
            ))}
          </div>
        )}

        {/* الهلال الكبير مع التوهج */}
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 1, type: 'spring', bounce: 0.5 }}
          className="absolute top-20 right-20 md:top-32 md:right-32"
        >
          <div className="relative">
            {/* توهج الهلال */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 blur-3xl bg-yellow-300 rounded-full"
            />
            
            {/* الهلال */}
            <svg width="80" height="80" viewBox="0 0 100 100" className="relative">
              <defs>
                <linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path
                d="M 50 10 A 40 40 0 1 0 50 90 A 30 30 0 1 1 50 10"
                fill="url(#moonGradient)"
                stroke="#FFF"
                strokeWidth="2"
              />
            </svg>

            {/* نجمة بجانب الهلال */}
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-2 -left-2"
            >
              <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
            </motion.div>
          </div>
        </motion.div>

        {/* فوانيس رمضان الكرتونية المصرية */}
        <div className="absolute top-0 left-0 right-0 flex justify-around px-4 md:px-10">
          {[
            { color1: '#FF1744', color2: '#C62828', shadowColor: '#FF1744', name: 'red' },
            { color1: '#00E5FF', color2: '#00ACC1', shadowColor: '#00E5FF', name: 'cyan' },
            { color1: '#FFD600', color2: '#F57C00', shadowColor: '#FFD600', name: 'yellow' },
            { color1: '#E040FB', color2: '#9C27B0', shadowColor: '#E040FB', name: 'purple' },
          ].map((lantern, i) => (
            <motion.div
              key={i}
              initial={{ y: -150, opacity: 0, rotate: -20 }}
              animate={{ 
                y: [0, 15, 0],
                opacity: 1,
                rotate: [-5, 5, -5],
              }}
              transition={{
                y: {
                  duration: 2.5 + i * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: 3 + i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                opacity: {
                  duration: 0.6,
                  delay: 0.3 + i * 0.15,
                }
              }}
              className="relative"
            >
              {/* الفانوس الكرتوني الاحترافي */}
              <svg width="80" height="110" viewBox="0 0 80 110" className="drop-shadow-2xl filter hover:scale-110 transition-transform">
                <defs>
                  {/* Gradient للجسم */}
                  <linearGradient id={`bodyGrad${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: lantern.color1, stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: lantern.color2, stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: lantern.color1, stopOpacity: 1 }} />
                  </linearGradient>
                  
                  {/* Gradient للضوء */}
                  <radialGradient id={`lightGrad${i}`} cx="50%" cy="50%">
                    <stop offset="0%" style={{ stopColor: '#FFF', stopOpacity: 0.9 }} />
                    <stop offset="50%" style={{ stopColor: lantern.color1, stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: lantern.color2, stopOpacity: 0 }} />
                  </radialGradient>
                  
                  {/* فلتر التوهج */}
                  <filter id={`megaGlow${i}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 8 0" result="glow"/>
                    <feMerge>
                      <feMergeNode in="glow"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  
                  {/* نمط الزخرفة الإسلامية */}
                  <pattern id={`pattern${i}`} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                    <circle cx="4" cy="4" r="1.5" fill="#FFF" opacity="0.3"/>
                  </pattern>
                </defs>
                
                {/* الحبل المتين */}
                <line x1="40" y1="0" x2="40" y2="15" stroke="#8B6F47" strokeWidth="3" strokeLinecap="round" />
                
                {/* حلقة التعليق الذهبية */}
                <circle cx="40" cy="12" r="5" fill="#FFD700" stroke="#B8860B" strokeWidth="2" />
                
                {/* القمة الزخرفية */}
                <g filter={`url(#megaGlow${i})`}>
                  <path d="M 40 15 L 25 22 L 28 25 L 52 25 L 55 22 Z" fill="#FFD700" stroke="#B8860B" strokeWidth="1.5"/>
                  <ellipse cx="40" cy="23" rx="13" ry="3" fill="#FFA500" opacity="0.6"/>
                </g>
                
                {/* الجسم الرئيسي المنتفخ (شكل بيضاوي كرتوني) */}
                <g filter={`url(#megaGlow${i})`}>
                  <ellipse cx="40" cy="55" rx="25" ry="30" fill={`url(#bodyGrad${i})`} stroke={lantern.color2} strokeWidth="2"/>
                  
                  {/* الزخرفة الإسلامية */}
                  <ellipse cx="40" cy="55" rx="23" ry="28" fill={`url(#pattern${i})`}/>
                  
                  {/* الإطار الزجاجي المضيء */}
                  <ellipse cx="40" cy="55" rx="18" ry="23" fill={`url(#lightGrad${i})`} opacity="0.8"/>
                  
                  {/* خطوط الزخرفة الأفقية */}
                  <line x1="18" y1="45" x2="62" y2="45" stroke="#FFF" strokeWidth="2" opacity="0.6" strokeLinecap="round"/>
                  <line x1="20" y1="55" x2="60" y2="55" stroke="#FFF" strokeWidth="2" opacity="0.6" strokeLinecap="round"/>
                  <line x1="18" y1="65" x2="62" y2="65" stroke="#FFF" strokeWidth="2" opacity="0.6" strokeLinecap="round"/>
                  
                  {/* النجوم الصغيرة على الجسم */}
                  <polygon points="40,40 41,43 44,43 42,45 43,48 40,46 37,48 38,45 36,43 39,43" fill="#FFD700" opacity="0.8"/>
                  <polygon points="30,55 31,57 33,57 31,58 32,60 30,59 28,60 29,58 27,57 29,57" fill="#FFD700" opacity="0.7"/>
                  <polygon points="50,60 51,62 53,62 51,63 52,65 50,64 48,65 49,63 47,62 49,62" fill="#FFD700" opacity="0.7"/>
                </g>
                
                {/* القاعدة الذهبية المزخرفة */}
                <g filter={`url(#megaGlow${i})`}>
                  <path d="M 28 83 L 22 90 L 58 90 L 52 83 Z" fill="#FFD700" stroke="#B8860B" strokeWidth="1.5"/>
                  <ellipse cx="40" cy="88" rx="18" ry="3" fill="#FFA500" opacity="0.6"/>
                  <rect x="35" y="83" width="10" height="3" fill="#B8860B" rx="1"/>
                </g>
                
                {/* الشرابة الكرتونية */}
                <g>
                  {/* كرات الشرابة */}
                  <circle cx="40" cy="95" r="4" fill="#FFD700" stroke="#B8860B" strokeWidth="1"/>
                  <ellipse cx="40" cy="96" rx="3" ry="2" fill="#FFA500" opacity="0.6"/>
                  
                  {/* الخيوط */}
                  {[-6, -3, 0, 3, 6].map((offset, idx) => (
                    <g key={idx}>
                      <line 
                        x1={40 + offset} 
                        y1="99" 
                        x2={40 + offset} 
                        y2="107" 
                        stroke="#B8860B" 
                        strokeWidth="1.5" 
                        strokeLinecap="round"
                      />
                      <circle cx={40 + offset} cy="108" r="1.5" fill="#FFD700"/>
                    </g>
                  ))}
                </g>
              </svg>

              {/* التوهج الخارجي الكبير */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut"
                }}
                className="absolute top-8 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full blur-3xl"
                style={{
                  background: `radial-gradient(circle, ${lantern.shadowColor}, transparent)`,
                }}
              />
              
              {/* شعاع الضوء للأسفل */}
              <motion.div
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                  scaleY: [1, 1.3, 1],
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
                className="absolute top-20 left-1/2 -translate-x-1/2 w-16 h-32 blur-xl"
                style={{
                  background: `linear-gradient(to bottom, ${lantern.shadowColor}88, transparent)`,
                  clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)',
                }}
              />
              
              {/* نجوم برّاقة حول الفانوس */}
              {[0, 1, 2].map((starIdx) => (
                <motion.div
                  key={starIdx}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    rotate: 360,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3 + starIdx * 0.5,
                    ease: "easeInOut"
                  }}
                  className="absolute"
                  style={{
                    left: starIdx === 0 ? '10px' : starIdx === 1 ? '60px' : '35px',
                    top: starIdx === 0 ? '30px' : starIdx === 1 ? '35px' : '70px',
                  }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: lantern.color1 }} />
                </motion.div>
              ))}
            </motion.div>
          ))}
        </div>

        {/* المحتوى الرئيسي */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
          {/* شعار التطبيق مع حركة دوران */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.3, type: 'spring', bounce: 0.6 }}
            className="relative mb-8"
          >
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.05, 1],
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity }
              }}
              className="absolute inset-0 blur-2xl bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full opacity-50"
            />
            <img 
              src="/logo.png" 
              alt="Remo Store" 
              className="relative w-28 h-28 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-yellow-400 shadow-2xl"
            />
          </motion.div>

          {/* اسم المتجر مع تأثير كتابة */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-4xl md:text-6xl font-black mb-3 bg-gradient-to-r from-yellow-200 via-yellow-400 to-orange-400 bg-clip-text text-transparent drop-shadow-2xl"
            style={{
              textShadow: '0 0 40px rgba(255, 215, 0, 0.5)',
            }}
          >
            ريمو ستور
          </motion.h1>

          {/* رسالة رمضانية مع تأثير الإعلانات التلفزيونية */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, type: 'spring', bounce: 0.5 }}
            className="mb-6 relative"
          >
            {/* خلفية متوهجة للنص */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 blur-3xl rounded-full"
            />
            
            {/* النص الرئيسي مع زخرفة */}
            <div className="relative bg-gradient-to-r from-yellow-900/30 via-orange-900/30 to-red-900/30 backdrop-blur-sm rounded-3xl px-6 py-4 border-2 border-yellow-400/50">
              <div className="flex items-center gap-3 text-yellow-100 text-2xl md:text-3xl font-black">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-yellow-300 drop-shadow-lg" />
                </motion.div>
                
                <motion.span 
                  className="drop-shadow-2xl bg-gradient-to-r from-yellow-200 via-yellow-300 to-orange-300 bg-clip-text text-transparent"
                  animate={{
                    textShadow: [
                      '0 0 20px rgba(255, 215, 0, 0.8)',
                      '0 0 40px rgba(255, 215, 0, 1)',
                      '0 0 20px rgba(255, 215, 0, 0.8)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    fontFamily: 'Cairo, sans-serif',
                    letterSpacing: '0.05em',
                  }}
                >
                  رمضان كريم
                </motion.span>
                
                <motion.div
                  animate={{ 
                    rotate: -360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1.5, repeat: Infinity }
                  }}
                >
                  <Moon className="w-7 h-7 md:w-8 md:h-8 text-yellow-300 drop-shadow-lg fill-yellow-200" />
                </motion.div>
              </div>
              
              {/* النص الثانوي */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="mt-3 text-center"
              >
                <p className="text-yellow-100 text-base md:text-lg font-bold drop-shadow-lg flex items-center justify-center gap-2">
                  <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  تسوق بأجواء رمضانية مميزة
                  <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                </p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6 }}
                  className="text-yellow-200/80 text-sm mt-1 font-medium"
                >
                  🌙 أهلاً وسهلاً بك 🌙
                </motion.p>
              </motion.div>
              
              {/* زخارف جانبية */}
              <div className="absolute -top-3 -left-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-6 h-6 text-yellow-300 fill-yellow-300 drop-shadow-lg" />
                </motion.div>
              </div>
              <div className="absolute -top-3 -right-3">
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-6 h-6 text-orange-300 fill-orange-300 drop-shadow-lg" />
                </motion.div>
              </div>
              <div className="absolute -bottom-3 -left-3">
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-red-300 drop-shadow-lg" />
                </motion.div>
              </div>
              <div className="absolute -bottom-3 -right-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-300 drop-shadow-lg" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Progress Bar الاحترافي */}
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '280px' }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="w-full max-w-xs relative"
          >
            {/* نص التحميل */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="text-center mb-2"
            >
              <p className="text-yellow-200 text-sm font-bold drop-shadow-lg">
                جاري التحميل...
              </p>
            </motion.div>
            
            {/* Progress Bar Container */}
            <div className="relative h-3 bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-full overflow-hidden backdrop-blur-md border-2 border-yellow-400/30 shadow-xl">
              {/* الخلفية المتحركة */}
              <motion.div
                animate={{
                  x: ['0%', '100%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              />
              
              {/* Progress Fill */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="relative h-full rounded-full overflow-hidden"
              >
                {/* Gradient متحرك */}
                <motion.div
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400"
                  style={{
                    boxShadow: '0 0 30px rgba(255, 215, 0, 1), inset 0 0 20px rgba(255, 255, 255, 0.5)',
                  }}
                />
                
                {/* توهج علوي */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full" />
              </motion.div>
              
              {/* شرارات على Progress Bar */}
              {progress > 10 && (
                <motion.div
                  animate={{
                    x: `${progress}%`,
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    x: { duration: 0.3 },
                    opacity: { duration: 0.8, repeat: Infinity }
                  }}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                  style={{ left: '0%' }}
                >
                  <div className="relative">
                    <Sparkles className="w-4 h-4 text-yellow-200 drop-shadow-lg" />
                    <div className="absolute inset-0 blur-md bg-yellow-400 rounded-full" />
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* النسبة المئوية */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-center mt-2"
            >
              <motion.span 
                className="text-yellow-300 text-xs font-black drop-shadow-lg"
                animate={{
                  scale: progress === 100 ? [1, 1.2, 1] : 1,
                }}
              >
                {progress}%
              </motion.span>
            </motion.div>
          </motion.div>

          {/* شرارات متحركة */}
          {isMounted && (
            <div className="absolute inset-0 pointer-events-none">
              {sparklePositions.map((sparkle, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0,
                    x: '50vw',
                    y: '50vh',
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    x: `${sparkle.x}vw`,
                    y: `${sparkle.y}vh`,
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: sparkle.delay,
                    ease: 'easeOut',
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* الزخارف الإسلامية في الزوايا */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute bottom-0 left-0 w-40 h-40"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-30">
            <defs>
              <pattern id="islamicPattern1" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="10" fill="none" stroke="#FFD700" strokeWidth="2"/>
                <path d="M 10 20 L 30 20 M 20 10 L 20 30" stroke="#FFD700" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#islamicPattern1)"/>
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute top-0 right-0 w-40 h-40 rotate-180"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-30">
            <defs>
              <pattern id="islamicPattern2" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="10" fill="none" stroke="#FFD700" strokeWidth="2"/>
                <path d="M 10 20 L 30 20 M 20 10 L 20 30" stroke="#FFD700" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#islamicPattern2)"/>
          </svg>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
