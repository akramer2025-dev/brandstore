'use client'

import { motion } from 'framer-motion'
import { Star, Moon, Sparkles } from 'lucide-react'

export function RamadanHomeDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* 🎀 سلسلة زينة رمضان في الأعلى - أعلام ملونة */}
      <div className="absolute top-0 left-0 right-0 h-20 z-50">
        <svg className="w-full h-full" viewBox="0 0 1200 80" preserveAspectRatio="none">
          {/* حبل الزينة */}
          <path 
            d="M 0,15 Q 150,25 300,15 T 600,15 T 900,15 T 1200,15" 
            stroke="#8B6F47" 
            strokeWidth="2" 
            fill="none"
          />
          
          {/* أعلام الزينة */}
          {[...Array(15)].map((_, i) => {
            const x = (i * 80) + 40
            const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3']
            const color = colors[i % colors.length]
            const delay = i * 0.15
            
            return (
              <g key={i}>
                {/* حبل التعليق */}
                <line x1={x} y1="15" x2={x} y2="28" stroke="#8B6F47" strokeWidth="1" />
                
                {/* العلم */}
                <motion.g
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ 
                    y: [0, 5, 0],
                    opacity: 1
                  }}
                  transition={{
                    y: { duration: 2 + (i % 3) * 0.5, repeat: Infinity, ease: "easeInOut", delay },
                    opacity: { duration: 0.5, delay: delay * 0.5 }
                  }}
                >
                  {/* شكل العلم المثلث */}
                  <path
                    d={`M ${x},28 L ${x-12},38 L ${x},58 L ${x+12},38 Z`}
                    fill={color}
                    stroke="#FFF"
                    strokeWidth="1"
                    opacity="0.9"
                  />
                  
                  {/* نجمة أو هلال على العلم */}
                  {i % 2 === 0 ? (
                    <circle cx={x} cy="43" r="3" fill="#FFF" opacity="0.8" />
                  ) : (
                    <path
                      d={`M ${x-2},43 Q ${x},40 ${x+2},43 Q ${x},45 ${x-2},43`}
                      fill="#FFF"
                      opacity="0.8"
                    />
                  )}
                  
                  {/* خيط الزينة المتدلي */}
                  <line x1={x} y1="58" x2={x} y2="65" stroke={color} strokeWidth="1" opacity="0.6" />
                  <circle cx={x} cy="66" r="2" fill={color} />
                </motion.g>
              </g>
            )
          })}
        </svg>
      </div>

      {/* 💡 خيط إضاءة LED متلألئ */}
      <div className="absolute top-0 left-0 right-0 h-16">
        {[...Array(20)].map((_, i) => {
          const left = (i * 5) + 2.5
          const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#AA96DA']
          const color = colors[i % colors.length]
          const delay = i * 0.2
          
          return (
            <motion.div
              key={`light-${i}`}
              className="absolute"
              style={{
                left: `${left}%`,
                top: '10px'
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay
              }}
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
                }}
              />
            </motion.div>
          )
        })}
      </div>

      {/* 🕌 مسجد صغير في الزاوية - تصميم بسيط */}
      <motion.div
        className="hidden md:block absolute top-1/2 right-12 -translate-y-1/2"
        initial={{ opacity: 0, x: 50 }}
        animate={{ 
          opacity: [0.15, 0.25, 0.15],
          x: 0
        }}
        transition={{
          opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 1, ease: "backOut" }
        }}
      >
        <svg width="80" height="100" viewBox="0 0 100 120" className="text-purple-600">
          {/* القبة */}
          <ellipse cx="50" cy="50" rx="25" ry="15" fill="currentColor" opacity="0.3" />
          <path d="M 25,50 Q 50,30 75,50" fill="currentColor" opacity="0.4" />
          
          {/* الهلال فوق القبة */}
          <path d="M 48,25 Q 50,20 52,25 Q 50,28 48,25" fill="currentColor" />
          
          {/* المئذنة */}
          <rect x="20" y="55" width="8" height="40" fill="currentColor" opacity="0.3" />
          <rect x="72" y="55" width="8" height="40" fill="currentColor" opacity="0.3" />
          
          {/* قمم المآذن */}
          <path d="M 24,55 L 24,45 L 26,50 Z" fill="currentColor" opacity="0.4" />
          <path d="M 76,55 L 76,45 L 78,50 Z" fill="currentColor" opacity="0.4" />
          
          {/* جسم المسجد */}
          <rect x="35" y="65" width="30" height="35" fill="currentColor" opacity="0.2" />
          
          {/* الباب */}
          <path d="M 45,80 L 45,100 L 55,100 L 55,80 Q 50,75 45,80" fill="currentColor" opacity="0.4" />
        </svg>
      </motion.div>

      {/* 🕌 مسجد صغير في الزاوية الأخرى */}
      <motion.div
        className="hidden md:block absolute top-1/2 left-12 -translate-y-1/2"
        initial={{ opacity: 0, x: -50 }}
        animate={{ 
          opacity: [0.15, 0.25, 0.15],
          x: 0
        }}
        transition={{
          opacity: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 1, ease: "backOut", delay: 0.3 }
        }}
      >
        <svg width="70" height="90" viewBox="0 0 100 120" className="text-yellow-600">
          <ellipse cx="50" cy="50" rx="25" ry="15" fill="currentColor" opacity="0.3" />
          <path d="M 25,50 Q 50,30 75,50" fill="currentColor" opacity="0.4" />
          <path d="M 48,25 Q 50,20 52,25 Q 50,28 48,25" fill="currentColor" />
          <rect x="20" y="55" width="8" height="35" fill="currentColor" opacity="0.3" />
          <rect x="72" y="55" width="8" height="35" fill="currentColor" opacity="0.3" />
          <path d="M 24,55 L 24,48 L 26,52 Z" fill="currentColor" opacity="0.4" />
          <path d="M 76,55 L 76,48 L 78,52 Z" fill="currentColor" opacity="0.4" />
          <rect x="35" y="65" width="30" height="30" fill="currentColor" opacity="0.2" />
          <path d="M 45,78 L 45,95 L 55,95 L 55,78 Q 50,73 45,78" fill="currentColor" opacity="0.4" />
        </svg>
      </motion.div>

      {/* فوانيس صغيرة في الزوايا */}
      {/* فانوس أيمن علوي */}
      <motion.div
        className="absolute top-20 right-4 md:right-8"
        animate={{
          y: [0, -10, 0],
          rotate: [-3, 3, -3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg width="40" height="55" viewBox="0 0 80 110" className="drop-shadow-lg">
          <defs>
            {/* Gradient للفانوس */}
            <linearGradient id="lantern-gold-1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
            <radialGradient id="glow-gold-1">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#FFA500" stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          {/* حبل ذهبي */}
          <line x1="40" y1="0" x2="40" y2="10" stroke="#8B6F47" strokeWidth="2" />
          <circle cx="40" cy="11" r="3" fill="url(#lantern-gold-1)" />
          
          {/* قمة الفانوس */}
          <path d="M 30 13 L 40 15 L 50 13 L 48 20 L 32 20 Z" fill="url(#lantern-gold-1)" />
          
          {/* جسم الفانوس */}
          <ellipse cx="40" cy="45" rx="22" ry="27" fill="url(#lantern-gold-1)" opacity="0.9" />
          
          {/* الضوء الداخلي */}
          <ellipse cx="40" cy="45" rx="12" ry="15" fill="url(#glow-gold-1)" />
          
          {/* خطوط زخرفية */}
          <line x1="20" y1="40" x2="60" y2="40" stroke="#8B6F47" strokeWidth="1" opacity="0.4" />
          <line x1="22" y1="50" x2="58" y2="50" stroke="#8B6F47" strokeWidth="1" opacity="0.4" />
          
          {/* نجوم على الجسم */}
          <circle cx="35" cy="35" r="2" fill="#FFD700" />
          <circle cx="45" cy="55" r="1.5" fill="#FFD700" />
          
          {/* قاعدة الفانوس */}
          <path d="M 32 70 L 40 73 L 48 70 L 45 75 L 35 75 Z" fill="url(#lantern-gold-1)" />
          <ellipse cx="40" cy="75" rx="6" ry="2" fill="url(#lantern-gold-1)" />
          
          {/* شرابة */}
          <line x1="40" y1="77" x2="38" y2="85" stroke="#B8860B" strokeWidth="1.5" />
          <line x1="40" y1="77" x2="40" y2="87" stroke="#B8860B" strokeWidth="1.5" />
          <line x1="40" y1="77" x2="42" y2="85" stroke="#B8860B" strokeWidth="1.5" />
          <circle cx="38" cy="86" r="2" fill="#B8860B" />
          <circle cx="40" cy="88" r="2" fill="#B8860B" />
          <circle cx="42" cy="86" r="2" fill="#B8860B" />
        </svg>
        
        {/* توهج حول الفانوس */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-yellow-400/20 rounded-full blur-xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* فانوس أيسر علوي */}
      <motion.div
        className="absolute top-32 left-4 md:left-8"
        animate={{
          y: [0, -15, 0],
          rotate: [3, -3, 3],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      >
        <svg width="35" height="48" viewBox="0 0 80 110" className="drop-shadow-lg">
          <defs>
            <linearGradient id="lantern-cyan-2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#00ACC1" />
            </linearGradient>
            <radialGradient id="glow-cyan-2">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#00BCD4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          <line x1="40" y1="0" x2="40" y2="10" stroke="#8B6F47" strokeWidth="2" />
          <circle cx="40" cy="11" r="3" fill="url(#lantern-cyan-2)" />
          <path d="M 30 13 L 40 15 L 50 13 L 48 20 L 32 20 Z" fill="url(#lantern-cyan-2)" />
          <ellipse cx="40" cy="45" rx="22" ry="27" fill="url(#lantern-cyan-2)" opacity="0.9" />
          <ellipse cx="40" cy="45" rx="12" ry="15" fill="url(#glow-cyan-2)" />
          <line x1="20" y1="40" x2="60" y2="40" stroke="#006064" strokeWidth="1" opacity="0.4" />
          <line x1="22" y1="50" x2="58" y2="50" stroke="#006064" strokeWidth="1" opacity="0.4" />
          <circle cx="35" cy="35" r="2" fill="#00E5FF" />
          <circle cx="45" cy="55" r="1.5" fill="#00E5FF" />
          <path d="M 32 70 L 40 73 L 48 70 L 45 75 L 35 75 Z" fill="url(#lantern-cyan-2)" />
          <ellipse cx="40" cy="75" rx="6" ry="2" fill="url(#lantern-cyan-2)" />
          <line x1="40" y1="77" x2="38" y2="85" stroke="#00ACC1" strokeWidth="1.5" />
          <line x1="40" y1="77" x2="40" y2="87" stroke="#00ACC1" strokeWidth="1.5" />
          <line x1="40" y1="77" x2="42" y2="85" stroke="#00ACC1" strokeWidth="1.5" />
          <circle cx="38" cy="86" r="2" fill="#00ACC1" />
          <circle cx="40" cy="88" r="2" fill="#00ACC1" />
          <circle cx="42" cy="86" r="2" fill="#00ACC1" />
        </svg>
        
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-cyan-400/20 rounded-full blur-xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* هلال ذهبي في الأعلى بالوسط */}
      <motion.div
        className="absolute top-2 left-1/2 -translate-x-1/2 hidden md:block"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ 
          scale: 1, 
          rotate: 0,
          y: [0, -5, 0]
        }}
        transition={{
          scale: { duration: 1, ease: "backOut" },
          rotate: { duration: 1, ease: "backOut" },
          y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }
        }}
      >
        <div className="relative">
          <Moon className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" fill="currentColor" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1 -right-1"
          >
            <Star className="w-3 h-3 text-yellow-300" fill="currentColor" />
          </motion.div>
        </div>
      </motion.div>

      {/* نجوم متلألئة في الخلفية */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut"
          }}
        >
          <Star 
            className="text-yellow-300" 
            fill="currentColor" 
            size={8 + Math.random() * 8}
          />
        </motion.div>
      ))}

      {/* نص "رمضان كريم" شفاف في الخلفية - مخفي على الموبايل */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: [0.03, 0.08, 0.03],
          scale: [0.95, 1.05, 0.95]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <h1 className="text-8xl font-black text-yellow-600 text-center leading-tight">
          رمضان كريم
        </h1>
      </motion.div>

      {/* أنماط إسلامية في الزوايا - مخفية على الموبايل */}
      <div className="hidden md:block absolute top-0 right-0 w-32 h-32 opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <pattern id="islamic-pattern-tr" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="3" fill="currentColor" className="text-yellow-600" />
            <circle cx="10" cy="10" r="2" fill="currentColor" className="text-yellow-600" />
            <circle cx="30" cy="10" r="2" fill="currentColor" className="text-yellow-600" />
            <circle cx="10" cy="30" r="2" fill="currentColor" className="text-yellow-600" />
            <circle cx="30" cy="30" r="2" fill="currentColor" className="text-yellow-600" />
          </pattern>
          <rect width="100" height="100" fill="url(#islamic-pattern-tr)" />
        </svg>
      </div>

      <div className="hidden md:block absolute bottom-0 left-0 w-32 h-32 opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <pattern id="islamic-pattern-bl" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="3" fill="currentColor" className="text-purple-600" />
            <circle cx="10" cy="10" r="2" fill="currentColor" className="text-purple-600" />
            <circle cx="30" cy="10" r="2" fill="currentColor" className="text-purple-600" />
            <circle cx="10" cy="30" r="2" fill="currentColor" className="text-purple-600" />
            <circle cx="30" cy="30" r="2" fill="currentColor" className="text-purple-600" />
          </pattern>
          <rect width="100" height="100" fill="url(#islamic-pattern-bl)" />
        </svg>
      </div>

      {/* بريق متحرك عشوائي */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute"
          style={{
            top: `${10 + Math.random() * 80}%`,
            left: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "easeOut"
          }}
        >
          <Sparkles 
            className="text-yellow-400" 
            size={12 + Math.random() * 8}
            style={{ filter: 'drop-shadow(0 0 4px rgba(250,204,21,0.6))' }}
          />
        </motion.div>
      ))}

      {/* فانوس أيمن سفلي - يظهر فقط على الشاشات الكبيرة */}
      <motion.div
        className="hidden lg:block absolute bottom-32 right-8"
        animate={{
          y: [0, -12, 0],
          rotate: [-2, 2, -2],
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        <svg width="38" height="52" viewBox="0 0 80 110" className="drop-shadow-lg">
          <defs>
            <linearGradient id="lantern-purple-3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E040FB" />
              <stop offset="100%" stopColor="#9C27B0" />
            </linearGradient>
            <radialGradient id="glow-purple-3">
              <stop offset="0%" stopColor="#E040FB" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#AB47BC" stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          <line x1="40" y1="0" x2="40" y2="10" stroke="#8B6F47" strokeWidth="2" />
          <circle cx="40" cy="11" r="3" fill="url(#lantern-purple-3)" />
          <path d="M 30 13 L 40 15 L 50 13 L 48 20 L 32 20 Z" fill="url(#lantern-purple-3)" />
          <ellipse cx="40" cy="45" rx="22" ry="27" fill="url(#lantern-purple-3)" opacity="0.9" />
          <ellipse cx="40" cy="45" rx="12" ry="15" fill="url(#glow-purple-3)" />
          <line x1="20" y1="40" x2="60" y2="40" stroke="#4A148C" strokeWidth="1" opacity="0.4" />
          <line x1="22" y1="50" x2="58" y2="50" stroke="#4A148C" strokeWidth="1" opacity="0.4" />
          <circle cx="35" cy="35" r="2" fill="#E040FB" />
          <circle cx="45" cy="55" r="1.5" fill="#E040FB" />
          <path d="M 32 70 L 40 73 L 48 70 L 45 75 L 35 75 Z" fill="url(#lantern-purple-3)" />
          <ellipse cx="40" cy="75" rx="6" ry="2" fill="url(#lantern-purple-3)" />
          <line x1="40" y1="77" x2="38" y2="85" stroke="#9C27B0" strokeWidth="1.5" />
          <line x1="40" y1="77" x2="40" y2="87" stroke="#9C27B0" strokeWidth="1.5" />
          <line x1="40" y1="77" x2="42" y2="85" stroke="#9C27B0" strokeWidth="1.5" />
          <circle cx="38" cy="86" r="2" fill="#9C27B0" />
          <circle cx="40" cy="88" r="2" fill="#9C27B0" />
          <circle cx="42" cy="86" r="2" fill="#9C27B0" />
        </svg>
        
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-purple-400/20 rounded-full blur-xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* فانوس أيسر سفلي - يظهر فقط على الشاشات الكبيرة */}
      <motion.div
        className="hidden lg:block absolute bottom-20 left-8"
        animate={{
          y: [0, -8, 0],
          rotate: [2, -2, 2],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
      >
        <svg width="36" height="50" viewBox="0 0 80 110" className="drop-shadow-lg">
          <defs>
            <linearGradient id="lantern-orange-4" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF6F00" />
              <stop offset="100%" stopColor="#E65100" />
            </linearGradient>
            <radialGradient id="glow-orange-4">
              <stop offset="0%" stopColor="#FF8F00" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#FF6F00" stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          <line x1="40" y1="0" x2="40" y2="10" stroke="#8B6F47" strokeWidth="2" />
          <circle cx="40" cy="11" r="3" fill="url(#lantern-orange-4)" />
          <path d="M 30 13 L 40 15 L 50 13 L 48 20 L 32 20 Z" fill="url(#lantern-orange-4)" />
          <ellipse cx="40" cy="45" rx="22" ry="27" fill="url(#lantern-orange-4)" opacity="0.9" />
          <ellipse cx="40" cy="45" rx="12" ry="15" fill="url(#glow-orange-4)" />
          <line x1="20" y1="40" x2="60" y2="40" stroke="#BF360C" strokeWidth="1" opacity="0.4" />
          <line x1="22" y1="50" x2="58" y2="50" stroke="#BF360C" strokeWidth="1" opacity="0.4" />
          <circle cx="35" cy="35" r="2" fill="#FF8F00" />
          <circle cx="45" cy="55" r="1.5" fill="#FF8F00" />
          <path d="M 32 70 L 40 73 L 48 70 L 45 75 L 35 75 Z" fill="url(#lantern-orange-4)" />
          <ellipse cx="40" cy="75" rx="6" ry="2" fill="url(#lantern-orange-4)" />
          <line x1="40" y1="77" x2="38" y2="85" stroke="#E65100" strokeWidth="1.5" />
          <line x1="40" y1="77" x2="40" y2="87" stroke="#E65100" strokeWidth="1.5" />
          <line x1="40" y1="77" x2="42" y2="85" stroke="#E65100" strokeWidth="1.5" />
          <circle cx="38" cy="86" r="2" fill="#E65100" />
          <circle cx="40" cy="88" r="2" fill="#E65100" />
          <circle cx="42" cy="86" r="2" fill="#E65100" />
        </svg>
        
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-orange-400/20 rounded-full blur-xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* 🎊 دوائر ملونة متحركة (Confetti Style) */}
      {[...Array(12)].map((_, i) => {
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA']
        const color = colors[i % colors.length]
        const size = 8 + Math.random() * 12
        const startX = Math.random() * 100
        const startY = Math.random() * 100
        
        return (
          <motion.div
            key={`confetti-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${startX}%`,
              top: `${startY}%`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              opacity: 0.3
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              rotate: [0, 360],
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 4
            }}
          />
        )
      })}

      {/* 🌙 أهلة ذهبية في مواقع استراتيجية */}
      <motion.div
        className="absolute top-1/4 right-1/4 hidden lg:block"
        animate={{
          rotate: [0, 10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Moon 
          className="w-8 h-8 text-yellow-400/40" 
          fill="currentColor"
          style={{ filter: 'drop-shadow(0 0 8px rgba(250,204,21,0.4))' }}
        />
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 left-1/4 hidden lg:block"
        animate={{
          rotate: [0, -10, 0],
          scale: [1, 1.15, 1]
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        <Moon 
          className="w-7 h-7 text-purple-400/40" 
          fill="currentColor"
          style={{ filter: 'drop-shadow(0 0 8px rgba(192,132,252,0.4))' }}
        />
      </motion.div>

      {/* ⭐ نجوم ذهبية كبيرة في الزوايا */}
      <motion.div
        className="absolute top-1/3 left-1/3 hidden md:block"
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1]
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <Star 
          className="w-6 h-6 text-yellow-400/30" 
          fill="currentColor"
          style={{ filter: 'drop-shadow(0 0 6px rgba(250,204,21,0.5))' }}
        />
      </motion.div>

      <motion.div
        className="absolute top-2/3 right-1/3 hidden md:block"
        animate={{
          rotate: -360,
          scale: [1, 1.3, 1]
        }}
        transition={{
          rotate: { duration: 18, repeat: Infinity, ease: "linear" },
          scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
        }}
      >
        <Star 
          className="w-7 h-7 text-orange-400/30" 
          fill="currentColor"
          style={{ filter: 'drop-shadow(0 0 6px rgba(251,146,60,0.5))' }}
        />
      </motion.div>

      {/* ✨ بريق رمضاني متحرك مع مسارات */}
      {[...Array(6)].map((_, i) => {
        const startX = Math.random() * 100
        const startY = Math.random() * 100
        const endX = Math.random() * 100
        const endY = Math.random() * 100
        
        return (
          <motion.div
            key={`sparkle-trail-${i}`}
            className="absolute"
            style={{
              left: `${startX}%`,
              top: `${startY}%`,
            }}
            animate={{
              x: [(endX - startX), -(endX - startX)],
              y: [(endY - startY), -(endY - startY)],
              scale: [0, 1, 0],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5
            }}
          >
            <Sparkles 
              className="text-purple-400" 
              size={16}
              style={{ filter: 'drop-shadow(0 0 8px rgba(192,132,252,0.6))' }}
            />
          </motion.div>
        )
      })}

      {/* 📿 خطوط زخرفية متموجة - أنماط إسلامية */}
      <svg className="absolute inset-0 w-full h-full opacity-5" style={{ pointerEvents: 'none' }}>
        <defs>
          <pattern id="wave-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <path
              d="M 0,100 Q 50,80 100,100 T 200,100"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-purple-600"
            />
            <path
              d="M 0,120 Q 50,140 100,120 T 200,120"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-yellow-600"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wave-pattern)" />
      </svg>

      {/* 🎨 أشكال هندسية إسلامية دوارة */}
      <motion.div
        className="hidden xl:block absolute top-1/2 right-1/3 -translate-y-1/2"
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <svg width="60" height="60" viewBox="0 0 100 100" className="opacity-10">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-600" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-600" />
          <path d="M 50,10 L 50,90 M 10,50 L 90,50" stroke="currentColor" strokeWidth="1" className="text-yellow-600" />
          <path d="M 20,20 L 80,80 M 80,20 L 20,80" stroke="currentColor" strokeWidth="1" className="text-purple-600" />
        </svg>
      </motion.div>

      <motion.div
        className="hidden xl:block absolute bottom-1/3 left-1/3"
        animate={{
          rotate: -360
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <svg width="50" height="50" viewBox="0 0 100 100" className="opacity-10">
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-600" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-600" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-600" />
          <path d="M 50,15 L 50,85 M 15,50 L 85,50" stroke="currentColor" strokeWidth="1" className="text-purple-600" />
        </svg>
      </motion.div>

      {/* 🌟 نجوم صغيرة متناثرة إضافية */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={`mini-star-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0.3, 0.8, 0.3],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        >
          <div 
            className="w-1 h-1 bg-yellow-400 rounded-full"
            style={{ boxShadow: '0 0 4px rgba(250,204,21,0.8)' }}
          />
        </motion.div>
      ))}
    </div>
  )
}
