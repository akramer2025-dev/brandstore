'use client';

import { useState, useEffect } from 'react';
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
  Users
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  stock: number;
  categoryId: string;
  category?: {
    nameAr: string;
  };
}

interface CartItem {
  product: Product;
  quantity: number;
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
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * product.price }
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
        ? { ...item, quantity: item.quantity - 1, subtotal: (item.quantity - 1) * item.product.price }
        : item
    ));
  };

  // زيادة الكمية
  const increaseQuantity = (productId: string) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        if (item.quantity < item.product.stock) {
          return { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.product.price };
        } else {
          alert('الكمية المتوفرة في المخزون غير كافية');
        }
      }
      return item;
    }));
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

  // حساب الإجمالي
  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // إتمام البيع
  const completeSale = async () => {
    if (cart.length === 0) {
      alert('السلة فارغة!');
      return;
    }

    if (confirm(`إتمام عملية البيع بمبلغ ${total.toFixed(2)} جنيه؟`)) {
      try {
        const response = await fetch('/api/vendor/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cart.map(item => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price,
              subtotal: item.subtotal
            })),
            total,
            paymentMethod: 'CASH'
          })
        });

        if (response.ok) {
          const data = await response.json();
          alert(`✅ ${data.message}\n\nرقم العملية: ${data.sale.id.slice(0, 8)}`);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Receipt className="w-8 h-8" />
              نقطة البيع - POS
            </h1>
            <p className="text-purple-300 mt-1">نظام كاشير احترافي</p>
          </div>
          <Button
            onClick={() => router.push('/vendor/dashboard')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            لوحة تحكم الشريك
          </Button>
        </div>

        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">عدد المنتجات</p>
                  <p className="text-2xl font-bold text-white">{products.length}</p>
                </div>
                <Package className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">السلة</p>
                  <p className="text-2xl font-bold text-white">{itemsCount} قطعة</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">الإجمالي</p>
                  <p className="text-2xl font-bold text-white">{total.toFixed(2)} ج</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">الأصناف</p>
                  <p className="text-2xl font-bold text-white">{categories.length}</p>
                </div>
                <Calculator className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
                {filteredProducts.map(product => (
                  <Card
                    key={product.id}
                    className="bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-3">
                      <h3 className="font-bold text-white text-sm mb-1">{product.nameAr}</h3>
                      <p className="text-xs text-gray-400 mb-2">{product.category?.nameAr}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-green-400 font-bold">{product.price} ج</span>
                        <Badge variant={product.stock > 10 ? 'default' : 'destructive'} className="text-xs">
                          {product.stock}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
              <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    السلة فارغة
                  </div>
                ) : (
                  cart.map(item => (
                    <Card key={item.product.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-white text-sm">{item.product.nameAr}</h4>
                            <p className="text-xs text-gray-400">{item.product.price} ج × {item.quantity}</p>
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => decreaseQuantity(item.product.id)}
                              className="h-7 w-7 p-0 bg-white/5 border-white/20 text-white"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-white font-bold w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => increaseQuantity(item.product.id)}
                              className="h-7 w-7 p-0 bg-white/5 border-white/20 text-white"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="text-green-400 font-bold">{item.subtotal.toFixed(2)} ج</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <>
                  <div className="border-t border-white/20 pt-4 mb-4">
                    <div className="flex items-center justify-between text-white mb-2">
                      <span>عدد القطع:</span>
                      <span className="font-bold">{itemsCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-white text-xl font-bold">
                      <span>الإجمالي:</span>
                      <span className="text-green-400">{total.toFixed(2)} ج</span>
                    </div>
                  </div>

                  <Button
                    onClick={completeSale}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-6"
                  >
                    <Receipt className="w-5 h-5 mr-2" />
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
