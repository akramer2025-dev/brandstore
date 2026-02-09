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
  Plus,
  Users,
  Edit,
  Trash2,
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';

interface OfflineProduct {
  id: string;
  productName?: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  soldQuantity: number;
  profit: number;
  createdAt: string;
  createdBy: string;
  supplier?: {
    id: string;
    name: string;
    phone: string | null;
  } | null;
}

interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  stats: {
    totalPurchases: number;
    totalPaid: number;
    totalProfit: number;
    pendingAmount: number;
    totalProducts: number;
    lastPaymentDate: string | null;
    remainingQuantity: number;
    remainingCost: number;
    remainingExpectedRevenue: number;
    soldRevenue: number;
  };
}

interface Stats {
  totalCost: number;
  totalRemainingRevenue: number;
  totalSoldRevenue: number;
  totalProfit: number;
  totalQuantity: number;
  totalSoldQuantity: number;
  totalRemainingQuantity: number;
}

export default function OfflineProductsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [offlineProducts, setOfflineProducts] = useState<OfflineProduct[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCost: 0,
    totalRemainingRevenue: 0,
    totalSoldRevenue: 0,
    totalProfit: 0,
    totalQuantity: 0,
    totalSoldQuantity: 0,
    totalRemainingQuantity: 0,
  });
  const [initialCapital, setInitialCapital] = useState(0);
  const [capitalBalance, setCapitalBalance] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [showEditSupplierDialog, setShowEditSupplierDialog] = useState(false);
  const [showEditProductDialog, setShowEditProductDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<OfflineProduct | null>(null);
  const [sellQuantity, setSellQuantity] = useState('');
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'CASH',
    notes: '',
  });

  const [formData, setFormData] = useState({
    purchasePrice: '',
    sellingPrice: '',
    quantity: '1',
    productName: '',
    description: '',
    supplierId: '',
  });

  // Load data
  useEffect(() => {
    fetchData();
    fetchCapital();
    fetchSuppliers();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/vendor/offline-products');
      if (response.ok) {
        const data = await response.json();
        setOfflineProducts(data.offlineProducts || []);
        setStats(data.stats || { 
          totalCost: 0, 
          totalRemainingRevenue: 0, 
          totalSoldRevenue: 0,
          totalProfit: 0, 
          totalQuantity: 0,
          totalSoldQuantity: 0,
          totalRemainingQuantity: 0,
        });
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
        // حفظ رأس المال الأولي عند أول تحميل
        if (initialCapital === 0) {
          setInitialCapital(data.capitalBalance || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching capital:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/vendor/offline-suppliers');
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.suppliers || []);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supplierForm.name.trim()) {
      toast.error('اسم الوسيط مطلوب');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/vendor/offline-suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('تم إضافة الوسيط بنجاح');
        setSupplierForm({ name: '', phone: '', address: '', notes: '' });
        setShowSupplierDialog(false);
        fetchSuppliers();
      } else {
        toast.error(data.error || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handlePaySupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSupplier) return;
    
    const amount = parseFloat(paymentForm.amount);
    if (!amount || amount <= 0) {
      toast.error('المبلغ يجب أن يكون أكبر من صفر');
      return;
    }

    if (amount > selectedSupplier.stats.pendingAmount) {
      toast.error(`المبلغ أكبر من المستحق (${selectedSupplier.stats.pendingAmount.toFixed(2)} ج)`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/vendor/offline-suppliers/${selectedSupplier.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('تم تسجيل الدفع بنجاح');
        setPaymentForm({ amount: '', paymentMethod: 'CASH', notes: '' });
        setShowPaymentDialog(false);
        setSelectedSupplier(null);
        fetchSuppliers();
        fetchData();
      } else {
        toast.error(data.error || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleSellProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;
    
    const quantity = parseInt(sellQuantity);
    if (!quantity || quantity <= 0) {
      toast.error('عدد القطع يجب أن يكون أكبر من صفر');
      return;
    }

    const remainingQuantity = selectedProduct.quantity - selectedProduct.soldQuantity;
    if (quantity > remainingQuantity) {
      toast.error(`العدد المطلوب (${quantity}) أكبر من المتبقي (${remainingQuantity})`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/vendor/offline-products/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          soldQuantity: quantity,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const revenue = data.data.revenue;
        const profit = data.data.profitFromSale;
        toast.success(
          <div>
            <p className="font-bold">تم تسجيل البيع بنجاح! 🎉</p>
            <p className="text-sm">المبلغ: {revenue.toFixed(0)} ج</p>
            <p className="text-sm">الربح: {profit.toFixed(0)} ج</p>
          </div>
        );
        setSellQuantity('');
        setShowSellDialog(false);
        setSelectedProduct(null);
        fetchData();
        fetchCapital();
      } else {
        toast.error(data.error || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate supplier is selected
    if (!formData.supplierId) {
      toast.error('يجب اختيار الوسيط');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/vendor/offline-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('تم إضافة البضاعة بنجاح!');
        setFormData({ purchasePrice: '', sellingPrice: '', quantity: '1', productName: '', description: '', supplierId: '' });
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

  const handleEditSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSupplier) return;
    
    if (!supplierForm.name.trim()) {
      toast.error('اسم الوسيط مطلوب');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/vendor/offline-suppliers/${selectedSupplier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('تم تعديل الوسيط بنجاح');
        setSupplierForm({ name: '', phone: '', address: '', notes: '' });
        setShowEditSupplierDialog(false);
        setSelectedSupplier(null);
        fetchSuppliers();
      } else {
        toast.error(data.error || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    if (!confirm(`هل أنت متأكد من حذف الوسيط "${supplier.name}"؟`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/vendor/offline-suppliers/${supplier.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('تم حذف الوسيط بنجاح');
        fetchSuppliers();
      } else {
        toast.error(data.error || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/vendor/offline-products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('تم تعديل البضاعة بنجاح');
        setFormData({ purchasePrice: '', sellingPrice: '', quantity: '1', productName: '', description: '', supplierId: '' });
        setShowEditProductDialog(false);
        setSelectedProduct(null);
        fetchData();
      } else {
        toast.error(data.error || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (product: OfflineProduct) => {
    if (!confirm(`هل أنت متأكد من حذف هذه البضاعة؟\nسيتم إرجاع ${(product.purchasePrice * product.quantity).toFixed(0)} ج لرأس المال`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/vendor/offline-products/${product.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          <div>
            <p className="font-bold">تم حذف البضاعة بنجاح</p>
            <p className="text-sm">تم إرجاع {data.refundedAmount.toFixed(0)} ج لرأس المال</p>
          </div>
        );
        fetchData();
        fetchCapital();
      } else {
        toast.error(data.error || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('⚠️ هل أنت متأكد من مسح كل البيانات؟\n\nسيتم مسح:\n✓ جميع البضائع\n✓ جميع الوسطاء\n✓ جميع المدفوعات\n\n❗ سيتم إرجاع قيمة البضاعة المتبقية لرأس المال')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/vendor/offline-products/clear', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          <div>
            <p className="font-bold">تم مسح جميع البيانات بنجاح! ✅</p>
            {data.refundedAmount > 0 && (
              <p className="text-sm">تم إرجاع {data.refundedAmount.toFixed(0)} ج لرأس المال</p>
            )}
            <p className="text-sm">رأس المال الجديد: {data.newBalance.toFixed(0)} ج</p>
          </div>
        );
        // إعادة تعيين رأس المال الأولي بعد المسح
        setInitialCapital(data.newBalance);
        fetchData();
        fetchSuppliers();
        fetchCapital();
      } else {
        toast.error(data.error || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال');
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                <Package className="w-8 h-8" />
                بضاعة خارج النظام
              </h1>
              <p className="text-gray-300 mt-2">تسجيل البضاعة المشتراة والمباعة خارج النظام</p>
            </div>
            <Button
              onClick={() => router.push('/vendor/offline-products/reports')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Receipt className="w-4 h-4 ml-2" />
              تقرير شامل
            </Button>
          </div>
        </div>

        {/* Capital Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-200 text-sm font-bold">💰 رأس المال قبل الشراء</p>
                <Wallet className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-3xl font-black text-white">{(capitalBalance + stats.totalCost - stats.totalSoldRevenue).toFixed(0)}</p>
              <p className="text-xs text-blue-300 mt-1">رأس المال الأولي (ثابت)</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-200 text-sm font-bold">💵 رأس المال بعد الشراء</p>
                <Wallet className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-3xl font-black text-white">{capitalBalance.toFixed(0)}</p>
              <p className="text-xs text-purple-300 mt-1">يقل مع كل عملية شراء</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-200 text-sm font-bold">💎 رأس المال المتوقع</p>
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-3xl font-black text-white">{(capitalBalance + stats.totalRemainingRevenue).toFixed(0)}</p>
              <p className="text-xs text-green-300 mt-1">بعد بيع البضاعة المتبقية ({stats.totalRemainingQuantity} قطعة)</p>
            </CardContent>
          </Card>
        </div>

        {/* Clear All Button */}
        {(offlineProducts.length > 0 || suppliers.length > 0) && (
          <div className="mb-6 flex justify-end">
            <Button
              onClick={handleClearAll}
              variant="destructive"
              className="bg-red-600/80 backdrop-blur-lg hover:bg-red-700/90"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              مسح كل شيء والبدء من جديد
            </Button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">التكلفة</p>
                  <p className="text-2xl font-bold text-red-400">{stats.totalCost.toFixed(0)}</p>
                  <p className="text-xs text-red-300">مخصومة من رأس المال</p>
                </div>
                <DollarSign className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">المبيعات المحصلة</p>
                  <p className="text-2xl font-bold text-emerald-400">{stats.totalSoldRevenue.toFixed(0)}</p>
                  <p className="text-xs text-emerald-300">{stats.totalSoldQuantity} قطعة مباعة</p>
                </div>
                <Receipt className="w-8 h-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">المتوقعة</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.totalRemainingRevenue.toFixed(0)}</p>
                  <p className="text-xs text-blue-300">{stats.totalRemainingQuantity} قطعة متبقية</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">الكمية الكلية</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.totalQuantity}</p>
                  <p className="text-xs text-yellow-300">قطعة مشتراة</p>
                </div>
                <Package className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suppliers Section */}
        {suppliers.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                الوسطاء ({suppliers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-bold text-lg">{supplier.name}</h3>
                        {supplier.phone && (
                          <p className="text-gray-400 text-sm">📞 {supplier.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* المدفوعات */}
                    <div className="mb-3 p-2 bg-red-500/10 rounded border border-red-500/30">
                      <p className="text-red-200 text-xs font-bold mb-1">💰 المدفوعات للوسيط:</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">إجمالي المشتريات:</span>
                          <span className="text-white font-bold">{supplier.stats.totalPurchases.toFixed(0)} ج</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">المدفوع:</span>
                          <span className="text-green-400 font-bold">{supplier.stats.totalPaid.toFixed(0)} ج</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">المتبقي للدفع:</span>
                          <span className="text-red-400 font-bold">{supplier.stats.pendingAmount.toFixed(0)} ج</span>
                        </div>
                      </div>
                    </div>

                    {/* البضاعة المتبقية عند الوسيط */}
                    {supplier.stats.remainingQuantity > 0 && (
                      <div className="mb-3 p-2 bg-yellow-500/10 rounded border border-yellow-500/30">
                        <p className="text-yellow-200 text-xs font-bold mb-1">📦 البضاعة عند الوسيط:</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">عدد القطع المتبقية:</span>
                            <span className="text-white font-bold">{supplier.stats.remainingQuantity} قطعة</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">قيمتها الأصلية:</span>
                            <span className="text-orange-400 font-bold">{supplier.stats.remainingCost.toFixed(0)} ج</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">لو اتباعت هتبقى:</span>
                            <span className="text-green-400 font-bold">{supplier.stats.remainingExpectedRevenue.toFixed(0)} ج</span>
                          </div>
                          <div className="flex justify-between mt-1 pt-1 border-t border-yellow-500/30">
                            <span className="text-yellow-300">ليكي عنده:</span>
                            <span className="text-yellow-400 font-bold">{supplier.stats.remainingCost.toFixed(0)} ج بضاعة</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* المبالغ المستحقة من الوسيط */}
                    {supplier.stats.soldRevenue > 0 && (
                      <div className="mb-3 p-2 bg-yellow-500/10 rounded border border-yellow-500/30">
                        <p className="text-yellow-200 text-xs font-bold mb-1">💰 المبلغ المستحق من الوسيط:</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">باع بضاعة بمبلغ:</span>
                            <span className="text-yellow-400 font-bold">{supplier.stats.soldRevenue.toFixed(0)} ج</span>
                          </div>
                          <div className="flex justify-between mt-1 pt-1 border-t border-yellow-500/30">
                            <span className="text-yellow-300 font-bold">الوسيط مديون ليكي:</span>
                            <span className="text-red-400 font-black text-sm">{supplier.stats.soldRevenue.toFixed(0)} ج</span>
                          </div>
                          <p className="text-yellow-300 text-[10px] mt-1">⚠️ لازم يدفعها ليكي</p>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mb-3">
                      عدد المنتجات: {supplier.stats.totalProducts}
                    </div>

                    <div className="flex gap-2">
                      {supplier.stats.pendingAmount > 0 && (
                        <Button
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setShowPaymentDialog(true);
                          }}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-sm"
                        >
                          <DollarSign className="w-4 h-4 ml-1" />
                          دفع
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          setSelectedSupplier(supplier);
                          setSupplierForm({
                            name: supplier.name,
                            phone: supplier.phone || '',
                            address: supplier.address || '',
                            notes: supplier.notes || '',
                          });
                          setShowEditSupplierDialog(true);
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteSupplier(supplier)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Add Form */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
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
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="supplierId" className="text-white">
                      الوسيط *
                    </Label>
                    <Button
                      type="button"
                      onClick={() => setShowSupplierDialog(true)}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-xs"
                    >
                      <Plus className="w-3 h-3 ml-1" />
                      وسيط جديد
                    </Button>
                  </div>
                  <select
                    id="supplierId"
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="" className="bg-gray-800">اختر الوسيط</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id} className="bg-gray-800">
                        {supplier.name} {supplier.stats.pendingAmount > 0 && `(مستحق: ${supplier.stats.pendingAmount.toFixed(0)} ج)`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="productName" className="text-white">
                    اسم المنتج (اختياري)
                  </Label>
                  <Input
                    id="productName"
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="مثال: بيجامات أطفال"
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

                {/* Quantity Summary */}
                {formData.quantity && parseInt(formData.quantity) > 0 && (
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <p className="text-blue-200 text-sm mb-2 font-bold">ملخص القطع:</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-blue-500/20 rounded">
                        <p className="text-blue-400 text-[10px] mb-1">القطع المشتراة</p>
                        <p className="text-white font-bold text-lg">{parseInt(formData.quantity)}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-700/50 rounded">
                        <p className="text-gray-400 text-[10px] mb-1">القطع المباعة</p>
                        <p className="text-white font-bold text-lg">0</p>
                      </div>
                      <div className="text-center p-2 bg-yellow-500/20 rounded border border-yellow-500/30">
                        <p className="text-yellow-400 text-[10px] mb-1">القطع المتبقية</p>
                        <p className="text-white font-bold text-lg">{parseInt(formData.quantity)}</p>
                      </div>
                    </div>
                  </div>
                )}

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
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg">
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
                  {offlineProducts.map((product) => {
                    const remainingQuantity = product.quantity - product.soldQuantity;
                    const soldPercentage = (product.soldQuantity / product.quantity) * 100;
                    return (
                    <div
                      key={product.id}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {product.productName || product.description || 'بضاعة'}
                          </p>
                          {product.supplier && (
                            <p className="text-xs text-purple-400 mt-1">
                              📦 {product.supplier.name}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(product.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">التقدم</span>
                          <span className="text-white">{soldPercentage.toFixed(0)}% مباع</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all"
                            style={{ width: `${soldPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Quantity Info */}
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="text-center p-2 bg-blue-500/10 rounded border border-blue-500/30">
                          <p className="text-blue-400 text-[10px] mb-1">القطع المشتراة</p>
                          <p className="text-white font-bold text-lg">{product.quantity}</p>
                        </div>
                        <div className="text-center p-2 bg-green-500/10 rounded border border-green-500/30">
                          <p className="text-green-400 text-[10px] mb-1">القطع المباعة</p>
                          <p className="text-white font-bold text-lg">{product.soldQuantity}</p>
                        </div>
                        <div className="text-center p-2 bg-yellow-500/10 rounded border border-yellow-500/30">
                          <p className="text-yellow-400 text-[10px] mb-1">القطع المتبقية</p>
                          <p className="text-white font-bold text-lg">{remainingQuantity}</p>
                        </div>
                      </div>

                      {/* Price Info */}
                      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-400">سعر الشراء/قطعة:</span>
                            <span className="text-red-300">{product.purchasePrice.toFixed(0)} ج</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">سعر البيع/قطعة:</span>
                            <span className="text-green-300">{product.sellingPrice.toFixed(0)} ج</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-400">إجمالي التكلفة:</span>
                            <span className="text-red-400 font-bold">{(product.purchasePrice * product.quantity).toFixed(0)} ج</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">الربح المتوقع:</span>
                            <span className="text-green-400 font-bold">{product.profit.toFixed(0)} ج</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {remainingQuantity > 0 ? (
                          <>
                            <Button
                              onClick={() => {
                                setSelectedProduct(product);
                                setSellQuantity('');
                                setShowSellDialog(true);
                              }}
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                            >
                              <DollarSign className="w-4 h-4 ml-1" />
                              بيع
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedProduct(product);
                                setFormData({
                                  purchasePrice: product.purchasePrice.toString(),
                                  sellingPrice: product.sellingPrice.toString(),
                                  quantity: product.quantity.toString(),
                                  productName: product.productName || '',
                                  description: product.description || '',
                                  supplierId: product.supplier?.id || '',
                                });
                                setShowEditProductDialog(true);
                              }}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteProduct(product)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <div className="flex-1 text-center py-2 bg-gray-700/50 rounded text-gray-400 text-sm">
                            ✓ تم البيع بالكامل
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-2">بواسطة: {product.createdBy}</p>
                    </div>
                  )})}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add Supplier Dialog */}
        {showSupplierDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-gray-900 border-purple-500/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    إضافة وسيط جديد
                  </span>
                  <Button
                    type="button"
                    onClick={() => setShowSupplierDialog(false)}
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSupplier} className="space-y-4">
                  <div>
                    <Label htmlFor="supplierName" className="text-white">
                      اسم الوسيط *
                    </Label>
                    <Input
                      id="supplierName"
                      value={supplierForm.name}
                      onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="مثال: محل أبو أحمد"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="supplierPhone" className="text-white">
                      رقم التليفون
                    </Label>
                    <Input
                      id="supplierPhone"
                      type="tel"
                      value={supplierForm.phone}
                      onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="01xxxxxxxxx"
                    />
                  </div>

                  <div>
                    <Label htmlFor="supplierAddress" className="text-white">
                      العنوان
                    </Label>
                    <Input
                      id="supplierAddress"
                      value={supplierForm.address}
                      onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="مثال: سوق الجملة - شارع الملك فيصل"
                    />
                  </div>

                  <div>
                    <Label htmlFor="supplierNotes" className="text-white">
                      ملاحظات
                    </Label>
                    <Textarea
                      id="supplierNotes"
                      value={supplierForm.notes}
                      onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="ملاحظات إضافية..."
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => setShowSupplierDialog(false)}
                      variant="outline"
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          إضافة...
                        </>
                      ) : (
                        'إضافة الوسيط'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payment Dialog */}
        {showPaymentDialog && selectedSupplier && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-gray-900 border-green-500/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    دفع للوسيط: {selectedSupplier.name}
                  </span>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowPaymentDialog(false);
                      setSelectedSupplier(null);
                      setPaymentForm({ amount: '', paymentMethod: 'CASH', notes: '' });
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
                <div className="mb-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                  <p className="text-red-200 text-sm">المبلغ المستحق:</p>
                  <p className="text-red-100 text-2xl font-bold">
                    {selectedSupplier.stats.pendingAmount.toFixed(2)} ج
                  </p>
                  <p className="text-xs text-red-300 mt-1">
                    المدفوع: {selectedSupplier.stats.totalPaid.toFixed(0)} ج من أصل {selectedSupplier.stats.totalPurchases.toFixed(0)} ج
                  </p>
                </div>

                <form onSubmit={handlePaySupplier} className="space-y-4">
                  <div>
                    <Label htmlFor="paymentAmount" className="text-white">
                      المبلغ المدفوع *
                    </Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      step="0.01"
                      max={selectedSupplier.stats.pendingAmount}
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="paymentMethod" className="text-white">
                      طريقة الدفع
                    </Label>
                    <select
                      id="paymentMethod"
                      value={paymentForm.paymentMethod}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                      className="w-full bg-white/5 border border-white/20 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="CASH" className="bg-gray-800">كاش</option>
                      <option value="BANK_TRANSFER" className="bg-gray-800">تحويل بنكي</option>
                      <option value="VODAFONE_CASH" className="bg-gray-800">فودافون كاش</option>
                      <option value="INSTAPAY" className="bg-gray-800">انستاباي</option>
                      <option value="OTHER" className="bg-gray-800">أخرى</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="paymentNotes" className="text-white">
                      ملاحظات
                    </Label>
                    <Textarea
                      id="paymentNotes"
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="ملاحظات اختيارية..."
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowPaymentDialog(false);
                        setSelectedSupplier(null);
                        setPaymentForm({ amount: '', paymentMethod: 'CASH', notes: '' });
                      }}
                      variant="outline"
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          جاري الدفع...
                        </>
                      ) : (
                        'تأكيد الدفع'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sell Dialog */}
        {showSellDialog && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-gray-900 border-green-500/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    تسجيل بيع قطع
                  </span>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowSellDialog(false);
                      setSelectedProduct(null);
                      setSellQuantity('');
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
                <div className="mb-4 space-y-3">
                  <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <p className="text-blue-200 text-sm mb-1">البضاعة:</p>
                    <p className="text-white font-bold">
                      {selectedProduct.productName || selectedProduct.description || 'بضاعة'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-white/5 rounded text-center">
                      <p className="text-gray-400 text-xs">المشتراة</p>
                      <p className="text-white font-bold text-lg">{selectedProduct.quantity}</p>
                    </div>
                    <div className="p-2 bg-green-500/20 rounded text-center border border-green-500/30">
                      <p className="text-green-400 text-xs">المباعة</p>
                      <p className="text-white font-bold text-lg">{selectedProduct.soldQuantity}</p>
                    </div>
                    <div className="p-2 bg-yellow-500/20 rounded text-center border border-yellow-500/30">
                      <p className="text-yellow-400 text-xs">المتبقية</p>
                      <p className="text-white font-bold text-lg">
                        {selectedProduct.quantity - selectedProduct.soldQuantity}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-white/5 rounded">
                      <p className="text-gray-400 text-xs">سعر البيع/قطعة</p>
                      <p className="text-green-300 font-bold">{selectedProduct.sellingPrice.toFixed(0)} ج</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded">
                      <p className="text-gray-400 text-xs">الربح/قطعة</p>
                      <p className="text-emerald-300 font-bold">
                        {(selectedProduct.sellingPrice - selectedProduct.purchasePrice).toFixed(0)} ج
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSellProduct} className="space-y-4">
                  <div>
                    <Label htmlFor="sellQuantity" className="text-white">
                      عدد القطع المباعة *
                    </Label>
                    <Input
                      id="sellQuantity"
                      type="number"
                      min="1"
                      max={selectedProduct.quantity - selectedProduct.soldQuantity}
                      value={sellQuantity}
                      onChange={(e) => setSellQuantity(e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="1"
                      required
                      autoFocus
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      الحد الأقصى: {selectedProduct.quantity - selectedProduct.soldQuantity}
                    </p>
                  </div>

                  {sellQuantity && parseInt(sellQuantity) > 0 && parseInt(sellQuantity) <= (selectedProduct.quantity - selectedProduct.soldQuantity) && (
                    <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                      <p className="text-green-200 text-sm mb-2">ملخص البيع:</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">المبلغ الإجمالي:</span>
                          <span className="text-white font-bold">
                            {(selectedProduct.sellingPrice * parseInt(sellQuantity)).toFixed(0)} ج
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">الربح المتوقع:</span>
                          <span className="text-green-300 font-bold">
                            {((selectedProduct.sellingPrice - selectedProduct.purchasePrice) * parseInt(sellQuantity)).toFixed(0)} ج
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowSellDialog(false);
                        setSelectedProduct(null);;
                        setSellQuantity('');
                      }}
                      variant="outline"
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          جاري التسجيل...
                        </>
                      ) : (
                        'تأكيد البيع'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Supplier Dialog */}
        {showEditSupplierDialog && selectedSupplier && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-gray-900 border-blue-500/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    تعديل وسيط: {selectedSupplier.name}
                  </span>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowEditSupplierDialog(false);
                      setSelectedSupplier(null);
                      setSupplierForm({ name: '', phone: '', address: '', notes: '' });
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
                <form onSubmit={handleEditSupplier} className="space-y-4">
                  <div>
                    <Label htmlFor="editSupplierName" className="text-white">
                      اسم الوسيط *
                    </Label>
                    <Input
                      id="editSupplierName"
                      value={supplierForm.name}
                      onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="editSupplierPhone" className="text-white">
                      رقم التليفون
                    </Label>
                    <Input
                      id="editSupplierPhone"
                      type="tel"
                      value={supplierForm.phone}
                      onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editSupplierAddress" className="text-white">
                      العنوان
                    </Label>
                    <Input
                      id="editSupplierAddress"
                      value={supplierForm.address}
                      onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editSupplierNotes" className="text-white">
                      ملاحظات
                    </Label>
                    <Textarea
                      id="editSupplierNotes"
                      value={supplierForm.notes}
                      onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowEditSupplierDialog(false);
                        setSelectedSupplier(null);
                        setSupplierForm({ name: '', phone: '', address: '', notes: '' });
                      }}
                      variant="outline"
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        'حفظ التعديلات'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Product Dialog */}
        {showEditProductDialog && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-gray-900 border-blue-500/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    تعديل بضاعة
                  </span>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowEditProductDialog(false);
                      setSelectedProduct(null);
                      setFormData({ purchasePrice: '', sellingPrice: '', quantity: '1', productName: '', description: '', supplierId: '' });
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
                <form onSubmit={handleEditProduct} className="space-y-4">
                  <div>
                    <Label htmlFor="editPurchasePrice" className="text-white">
                      سعر الشراء (للوحدة) *
                    </Label>
                    <Input
                      id="editPurchasePrice"
                      type="number"
                      step="0.01"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="editSellingPrice" className="text-white">
                      سعر البيع (للوحدة) *
                    </Label>
                    <Input
                      id="editSellingPrice"
                      type="number"
                      step="0.01"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="editQuantity" className="text-white">
                      الكمية *
                    </Label>
                    <Input
                      id="editQuantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="editSupplierId" className="text-white">
                      الوسيط *
                    </Label>
                    <select
                      id="editSupplierId"
                      value={formData.supplierId}
                      onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                      className="w-full bg-white/5 border border-white/20 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="" className="bg-gray-800">اختر الوسيط</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id} className="bg-gray-800">
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="editProductName" className="text-white">
                      اسم المنتج (اختياري)
                    </Label>
                    <Input
                      id="editProductName"
                      type="text"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="مثال: بيجامات أطفال"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editDescription" className="text-white">
                      وصف
                    </Label>
                    <Textarea
                      id="editDescription"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowEditProductDialog(false);
                        setSelectedProduct(null);
                        setFormData({ purchasePrice: '', sellingPrice: '', quantity: '1', productName: '', description: '', supplierId: '' });
                      }}
                      variant="outline"
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        'حفظ التعديلات'
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

