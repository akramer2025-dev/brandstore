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
  };
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
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
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
      toast.error('اسم المورد مطلوب');
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
        toast.success('تم إضافة المورد بنجاح');
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
        setFormData({ purchasePrice: '', sellingPrice: '', quantity: '1', description: '', supplierId: '' });
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

        {/* Suppliers Section */}
        {suppliers.length > 0 && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                الموردين ({suppliers.length})
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

                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">إجمالي المشتريات:</span>
                        <span className="text-white font-bold">{supplier.stats.totalPurchases.toFixed(0)} ج</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">المدفوع:</span>
                        <span className="text-green-400 font-bold">{supplier.stats.totalPaid.toFixed(0)} ج</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">المتبقي:</span>
                        <span className="text-red-400 font-bold">{supplier.stats.pendingAmount.toFixed(0)} ج</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">عدد المنتجات:</span>
                        <span className="text-white font-bold">{supplier.stats.totalProducts}</span>
                      </div>
                    </div>

                    {supplier.stats.pendingAmount > 0 && (
                      <Button
                        onClick={() => {
                          setSelectedSupplier(supplier);
                          setShowPaymentDialog(true);
                        }}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-sm"
                      >
                        <DollarSign className="w-4 h-4 ml-2" />
                        دفع للمورد
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="supplierId" className="text-white">
                      المورد (اختياري)
                    </Label>
                    <Button
                      type="button"
                      onClick={() => setShowSupplierDialog(true)}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-xs"
                    >
                      <Plus className="w-3 h-3 ml-1" />
                      مورد جديد
                    </Button>
                  </div>
                  <select
                    id="supplierId"
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="" className="bg-gray-800">بدون مورد</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id} className="bg-gray-800">
                        {supplier.name} {supplier.stats.pendingAmount > 0 && `(مستحق: ${supplier.stats.pendingAmount.toFixed(0)} ج)`}
                      </option>
                    ))}
                  </select>
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
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {product.description || 'بضاعة'}
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

        {/* Add Supplier Dialog */}
        {showSupplierDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-gray-900 border-purple-500/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    إضافة مورد جديد
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
                      اسم المورد *
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
                        'إضافة المورد'
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
                    دفع للمورد: {selectedSupplier.name}
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
      </div>
    </div>
  );
}
