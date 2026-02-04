'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  LogOut
} from 'lucide-react';
import { signOut } from 'next-auth/react';

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

interface CartItem {
  product: Product;
  quantity: number;
  customPrice: number; // السعر المخصص (قابل للتعديل)
  subtotal: number;
}

export default function POSPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // جلب المنتجات والأصناف
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
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

  // إضافة منتج للسلة
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.customPrice }
            : item
        ));
      } else {
        alert('الكمية المتوفرة في المخزون غير كافية');
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, {
          product,
          quantity: 1,
          customPrice: product.price,
          subtotal: product.price
        }]);
      } else {
        alert('المنتج غير متوفر في المخزون');
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
    }
  };

  // حساب الإجمالي والربح
  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const totalCost = cart.reduce((sum, item) => sum + (item.product.productionCost || 0) * item.quantity, 0);
  const totalProfit = total - totalCost;
  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // إتمام البيع
  const completeSale = async () => {
    if (cart.length === 0) {
      alert('السلة فارغة!');
      return;
    }

    if (confirm(`إتمام عملية البيع؟\n\n💵 الإجمالي: ${total.toFixed(2)} ج\n💰 الربح: ${totalProfit.toFixed(2)} ج`)) {
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
            paymentMethod: 'CASH'
          })
        });

        if (response.ok) {
          const data = await response.json();
          const saleId = data.sales?.[0]?.id?.slice(0, 8) || 'N/A';
          alert(`✅ ${data.message}\n\nرقم العملية: ${saleId}`);
          setCart([]);
          fetchData(); // تحديث المخزون
        } else {
          const error = await response.json();
          alert(`❌ ${error.error || 'فشل إتمام البيع'}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ أثناء إتمام البيع');
      }
    }
  };

  // فلترة المنتجات
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory && product.stock > 0;
  });

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

        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 md:gap-4">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-2 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-[10px] md:text-sm">المنتجات</p>
                  <p className="text-lg md:text-2xl font-bold text-white">{products.length}</p>
                </div>
                <Package className="w-5 h-5 md:w-8 md:h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-2 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-[10px] md:text-sm">السلة</p>
                  <p className="text-lg md:text-2xl font-bold text-white">{itemsCount}</p>
                </div>
                <ShoppingCart className="w-5 h-5 md:w-8 md:h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-2 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-[10px] md:text-sm">الإجمالي</p>
                  <p className="text-base md:text-2xl font-bold text-white">{total.toFixed(0)} ج</p>
                </div>
                <DollarSign className="w-5 h-5 md:w-8 md:h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-2 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-[10px] md:text-sm">الربح</p>
                  <p className={`text-base md:text-2xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalProfit.toFixed(0)} ج
                  </p>
                </div>
                <Calculator className="w-5 h-5 md:w-8 md:h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
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
                <div className="relative">
                  <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن منتج..."
                    className="pr-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

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
              </div>
            </CardHeader>
            <CardContent>
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
              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  لا توجد منتجات متاحة
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
                  <div className="border-t border-white/20 pt-2 md:pt-4 mb-2 md:mb-4">
                    <div className="flex items-center justify-between text-white mb-1 md:mb-2 text-xs md:text-base">
                      <span>عدد القطع:</span>
                      <span className="font-bold">{itemsCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-white text-base md:text-xl font-bold">
                      <span>الإجمالي:</span>
                      <span className="text-green-400">{total.toFixed(2)} ج</span>
                    </div>
                  </div>

                  <Button
                    onClick={completeSale}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-sm md:text-lg py-4 md:py-6 font-bold"
                  >
                    <Receipt className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    إتمام البيع
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
