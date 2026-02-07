'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Gift, Sparkles } from 'lucide-react';

const prizes = [
  { id: 1, text: 'خصم 250 جنيه على 500 جنيه', color: '#FF6B6B', value: 250, minPurchase: 500 },
  { id: 2, text: 'خصم 100 جنيه على 300 جنيه', color: '#4ECDC4', value: 100, minPurchase: 300 },
  { id: 3, text: 'شحن مجاني', color: '#FFE66D', value: 0, minPurchase: 0 },
  { id: 4, text: 'خصم 50 جنيه على 200 جنيه', color: '#95E1D3', value: 50, minPurchase: 200 },
  { id: 5, text: 'خصم 150 جنيه على 400 جنيه', color: '#F38181', value: 150, minPurchase: 400 },
  { id: 6, text: 'منتج مجاني عند الشراء', color: '#AA96DA', value: 0, minPurchase: 500 },
  { id: 7, text: 'خصم 200 جنيه على 600 جنيه', color: '#FCBAD3', value: 200, minPurchase: 600 },
  { id: 8, text: 'خصم 75 جنيه على 250 جنيه', color: '#A8E6CF', value: 75, minPurchase: 250 },
];

export default function SpinWheel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<typeof prizes[0] | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

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
    
    // اختيار جائزة عشوائية
    const randomIndex = Math.floor(Math.random() * prizes.length);
    const prize = prizes[randomIndex];
    
    // حساب زاوية الدوران
    const segmentAngle = 360 / prizes.length;
    const targetRotation = 360 * 5 + (randomIndex * segmentAngle) + (segmentAngle / 2);
    
    setRotation(targetRotation);
    
    // بعد انتهاء الدوران
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedPrize(prize);
      setHasSpun(true);
      
      // حفظ الجائزة في localStorage
      localStorage.setItem('userPrize', JSON.stringify(prize));
    }, 4000);
  };

  const handleClose = () => {
    setIsOpen(false);
    // تسجيل أن المستخدم زار الموقع
    localStorage.setItem('hasVisitedBefore', 'true');
  };

  const handleClaim = () => {
    // حفظ الجائزة وإغلاق
    if (selectedPrize) {
      localStorage.setItem('hasVisitedBefore', 'true');
      localStorage.setItem('activeCoupon', JSON.stringify({
        code: `LUCKY${selectedPrize.value}`,
        discount: selectedPrize.value,
        minPurchase: selectedPrize.minPurchase,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 أيام
      }));
    }
    setIsOpen(false);
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
          <div className="relative aspect-square bg-white rounded-full shadow-2xl p-4">
            <div
              ref={wheelRef}
              className="relative w-full h-full rounded-full overflow-hidden transition-transform duration-[4000ms] ease-out"
              style={{
                transform: `rotate(${rotation}deg)`,
              }}
            >
              {prizes.map((prize, index) => {
                const rotation = (360 / prizes.length) * index;
                return (
                  <div
                    key={prize.id}
                    className="absolute w-full h-full"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%)',
                      transformOrigin: 'center',
                    }}
                  >
                    <div
                      className="w-full h-full flex items-start justify-center pt-8"
                      style={{ backgroundColor: prize.color }}
                    >
                      <span className="text-white text-xs font-bold text-center px-2 transform -rotate-45">
                        {prize.value > 0 ? `${prize.value} جنيه` : prize.text.includes('شحن') ? '🚚' : '🎁'}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg flex items-center justify-center border-4 border-white">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Result Display */}
        {selectedPrize && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 animate-fade-in border-2 border-yellow-400/50">
            <p className="text-center text-white font-bold text-lg mb-2">
              🎊 مبروك! ربحت:
            </p>
            <p className="text-center text-yellow-400 font-black text-xl">
              {selectedPrize.text}
            </p>
            {selectedPrize.value > 0 && (
              <p className="text-center text-white/70 text-sm mt-2">
                استخدم الكود: <span className="font-bold text-yellow-300">LUCKY{selectedPrize.value}</span>
              </p>
            )}
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
          ) : (
            <button
              onClick={handleClaim}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-lg py-4 rounded-xl hover:scale-105 transition-transform shadow-lg"
            >
              ✅ احصل على الجائزة!
            </button>
          )}
          
          <button
            onClick={handleClose}
            className="w-full bg-white/10 text-white font-semibold py-3 rounded-xl hover:bg-white/20 transition-colors"
          >
            {hasSpun ? 'إغلاق' : 'ربما لاحقاً'}
          </button>
        </div>

        {/* Bottom Note */}
        <p className="text-center text-white/60 text-xs mt-4">
          ⏰ الجائزة صالحة لمدة 7 أيام من تاريخ الفوز
        </p>
      </div>
    </div>
  );
}
