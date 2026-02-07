"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: Date | null;
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("يجب تسجيل الدخول أولاً");
      router.push("/auth/login");
    }
  }, [status, router]);

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
    toast.success("تم تحديث الكمية");
  };

  const handleRemoveItem = (id: string, name: string) => {
    removeItem(id);
    toast.success(`تم حذف ${name} من السلة`);
  };

  const handleClearCart = () => {
    clearCart();
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("تم إفراغ السلة");
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("الرجاء إدخال كود الكوبون");
      return;
    }

    setIsCheckingCoupon(true);
    setCouponError("");

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: couponCode }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        const coupon = data.coupon;
        
        // التحقق من الحد الأدنى للشراء
        if (totalPrice < coupon.minPurchase) {
          setCouponError(`يجب أن يكون إجمالي الطلب ${coupon.minPurchase} جنيه على الأقل للحصول على هذا الخصم`);
          setIsCheckingCoupon(false);
          return;
        }

        setAppliedCoupon(coupon);
        setCouponCode("");
        toast.success(`تم تطبيق خصم ${coupon.discount} جنيه!`);
      } else {
        setCouponError(data.error || "كود الكوبون غير صحيح");
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError("حدث خطأ في التحقق من الكوبون");
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    toast.info("تم إزالة الكوبون");
  };

  const totalPrice = getTotalPrice();
  const discount = appliedCoupon? appliedCoupon.discount : 0;
  const finalPrice = Math.max(0, totalPrice - discount);

  // حساب الوفورات من الأسعار الوهمية
  const originalTotalPrice = items.reduce((sum, item) => {
    const originalPrice = item.originalPrice || item.price;
    return sum + (originalPrice * item.quantity);
  }, 0);
  const fakeSavings = originalTotalPrice - totalPrice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 py-6 sm:py-12">
      {/* Background Effects */}
      <div className="hidden md:block fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent mb-2 sm:mb-4">
            سلة التسوق
          </h1>
          <p className="text-gray-400 text-sm sm:text-lg">
            مرحباً {session?.user?.name || session?.user?.username || "عزيزي العميل"}
          </p>
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <Card className="max-w-2xl mx-auto bg-gray-800/80 border-teal-500/20">
            <CardContent className="p-6 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 sm:w-12 sm:h-12 text-teal-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">السلة فارغة</h2>
              <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8">
                لم تقم بإضافة أي منتجات للسلة بعد
              </p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white">
                  <ArrowRight className="w-5 h-5 ml-2" />
                  تصفح المنتجات
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Cart Items */
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="bg-gray-800/80 border-teal-500/20 hover:border-teal-500/40 transition-all">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex gap-3 sm:gap-6">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-700">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-12 h-12 text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-1 sm:mb-2">
                            <div>
                              <h3 className="text-base sm:text-xl font-bold text-white mb-0.5 sm:mb-1">
                                {item.name}
                              </h3>
                              {item.categoryName && (
                                <p className="text-xs sm:text-sm text-gray-400">
                                  {item.categoryName}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id, item.name)}
                              className="text-red-400 hover:text-red-300 transition-colors p-1 sm:p-2"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                          
                          {/* Price Display - Enhanced */}
                          <div className="space-y-1">
                            {/* Original Price (Crossed) */}
                            {item.originalPrice && item.originalPrice > item.price && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500 line-through text-sm">
                                  {(item.originalPrice * item.quantity).toLocaleString()} جنيه
                                </span>
                                <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full font-bold">
                                  -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                                </span>
                              </div>
                            )}
                            
                            {/* Current Price */}
                            <p className="text-xl sm:text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                              {(item.price * item.quantity).toFixed(2)} جنيه
                            </p>
                            
                            {/* Savings */}
                            {item.originalPrice && item.originalPrice > item.price && (
                              <p className="text-xs text-orange-400">
                                🎉 وفّرت {((item.originalPrice - item.price) * item.quantity).toFixed(0)} جنيه
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
                          >
                            <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          
                          <span className="text-base sm:text-xl font-bold text-white w-8 sm:w-12 text-center">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 flex items-center justify-center text-white transition-colors"
                          >
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          
                          <span className="text-xs sm:text-sm text-gray-400 mr-2 sm:mr-4">
                            {item.price} جنيه للقطعة
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Clear Cart Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleClearCart}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-5 h-5 ml-2" />
                  إفراغ السلة
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-800/80 border-teal-500/20 lg:sticky lg:top-24">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-white">
                    ملخص الطلب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  {/* Coupon Section */}
                  <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-5 h-5 text-amber-400" />
                      <h3 className="font-bold text-white">كود الخصم</h3>
                    </div>
                    
                    {!appliedCoupon ? (
                      <>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="أدخل كود الكوبون"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="bg-gray-800 border-amber-500/50 text-white placeholder:text-gray-500"
                            disabled={isCheckingCoupon}
                          />
                          <Button
                            onClick={handleApplyCoupon}
                            disabled={isCheckingCoupon || !couponCode.trim()}
                            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4"
                          >
                            {isCheckingCoupon ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "تطبيق"
                            )}
                          </Button>
                        </div>
                        
                        {couponError && (
                          <div className="flex items-start gap-2 mt-2 text-red-400 text-xs">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{couponError}</span>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-400 mt-2">
                          💡 احصل على كوبون خصم من عجلة الحظ!
                        </p>
                      </>
                    ) : (
                      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span className="font-bold text-white">{appliedCoupon.code}</span>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-red-400 hover:text-red-300 text-sm underline"
                          >
                            إزالة
                          </button>
                        </div>
                        <p className="text-green-400 text-sm font-medium">
                          خصم {appliedCoupon.discount} جنيه
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between text-gray-400">
                    <span>عدد المنتجات:</span>
                    <span className="font-bold">{items.length}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-400">
                    <span>إجمالي الكمية:</span>
                    <span className="font-bold">
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    {/* Original Total (if there are savings) */}
                    {fakeSavings > 0 && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-500 text-sm line-through">السعر الأصلي:</span>
                        <span className="text-gray-500 line-through">
                          {originalTotalPrice.toFixed(2)} جنيه
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">سعر المنتجات:</span>
                      <span className="text-xl font-bold text-white">
                        {totalPrice.toFixed(2)} جنيه
                      </span>
                    </div>
                    
                    {/* Fake Savings Display */}
                    {fakeSavings > 0 && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-orange-400 text-sm">💰 الوفورات:</span>
                        <span className="text-orange-400 font-bold text-sm">
                          {fakeSavings.toFixed(2)} جنيه
                        </span>
                      </div>
                    )}
                    
                    {appliedCoupon && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-green-400 text-sm">🎫 خصم الكوبون ({appliedCoupon.code}):</span>
                        <span className="text-green-400 font-bold">- {discount.toFixed(2)} جنيه</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">رسوم التوصيل:</span>
                      <span className="text-teal-400 font-bold">مجاناً</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-3 sm:pt-4">
                    {/* Total Savings Celebration */}
                    {(fakeSavings + discount) > 0 && (
                      <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-green-400 text-sm font-bold">🎉 إجمالي التوفير:</span>
                          <span className="text-green-400 font-black text-lg">
                            {(fakeSavings + discount).toFixed(2)} جنيه
                          </span>
                        </div>
                        <p className="text-green-300 text-xs mt-1">
                          رائع! وفّرت {Math.round(((fakeSavings + discount) / originalTotalPrice) * 100)}% من المبلغ الأصلي 💪
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                      <span className="text-base sm:text-xl font-bold text-white">الإجمالي النهائي:</span>
                      <span className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                        {finalPrice.toFixed(2)} جنيه
                      </span>
                    </div>
                    
                    {appliedCoupon && appliedCoupon.minPurchase > finalPrice && (
                      <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-3 mb-4">
                        <div className="flex items-start gap-2 text-amber-400 text-xs">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>
                            لم تصل للحد الأدنى المطلوب! أضف منتجات بقيمة {(appliedCoupon.minPurchase - totalPrice).toFixed(2)} جنيه للحصول على الخصم
                          </span>
                        </div>
                      </div>
                    )}

                    <Link href="/checkout">
                      <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-sm sm:text-lg py-4 sm:py-6">
                        <ShoppingBag className="w-5 h-5 ml-2" />
                        إتمام الطلب
                      </Button>
                    </Link>
                  </div>

                  <div className="bg-gradient-to-r from-teal-900/20 to-cyan-900/20 border border-teal-500/30 rounded-lg p-3 sm:p-4 text-center">
                    <p className="text-xs sm:text-sm text-teal-300 font-medium">
                      💳 طرق دفع متعددة متاحة
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                      دفع عند الاستلام • تحويل بنكي • محفظة إلكترونية • تقسيط
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
