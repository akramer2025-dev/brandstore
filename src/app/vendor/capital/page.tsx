'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, DollarSign, TrendingUp, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CapitalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [capital, setCapital] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchCapital();
  }, []);

  const fetchCapital = async () => {
    try {
      const response = await fetch('/api/vendor/capital');
      if (response.ok) {
        const data = await response.json();
        setCapital(data.capital);
        if (data.capital) {
          setAmount(data.capital.initialAmount.toString());
          setNotes(data.capital.notes || '');
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('الرجاء إدخال مبلغ صحيح');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/vendor/capital', {
        method: capital ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialAmount: parseFloat(amount),
          notes,
        }),
      });

      if (response.ok) {
        alert(`✅ تم ${capital ? 'تحديث' : 'تسجيل'} رأس المال بنجاح!`);
        fetchCapital();
      } else {
        const error = await response.json();
        alert(error.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/vendor/dashboard">
            <Button variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-400" />
              رأس المال
            </h1>
            <p className="text-gray-400 mt-1">تسجيل وإدارة رأس المال الأولي</p>
          </div>
        </div>

        {/* معلومات رأس المال الحالي */}
        {capital && (
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-500/30 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-green-200 text-sm mb-2">رأس المال الأولي</p>
                  <p className="text-3xl font-bold text-white">{capital.initialAmount.toLocaleString()} ج</p>
                </div>
                <div>
                  <p className="text-green-200 text-sm mb-2">المتبقي</p>
                  <p className="text-3xl font-bold text-white">{capital.currentAmount.toLocaleString()} ج</p>
                </div>
                <div>
                  <p className="text-green-200 text-sm mb-2">المستخدم</p>
                  <p className="text-3xl font-bold text-white">
                    {(capital.initialAmount - capital.currentAmount).toLocaleString()} ج
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* نموذج رأس المال */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">
              {capital ? 'تحديث رأس المال' : 'تسجيل رأس المال الأولي'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-white">المبلغ (جنيه) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-white/5 border-white/20 text-white text-xl"
                  placeholder="5000.00"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-white">ملاحظات (اختياري)</Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 text-white rounded-md p-2 min-h-[100px]"
                  placeholder="ملاحظات عن رأس المال..."
                />
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-200 text-sm">
                  💡 <strong>ملاحظة:</strong> رأس المال هو المبلغ الذي تبدأ به نشاطك التجاري. 
                  عند شراء منتجات "من رأس المال"، سيتم خصمها تلقائياً من هذا المبلغ.
                </p>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    {capital ? 'تحديث رأس المال' : 'حفظ رأس المال'}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* إجراءات سريعة */}
        {capital && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Link href="/vendor/purchases/new">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Package className="w-12 h-12 mx-auto text-purple-400 mb-3" />
                  <p className="text-white font-bold">إضافة فاتورة مشتريات</p>
                  <p className="text-gray-400 text-sm mt-1">تسجيل مشتريات جديدة</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/vendor/reports/financial">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto text-blue-400 mb-3" />
                  <p className="text-white font-bold">التقارير المالية</p>
                  <p className="text-gray-400 text-sm mt-1">عرض الأرباح والخسائر</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
