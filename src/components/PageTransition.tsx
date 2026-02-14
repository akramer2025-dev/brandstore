'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { Moon, Star, Sparkles } from 'lucide-react'
import Image from 'next/image'

export function PageTransition() {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Generate star positions once on client
  const [starPositions, setStarPositions] = useState<Array<{left: number, top: number}>>([])

  useEffect(() => {
    // Mark as mounted and generate positions on client only
    if (!isMounted) {
      setIsMounted(true)
      // تقليل عدد النجوم لتحسين الأداء
      setStarPositions(
        Array.from({ length: 10 }, () => ({
          left: 20 + Math.random() * 60,
          top: 20 + Math.random() * 60,
        }))
      )
    }
  }, [])

  useEffect(() => {
    // Show transition when pathname changes
    setIsTransitioning(true)
    setIsLoading(true)

    // Minimum display time for smooth experience - تقليل المدة
    const minDisplayTime = 400 // كانت 600، الآن 400
    const startTime = Date.now()

    // Wait for page to be interactive
    const checkPageReady = () => {
      const elapsed = Date.now() - startTime
      const remainingTime = Math.max(0, minDisplayTime - elapsed)

      setTimeout(() => {
        setIsLoading(false)
        // Hide transition after content is loaded
        setTimeout(() => {
          setIsTransitioning(false)
        }, 200)
      }, remainingTime)
    }

    // Check if page is already loaded
    if (document.readyState === 'complete') {
      checkPageReady()
    } else {
      window.addEventListener('load', checkPageReady)
    }

    return () => {
      window.removeEventListener('load', checkPageReady)
    }
  }, [pathname])

  if (!isTransitioning) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(74,28,107,0.95) 0%, rgba(45,27,78,0.95) 50%, rgba(26,15,46,0.95) 100%)'
        }}
      >
        {/* نجوم ثابتة ومتلألئة */}
        {isMounted && starPositions.map((star, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 0.8,
              scale: 1,
            }}
            transition={{
              duration: 0.4,
              delay: i * 0.015,
              ease: "easeOut"
            }}
            className="absolute w-1 h-1 bg-yellow-200 rounded-full shadow-[0_0_4px_rgba(250,204,21,0.8)]"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
            }}
          />
        ))}

        {/* الشعار المتحرك */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 200,
            damping: 15
          }}
          className="relative"
        >
          {/* توهج ذهبي حول الشعار */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.4, 0.5, 0.4],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 blur-lg bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full"
          />

          {/* الشعار */}
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden ring-4 ring-yellow-400 shadow-2xl">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* هلال ذهبي دوار */}
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
            }}
            className="absolute -top-2 -right-2"
          >
            <Moon className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
          </motion.div>

          {/* نجمة دوارة */}
          <motion.div
            animate={{
              rotate: -360,
            }}
            transition={{
              rotate: { duration: 3.5, repeat: Infinity, ease: "linear" },
            }}
            className="absolute -bottom-2 -left-2"
          >
            <Star className="w-5 h-5 text-yellow-300 fill-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.8)]" />
          </motion.div>

          {/* بريق */}
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            }}
            className="absolute -top-1 -left-1"
          >
            <Sparkles className="w-4 h-4 text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.8)]" />
          </motion.div>
        </motion.div>

        {/* فانوس صغير يمين */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block"
        >
          <motion.svg
            animate={{
              y: [0, -10, 0],
              rotate: [-3, 3, -3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            width="40"
            height="55"
            viewBox="0 0 80 110"
            className="drop-shadow-lg"
          >
            <defs>
              <linearGradient id="lantern-gold-transition" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FFA500" />
              </linearGradient>
            </defs>
            <line x1="40" y1="0" x2="40" y2="10" stroke="#8B6F47" strokeWidth="2" />
            <circle cx="40" cy="11" r="3" fill="url(#lantern-gold-transition)" />
            <ellipse cx="40" cy="45" rx="22" ry="27" fill="url(#lantern-gold-transition)" opacity="0.9" />
            <circle cx="40" cy="45" r="12" fill="#FFD700" opacity="0.6" />
          </motion.svg>
        </motion.div>

        {/* فانوس صغير يسار */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute left-8 top-1/2 -translate-y-1/2 hidden md:block"
        >
          <motion.svg
            animate={{
              y: [0, -12, 0],
              rotate: [3, -3, 3]
            }}
            transition={{
              duration: 2.3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            width="35"
            height="50"
            viewBox="0 0 80 110"
            className="drop-shadow-lg"
          >
            <defs>
              <linearGradient id="lantern-cyan-transition" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#00ACC1" />
              </linearGradient>
            </defs>
            <line x1="40" y1="0" x2="40" y2="10" stroke="#8B6F47" strokeWidth="2" />
            <circle cx="40" cy="11" r="3" fill="url(#lantern-cyan-transition)" />
            <ellipse cx="40" cy="45" rx="22" ry="27" fill="url(#lantern-cyan-transition)" opacity="0.9" />
            <circle cx="40" cy="45" r="12" fill="#00E5FF" opacity="0.6" />
          </motion.svg>
        </motion.div>

        {/* نص "جاري التحميل" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </motion.div>
            <span className="text-yellow-200 text-sm font-semibold">جاري التحميل...</span>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
