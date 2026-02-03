'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, X } from 'lucide-react';

interface ResetCapitalButtonProps {
  currentBalance: number;
}

export default function ResetCapitalButton({ currentBalance }: ResetCapitalButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!newAmount || parseFloat(newAmount) < 0) {
      alert('يرجى إدخال مبلغ صحيح');
      return;
    }

    if (!confirm(`هل أنت متأكد من تصفية رأس المال وتعيينه إلى ${parseFloat(newAmount).toLocaleString()} ج؟\n\nسيتم حذف جميع سجلات المعاملات السابقة.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/vendor/capital/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newAmount: parseFloat(newAmount) }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ ${data.message}\n\nرأس المال الجديد: ${data.newBalance.toLocaleString()} ج`);
        setShowModal(false);
        router.refresh();
      } else {
        const error = await response.json();
        alert(`❌ ${error.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="bg-orange-500/20 border border-orange-500/50 text-orange-300 hover:bg-orange-500/30"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        تصفية رأس المال
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-md border border-gray-700 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">🔄 تصفية رأس المال</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                <p className="text-red-300 text-sm">
                  ⚠️ <strong>تحذير:</strong> هذا الإجراء سيحذف جميع سجلات المعاملات السابقة (إيداعات، مشتريات، إلخ) وسيبدأ حساب جديد.
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">الرصيد الحالي:</p>
                <p className="text-2xl font-bold text-yellow-400">{currentBalance.toLocaleString()} ج</p>
              </div>

              <div>
                <label className="text-white text-sm block mb-2">رأس المال الجديد:</label>
                <Input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="أدخل المبلغ الجديد"
                  className="bg-gray-700 border-gray-600 text-white text-lg"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleReset}
                  disabled={loading || !newAmount}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {loading ? 'جاري التصفية...' : '✓ تأكيد التصفية'}
                </Button>
                <Button
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
