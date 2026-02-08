'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  DollarSign,
  Receipt,
  Loader2,
  Plus,
  TrendingDown,
  Calendar,
  User,
  Wallet,
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  notes: string | null;
  createdBy: string;
  createdAt: string;
}

interface Stats {
  total: number;
  count: number;
}

export default function ExpensesPage() {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, count: 0 });
  const [capitalBalance, setCapitalBalance] = useState(0);
  const [showDialog, setShowDialog] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    category: 'OFFICE',
    description: '',
    notes: '',
  });

  const categories = [
    { value: 'RENT', label: 'إيجار' },
    { value: 'UTILITIES', label: 'مرافق (كهرباء، مياه، إلخ)' },
    { value: 'SALARIES', label: 'رواتب وأجور' },
    { value: 'MARKETING', label: 'تسويق وإعلانات' },
    { value: 'SHIPPING', label: 'شحن وتوصيل' },
    { value: 'SUPPLIES', label: 'مستلزمات' },
    { value: 'MAINTENANCE', label: 'صيانة' },
    { value: 'PHONE_INTERNET', label: 'هاتف وإنترنت' },
    { value: 'OFFICE', label: 'مكتبية' },
    { value: 'TRANSPORTATION', label: 'مواصلات' },
    { value: 'MEALS', label: 'وجبات' },
    { value: 'OTHER', label: 'أخرى' },
  ];

  useEffect(() => {
    fetchData();
    fetchCapital();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/vendor/expenses');
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
        setStats(data.stats || { total: 0, count: 0 });
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchCapital = async () => {
    try {
      const response = await fetch('/api/vendor/capital');
      if (response.ok) {
        const data = await response.json();
        setCapitalBalance(data.capitalBalance || 0);
      }
    } catch (error) {
      console.error('Error fetching capital:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/vendor/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('تم تسجيل المصروف بنجاح');
        setFormData({ amount: '', category: 'OFFICE', description: '', notes: '' });
        setShowDialog(false);
        fetchData();
        fetchCapital();
      } else {
        toast.error(data.error || 'فشل تسجيل المصروف');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ أثناء تسجيل المصروف');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <BackButton />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Receipt className="w-8 h-8" />
            المصروفات
          </h1>
          <p className="text-gray-300 mt-2">تسجيل ومتابعة جميع المصروفات</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">رأس المال</p>
                  <p className="text-2xl font-bold text-green-400">{capitalBalance.toFixed(0)}</p>
                  <p className="text-xs text-gray-400">جنيه</p>
                </div>
                <Wallet className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">إجمالي المصروفات</p>
                  <p className="text-2xl font-bold text-red-400">{stats.total.toFixed(0)}</p>
                  <p className="text-xs text-gray-400">جنيه</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">عدد المصروفات</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.count}</p>
                  <p className="text-xs text-gray-400">عملية</p>
                </div>
                <Receipt className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowDialog(true)}
            className="w-full md:w-auto bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة مصروف جديد
          </Button>
        </div>

        {/* Expenses List */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              سجل المصروفات ({expenses.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            {expenses.length === 0 ? (
              <p className="text-gray-400 text-center py-8">لا توجد مصروفات مسجلة</p>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => {
                  const categoryLabel = categories.find(c => c.value === expense.category)?.label || expense.category;
                  
                  return (
                    <div
                      key={expense.id}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
                              {categoryLabel}
                            </span>
                          </div>
                          <p className="text-white font-medium">{expense.description}</p>
                          {expense.notes && (
                            <p className="text-gray-400 text-sm mt-1">{expense.notes}</p>
                          )}
                        </div>
                        <div className="text-left ml-4">
                          <p className="text-red-400 font-bold text-lg">
                            {expense.amount.toFixed(0)} ج
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(expense.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {expense.createdBy}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Dialog */}
        {showDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-gray-900 border-red-500/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    تسجيل مصروف جديد
                  </span>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowDialog(false);
                      setFormData({ amount: '', category: 'OFFICE', description: '', notes: '' });
                    }}
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="amount" className="text-white">
                      المبلغ *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="100.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-white">
                      نوع المصروف *
                    </Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-white/5 border border-white/20 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value} className="bg-gray-800">
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">
                      الوصف *
                    </Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="مثال: فاتورة كهرباء شهر يناير"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-white">
                      ملاحظات (اختياري)
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="ملاحظات إضافية..."
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowDialog(false);
                        setFormData({ amount: '', category: 'OFFICE', description: '', notes: '' });
                      }}
                      variant="outline"
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        'حفظ المصروف'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
