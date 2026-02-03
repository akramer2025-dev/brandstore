"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBag, MapPin, Phone, User, Home, Loader2, CheckCircle2, Package, CreditCard, Banknote, Calendar } from "lucide-react";
import { toast } from "sonner";
import InstallmentCalculator from "@/components/InstallmentCalculator";

type PaymentMethod = 'CASH_ON_DELIVERY' | 'BANK_TRANSFER' | 'E_WALLET_TRANSFER' | 'INSTALLMENT_4' | 'INSTALLMENT_6' | 'INSTALLMENT_12' | 'INSTALLMENT_24';
type EWalletType = 'etisalat_cash' | 'vodafone_cash' | 'we_pay';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_ON_DELIVERY');
  const [eWalletType, setEWalletType] = useState<EWalletType>('vodafone_cash');
  const [selectedInstallmentPlan, setSelectedInstallmentPlan] = useState<any>(null);
  
  const { items, getTotalPrice, clearCart } = useCartStore();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    notes: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("يجب تسجيل الدخول أولاً");
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (mounted && items.length === 0) {
      toast.error("السلة فارغة");
      router.push("/cart");
    }
  }, [mounted, items, router]);

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        fullName: session.user.name || "",
        phone: session.user.phone || "",
      }));
    }
  }, [session]);

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (status === "unauthenticated" || items.length === 0) {
    return null;
  }

  const totalPrice = getTotalPrice();
  const deliveryFee = 0; // توصيل مجاني
  const finalTotal = totalPrice + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (paymentMethod.startsWith('INSTALLMENT_') && !selectedInstallmentPlan) {
      toast.error("يرجى اختيار خطة التقسيط");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData: any = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        deliveryAddress: `${formData.address}, ${formData.district}, ${formData.city}`,
        deliveryPhone: formData.phone,
        customerNotes: formData.notes,
        deliveryFee: 0,
        paymentMethod,
        ...(paymentMethod === 'E_WALLET_TRANSFER' && { eWalletType }),
      };

      // إضافة بيانات الأقساط إذا كانت الدفع بالتقسيط
      if (paymentMethod.startsWith('INSTALLMENT_') && selectedInstallmentPlan) {
        orderData.installmentPlan = {
          totalAmount: selectedInstallmentPlan.totalWithInterest,
          downPayment: selectedInstallmentPlan.downPayment,
          monthlyAmount: selectedInstallmentPlan.monthlyAmount,
          numberOfMonths: selectedInstallmentPlan.months,
          interestRate: selectedInstallmentPlan.interestRate,
        };
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "حدث خطأ أثناء إنشاء الطلب");
      }

      const order = await response.json();
      
      clearCart();
      toast.success("تم إنشاء الطلب بنجاح! 🎉");
      router.push(`/orders/${order.id}`);
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 py-12">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent mb-4">
            إتمام الطلب
          </h1>
          <p className="text-gray-400 text-lg">
            أكمل بياناتك لاستلام طلبك
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Delivery Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card className="bg-gray-800/80 border-teal-500/20">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <User className="w-6 h-6 text-teal-400" />
                    المعلومات الشخصية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="text-gray-300 mb-2 block">
                        الاسم الكامل <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="أدخل اسمك الكامل"
                        required
                        className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-gray-300 mb-2 block">
                        رقم الهاتف <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="01xxxxxxxxx"
                        required
                        className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card className="bg-gray-800/80 border-teal-500/20">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-teal-400" />
                    عنوان التوصيل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-gray-300 mb-2 block">
                        المدينة <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="مثال: القاهرة"
                        required
                        className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="district" className="text-gray-300 mb-2 block">
                        المنطقة <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        placeholder="مثال: مدينة نصر"
                        required
                        className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-gray-300 mb-2 block">
                      العنوان التفصيلي <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="رقم المبنى، اسم الشارع، أقرب معلم"
                      required
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-gray-300 mb-2 block">
                      ملاحظات إضافية (اختياري)
                    </Label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="أي ملاحظات خاصة بالطلب أو التوصيل"
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="bg-gray-800/80 border-teal-500/20">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-teal-400" />
                    طريقة الدفع
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                      paymentMethod === 'CASH_ON_DELIVERY'
                        ? 'border-teal-500 bg-teal-900/30'
                        : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        paymentMethod === 'CASH_ON_DELIVERY'
                          ? 'border-teal-500 bg-teal-500'
                          : 'border-gray-500'
                      }`}>
                        {paymentMethod === 'CASH_ON_DELIVERY' && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Banknote className="w-5 h-5 text-teal-400" />
                          <h3 className="text-lg font-bold text-white">
                            الدفع عند الاستلام (COD)
                          </h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">
                          ادفع نقداً عند استلام الطلب بعد فحص المنتجات
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <CheckCircle2 className="w-3 h-3 text-teal-400" />
                            افحص المنتجات قبل الدفع
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <CheckCircle2 className="w-3 h-3 text-teal-400" />
                            في حالة عدم الرضا، ادفع رسوم التوصيل فقط
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bank Transfer */}
                  <div
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                      paymentMethod === 'BANK_TRANSFER'
                        ? 'border-blue-500 bg-blue-900/30'
                        : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        paymentMethod === 'BANK_TRANSFER'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-500'
                      }`}>
                        {paymentMethod === 'BANK_TRANSFER' && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-5 h-5 text-blue-400" />
                          <h3 className="text-lg font-bold text-white">
                            تحويل بنكي
                          </h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">
                          احصل على خصم 5% بالدفع المسبق عبر التحويل البنكي
                        </p>
                        <div className="bg-gray-900/50 rounded p-2 text-xs text-gray-400">
                          سيتم إرسال تفاصيل الحساب البنكي بعد تأكيد الطلب
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* E-Wallet Transfer */}
                  <div
                    onClick={() => setPaymentMethod('E_WALLET_TRANSFER')}
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                      paymentMethod === 'E_WALLET_TRANSFER'
                        ? 'border-green-500 bg-green-900/30'
                        : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        paymentMethod === 'E_WALLET_TRANSFER'
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-500'
                      }`}>
                        {paymentMethod === 'E_WALLET_TRANSFER' && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="w-5 h-5 text-green-400" />
                          <h3 className="text-lg font-bold text-white">
                            تحويل على المحفظة
                          </h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">
                          ادفع بسهولة عبر المحافظ الإلكترونية
                        </p>
                        
                        {paymentMethod === 'E_WALLET_TRANSFER' && (
                          <div className="space-y-2 mt-3">
                            <p className="text-sm text-gray-400 mb-2">اختر المحفظة الإلكترونية:</p>
                            
                            {/* Vodafone Cash */}
                            <div
                              onClick={(e) => { e.stopPropagation(); setEWalletType('vodafone_cash'); }}
                              className={`cursor-pointer border rounded-lg p-3 transition-all ${
                                eWalletType === 'vodafone_cash'
                                  ? 'border-red-500 bg-red-900/30'
                                  : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  eWalletType === 'vodafone_cash'
                                    ? 'border-red-500 bg-red-500'
                                    : 'border-gray-500'
                                }`}>
                                  {eWalletType === 'vodafone_cash' && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                                <span className="text-white font-medium">فودافون كاش</span>
                              </div>
                            </div>

                            {/* Etisalat Cash */}
                            <div
                              onClick={(e) => { e.stopPropagation(); setEWalletType('etisalat_cash'); }}
                              className={`cursor-pointer border rounded-lg p-3 transition-all ${
                                eWalletType === 'etisalat_cash'
                                  ? 'border-orange-500 bg-orange-900/30'
                                  : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  eWalletType === 'etisalat_cash'
                                    ? 'border-orange-500 bg-orange-500'
                                    : 'border-gray-500'
                                }`}>
                                  {eWalletType === 'etisalat_cash' && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                                <span className="text-white font-medium">اتصالات كاش</span>
                              </div>
                            </div>

                            {/* We Pay */}
                            <div
                              onClick={(e) => { e.stopPropagation(); setEWalletType('we_pay'); }}
                              className={`cursor-pointer border rounded-lg p-3 transition-all ${
                                eWalletType === 'we_pay'
                                  ? 'border-purple-500 bg-purple-900/30'
                                  : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  eWalletType === 'we_pay'
                                    ? 'border-purple-500 bg-purple-500'
                                    : 'border-gray-500'
                                }`}>
                                  {eWalletType === 'we_pay' && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                                <span className="text-white font-medium">وي باي (WE Pay)</span>
                              </div>
                            </div>

                            <div className="bg-gray-900/50 rounded p-2 text-xs text-gray-400 mt-2">
                              سيتم إرسال رقم المحفظة بعد تأكيد الطلب
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Installment */}
                  <div
                    onClick={() => setPaymentMethod('INSTALLMENT_4')}
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                      paymentMethod.startsWith('INSTALLMENT_')
                        ? 'border-purple-500 bg-purple-900/30'
                        : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        paymentMethod.startsWith('INSTALLMENT_')
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-500'
                      }`}>
                        {paymentMethod.startsWith('INSTALLMENT_') && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-5 h-5 text-purple-400" />
                          <h3 className="text-lg font-bold text-white">
                            الدفع بالتقسيط
                          </h3>
                        </div>
                        <p className="text-gray-300 text-sm">
                          قسّط مشترياتك على 4، 6، 12، أو 24 شهر
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Installment Calculator */}
                  {paymentMethod.startsWith('INSTALLMENT_') && (
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <InstallmentCalculator
                        totalAmount={finalTotal}
                        onSelect={(plan) => {
                          setSelectedInstallmentPlan(plan);
                          setPaymentMethod(`INSTALLMENT_${plan.months}` as PaymentMethod);
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-800/80 border-teal-500/20 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">
                    ملخص الطلب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Products */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-700">
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{item.name}</p>
                          <p className="text-gray-400 text-xs">
                            {item.quantity} × {item.price} جنيه
                          </p>
                        </div>
                        <p className="text-teal-400 font-bold">
                          {(item.quantity * item.price).toFixed(2)} جنيه
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-700 pt-4 space-y-2">
                    <div className="flex justify-between text-gray-300">
                      <span>المجموع الفرعي:</span>
                      <span className="font-bold">{totalPrice.toFixed(2)} جنيه</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-300">
                      <span>رسوم التوصيل:</span>
                      <span className="font-bold text-teal-400">مجاناً</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xl font-bold text-white">الإجمالي:</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                        {finalTotal.toFixed(2)} جنيه
                      </span>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-lg py-6"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                          جاري إنشاء الطلب...
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-5 h-5 ml-2" />
                          تأكيد الطلب
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-400">
                      بالضغط على "تأكيد الطلب"، أنت توافق على شروط وأحكام الشراء
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
