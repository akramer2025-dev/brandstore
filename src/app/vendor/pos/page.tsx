'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  ShoppingCart, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  DollarSign,
  LayoutDashboard,
  Package,
  Calculator,
  Receipt,
  Users,
  LogOut,
  Percent,
  User,
  FileText,
  Printer,
  CreditCard,
  Wallet,
  Clock,
  TrendingUp,
  Barcode
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { BackButton } from '@/components/BackButton';

interface Product {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  stock: number;
  categoryId: string;
  images?: string;
  productionCost?: number; // سعر الشراء
  category?: {
    nameAr: string;
  };
}

interface OfflineProduct {
  id: string;
  productName?: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  soldQuantity: number;
  supplier?: {
    id: string;
    name: string;
  };
}

interface CartItem {
  product: Product;
  quantity: number;
  customPrice: number; // السعر المخصص (قابل للتعديل)
  subtotal: number;
}

export default function POSPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [offlineProducts, setOfflineProducts] = useState<OfflineProduct[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showOfflineProducts, setShowOfflineProducts] = useState(false);
  const [canViewOffline, setCanViewOffline] = useState(false);
  
  // بيانات الفاتورة المحسنة
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'DEFERRED'>('CASH');
  const [discountType, setDiscountType] = useState<'NONE' | 'PERCENTAGE' | 'FIXED'>('NONE');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');

  // جلب المنتجات والأصناف
  useEffect(() => {
    fetchData();
    fetchOfflineData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/vendor/inventory'),
        fetch('/api/categories')
      ]);
      
      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.products || []);
      }
      
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfflineData = async () => {
    try {
      // جلب المنتجات الخارجية (سيفشل إذا لم تكن هناك صلاحية)
      const offlineRes = await fetch('/api/vendor/offline-products');
      if (offlineRes.ok) {
        const data = await offlineRes.json();
        setOfflineProducts(data.offlineProducts || []);
        setCanViewOffline(true); // إذا نجح الطلب = عنده صلاحية
      } else if (offlineRes.status === 403) {
        // ليس لديه صلاحية
        setCanViewOffline(false);
        setOfflineProducts([]);
      }
    } catch (error) {
      console.error('Error fetching offline data:', error);
      setCanViewOffline(false);
    }
  };

  // إضافة منتج للسلة مع صوت وإشعار
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.customPrice }
            : item
        ));
        toast.success(`✅ تمت إضافة قطعة من ${product.nameAr}`);
      } else {
        toast.error('⚠️ الكمية المتوفرة في المخزون غير كافية');
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, {
          product,
          quantity: 1,
          customPrice: product.price,
          subtotal: product.price
        }]);
        toast.success(`✅ تم إضافة ${product.nameAr} للسلة`);
        // صوت عند الإضافة
        try {
          const audio = new Audio('/sounds/beep.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch (e) {}
      } else {
        toast.error('❌ المنتج غير متوفر في المخزون');
      }
    }
  };

  // تقليل الكمية
  const decreaseQuantity = (productId: string) => {
    setCart(cart.map(item =>
      item.product.id === productId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1, subtotal: (item.quantity - 1) * item.customPrice }
        : item
    ));
  };

  // زيادة الكمية
  const increaseQuantity = (productId: string) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        if (item.quantity < item.product.stock) {
          return { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.customPrice };
        } else {
          alert('الكمية المتوفرة في المخزون غير كافية');
        }
      }
      return item;
    }));
  };

  // تعديل السعر
  const updatePrice = (productId: string, newPrice: number) => {
    if (newPrice < 0) return;
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, customPrice: newPrice, subtotal: item.quantity * newPrice }
        : item
    ));
  };

  // حذف من السلة
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // إفراغ السلة
  const clearCart = () => {
    if (confirm('هل أنت متأكد من إفراغ السلة؟')) {
      setCart([]);
      setDiscountType('NONE');
      setDiscountValue(0);
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
      toast.success('🗑️ تم إفراغ السلة');
    }
  };

  // البحث بالباركود
  const searchByBarcode = (barcode: string) => {
    if (!barcode.trim()) return;
    
    const product = products.find(p => 
      p.id.includes(barcode) || 
      p.name.toLowerCase().includes(barcode.toLowerCase()) ||
      p.nameAr.includes(barcode)
    );
    
    if (product && product.stock > 0) {
      addToCart(product);
      setBarcodeInput('');
    } else {
      toast.error('❌ لم يتم العثور على المنتج أو نفذ من المخزون');
    }
  };

  // حساب الخصم
  const calculateDiscount = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    if (discountType === 'PERCENTAGE') {
      return (subtotal * discountValue) / 100;
    } else if (discountType === 'FIXED') {
      return discountValue;
    }
    return 0;
  };

  // حساب الإجمالي والربح
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = calculateDiscount();
  const total = subtotal - discount;
  const totalCost = cart.reduce((sum, item) => sum + (item.product.productionCost || 0) * item.quantity, 0);
  const totalProfit = total - totalCost;
  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // إتمام البيع
  const completeSale = async () => {
    if (cart.length === 0) {
      toast.error('❌ السلة فارغة!');
      return;
    }

    // التحقق من الدفعة الأولى للقسط
    if (paymentMethod === 'DEFERRED' && downPayment <= 0) {
      toast.error('⚠️ يجب إدخال الدفعة الأولى للقسط!');
      return;
    }

    if (paymentMethod === 'DEFERRED' && downPayment > total) {
      toast.error('⚠️ الدفعة الأولى لا يمكن أن تكون أكبر من الإجمالي!');
      return;
    }

    // التأكيد
    const paymentMethodText = paymentMethod === 'CASH' ? 'نقدي' : paymentMethod === 'CARD' ? 'بطاقة' : 'قسط';
    const confirmMessage = `إتمام عملية البيع؟\n\n💵 الإجمالي: ${total.toFixed(2)} ج\n${discount > 0 ? `💰 الخصم: ${discount.toFixed(2)} ج\n` : ''}💰 الربح: ${totalProfit.toFixed(2)} ج\n💳 طريقة الدفع: ${paymentMethodText}${paymentMethod === 'DEFERRED' ? `\n💵 الدفعة الأولى: ${downPayment.toFixed(2)} ج\n💰 المتبقي: ${(total - downPayment).toFixed(2)} ج` : ''}${customerName ? `\n👤 العميل: ${customerName}` : ''}`;
    
    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch('/api/vendor/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.customPrice,
            subtotal: item.subtotal
          })),
          total,
          subtotal,
          discount,
          discountType: discountType !== 'NONE' ? discountType : undefined,
          discountValue: discountValue > 0 ? discountValue : undefined,
          paymentMethod,
          downPayment: paymentMethod === 'DEFERRED' ? downPayment : undefined,
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          notes: notes || undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        const saleId = data.sales?.[0]?.id?.slice(0, 8) || 'N/A';
        
        toast.success(`✅ ${data.message}\n\nرقم العملية: ${saleId}`);
        
        // إعادة تعيين كل شيء
        setCart([]);
        setDiscountType('NONE');
        setDiscountValue(0);
        setDownPayment(0);
        setCustomerName('');
        setCustomerPhone('');
        setNotes('');
        setPaymentMethod('CASH');
        
        fetchData(); // تحديث المخزون
        
        // طباعة الفاتورة (اختياري)
        if (confirm('هل تريد طباعة الفاتورة؟')) {
          printInvoice(saleId, data.sales?.[0]);
        }
      } else {
        const error = await response.json();
        toast.error(`❌ ${error.error || 'فشل إتمام البيع'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('⚠️ حدث خطأ أثناء إتمام البيع');
    }
  };

  // طباعة الفاتورة
  const printInvoice = (saleId: string, saleData: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة #${saleId}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; text-align: right; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .info { margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background-color: #f2f2f2; }
          .total { font-size: 18px; font-weight: bold; text-align: left; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BS Brand Store</h1>
          <p>فاتورة بيع #${saleId}</p>
          <p>${new Date().toLocaleString('ar-EG')}</p>
        </div>
        <div class="info">
          ${customerName ? `<p><strong>العميل:</strong> ${customerName}</p>` : ''}
          ${customerPhone ? `<p><strong>الهاتف:</strong> ${customerPhone}</p>` : ''}
          <p><strong>طريقة الدفع:</strong> ${paymentMethod === 'CASH' ? 'نقدي' : paymentMethod === 'CARD' ? 'بطاقة' : 'آجل'}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${cart.map(item => `
              <tr>
                <td>${item.product.nameAr}</td>
                <td>${item.quantity}</td>
                <td>${item.customPrice.toFixed(2)} ج</td>
                <td>${item.subtotal.toFixed(2)} ج</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">
          <p>المجموع الفرعي: ${subtotal.toFixed(2)} ج</p>
          ${discount > 0 ? `<p>الخصم: ${discount.toFixed(2)} ج</p>` : ''}
          <p>الإجمالي النهائي: ${total.toFixed(2)} ج</p>
        </div>
        ${notes ? `<p><strong>ملاحظات:</strong> ${notes}</p>` : ''}
        <div style="text-align: center; margin-top: 40px;">
          <p>شكراً لتعاملكم معنا</p>
          <button onclick="window.print()">طباعة</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  // فلترة المنتجات
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory && product.stock > 0;
  });

  // فلترة المنتجات الخارجية
  const filteredOfflineProducts = offlineProducts.filter(product => {
    const remainingStock = product.quantity - product.soldQuantity;
    const displayName = product.productName || product.description || 'بضاعة';
    const matchesSearch = displayName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && remainingStock > 0;
  });

  // تحويل المنتج الخارجي إلى منتج عادي للسلة
  const convertOfflineToProduct = (offlineProduct: OfflineProduct): Product => {
    const remainingStock = offlineProduct.quantity - offlineProduct.soldQuantity;
    return {
      id: offlineProduct.id,
      name: offlineProduct.productName || offlineProduct.description || 'بضاعة خارجية',
      nameAr: offlineProduct.productName || offlineProduct.description || 'بضاعة خارجية',
      price: offlineProduct.sellingPrice,
      stock: remainingStock,
      categoryId: 'offline',
      productionCost: offlineProduct.purchasePrice,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-1.5 md:p-4">
      {/* Header */}
      <div className="mb-3 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-3 mb-3 md:mb-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 md:w-8 md:h-8" />
              نقطة البيع - POS
            </h1>
            <p className="text-purple-300 mt-1 text-xs md:text-base">نظام كاشير احترافي</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <BackButton 
              fallbackUrl="/vendor/dashboard"
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-xs md:text-sm"
            />
            <Button
              onClick={() => router.push('/vendor/dashboard')}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs md:text-sm"
            >
              <LayoutDashboard className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              لوحة التحكم
            </Button>
            <Button
              onClick={() => signOut({ callbackUrl: '/' })}
              variant="outline"
              size="sm"
              className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300 text-xs md:text-sm"
            >
              <LogOut className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              خروج
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
        {/* المنتجات */}
        <div className="lg:col-span-2">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="w-5 h-5" />
                المنتجات المتاحة
              </CardTitle>
              
              {/* البحث والفلترة */}
              <div className="space-y-3 mt-4">
                {/* بحث بالباركود */}
                <div className="relative">
                  <Barcode className="absolute right-3 top-3 w-5 h-5 text-yellow-400" />
                  <Input
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        searchByBarcode(barcodeInput);
                      }
                    }}
                    placeholder="امسح الباركود أو اكتب رقم المنتج..."
                    className="pr-10 bg-yellow-500/10 border-yellow-500/30 text-white placeholder:text-yellow-300/70"
                  />
                </div>

                <div className="relative">
                  <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن منتج..."
                    className="pr-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* التبديل بين المنتجات العادية والخارجية */}
                <div className="flex gap-2">
                  <Button
                    variant={!showOfflineProducts ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowOfflineProducts(false)}
                    className={!showOfflineProducts 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 flex-1' 
                      : 'bg-white/5 text-white border-white/20 flex-1'
                    }
                  >
                    <Package className="w-4 h-4 ml-1" />
                    أصناف المتجر
                  </Button>
                  {canViewOffline && (
                    <Button
                      variant={showOfflineProducts ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowOfflineProducts(true)}
                      className={showOfflineProducts 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 flex-1' 
                        : 'bg-white/5 text-white border-white/20 flex-1'
                      }
                    >
                      <FileText className="w-4 h-4 ml-1" />
                      أصناف خارج النظام
                    </Button>
                  )}
                </div>

                {!showOfflineProducts && (
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('all')}
                      className={selectedCategory === 'all' ? 'bg-purple-600' : 'bg-white/5 text-white border-white/20'}
                    >
                      الكل
                    </Button>
                    {categories.map(category => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className={selectedCategory === category.id ? 'bg-purple-600' : 'bg-white/5 text-white border-white/20'}
                      >
                        {category.nameAr}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!showOfflineProducts ? (
                // عرض المنتجات العادية
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 md:gap-3 max-h-[calc(100vh-400px)] md:max-h-[500px] overflow-y-auto pr-1">
                  {filteredProducts.map(product => {
                    const imageUrl = product.images?.split(',')[0] || '/placeholder.jpg';
                    return (
                      <Card
                        key={product.id}
                        className="bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-all hover:scale-105"
                        onClick={() => addToCart(product)}
                      >
                        <CardContent className="p-1.5 md:p-3">
                          <div className="aspect-square mb-1 md:mb-2 rounded-md overflow-hidden bg-white/10">
                            <img 
                              src={imageUrl} 
                              alt={product.nameAr}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.jpg';
                              }}
                            />
                        </div>
                        <h3 className="font-bold text-white text-[10px] md:text-sm mb-0.5 md:mb-1 line-clamp-1 leading-tight">{product.nameAr}</h3>
                        <p className="text-[9px] md:text-xs text-gray-400 mb-1 md:mb-2 line-clamp-1">{product.category?.nameAr}</p>
                        <div className="flex items-center justify-between text-[10px] md:text-sm">
                          <span className="text-green-400 font-bold">{product.price} ج</span>
                          <Badge variant={product.stock > 10 ? 'default' : 'destructive'} className="text-[8px] md:text-xs px-1 py-0 h-4">
                            {product.stock}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    );
                  })}
                </div>
              ) : (
                // عرض المنتجات الخارجية
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 md:gap-3 max-h-[calc(100vh-400px)] md:max-h-[500px] overflow-y-auto pr-1">
                  {filteredOfflineProducts.map(offlineProduct => {
                    const product = convertOfflineToProduct(offlineProduct);
                    return (
                      <Card
                        key={offlineProduct.id}
                        className="bg-transparent border-purple-500/40 hover:bg-purple-500/10 cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                        onClick={() => addToCart(product)}
                      >
                        <CardContent className="p-1.5 md:p-3">
                          <div className="aspect-square mb-1 md:mb-2 rounded-md overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center border border-purple-500/20">
                            <img 
                              src="/logo.png" 
                              alt={offlineProduct.productName || 'بضاعة'}
                              className="w-full h-full object-contain p-2"
                            />
                          </div>
                          <h3 className="font-bold text-purple-200 text-[10px] md:text-sm mb-0.5 md:mb-1 line-clamp-2 leading-tight">
                            {offlineProduct.productName || offlineProduct.description || 'بضاعة'}
                          </h3>
                          {offlineProduct.supplier && (
                            <p className="text-[9px] md:text-xs text-purple-300 mb-1 line-clamp-1 font-medium">
                              📦 {offlineProduct.supplier.name}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-[10px] md:text-sm">
                            <span className="text-green-400 font-bold">{offlineProduct.sellingPrice.toFixed(0)} ج</span>
                            <Badge variant="secondary" className="text-[8px] md:text-xs px-1 py-0 h-4 bg-purple-500/40 text-purple-100 border border-purple-400/30">
                              {product.stock}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
              
              {!showOfflineProducts && filteredProducts.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  لا توجد منتجات متاحة
                </div>
              )}
              
              {showOfflineProducts && filteredOfflineProducts.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  لا توجد أصناف خارج النظام متاحة
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* السلة */}
        <div>
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 sticky top-4">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  السلة ({itemsCount})
                </span>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 md:space-y-3 max-h-[calc(100vh-350px)] md:max-h-[400px] overflow-y-auto mb-2 md:mb-4 pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-8 md:py-12 text-gray-400">
                    <ShoppingCart className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm md:text-base">السلة فارغة</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <Card key={item.product.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-2 md:p-3">
                        <div className="flex items-start justify-between mb-1.5 md:mb-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-white text-xs md:text-sm">{item.product.nameAr}</h4>
                            <p className="text-[10px] md:text-xs text-gray-400">السعر الأصلي: {item.product.price} ج</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-400 hover:text-red-300 p-1 h-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* حقل تعديل السعر */}
                        <div className="flex items-center gap-1 md:gap-2 mb-1.5 md:mb-2">
                          <span className="text-[10px] md:text-xs text-gray-400">السعر:</span>
                          <Input
                            type="number"
                            value={item.customPrice}
                            onChange={(e) => updatePrice(item.product.id, parseFloat(e.target.value) || 0)}
                            className="h-6 md:h-7 w-16 md:w-24 text-center bg-white/10 border-yellow-500/50 text-yellow-400 font-bold text-xs"
                            min="0"
                            step="0.5"
                          />
                          <span className="text-[10px] md:text-xs text-gray-400">ج</span>
                          {item.customPrice !== item.product.price && (
                            <Badge variant="outline" className="text-yellow-400 border-yellow-400/50 text-[8px] md:text-xs px-1 py-0">
                              معدّل
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 md:gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => decreaseQuantity(item.product.id)}
                              className="h-6 w-6 md:h-7 md:w-7 p-0 bg-white/5 border-white/20 text-white"
                            >
                              <Minus className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            </Button>
                            <span className="text-white font-bold w-6 md:w-8 text-center text-xs md:text-base">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => increaseQuantity(item.product.id)}
                              className="h-6 w-6 md:h-7 md:w-7 p-0 bg-white/5 border-white/20 text-white"
                            >
                              <Plus className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            </Button>
                          </div>
                          <span className="text-green-400 font-bold text-xs md:text-base">{item.subtotal.toFixed(2)} ج</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <>
                  {/* بيانات الفاتورة */}
                  <div className="space-y-3 mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      بيانات الفاتورة
                    </h3>
                    
                    {/* طريقة الدفع */}
                    <div className="space-y-2">
                      <Label className="text-white text-xs">طريقة الدفع</Label>
                      <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH">
                            <div className="flex items-center gap-2">
                              <Wallet className="w-4 h-4" />
                              نقدي
                            </div>
                          </SelectItem>
                          <SelectItem value="CARD">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              بطاقة
                            </div>
                          </SelectItem>
                          <SelectItem value="DEFERRED">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              قسط
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* الدفعة الأولى للتقسيط */}
                    {paymentMethod === 'DEFERRED' && (
                      <div className="space-y-2 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/30">
                        <Label className="text-yellow-300 text-xs flex items-center gap-2 font-bold">
                          <DollarSign className="w-3 h-3" />
                          الدفعة الأولى (إجباري)
                        </Label>
                        <Input
                          type="number"
                          value={downPayment}
                          onChange={(e) => setDownPayment(parseFloat(e.target.value) || 0)}
                          placeholder="أدخل الدفعة الأولى"
                          className="bg-white/10 border-yellow-500/50 text-white text-xs"
                          min="0"
                          max={total}
                        />
                        <p className="text-[10px] text-yellow-300">
                          💡 المتبقي: {(total - downPayment).toFixed(2)} ج
                        </p>
                      </div>
                    )}

                    {/* الخصم */}
                    <div className="space-y-2">
                      <Label className="text-white text-xs flex items-center gap-2">
                        <Percent className="w-3 h-3" />
                        الخصم
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={discountType} onValueChange={(value: any) => setDiscountType(value)}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NONE">بدون</SelectItem>
                            <SelectItem value="PERCENTAGE">نسبة %</SelectItem>
                            <SelectItem value="FIXED">مبلغ ثابت</SelectItem>
                          </SelectContent>
                        </Select>
                        {discountType !== 'NONE' && (
                          <Input
                            type="number"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                            placeholder={discountType === 'PERCENTAGE' ? '%' : 'ج'}
                            className="bg-white/10 border-white/20 text-white text-xs"
                            min="0"
                          />
                        )}
                      </div>
                    </div>

                    {/* بيانات العميل */}
                    <div className="space-y-2">
                      <Label className="text-white text-xs flex items-center gap-2">
                        <User className="w-3 h-3" />
                        العميل (اختياري)
                      </Label>
                      <Input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="اسم العميل"
                        className="bg-white/10 border-white/20 text-white text-xs"
                      />
                      <Input
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="رقم الهاتف"
                        className="bg-white/10 border-white/20 text-white text-xs"
                      />
                    </div>

                    {/* ملاحظات */}
                    <div className="space-y-2">
                      <Label className="text-white text-xs">ملاحظات</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="أي ملاحظات إضافية..."
                        className="bg-white/10 border-white/20 text-white text-xs min-h-[60px]"
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-2 md:pt-4 mb-2 md:mb-4 space-y-2">
                    <div className="flex items-center justify-between text-white text-xs md:text-sm">
                      <span>عدد القطع:</span>
                      <span className="font-bold">{itemsCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-white text-xs md:text-sm">
                      <span>المجموع الفرعي:</span>
                      <span className="font-bold">{subtotal.toFixed(2)} ج</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex items-center justify-between text-yellow-400 text-xs md:text-sm">
                        <span>الخصم:</span>
                        <span className="font-bold">- {discount.toFixed(2)} ج</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-green-400 text-xs md:text-sm">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        الربح المتوقع:
                      </span>
                      <span className="font-bold">{totalProfit.toFixed(2)} ج</span>
                    </div>
                    <div className="flex items-center justify-between text-white text-base md:text-xl font-bold pt-2 border-t border-white/20">
                      <span>الإجمالي النهائي:</span>
                      <span className="text-green-400">{total.toFixed(2)} ج</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={completeSale}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-sm md:text-lg py-4 md:py-6 font-bold"
                    >
                      <Receipt className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      إتمام البيع
                    </Button>
                    <Button
                      onClick={clearCart}
                      variant="outline"
                      className="w-full border-red-500/50 text-red-400 hover:bg-red-500/20 text-xs md:text-sm"
                    >
                      <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                      إفراغ السلة
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
