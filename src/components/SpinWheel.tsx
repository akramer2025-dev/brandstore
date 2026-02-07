'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Gift, Sparkles, CheckCircle2, Loader2, AlertCircle, Copy, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// جميع الخصومات بنسبة 30% بالظبط
const prizes = [
  { id: 1, text: '75 جنيه', subtext: 'على 250', color: '#FF6B6B', value: 75, minPurchase: 250, percentage: 30 },
  { id: 2, text: '60 جنيه', subtext: 'على 200', color: '#4ECDC4', value: 60, minPurchase: 200, percentage: 30 },
  { id: 3, text: '45 جنيه', subtext: 'على 150', color: '#FFE66D', value: 45, minPurchase: 150, percentage: 30 },
  { id: 4, text: '30 جنيه', subtext: 'على 100', color: '#95E1D3', value: 30, minPurchase: 100, percentage: 30 },
  { id: 5, text: '90 جنيه', subtext: 'على 300', color: '#F38181', value: 90, minPurchase: 300, percentage: 30 },
  { id: 6, text: '105 جنيه', subtext: 'على 350', color: '#AA96DA', value: 105, minPurchase: 350, percentage: 30 },
  { id: 7, text: '120 جنيه', subtext: 'على 400', color: '#FCBAD3', value: 120, minPurchase: 400, percentage: 30 },
  { id: 8, text: '150 جنيه', subtext: 'على 500', color: '#A8E6CF', value: 150, minPurchase: 500, percentage: 30 },
];

export default function SpinWheel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<typeof prizes[0] | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  
  const copyCodeToClipboard = () => {
    if (couponCode) {
      navigator.clipboard.writeText(couponCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [usedPrizes, setUsedPrizes] = useState<number[]>([]);
  const wheelRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    
    const checkIfUserHasCoupon = async () => {
      // التحقق من localStorage أولاً
      const hasClaimed = localStorage.getItem('prizeClaimed');
      
      if (hasClaimed) {
        console.log('🚫 المستخدم حصل على كوبون من قبل (localStorage)');
        return false;
      }
      
      // إذا كان مسجل دخول، التحقق من قاعدة البيانات
      if (session?.user) {
        try {
          console.log('🔍 التحقق من الكوبونات في قاعدة البيانات...');
          const response = await fetch('/api/user/coupons');
          const data = await response.json();
          
          // لو عنده أي كوبونات، لا تظهر العجلة
          if (data.coupons && data.coupons.length > 0) {
            console.log('🚫 المستخدم لديه كوبونات نشطة:', data.coupons.length);
            localStorage.setItem('prizeClaimed', 'true');
            return false;
          }
          
          console.log('✅ المستخدم ليس لديه كوبونات - يمكن إظهار العجلة');
          return true;
        } catch (error) {
          console.error('❌ خطأ في التحقق من الكوبونات:', error);
          return false;
        }
      }
      
      // إذا لم يكن مسجل دخول، يمكن إظهار العجلة
      return true;
    };
    
    checkIfUserHasCoupon().then((shouldShow) => {
      if (shouldShow && isMounted) {
        setTimeout(() => {
          if (isMounted) {
            console.log('🎡 إظهار عجلة الحظ...');
            setIsOpen(true);
          }
        }, 2000);
      }
    });
    
    return () => {
      isMounted = false;
    };
  }, [session]);

  useEffect(() => {
    // تحميل الجوائز المستخدمة من localStorage
    const stored = localStorage.getItem('usedPrizeIds');
    if (stored) {
      setUsedPrizes(JSON.parse(stored));
    }
  }, []);

  const spinWheel = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);
    
    // إنشاء Audio Context للصوت
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioContext = audioContextRef.current;
    
    // إنشاء مذبذب الصوت
    oscillatorRef.current = audioContext.createOscillator();
    gainNodeRef.current = audioContext.createGain();
    
    const oscillator = oscillatorRef.current;
    const gainNode = gainNodeRef.current;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'triangle';
    gainNode.gain.value = 0.08;
    
    try {
      oscillator.start();
      
      // تغيير التردد بناءً على الوقت (يبطأ تدريجياً مع العجلة)
      const startFreq = 800;
      const endFreq = 200;
      const duration = 5;
      
      // التغيير التدريجي للتردد ليتماشى مع تباطؤ العجلة
      oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + duration);
      
      // تلاشي الصوت في النهاية
      gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      // إيقاف الصوت
      oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
      console.log('Sound not available');
    }
    
    // اختيار جائزة مختلفة عن السابقة
    let availablePrizes = prizes.filter(p => !usedPrizes.includes(p.id));
    
    // إذا تم استخدام كل الجوائز، أعد التعيين
    if (availablePrizes.length === 0) {
      availablePrizes = prizes;
      setUsedPrizes([]);
      localStorage.removeItem('usedPrizeIds');
    }
    
    const randomIndex = Math.floor(Math.random() * availablePrizes.length);
    const selectedPrize = availablePrizes[randomIndex];
    const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id);
    
    // حفظ الجائزة أولاً قبل أي حساب
    setSelectedPrize(selectedPrize);
    
    // حساب زاوية الدوران بدقة مطلقة
    const totalPrizes = prizes.length; // 8 جوائز
    const segmentAngle = 360 / totalPrizes; // 45 درجة لكل جائزة
    const spins = 5; // 5 لفات كاملة
    
    // كل segment بيترسم بحيث يشير للأعلى عند rotation = index * 45
    // يعني segment 0 مركزه عند 0°، segment 1 مركزه عند 45°، وهكذا
    // السهم ثابت عند 0° في الأعلى
    // نريد أن يصبح الـ segment المختار تحت السهم مباشرة
    const prizeCenterAngle = prizeIndex * segmentAngle;
    
    // ندير العجلة بحيث الـ segment المختار يبقى عند 0°
    const targetAngle = (360 * spins) - prizeCenterAngle;
    
    setRotation(targetAngle);
    
    // حفظ الجائزة المستخدمة
    const newUsedPrizes = [...usedPrizes, selectedPrize.id];
    setUsedPrizes(newUsedPrizes);
    localStorage.setItem('usedPrizeIds', JSON.stringify(newUsedPrizes));
    
    // بعد انتهاء الدوران
    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
      
      // صوت الفوز (نغمة واحدة قصيرة وواضحة)
      try {
        const winContext = new AudioContext();
        const winOscillator = winContext.createOscillator();
        const winGain = winContext.createGain();
        
        winOscillator.connect(winGain);
        winGain.connect(winContext.destination);
        
        winOscillator.frequency.value = 1200;
        winOscillator.type = 'sine';
        winGain.gain.value = 0.2;
        
        winOscillator.start();
        winGain.gain.exponentialRampToValueAtTime(0.01, winContext.currentTime + 0.5);
        winOscillator.stop(winContext.currentTime + 0.5);
      } catch (e) {
        console.log('Win sound not available');
      }
      
      localStorage.setItem('userPrize', JSON.stringify(selectedPrize));
    }, 5000);
  };

  const handleClose = () => {
    setIsOpen(false);
    // لا نحفظ hasVisitedBefore هنا - العجلة ستظهر مرة أخرى
    // العجلة تختفي نهائياً فقط عند الحصول على الجائزة
    
    // إيقاف الصوت إذا كان يعمل
    if (oscillatorRef.current && audioContextRef.current) {
      try {
        oscillatorRef.current.stop();
        audioContextRef.current.close();
      } catch (e) {}
    }
  };

  const handleClaim = async () => {
    // التحقق من تسجيل الدخول
    if (!session?.user) {
      // حفظ الجائزة وعرض رسالة بدلاً من التوجيه
      localStorage.setItem('pendingPrize', JSON.stringify(selectedPrize));
      setShowLoginMessage(true);
      
      // إخفاء العجلة بعد 4 ثوان
      setTimeout(() => {
        setIsOpen(false);
      }, 4000);
      return;
    }

    setIsClaiming(true);

    try {
      // حفظ الكوبون في قاعدة البيانات
      const response = await fetch('/api/coupons/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discount: selectedPrize?.value,
          minPurchase: selectedPrize?.minPurchase,
          percentage: selectedPrize?.percentage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setClaimSuccess(true);
        setCouponCode(data.coupon?.code || ''); // حفظ الكود
        
        console.log('✅ تم حفظ الكوبون بنجاح:', data);
        
        // تسجيل أن المستخدم حصل على الجائزة وعدم إظهار العجلة مرة أخرى
        localStorage.setItem('hasVisitedBefore', 'true');
        localStorage.setItem('prizeClaimed', 'true');
        localStorage.setItem('prizeClaimedDate', new Date().toISOString());
        
        // انتظار 6 ثوانٍ لإعطاء الوقت لنسخ الكود
        setTimeout(() => {
          setIsOpen(false);
        }, 6000);
      } else {
        const errorData = await response.json();
        console.error('❌ فشل حفظ الخصم:', errorData);
        alert(`حدث خطأ في حفظ الخصم: ${errorData.error || 'حاول مرة أخرى'}`);
        setIsClaiming(false);
      }
    } catch (error) {
      console.error('❌ Error claiming prize:', error);
      alert('حدث خطأ في الاتصال بالخادم. تحقق من اتصال الإنترنت.');
      setIsClaiming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 rounded-3xl shadow-2xl max-w-lg w-full mx-4 p-6 md:p-8 animate-scale-in">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 text-white/70 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gift className="w-8 h-8 text-yellow-400 animate-bounce" />
            <h2 className="text-2xl md:text-3xl font-black text-white">
              عجلة الحظ
            </h2>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-white/90 text-sm md:text-base">
            🎉 مرحباً بك! اسحب حظك واربح جائزة فورية!
          </p>
        </div>

        {/* Wheel Container */}
        <div className="relative w-full max-w-sm mx-auto mb-6">
          {/* Pointer/Arrow */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-yellow-400 drop-shadow-lg" />
          </div>

          {/* Wheel */}
          <div className="relative aspect-square bg-white rounded-full shadow-2xl p-2">
            <div
              ref={wheelRef}
              className="relative w-full h-full rounded-full overflow-hidden will-change-transform"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
              }}
            >
              {/* Segments */}
              {prizes.map((prize, index) => {
                const segmentAngle = 360 / prizes.length;
                const rotation = segmentAngle * index;
                
                return (
                  <div
                    key={prize.id}
                    className="absolute w-full h-full"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: 'center',
                    }}
                  >
                    {/* الشكل المثلث للقطعة */}
                    <div
                      className="absolute top-0 left-1/2 origin-bottom"
                      style={{
                        width: '0',
                        height: '0',
                        borderLeft: '80px solid transparent',
                        borderRight: '80px solid transparent',
                        borderTop: `160px solid ${prize.color}`,
                        transform: 'translateX(-50%)',
                      }}
                    />
                    
                    {/* النص */}
                    <div 
                      className="absolute top-12 left-1/2 -translate-x-1/2 text-center"
                      style={{
                        width: '120px',
                      }}
                    >
                      <div className="text-white font-black text-sm md:text-base drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                        {prize.text}
                      </div>
                      <div className="text-white font-bold text-xs drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                        {prize.subtext}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Center Circle with Logo */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-yellow-400 z-10 p-2">
                <Image 
                  src="/logo.png" 
                  alt="Logo" 
                  width={60} 
                  height={60}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Result Display - يظهر فقط بعد توقف العجلة */}
        {selectedPrize && hasSpun && !claimSuccess && !showLoginMessage && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 animate-fade-in border-2 border-yellow-400/50">
            <p className="text-center text-white font-bold text-lg mb-2">
              🎊 مبروك! ربحت:
            </p>
            <p className="text-center text-yellow-400 font-black text-2xl">
              خصم {selectedPrize.value} جنيه
            </p>
            <p className="text-center text-white/80 text-sm mt-1">
              على مشتريات {selectedPrize.minPurchase} جنيه
            </p>
            <div className="mt-3 bg-yellow-400/20 rounded-lg p-2">
              <p className="text-center text-yellow-300 text-xs">
                💰 خصم {selectedPrize.percentage}% على مشترياتك
              </p>
            </div>
          </div>
        )}

        {/* Login Message */}
        {showLoginMessage && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 mb-4 animate-scale-in border-2 border-blue-300">
            <div className="flex items-center justify-center mb-3">
              <AlertCircle className="w-16 h-16 text-white animate-pulse" />
            </div>
            <p className="text-center text-white font-black text-xl mb-2">
              🎁 سوف تحصل على الخصم عند تسجيل الدخول
            </p>
            <p className="text-center text-white/90 text-sm">
              خصم {selectedPrize?.value} جنيه بانتظارك!
            </p>
            <p className="text-center text-white/80 text-xs mt-2">
              سجل دخول الآن لإضافة الخصم لحسابك
            </p>
          </div>
        )}

        {/* Success Message */}
        {claimSuccess && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-4 animate-scale-in border-2 border-green-300">
            <div className="flex items-center justify-center mb-3">
              <CheckCircle2 className="w-16 h-16 text-white animate-bounce" />
            </div>
            <p className="text-center text-white font-black text-2xl mb-2">
              ✅ تم الحصول على الخصم!
            </p>
            <p className="text-center text-white/90 text-sm">
              تم إضافة خصم {selectedPrize?.value} جنيه إلى حسابك بنجاح
            </p>
            
            {/* Coupon Code Display */}
            {couponCode && (
              <div className="mt-4 bg-white/20 backdrop-blur-lg rounded-xl p-4 border-2 border-white/40">
                <p className="text-center text-white/90 text-xs mb-2 font-bold">
                  🎫 كود الخصم الخاص بك:
                </p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="bg-white/30 px-4 py-2 rounded-lg">
                    <code className="text-white font-mono font-black text-lg tracking-wider">
                      {couponCode}
                    </code>
                  </div>
                  <button
                    onClick={copyCodeToClipboard}
                    className="bg-white/30 hover:bg-white/40 p-2 rounded-lg transition-all duration-200 active:scale-95"
                    title="نسخ الكود"
                  >
                    {codeCopied ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Copy className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
                <p className="text-center text-white/80 text-xs">
                  {codeCopied ? '✓ تم النسخ!' : 'استخدمه في صفحة السلة 🛒'}
                </p>
              </div>
            )}
            
            <p className="text-center text-white/80 text-xs mt-2">
              يمكنك استخدامه عند الشراء بقيمة {selectedPrize?.minPurchase} جنيه أو أكثر 🎉
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {!hasSpun ? (
            <button
              onClick={spinWheel}
              disabled={isSpinning}
              className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-black text-lg py-4 rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSpinning ? '🎡 جاري الدوران...' : '🎯 جرب حظك!'}
            </button>
          ) : !claimSuccess && !showLoginMessage ? (
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-lg py-4 rounded-xl hover:scale-105 transition-transform disabled:opacity-70 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
            >
              {isClaiming ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  ✅ احصل على الخصم!
                </>
              )}
            </button>
          ) : null}
          
          {!claimSuccess && (
            <button
              onClick={handleClose}
              className="w-full bg-white/10 text-white font-semibold py-3 rounded-xl hover:bg-white/20 transition-colors"
            >
              {hasSpun ? 'إغلاق' : 'ربما لاحقاً'}
            </button>
          )}
        </div>

        {/* Bottom Note */}
        {!claimSuccess && (
          <p className="text-center text-white/60 text-xs mt-4">
            {!session?.user && hasSpun ? (
              <span className="text-yellow-300">⚠️ يجب تسجيل الدخول للحصول على الخصم</span>
            ) : (
              '⏰ الخصم صالح لمدة 7 أيام من تاريخ الفوز'
            )}
          </p>
        )}
      </div>
    </div>
  );
}
