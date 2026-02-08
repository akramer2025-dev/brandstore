'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Package,
  DollarSign,
  TrendingUp,
  Loader2,
  Receipt,
  Wallet,
  ArrowLeft,
  Calculator,
  Plus
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';

interface OfflineProduct {
  id: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  profit: number;
  createdAt: string;
  createdBy: string;
}

interface Stats {
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  totalQuantity: number;
}

export default function OfflineProductsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [offlineProducts, setOfflineProducts] = useState<OfflineProduct[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCost: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalQuantity: 0,
  });
  const [capitalBalance, setCapitalBalance] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  const [formData, setFormData] = useState({
    purchasePrice: '',
    sellingPrice: '',
    quantity: '1',
    description: '',
  });

  // Load data
  useEffect(() => {
    fetchData();
    fetchCapital();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/vendor/offline-products');
      if (response.ok) {
        const data = await response.json();
        setOfflineProducts(data.offlineProducts || []);
        setStats(data.stats || { totalCost: 0, totalRevenue: 0, totalProfit: 0, totalQuantity: 0 });
        setHasPermission(true);
      } else if (response.status === 403) {
        setHasPermission(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
      const response = await fetch('/api/vendor/offline-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('تم إضافة البضاعة بنجاح!');
        setFormData({ purchasePrice: '', sellingPrice: '', quantity: '1', description: '' });
        fetchData();
        fetchCapital();
      } else {
        toast.error(data.error || 'فشل إضافة البضاعة');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ أثناء إضافة البضاعة');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfit = () => {
    const purchase = parseFloat(formData.purchasePrice) || 0;
    const selling = parseFloat(formData.sellingPrice) || 0;
    const qty = parseInt(formData.quantity) || 1;
    return (selling - purchase) * qty;
  };

  const calculateTotalCost = () => {
    const purchase = parseFloat(formData.purchasePrice) || 0;
    const qty = parseInt(formData.quantity) || 1;
    return purchase * qty;
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
        <div className="max-w-2xl mx-auto">
          <BackButton fallbackUrl="/vendor/dashboard" className="mb-4" />
          <Card className="bg-white/10 backdrop-blur-lg border-red-500/30">
            <CardHeader>
              <CardTitle className="text-white">⛔ غير مصرح</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                عذراً، ليس لديك صلاحية إضافة بضاعة خارج النظام. يرجى التواصل مع الإدارة لتفعيل هذه الخاصية.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <BackButton fallbackUrl="/vendor/dashboard" className="mb-3" />
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Package className="w-8 h-8" />
            بضاعة خارج النظام
          </h1>
          <p className="text-gray-300 mt-2">تسجيل البضاعة المشتراة والمباعة خارج النظام</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">رأس المال</p>
                  <p className="text-2xl font-bold text-white">{capitalBalance.toFixed(0)}</p>
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
                  <p className="text-gray-300 text-sm">التكلفة</p>
                  <p className="text-2xl font-bold text-red-400">{stats.totalCost.toFixed(0)}</p>
                  <p className="text-xs text-gray-400">جنيه</p>
                </div>
                <DollarSign className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">المبيعات</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.totalRevenue.toFixed(0)}</p>
                  <p className="text-xs text-gray-400">جنيه</p>
                </div>
                <Receipt className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">الربح</p>
                  <p className="text-2xl font-bold text-green-400">{stats.totalProfit.toFixed(0)}</p>
                  <p className="text-xs text-gray-400">جنيه</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">الكمية</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.totalQuantity}</p>
                  <p className="text-xs text-gray-400">وحدة</p>
                </div>
                <Package className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Add Form */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-5 h-5" />
                إضافة بضاعة جديدة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="purchasePrice" className="text-white">
                    سعر الشراء (للوحدة) *
                  </Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="100.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sellingPrice" className="text-white">
                    سعر البيع (للوحدة) *
                  </Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="150.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="quantity" className="text-white">
                    الكمية *
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-white">
                    وصف اختياري
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="مثال: بيجامات أطفال - 5 قطع"
                    rows={2}
                  />
                </div>

                {/* Profit Calculator */}
                {formData.purchasePrice && formData.sellingPrice && (
                  <div className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="w-5 h-5 text-green-400" />
                      <span className="text-white font-bold">حساب الربح:</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <p className="text-gray-300">التكلفة</p>
                        <p className="text-red-400 font-bold">{calculateTotalCost().toFixed(2)} ج</p>
                      </div>
                      <div>
                        <p className="text-gray-300">المبيعات</p>
                        <p className="text-blue-400 font-bold">
                          {((parseFloat(formData.sellingPrice) || 0) * (parseInt(formData.quantity) || 1)).toFixed(2)} ج
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300">الربح</p>
                        <p className="text-green-400 font-bold text-lg">{calculateProfit().toFixed(2)} ج</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري الإضافة...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      إضافة البضاعة
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Products List */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                السجل ({offlineProducts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {offlineProducts.length === 0 ? (
                <p className="text-gray-400 text-center py-8">لا توجد بضائع مسجلة</p>
              ) : (
                <div className="space-y-3">
                  {offlineProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-white font-medium">
                          {product.description || 'بضاعة'}
                        </p>
                        <span className="text-xs text-gray-400">
                          {new Date(product.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-gray-400">الكمية</p>
                          <p className="text-white font-bold">{product.quantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">التكلفة</p>
                          <p className="text-red-400 font-bold">
                            {(product.purchasePrice * product.quantity).toFixed(0)} ج
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">الربح</p>
                          <p className="text-green-400 font-bold">{product.profit.toFixed(0)} ج</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">بواسطة: {product.createdBy}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
