'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2, ShoppingCart, DollarSign, Loader2, Package, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/BackButton';

interface PurchaseItem {
  id: string;
  productName: string;
  productNameAr: string;
  categoryId: string;
  color: string;
  size: string; // S, M, L, XL, XXL
  imageUrl: string;
  quantity: number;
  purchasePrice: number; // سعر الشراء
  sellingPrice: number; // سعر البيع
  fromCapital: boolean; // من رأس المال أو بالنيابة
  commissionFromStore: boolean; // هل يحسب عمولة المتجر 5% (ثابتة)
}

export default function NewPurchasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [capital, setCapital] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [supplier, setSupplier] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [tripExpense, setTripExpense] = useState('0'); // مصاريف المشوار
  const [notes, setNotes] = useState('');

  useEffect(() => {
    checkCapital();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const checkCapital = async () => {
    try {
      const response = await fetch('/api/vendor/capital');
      if (response.ok) {
        const data = await response.json();
        if (!data.capital) {
          if (confirm('يجب تسجيل رأس المال أولاً. هل تريد الذهاب لصفحة رأس المال؟')) {
            router.push('/vendor/capital');
            return;
          }
        }
        setCapital(data.capital);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      productName: '',
      productNameAr: '',
      categoryId: '',
      color: '',
      size: 'M',
      imageUrl: '',
      quantity: 1,
      purchasePrice: 0,
      sellingPrice: 0,
      fromCapital: true,
      commissionFromStore: true, // ثابتة 5%
    }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof PurchaseItem, value: any) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // حساب الإجماليات
  const totalPurchasePrice = items.reduce((sum, item) => 
    sum + (item.quantity * item.purchasePrice), 0
  );

  const totalFromCapital = items
    .filter(item => item.fromCapital)
    .reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);

  const totalOnBehalf = totalPurchasePrice - totalFromCapital;

  const totalSellingPrice = items.reduce((sum, item) => 
    sum + (item.quantity * item.sellingPrice), 0
  );

  const expectedProfit = items.reduce((sum, item) => {
    const itemProfit = (item.sellingPrice - item.purchasePrice) * item.quantity;
    const commission = item.sellingPrice * STORE_COMMISSION_RATE * item.quantity;
    return sum + itemProfit - commission;
  }, 0);

  // العمولة ثابتة 5% من المتجر على كل منتج
  const STORE_COMMISSION_RATE = 0.05;
  const totalCommission = items.reduce((sum, item) => 
    sum + (item.sellingPrice * STORE_COMMISSION_RATE * item.quantity), 0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('يرجى إضافة منتج واحد على الأقل');
      return;
    }

    // التحقق من الحقول المطلوبة
    for (const item of items) {
      if (!item.productNameAr || item.quantity <= 0 || item.purchasePrice <= 0 || item.sellingPrice <= 0) {
        alert('يرجى ملء جميع بيانات المنتجات بشكل صحيح');
        return;
      }
    }

    // التحقق من رأس المال الكافي
    if (totalFromCapital > 0 && capital && totalFromCapital + parseFloat(tripExpense) > capital.currentAmount) {
      if (!confirm(`رأس المال المتبقي (${capital.currentAmount} ج) غير كافٍ. المطلوب: ${(totalFromCapital + parseFloat(tripExpense)).toFixed(2)} ج. هل تريد المتابعة؟`)) {
        return;
      }
    }

    setSaving(true);

    try {
      const response = await fetch('/api/vendor/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier,
          supplierPhone,
          tripExpense: parseFloat(tripExpense),
          notes,
          items: items.map(item => ({
            productName: item.productName || item.productNameAr,
            productNameAr: item.productNameAr,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            sellingPrice: item.sellingPrice,
            fromCapital: item.fromCapital,
            commissionFromStore: item.commissionFromStore,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ تم تسجيل الفاتورة بنجاح!\n\nرقم الفاتورة: ${data.purchase.receiptNumber}\nإجمالي المشتريات: ${totalPurchasePrice.toFixed(2)} ج\nمن رأس المال: ${totalFromCapital.toFixed(2)} ج\nمصاريف المشوار: ${tripExpense} ج`);
        router.push('/vendor/purchases');
      } else {
        const error = await response.json();
        alert(error.error || 'فشل حفظ الفاتورة');
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <BackButton fallbackUrl="/vendor/purchases" />
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-purple-400" />
              فاتورة مشتريات جديدة
            </h1>
            <p className="text-gray-400 mt-1">تسجيل مشتريات جديدة مع تفاصيل الأسعار</p>
          </div>
        </div>

        {/* معلومات رأس المال */}
        {capital && (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-green-200 text-sm">رأس المال</p>
                  <p className="text-xl font-bold text-white">{capital.initialAmount.toLocaleString()} ج</p>
                </div>
                <div>
                  <p className="text-green-200 text-sm">المتبقي</p>
                  <p className="text-xl font-bold text-white">{capital.currentAmount.toLocaleString()} ج</p>
                </div>
                <div>
                  <p className="text-yellow-200 text-sm">هيُخصم من رأس المال</p>
                  <p className="text-xl font-bold text-yellow-400">{(totalFromCapital + parseFloat(tripExpense)).toFixed(2)} ج</p>
                </div>
                <div>
                  <p className="text-blue-200 text-sm">المتبقي بعد الشراء</p>
                  <p className="text-xl font-bold text-blue-400">
                    {(capital.currentAmount - totalFromCapital - parseFloat(tripExpense)).toFixed(2)} ج
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          {/* بيانات المورد */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="text-white">بيانات المورد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier" className="text-white">اسم المورد</Label>
                  <Input
                    id="supplier"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="اسم المورد أو المحل"
                  />
                </div>
                <div>
                  <Label htmlFor="supplierPhone" className="text-white">رقم الهاتف</Label>
                  <Input
                    id="supplierPhone"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="01xxxxxxxxx"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tripExpense" className="text-white">مصاريف المشوار (مواصلات/نقل)</Label>
                <Input
                  id="tripExpense"
                  type="number"
                  step="0.01"
                  value={tripExpense}
                  onChange={(e) => setTripExpense(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-400 mt-1">إذا لم يكن هناك مصاريف، اترك القيمة صفر</p>
              </div>
            </CardContent>
          </Card>

          {/* المنتجات */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  المنتجات ({items.length})
                </CardTitle>
                <Button
                  type="button"
                  onClick={addItem}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة منتج
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">لا توجد منتجات. اضغط "إضافة منتج" للبدء</p>
                </div>
              ) : (
                items.map((item, index) => (
                  <Card key={item.id} className="bg-white/5 backdrop-blur-sm border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-4">
                          {/* رقم المنتج */}
                          <div className="flex items-center justify-between">
                            <h3 className="text-white font-bold">منتج #{index + 1}</h3>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* الاسم والفئة */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-white">اسم المنتج *</Label>
                              <Input
                                value={item.productNameAr}
                                onChange={(e) => updateItem(item.id, 'productNameAr', e.target.value)}
                                className="bg-white/5 border-white/20 text-white"
                                placeholder="مثال: بلوزة"
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-white">الفئة *</Label>
                              <select
                                value={item.categoryId}
                                onChange={(e) => updateItem(item.id, 'categoryId', e.target.value)}
                                className="w-full bg-white/5 border border-white/20 text-white rounded-md p-2"
                                required
                              >
                                <option value="" className="bg-gray-800">اختر الفئة</option>
                                {categories.map((cat) => (
                                  <option key={cat.id} value={cat.id} className="bg-gray-800">
                                    {cat.nameAr}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* اللون والحجم */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-white">اللون *</Label>
                              <Input
                                value={item.color}
                                onChange={(e) => updateItem(item.id, 'color', e.target.value)}
                                className="bg-white/5 border-white/20 text-white"
                                placeholder="مثال: أزرق"
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-white">الحجم *</Label>
                              <select
                                value={item.size}
                                onChange={(e) => updateItem(item.id, 'size', e.target.value)}
                                className="w-full bg-white/5 border border-white/20 text-white rounded-md p-2"
                                required
                              >
                                <option value="S" className="bg-gray-800">S - صغير</option>
                                <option value="M" className="bg-gray-800">M - وسط</option>
                                <option value="L" className="bg-gray-800">L - كبير</option>
                                <option value="XL" className="bg-gray-800">XL - كبير جداً</option>
                                <option value="XXL" className="bg-gray-800">XXL - كبير جداً جداً</option>
                              </select>
                            </div>
                          </div>

                          {/* رابط الصورة */}
                          <div>
                            <Label className="text-white">رابط الصورة</Label>
                            <Input
                              value={item.imageUrl}
                              onChange={(e) => updateItem(item.id, 'imageUrl', e.target.value)}
                              className="bg-white/5 border-white/20 text-white"
                              placeholder="https://example.com/image.jpg"
                            />
                            {item.imageUrl && (
                              <div className="mt-2">
                                <img 
                                  src={item.imageUrl} 
                                  alt="معاينة" 
                                  className="h-20 w-20 object-cover rounded border border-white/20"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          {/* الكمية والأسعار */}
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label className="text-white">الكمية *</Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                className="bg-white/5 border-white/20 text-white"
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-white">سعر الشراء *</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.purchasePrice}
                                onChange={(e) => updateItem(item.id, 'purchasePrice', parseFloat(e.target.value) || 0)}
                                className="bg-white/5 border-white/20 text-white"
                                placeholder="5.00"
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-white">سعر البيع *</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.sellingPrice}
                                onChange={(e) => updateItem(item.id, 'sellingPrice', parseFloat(e.target.value) || 0)}
                                className="bg-white/5 border-white/20 text-white"
                                placeholder="10.00"
                                required
                              />
                            </div>
                          </div>

                          {/* الخيارات */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                              <input
                                type="checkbox"
                                id={`fromCapital-${item.id}`}
                                checked={item.fromCapital}
                                onChange={(e) => updateItem(item.id, 'fromCapital', e.target.checked)}
                                className="w-4 h-4 accent-blue-500"
                              />
                              <Label htmlFor={`fromCapital-${item.id}`} className="text-white text-sm cursor-pointer">
                                ✅ يُحسب من رأس المال
                              </Label>
                            </div>
                            
                            {/* عمولة المتجر ثابتة 5% */}
                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-yellow-500 flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                                <Label className="text-white text-sm">
                                  💰 عمولة المتجر <span className="font-bold text-yellow-300">5% (ثابتة)</span>
                                </Label>
                              </div>
                              <p className="text-xs text-yellow-200 mt-1 mr-6">
                                يتم حساب عمولة 5% من سعر البيع للمتجر تلقائياً
                              </p>
                            </div>
                          </div>

                          {!item.fromCapital && (
                            <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded text-sm text-orange-200">
                              📦 بيع بالنيابة - لن يُخصم من رأس المال
                            </div>
                          )}

                          {/* حساب المنتج */}
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="p-2 bg-white/5 rounded">
                              <p className="text-gray-400">إجمالي الشراء</p>
                              <p className="text-white font-bold">{(item.quantity * item.purchasePrice).toFixed(2)} ج</p>
                            </div>
                            <div className="p-2 bg-white/5 rounded">
                              <p className="text-gray-400">إجمالي البيع</p>
                              <p className="text-white font-bold">{(item.quantity * item.sellingPrice).toFixed(2)} ج</p>
                            </div>
                            <div className="p-2 bg-green-500/20 rounded">
                              <p className="text-gray-400">الربح المتوقع</p>
                              <p className="text-green-400 font-bold">
                                {((item.sellingPrice - item.purchasePrice) * item.quantity - 
                                  (item.sellingPrice * STORE_COMMISSION_RATE * item.quantity)).toFixed(2)} ج
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* الإجماليات */}
          {items.length > 0 && (
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  ملخص الفاتورة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-white/10 rounded-lg">
                    <p className="text-gray-300 text-sm mb-1">إجمالي المشتريات</p>
                    <p className="text-2xl font-bold text-white">{totalPurchasePrice.toFixed(2)} ج</p>
                  </div>
                  <div className="p-4 bg-blue-500/20 rounded-lg backdrop-blur-sm border border-blue-500/30">
                    <p className="text-blue-200 text-sm mb-1">من رأس المال</p>
                    <p className="text-2xl font-bold text-blue-300">{totalFromCapital.toFixed(2)} ج</p>
                  </div>
                  <div className="p-4 bg-orange-500/20 rounded-lg backdrop-blur-sm border border-orange-500/30">
                    <p className="text-orange-200 text-sm mb-1">بالنيابة</p>
                    <p className="text-2xl font-bold text-orange-300">{totalOnBehalf.toFixed(2)} ج</p>
                  </div>
                  <div className="p-4 bg-yellow-500/20 rounded-lg backdrop-blur-sm border border-yellow-500/30">
                    <p className="text-yellow-200 text-sm mb-1">مصاريف المشوار</p>
                    <p className="text-2xl font-bold text-yellow-300">{parseFloat(tripExpense).toFixed(2)} ج</p>
                  </div>
                  <div className="p-4 bg-green-500/20 rounded-lg backdrop-blur-sm border border-green-500/30">
                    <p className="text-green-200 text-sm mb-1">إجمالي البيع المتوقع</p>
                    <p className="text-2xl font-bold text-green-300">{totalSellingPrice.toFixed(2)} ج</p>
                  </div>
                  <div className="p-4 bg-emerald-500/20 rounded-lg backdrop-blur-sm border border-emerald-500/30">
                    <p className="text-emerald-200 text-sm mb-1">الربح المتوقع</p>
                    <p className="text-2xl font-bold text-emerald-300">{expectedProfit.toFixed(2)} ج</p>
                  </div>
                  <div className="p-4 bg-red-500/20 rounded-lg backdrop-blur-sm border border-red-500/30">
                    <p className="text-red-200 text-sm mb-1">عمولة المتجر <span className="font-bold">5% (ثابتة)</span></p>
                    <p className="text-2xl font-bold text-red-300">{totalCommission.toFixed(2)} ج</p>
                  </div>
                  <div className="p-4 bg-purple-500/20 rounded-lg backdrop-blur-sm border border-purple-500/30">
                    <p className="text-purple-200 text-sm mb-1">صافي الربح</p>
                    <p className="text-2xl font-bold text-purple-300">{(expectedProfit - parseFloat(tripExpense)).toFixed(2)} ج</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ملاحظات */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl mb-6">
            <CardContent className="p-4">
              <Label htmlFor="notes" className="text-white">ملاحظات</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white/5 border border-white/20 text-white rounded-md p-2 min-h-[80px] mt-2"
                placeholder="ملاحظات عن الفاتورة..."
              />
            </CardContent>
          </Card>

          {/* أزرار الحفظ */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={saving || items.length === 0}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  حفظ الفاتورة
                </>
              )}
            </Button>
            <Link href="/vendor/purchases">
              <Button type="button" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white py-6 px-8">
                إلغاء
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
