"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBag, MapPin, Phone, User, Home, Loader2, CheckCircle2, Package, CreditCard, Banknote, Calendar, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import InstallmentCalculator from "@/components/InstallmentCalculator";
import AddressSelector from "@/components/AddressSelector";
import AddressForm from "@/components/AddressForm";

type PaymentMethod = 'CASH_ON_DELIVERY' | 'BANK_TRANSFER' | 'E_WALLET_TRANSFER' | 'INSTALLMENT_4' | 'INSTALLMENT_6' | 'INSTALLMENT_12' | 'INSTALLMENT_24';
type EWalletType = 'etisalat_cash' | 'vodafone_cash' | 'we_pay';
type DeliveryMethod = 'HOME_DELIVERY' | 'STORE_PICKUP';

interface SavedAddress {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  alternativePhone?: string;
  governorate: string;
  city: string;
  district: string;
  street: string;
  buildingNumber?: string;
  floorNumber?: string;
  apartmentNumber?: string;
  landmark?: string;
  postalCode?: string;
  isDefault: boolean;
}

interface DeliveryZone {
  id: string;
  governorate: string;
  deliveryFee: number;
  minOrderValue: number;
  isActive: boolean;
}

interface PickupLocation {
  address: string;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_ON_DELIVERY');
  const [eWalletType, setEWalletType] = useState<EWalletType>('vodafone_cash');
  const [selectedInstallmentPlan, setSelectedInstallmentPlan] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  // Delivery system states
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('HOME_DELIVERY');
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<string>('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [downPaymentPercent, setDownPaymentPercent] = useState(30); // Default 30%
  
  const { items, getTotalPrice, clearCart } = useCartStore();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    alternativePhone: "",
    governorate: "",
    city: "",
    district: "",
    street: "",
    buildingNumber: "",
    floorNumber: "",
    apartmentNumber: "",
    landmark: "",
    postalCode: "",
    notes: "",
    saveAddress: false,
    addressTitle: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // جلب العناوين المحفوظة
  useEffect(() => {
    if (session?.user && mounted) {
      fetchSavedAddresses();
      fetchDeliveryZones();
      fetchSystemSettings();
    }
  }, [session, mounted]);

  // تحديث رسوم التوصيل عند تغيير المحافظة أو طريقة التوصيل
  useEffect(() => {
    if (deliveryMethod === 'HOME_DELIVERY' && formData.governorate) {
      const zone = deliveryZones.find(z => z.governorate === formData.governorate && z.isActive);
      if (zone) {
        setDeliveryFee(zone.deliveryFee);
      } else {
        // استخدام الرسوم الافتراضية إذا لم تُجد المحافظة
        setDeliveryFee(125);
      }
    } else if (deliveryMethod === 'STORE_PICKUP') {
      setDeliveryFee(0);
    }
  }, [deliveryMethod, formData.governorate, deliveryZones]);

  // تحميل بيانات المستخدم
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        fullName: session.user.name || "",
        phone: session.user.phone || "",
      }));
    }
  }, [session]);

  const fetchSavedAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const response = await fetch('/api/addresses');
      if (response.ok) {
        const data = await response.json();
        setSavedAddresses(data.addresses || []);
        
        // اختيار العنوان الافتراضي تلقائياً
        const defaultAddress = data.addresses?.find((addr: SavedAddress) => addr.isDefault);
        if (defaultAddress) {
          selectSavedAddress(defaultAddress.id);
        } else if (data.addresses?.length > 0) {
          // إذا لم يوجد عنوان افتراضي، اختر أول عنوان
          setShowNewAddressForm(true);
        } else {
          setShowNewAddressForm(true);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchDeliveryZones = async () => {
    try {
      const response = await fetch('/api/admin/delivery-zones');
      if (response.ok) {
        const zones = await response.json();
        // فقط المناطق النشطة
        setDeliveryZones(zones.filter((z: DeliveryZone) => z.isActive));
      }
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const response = await fetch('/api/settings?keys=min_down_payment_percent,store_pickup_locations,allow_store_pickup');
      if (response.ok) {
        const settings = await response.json();
        
        const minDownPayment = settings.find((s: any) => s.key === 'min_down_payment_percent');
        if (minDownPayment) {
          setDownPaymentPercent(parseInt(minDownPayment.value));
        }
        
        const pickupLocs = settings.find((s: any) => s.key === 'store_pickup_locations');
        if (pickupLocs) {
          try {
            const locations = JSON.parse(pickupLocs.value);
            setPickupLocations(locations.map((addr: string) => ({ address: addr })));
            if (locations.length > 0) {
              setSelectedPickupLocation(locations[0]);
            }
          } catch (e) {
            console.error('Error parsing pickup locations:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching system settings:', error);
    }
  };

  const selectSavedAddress = (addressId: string) => {
    const address = savedAddresses.find(addr => addr.id === addressId);
    if (address) {
      setSelectedAddress(addressId);
      setFormData(prev => ({
        ...prev,
        fullName: address.fullName,
        phone: address.phone,
        alternativePhone: address.alternativePhone || "",
        governorate: address.governorate,
        city: address.city,
        district: address.district,
        street: address.street,
        buildingNumber: address.buildingNumber || "",
        floorNumber: address.floorNumber || "",
        apartmentNumber: address.apartmentNumber || "",
        landmark: address.landmark || "",
        postalCode: address.postalCode || "",
      }));
      setShowNewAddressForm(false);
    }
  };

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

  // إذا كانت السلة فارغة، نرجع null بدون toast
  if (items.length === 0) {
    if (mounted) {
      router.replace("/cart");
    }
    return null;
  }

  const totalPrice = getTotalPrice();
  const downPayment = deliveryMethod === 'STORE_PICKUP' ? (totalPrice * downPaymentPercent / 100) : 0;
  const remainingAmount = deliveryMethod === 'STORE_PICKUP' ? (totalPrice - downPayment) : 0;
  const finalTotal = deliveryMethod === 'HOME_DELIVERY' ? (totalPrice + deliveryFee) : downPayment;

  const saveNewAddress = async () => {
    if (!formData.saveAddress || !formData.addressTitle) return null;

    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.addressTitle,
          fullName: formData.fullName,
          phone: formData.phone,
          alternativePhone: formData.alternativePhone,
          governorate: formData.governorate,
          city: formData.city,
          district: formData.district,
          street: formData.street,
          buildingNumber: formData.buildingNumber,
          floorNumber: formData.floorNumber,
          apartmentNumber: formData.apartmentNumber,
          landmark: formData.landmark,
          postalCode: formData.postalCode,
          isDefault: savedAddresses.length === 0,
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.address;
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من وجود منتجات في السلة
    if (items.length === 0) {
      router.push("/cart");
      return;
    }
    
    // التحقق من طريقة التوصيل
    if (deliveryMethod === 'HOME_DELIVERY') {
      if (!formData.fullName || !formData.phone || !formData.governorate || 
          !formData.city || !formData.district || !formData.street) {
        toast.error("يرجى ملء جميع بيانات التوصيل");
        return;
      }
    } else if (deliveryMethod === 'STORE_PICKUP') {
      if (!selectedPickupLocation) {
        toast.error("يرجى اختيار مكان الاستلام");
        return;
      }
      if (!formData.fullName || !formData.phone) {
        toast.error("يرجى ملء الاسم ورقم الهاتف");
        return;
      }
    }

    if (paymentMethod.startsWith('INSTALLMENT_') && !selectedInstallmentPlan) {
      toast.error("يرجى اختيار خطة التقسيط");
      return;
    }

    setIsSubmitting(true);

    try {
      // حفظ العنوان إذا طلب المستخدم
      await saveNewAddress();

      // تجميع العنوان الكامل للتوصيل المنزلي
      const fullAddress = deliveryMethod === 'HOME_DELIVERY' ? [
        formData.street,
        formData.buildingNumber && `عمارة ${formData.buildingNumber}`,
        formData.floorNumber && `طابق ${formData.floorNumber}`,
        formData.apartmentNumber && `شقة ${formData.apartmentNumber}`,
        formData.landmark && `بجوار ${formData.landmark}`,
        formData.district,
        formData.city,
        formData.governorate,
        formData.postalCode && `رمز بريدي: ${formData.postalCode}`
      ].filter(Boolean).join(', ') : '';

      const orderData: any = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        deliveryAddress: fullAddress,
        deliveryPhone: formData.phone,
        customerNotes: formData.notes,
        deliveryFee: deliveryMethod === 'HOME_DELIVERY' ? deliveryFee : 0,
        paymentMethod,
        deliveryMethod,
        ...(deliveryMethod === 'HOME_DELIVERY' && { governorate: formData.governorate }),
        ...(deliveryMethod === 'STORE_PICKUP' && { 
          pickupLocation: selectedPickupLocation,
          downPayment: downPayment,
          remainingAmount: remainingAmount
        }),
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
      
      if (deliveryMethod === 'STORE_PICKUP') {
        toast.success(`تم إنشاء الطلب بنجاح! 🎉\nالمبلغ المدفوع مقدماً: ${downPayment.toFixed(2)} ج.م\nالمبلغ المتبقي: ${remainingAmount.toFixed(2)} ج.م`);
      } else {
        toast.success("تم إنشاء الطلب بنجاح! 🎉");
      }
      
      // تأخير التوجيه قليلاً لتجنب خطأ Router أثناء الـ render
      setTimeout(() => {
        router.push(`/orders/${order.id}`);
      }, 100);
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
            إتمام الطلب
          </h1>
          <p className="text-gray-400 text-sm sm:text-lg">
            أكمل بياناتك لاستلام طلبك
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Delivery Information */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Delivery Method Selection */}
              <Card className="bg-gray-800/80 border-teal-500/20">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
                    طريقة الاستلام
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  {/* Home Delivery */}
                  <div
                    onClick={() => setDeliveryMethod('HOME_DELIVERY')}
                    className={`cursor-pointer border-2 rounded-lg p-3 sm:p-4 transition-all ${
                      deliveryMethod === 'HOME_DELIVERY'
                        ? 'border-teal-500 bg-teal-900/30'
                        : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        deliveryMethod === 'HOME_DELIVERY'
                          ? 'border-teal-500 bg-teal-500'
                          : 'border-gray-500'
                      }`}>
                        {deliveryMethod === 'HOME_DELIVERY' && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 sm:mb-2">
                          <Home className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                          <h3 className="text-base sm:text-lg font-bold text-white">
                            التوصيل للمنزل
                          </h3>
                        </div>
                        <p className="text-gray-300 text-xs sm:text-sm mb-2">
                          سيتم توصيل طلبك إلى عنوانك
                        </p>
                        <div className="flex items-center gap-2 text-xs text-teal-400">
                          <CheckCircle2 className="w-3 h-3" />
                          رسوم توصيل حسب المحافظة
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Store Pickup */}
                  <div
                    onClick={() => setDeliveryMethod('STORE_PICKUP')}
                    className={`cursor-pointer border-2 rounded-lg p-3 sm:p-4 transition-all ${
                      deliveryMethod === 'STORE_PICKUP'
                        ? 'border-purple-500 bg-purple-900/30'
                        : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        deliveryMethod === 'STORE_PICKUP'
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-500'
                      }`}>
                        {deliveryMethod === 'STORE_PICKUP' && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 sm:mb-2">
                          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                          <h3 className="text-base sm:text-lg font-bold text-white">
                            الاستلام من الفرع
                          </h3>
                        </div>
                        <p className="text-gray-300 text-xs sm:text-sm mb-2">
                          استلم طلبك من أحد فروعنا
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-purple-400">
                            <CheckCircle2 className="w-3 h-3" />
                            لا توجد رسوم توصيل
                          </div>
                          <div className="flex items-center gap-2 text-xs text-yellow-400">
                            <CheckCircle2 className="w-3 h-3" />
                            يتطلب دفعة مقدمة {downPaymentPercent}%
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Pickup Locations */}
                    {deliveryMethod === 'STORE_PICKUP' && pickupLocations.length > 0 && (
                      <div className="mt-4 space-y-2 border-t border-gray-600 pt-4">
                        <Label className="text-white text-sm">اختر مكان الاستلام:</Label>
                        {pickupLocations.map((location, index) => (
                          <div
                            key={index}
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setSelectedPickupLocation(location.address); 
                            }}
                            className={`cursor-pointer border rounded-lg p-3 transition-all ${
                              selectedPickupLocation === location.address
                                ? 'border-purple-500 bg-purple-900/30'
                                : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                selectedPickupLocation === location.address
                                  ? 'border-purple-500 bg-purple-500'
                                  : 'border-gray-500'
                              }`}>
                                {selectedPickupLocation === location.address && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                              <span className="text-white text-sm">{location.address}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Show address form only for HOME_DELIVERY */}
              {deliveryMethod === 'HOME_DELIVERY' && (
                <>
                  {/* العناوين المحفوظة */}
                  {!showNewAddressForm && savedAddresses.length > 0 && (
                    <AddressSelector
                      savedAddresses={savedAddresses}
                      selectedAddress={selectedAddress}
                      onSelectAddress={selectSavedAddress}
                      onNewAddress={() => setShowNewAddressForm(true)}
                      loading={loadingAddresses}
                    />
                  )}

                  {/* نموذج العنوان الجديد */}
                  {showNewAddressForm && (
                    <>
                      {savedAddresses.length > 0 && (
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowNewAddressForm(false);
                              if (savedAddresses.length > 0) {
                                selectSavedAddress(savedAddresses[0].id);
                              }
                            }}
                            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                          >
                            عرض العناوين المحفوظة
                          </Button>
                        </div>
                      )}
                      <AddressForm
                        formData={formData}
                        onChange={handleInputChange}
                        onCheckboxChange={(checked) => 
                          setFormData(prev => ({ ...prev, saveAddress: checked }))
                        }
                      />
                    </>
                  )}
                </>
              )}

              {/* Basic Contact Info for STORE_PICKUP */}
              {deliveryMethod === 'STORE_PICKUP' && (
                <Card className="bg-gray-800/80 border-purple-500/20">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                      معلومات الاتصال
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 sm:p-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-white">
                        الاسم الكامل <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="أدخل اسمك الكامل"
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">
                        رقم الهاتف <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="01xxxxxxxxx"
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
                      <h4 className="text-white font-bold mb-2">ملاحظة هامة:</h4>
                      <p className="text-white/80 text-sm">
                        سيتم التواصل معك لتحديد موعد الاستلام المناسب بعد تأكيد الطلب.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Method */}
              <Card className="bg-gray-800/80 border-teal-500/20">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
                    طريقة الدفع
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  {/* Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                    className={`cursor-pointer border-2 rounded-lg p-3 sm:p-4 transition-all ${
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
                        <div className="flex items-center gap-2 mb-1 sm:mb-2">
                          <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                          <h3 className="text-base sm:text-lg font-bold text-white">
                            الدفع عند الاستلام (COD)
                          </h3>
                        </div>
                        <p className="text-gray-300 text-xs sm:text-sm mb-2">
                          ادفع نقداً عند استلام الطلب بعد فحص المنتجات
                        </p>
                        <div className="space-y-0.5 sm:space-y-1">
                          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-400">
                            <CheckCircle2 className="w-3 h-3 text-teal-400 flex-shrink-0" />
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
              <Card className="bg-gray-800/80 border-teal-500/20 lg:sticky lg:top-24">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-white">
                    ملخص الطلب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  {/* Products */}
                  <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-1.5 sm:py-2 border-b border-gray-700">
                        <div className="flex-1">
                          <p className="text-white font-medium text-xs sm:text-sm">{item.name}</p>
                          <p className="text-gray-400 text-[10px] sm:text-xs">
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
                    
                    {deliveryMethod === 'HOME_DELIVERY' && (
                      <div className="flex justify-between text-gray-300">
                        <span>رسوم التوصيل:</span>
                        <span className="font-bold text-teal-400">
                          {deliveryFee > 0 ? `${deliveryFee.toFixed(2)} جنيه` : 'مجاناً'}
                        </span>
                      </div>
                    )}

                    {deliveryMethod === 'STORE_PICKUP' && (
                      <>
                        <div className="flex justify-between text-purple-300">
                          <span>الدفعة المقدمة ({downPaymentPercent}%):</span>
                          <span className="font-bold">{downPayment.toFixed(2)} جنيه</span>
                        </div>
                        <div className="flex justify-between text-yellow-300">
                          <span>المبلغ المتبقي:</span>
                          <span className="font-bold">{remainingAmount.toFixed(2)} جنيه</span>
                        </div>
                        <div className="bg-purple-900/30 border border-purple-500/30 rounded p-2 text-xs text-white/80 mt-2">
                          💡 ادفع المبلغ المتبقي عند الاستلام من الفرع
                        </div>
                      </>
                    )}
                  </div>

                  <div className="border-t border-gray-700 pt-3 sm:pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-base sm:text-xl font-bold text-white">
                        {deliveryMethod === 'STORE_PICKUP' ? 'المبلغ المطلوب الآن:' : 'الإجمالي:'}
                      </span>
                      <span className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                        {finalTotal.toFixed(2)} جنيه
                      </span>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-sm sm:text-lg py-4 sm:py-6"
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

                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 sm:p-4 text-center">
                    <p className="text-[10px] sm:text-xs text-gray-400">
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
