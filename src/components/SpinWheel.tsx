'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Gift, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
  const [hasSpun, setHasSpun] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // التحقق من الزيارة الأولى
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    
    if (!hasVisited) {
      // تأخير بسيط قبل إظهار العجلة
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const spinWheel = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);
    
    // تشغيل صوت الدوران باستخدام Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 200;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;
    
    try {
      oscillator.start();
      // إيقاف الصوت بعد 4.5 ثواني
      setTimeout(() => {
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.stop(audioContext.currentTime + 0.5);
      }, 4500);
    } catch (e) {
      console.log('Sound not available');
    }
    
    // اختيار جائزة عشوائية
    const randomIndex = Math.floor(Math.random() * prizes.length);
    const prize = prizes[randomIndex];
    
    // حساب زاوية الدوران بدقة
    const segmentAngle = 360 / prizes.length; // 45 درجة لكل قطعة
    const spins = 5; // عدد اللفات الكاملة
    
    // حساب الزاوية المستهدفة بحيث يكون السهم في منتصف القطعة المختارة
    // السهم في الأعلى (0 درجة)، نريد أن تكون القطعة المختارة في الأعلى
    const targetAngle = (360 * spins) + (360 - (randomIndex * segmentAngle) - (segmentAngle / 2));
    
    setRotation(targetAngle);
    
    // بعد انتهاء الدوران
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedPrize(prize);
      setHasSpun(true);
      
      // صوت الفوز
      try {
        const winOscillator = audioContext.createOscillator();
        const winGain = audioContext.createGain();
        
        winOscillator.connect(winGain);
        winGain.connect(audioContext.destination);
        
        winOscillator.frequency.value = 800;
        winOscillator.type = 'sine';
        winGain.gain.value = 0.15;
        
        winOscillator.start();
        winOscillator.stop(audioContext.currentTime + 0.3);
        
        // نغمة ثانية
        setTimeout(() => {
          const win2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          win2.connect(gain2);
          gain2.connect(audioContext.destination);
          win2.frequency.value = 1000;
          win2.type = 'sine';
          gain2.gain.value = 0.15;
          win2.start();
          win2.stop(audioContext.currentTime + 0.3);
        }, 300);
      } catch (e) {
        console.log('Win sound not available');
      }
      
      // حفظ الجائزة في localStorage
      localStorage.setItem('userPrize', JSON.stringify(prize));
    }, 5000); // 5 ثوانٍ للدوران
  };

  const handleClose = () => {
    setIsOpen(false);
    // تسجيل أن المستخدم زار الموقع
    localStorage.setItem('hasVisitedBefore', 'true');
  };

  const handleClaim = async () => {
    // التحقق من تسجيل الدخول
    if (!session?.user) {
      // توجيه للتسجيل
      localStorage.setItem('pendingPrize', JSON.stringify(selectedPrize));
      router.push('/auth/signin?callbackUrl=/');
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
        setClaimSuccess(true);
        localStorage.setItem('hasVisitedBefore', 'true');
        
        // انتظار ثانيتين ثم إغلاق
        setTimeout(() => {
          setIsOpen(false);
        }, 3000);
      } else {
        alert('حدث خطأ في حفظ الخصم. حاول مرة أخرى.');
      }
    } catch (error) {
      console.error('Error claiming prize:', error);
      alert('حدث خطأ في حفظ الخصم. حاول مرة أخرى.');
    } finally {
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
              
              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-xl flex items-center justify-center border-4 border-white z-10">
                <Sparkles className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Result Display */}
        {selectedPrize && !claimSuccess && (
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
            <p className="text-center text-white/80 text-xs mt-2">
              يمكنك استخدامه الآن عند الدفع 🎉
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
              {isSpinning ? '🎡 جاري الدوران...' : '🎯 اسحب حظك!'}
            </button>
          ) : !claimSuccess ? (
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
