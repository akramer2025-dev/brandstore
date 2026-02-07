'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { CheckCircle2, Gift } from 'lucide-react';

export default function PendingPrizeHandler() {
  const { data: session, status } = useSession();
  const [showSuccess, setShowSuccess] = useState(false);
  const [prizeValue, setPrizeValue] = useState<number | null>(null);

  useEffect(() => {
    // التحقق من pending prize عند تسجيل الدخول
    const checkPendingPrize = async () => {
      // التأكد من تسجيل الدخول
      if (status !== 'authenticated' || !session?.user) return;

      // التحقق من وجود جائزة معلقة
      const pendingPrizeStr = localStorage.getItem('pendingPrize');
      if (!pendingPrizeStr) return;

      try {
        const pendingPrize = JSON.parse(pendingPrizeStr);
        
        // حفظ الكوبون في قاعدة البيانات
        const response = await fetch('/api/coupons/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            discount: pendingPrize.value,
            minPurchase: pendingPrize.minPurchase,
            percentage: pendingPrize.percentage,
          }),
        });

        if (response.ok) {
          // إزالة الجائزة المعلقة
          localStorage.removeItem('pendingPrize');
          
          // تسجيل أن المستخدم حصل على الجائزة
          localStorage.setItem('prizeClaimed', 'true');
          localStorage.setItem('prizeClaimedDate', new Date().toISOString());
          
          // عرض رسالة النجاح
          setPrizeValue(pendingPrize.value);
          setShowSuccess(true);
          
          // إخفاء الرسالة بعد 5 ثوانٍ
          setTimeout(() => {
            setShowSuccess(false);
          }, 5000);
        }
      } catch (error) {
        console.error('Error processing pending prize:', error);
      }
    };

    checkPendingPrize();
  }, [session, status]);

  if (!showSuccess) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] animate-slide-in-right">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 shadow-2xl border-2 border-green-300 max-w-sm animate-bounce-subtle">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle2 className="w-12 h-12 text-white animate-pulse" />
          <div>
            <p className="text-white font-black text-xl">
              ✅ تم الحصول على الخصم!
            </p>
          </div>
        </div>
        <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-6 h-6 text-yellow-300" />
            <p className="text-white font-bold text-lg">
              خصم {prizeValue} جنيه
            </p>
          </div>
          <p className="text-white/90 text-sm">
            تم إضافة الخصم لحسابك بنجاح 🎉
          </p>
          <p className="text-white/80 text-xs mt-1">
            يمكنك استخدامه الآن عند الشراء
          </p>
        </div>
      </div>
    </div>
  );
}
