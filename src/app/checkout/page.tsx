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

type PaymentMethod = 'CASH_ON_DELIVERY' | 'BANK_TRANSFER' | 'E_WALLET_TRANSFER' | 'WE_PAY' | 'GOOGLE_PAY' | 'INSTALLMENT_4' | 'INSTALLMENT_6' | 'INSTALLMENT_12' | 'INSTALLMENT_24' | 'PARTIAL_PAYMENT_50' | 'FULL_PAYMENT';
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('WE_PAY');
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
  
  // Checkout settings (enabled/disabled features)
  const [checkoutSettings, setCheckoutSettings] = useState({
    deliveryMethodHomeDelivery: true,
    deliveryMethodStorePickup: true,
    paymentMethodCashOnDelivery: true,
    paymentMethodBankTransfer: true,
    paymentMethodEWallet: true,
    paymentMethodGooglePay: true,
    paymentMethodInstallment: true,
  });
  
  // Bank Transfer Receipt states
  const [bankTransferReceipt, setBankTransferReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  
  // E-Wallet Transfer Receipt states
  const [eWalletReceipt, setEWalletReceipt] = useState<File | null>(null);
  const [eWalletReceiptPreview, setEWalletReceiptPreview] = useState<string | null>(null);
  const [uploadingEWalletReceipt, setUploadingEWalletReceipt] = useState(false);
  
  // WE Pay Receipt states
  const [wePayReceipt, setWePayReceipt] = useState<File | null>(null);
  const [wePayReceiptPreview, setWePayReceiptPreview] = useState<string | null>(null);
  const [uploadingWePayReceipt, setUploadingWePayReceipt] = useState(false);
  
  // Installment Documents states
  const [idCardFront, setIdCardFront] = useState<File | null>(null);
  const [idCardFrontPreview, setIdCardFrontPreview] = useState<string | null>(null);
  const [idCardBack, setIdCardBack] = useState<File | null>(null);
  const [idCardBackPreview, setIdCardBackPreview] = useState<string | null>(null);
  const [signedPromissoryNote, setSignedPromissoryNote] = useState<File | null>(null);
  const [signedPromissoryNotePreview, setSignedPromissoryNotePreview] = useState<string | null>(null);
  const [firstPaymentReceipt, setFirstPaymentReceipt] = useState<File | null>(null);
  const [firstPaymentReceiptPreview, setFirstPaymentReceiptPreview] = useState<string | null>(null);
  const [uploadingInstallmentDocs, setUploadingInstallmentDocs] = useState(false);
  
  const { items, getTotalPrice, clearCart } = useCartStore();
  
  // التحقق من المنتجات القابلة للتقسيط
  const [installmentEligibleItems, setInstallmentEligibleItems] = useState<any[]>([]);
  const [hasInstallmentItems, setHasInstallmentItems] = useState(false);

  // Check if all items are clothing (COD only for clothing)
  const clothingCategories = [
    'تيشيرتات', 'T-Shirts',
    'أحذية', 'Shoes',
    'بناطيل', 'Pants',
    'جواكت', 'Jackets',
    'شي إن', 'Shein',
    'ترينديول', 'Trendyol',
    'ملابس',
    'اكسسورارت', 'accessories'
  ];
  
  const isAllClothing = items.every(item => 
    item.categoryName && clothingCategories.includes(item.categoryName)
  );
  
  // Check if cart has Shein or Trendyol items
  const hasSheinOrTrendyol = items.some(item => 
    item.categoryName && ['شي إن', 'Shein', 'ترينديول', 'Trendyol'].includes(item.categoryName)
  );
  
  // Check if all items are Shein/Trendyol
  const isAllSheinOrTrendyol = items.every(item => 
    item.categoryName && ['شي إن', 'Shein', 'ترينديول', 'Trendyol'].includes(item.categoryName)
  );

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
    saveAddress: true,
    addressTitle: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // التحقق من المنتجات القابلة للتقسيط
  useEffect(() => {
    console.log('🔄 [INSTALLMENT USEEFFECT] تم تشغيل useEffect');
    const checkInstallmentEligibility = async () => {
      console.log('🛒 [INSTALLMENT CHECK] بدء الفحص - عدد المنتجات:', items.length);
      
      if (items.length === 0) {
        console.log('⚠️ [INSTALLMENT CHECK] السلة فاضية - إخفاء التقسيط');
        setHasInstallmentItems(false);
        setInstallmentEligibleItems([]);
        return;
      }
      
      console.log('🛒 [INSTALLMENT CHECK] فحص المنتجات في السلة:');
      console.log('  - itemsCount:', items.length);
      items.forEach((item, index) => {
        console.log(`  - [${index + 1}] ${item.name || item.nameAr}: ${item.price} ج (ID: ${item.id})`);
      });
      
      try {
        // جلب معلومات المنتجات من API
        const productIds = items.map(item => item.id).join(',');
        const response = await fetch(`/api/products/check-installment?ids=${productIds}`);
        
        const data = await response.json();
        console.log('📦 [INSTALLMENT API] نتيجة API:');
        console.log('  - success:', data.success);
        console.log('  - products count:', data.products?.length || 0);
        console.log('  - products:', data.products);
        
        if (data.success && data.products && Array.isArray(data.products)) {
          const eligibleItems = items.filter(item => 
            data.products.find((p: any) => p.id === item.id && p.allowInstallment === true)
          );
          console.log('✅ [INSTALLMENT CHECK] المنتجات القابلة للتقسيط:');
          console.log('  - eligibleCount:', eligibleItems.length);
          console.log('  - eligibleItems:', eligibleItems.map(i => ({ id: i.id, name: i.name })));
          setInstallmentEligibleItems(eligibleItems);
          setHasInstallmentItems(eligibleItems.length > 0);
        } else {
          console.log('❌ [INSTALLMENT CHECK] لا يوجد منتجات قابلة للتقسيط');
          setHasInstallmentItems(false);
          setInstallmentEligibleItems([]);
        }
      } catch (error) {
        console.error('❌ [INSTALLMENT CHECK] خطأ في API:', error);
        setHasInstallmentItems(false);
        setInstallmentEligibleItems([]);
      }
    };
    
    checkInstallmentEligibility();
    console.log('✅ [INSTALLMENT USEEFFECT] انتهى useEffect');
  }, [items]);

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

  // Check if returning from installment agreement completion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const installmentCompleted = urlParams.get('installmentAgreementCompleted');
    
    if (installmentCompleted === 'true') {
      // Get installment documents from sessionStorage
      const storedDocs = sessionStorage.getItem('installmentDocuments');
      if (storedDocs) {
        const docs = JSON.parse(storedDocs);
        // We have the documents, now we can proceed with order creation
        // The documents will be used when submitting the order
        toast.success('تم توثيق الكمبيالة بنجاح! يمكنك الآن إتمام الطلب', {
          duration: 5000
        });
      }
    }
  }, []);

  // Auto-select payment method based on cart items
  useEffect(() => {
    if (mounted && items.length > 0) {
      // الصفحة الحالية تستخدم WE_PAY فقط كطريقة دفع رئيسية
      // لا حاجة لتغيير paymentMethod تلقائياً
      // إذا كنت تريد تفعيل طرق دفع أخرى، قم بإزالة هذا التعليق
      
      /*
      // If cart has Shein/Trendyol, default to partial payment
      if (hasSheinOrTrendyol && paymentMethod === 'CASH_ON_DELIVERY') {
        setPaymentMethod('PARTIAL_PAYMENT_50');
      }
      // If cart contains non-clothing items, default to E-Wallet
      else if (!isAllClothing && paymentMethod === 'CASH_ON_DELIVERY') {
        setPaymentMethod('E_WALLET_TRANSFER');
      }
      */
    }
  }, [mounted, items, isAllClothing, hasSheinOrTrendyol, paymentMethod]);

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
      const keys = [
        'min_down_payment_percent',
        'store_pickup_locations',
        'allow_store_pickup',
        'delivery_method_home_delivery',
        'delivery_method_store_pickup',
        'payment_method_cash_on_delivery',
        'payment_method_bank_transfer',
        'payment_method_e_wallet',
        'payment_method_google_pay',
        'payment_method_installment',
      ];
      
      const response = await fetch(`/api/settings?keys=${keys.join(',')}`);
      if (response.ok) {
        const settings = await response.json();
        
        // Load min down payment
        const minDownPayment = settings.find((s: any) => s.key === 'min_down_payment_percent');
        if (minDownPayment) {
          setDownPaymentPercent(parseInt(minDownPayment.value));
        }
        
        // Load pickup locations
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
        
        // Load checkout settings
        const installmentSettingRaw = settings.find((s: any) => s.key === 'payment_method_installment');
        console.log('🔍 [SETTINGS LOAD] payment_method_installment من Database:');
        console.log('  - found:', !!installmentSettingRaw);
        console.log('  - key:', installmentSettingRaw?.key);
        console.log('  - value:', installmentSettingRaw?.value);
        console.log('  - type:', typeof installmentSettingRaw?.value);
        
        const checkoutSettingsData = {
          deliveryMethodHomeDelivery: settings.find((s: any) => s.key === 'delivery_method_home_delivery')?.value !== 'false',
          deliveryMethodStorePickup: settings.find((s: any) => s.key === 'delivery_method_store_pickup')?.value !== 'false',
          paymentMethodCashOnDelivery: settings.find((s: any) => s.key === 'payment_method_cash_on_delivery')?.value !== 'false',
          paymentMethodBankTransfer: settings.find((s: any) => s.key === 'payment_method_bank_transfer')?.value !== 'false',
          paymentMethodGooglePay: settings.find((s: any) => s.key === 'payment_method_google_pay')?.value !== 'false',
          paymentMethodEWallet: settings.find((s: any) => s.key === 'payment_method_e_wallet')?.value !== 'false',
          paymentMethodInstallment: settings.find((s: any) => s.key === 'payment_method_installment')?.value !== 'false',
        };
        console.log('⚙️ [SETTINGS] إعدادات Checkout:');
        console.log('  - paymentMethodInstallment:', checkoutSettingsData.paymentMethodInstallment);
        console.log('  - paymentMethodCashOnDelivery:', checkoutSettingsData.paymentMethodCashOnDelivery);
        console.log('💳 [INSTALLMENT SETTING] قيمة payment_method_installment:');
        console.log('  - rawValue:', installmentSettingRaw?.value);
        console.log('  - parsedValue:', checkoutSettingsData.paymentMethodInstallment);
        console.log('  - willShow:', checkoutSettingsData.paymentMethodInstallment ? 'نعم ✅' : 'لا ❌');
        setCheckoutSettings(checkoutSettingsData);
        
        // Set default delivery method based on enabled settings
        if (!checkoutSettingsData.deliveryMethodHomeDelivery && checkoutSettingsData.deliveryMethodStorePickup) {
          setDeliveryMethod('STORE_PICKUP');
        } else if (checkoutSettingsData.deliveryMethodHomeDelivery) {
          setDeliveryMethod('HOME_DELIVERY');
        }
        
        // Set default payment method based on enabled settings
        if (!checkoutSettingsData.paymentMethodCashOnDelivery && checkoutSettingsData.paymentMethodBankTransfer) {
          setPaymentMethod('BANK_TRANSFER');
        } else if (!checkoutSettingsData.paymentMethodCashOnDelivery && !checkoutSettingsData.paymentMethodBankTransfer && checkoutSettingsData.paymentMethodEWallet) {
          setPaymentMethod('E_WALLET_TRANSFER');
        } else if (!checkoutSettingsData.paymentMethodCashOnDelivery && !checkoutSettingsData.paymentMethodBankTransfer && !checkoutSettingsData.paymentMethodEWallet && checkoutSettingsData.paymentMethodInstallment) {
          setPaymentMethod('INSTALLMENT_4');
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
  
  // Calculate amounts based on payment method
  let downPayment = 0;
  let remainingAmount = 0;
  
  if (deliveryMethod === 'STORE_PICKUP') {
    downPayment = totalPrice * downPaymentPercent / 100;
    remainingAmount = totalPrice - downPayment;
  } else if (paymentMethod === 'PARTIAL_PAYMENT_50') {
    downPayment = totalPrice / 2; // 50% مقدم
    remainingAmount = totalPrice / 2; // 50% عند الاستلام
  } else if (paymentMethod === 'FULL_PAYMENT') {
    downPayment = totalPrice; // دفع كامل
    remainingAmount = 0;
  }
  
  const finalTotal = deliveryMethod === 'HOME_DELIVERY' ? 
    (paymentMethod === 'PARTIAL_PAYMENT_50' || paymentMethod === 'FULL_PAYMENT' ? downPayment + deliveryFee : totalPrice + deliveryFee) : 
    downPayment;

  const saveNewAddress = async () => {
    if (!formData.saveAddress) return null;

    try {
      // التحقق من وجود عنوان مطابق أولاً
      const existingAddress = savedAddresses.find(addr => 
        addr.governorate === formData.governorate &&
        addr.city === formData.city &&
        addr.district === formData.district &&
        addr.street === formData.street &&
        addr.buildingNumber === formData.buildingNumber &&
        addr.floorNumber === formData.floorNumber &&
        addr.apartmentNumber === formData.apartmentNumber
      );

      // إذا كان العنوان موجود فعلاً، لا نضيف عنوان جديد
      if (existingAddress) {
        console.log('العنوان موجود بالفعل، لن يتم التكرار:', existingAddress.title);
        return existingAddress;
      }

      // توليد عنوان تلقائي إذا لم يتم توفيره
      const autoTitle = formData.addressTitle || 
        `${formData.governorate || ''} - ${formData.city || ''} - ${formData.district || ''}`;

      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: autoTitle,
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
        console.log('✅ تم حفظ عنوان جديد:', data.address.title);
        // تحديث قائمة العناوين المحفوظة
        setSavedAddresses(prev => [...prev, data.address]);
        return data.address;
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
    return null;
  };

  // معالج تحديد صورة إيصال التحويل
  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error("يرجى اختيار صورة فقط");
        return;
      }

      setBankTransferReceipt(file);
      
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast.success("تم اختيار الصورة بنجاح");
    }
  };

  // رفع صورة إيصال المحفظة
  const handleEWalletReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error("يرجى اختيار صورة فقط");
        return;
      }

      setEWalletReceipt(file);
      
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onloadend = () => {
        setEWalletReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast.success("تم اختيار صورة إيصال المحفظة بنجاح");
    }
  };

  // WE Pay Receipt handler
  const handleWePayReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error("يرجى اختيار صورة فقط");
        return;
      }

      setWePayReceipt(file);
      
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onloadend = () => {
        setWePayReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast.success("تم اختيار صورة إيصال وي باي بنجاح");
    }
  };

  // Installment Documents handlers
  const handleIdCardFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("يرجى اختيار صورة فقط");
        return;
      }
      setIdCardFront(file);
      const reader = new FileReader();
      reader.onloadend = () => setIdCardFrontPreview(reader.result as string);
      reader.readAsDataURL(file);
      toast.success("تم اختيار صورة البطاقة الأمامية");
    }
  };

  const handleIdCardBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("يرجى اختيار صورة فقط");
        return;
      }
      setIdCardBack(file);
      const reader = new FileReader();
      reader.onloadend = () => setIdCardBackPreview(reader.result as string);
      reader.readAsDataURL(file);
      toast.success("تم اختيار صورة البطاقة الخلفية");
    }
  };

  const handleSignedPromissoryNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("يرجى اختيار صورة فقط");
        return;
      }
      setSignedPromissoryNote(file);
      const reader = new FileReader();
      reader.onloadend = () => setSignedPromissoryNotePreview(reader.result as string);
      reader.readAsDataURL(file);
      toast.success("تم اختيار صورة الكمبيالة الموقعة");
    }
  };

  const handleFirstPaymentReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("يرجى اختيار صورة فقط");
        return;
      }
      setFirstPaymentReceipt(file);
      const reader = new FileReader();
      reader.onloadend = () => setFirstPaymentReceiptPreview(reader.result as string);
      reader.readAsDataURL(file);
      toast.success("تم اختيار صورة إيصال الدفعة الأولى");
    }
  };

  // رفع صورة الإيصال إلى Cloudinary عبر API
  const uploadReceiptToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-receipt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل رفع الصورة');
      }

      const data = await response.json();
      return data.url;
    } catch (error: any) {
      console.error('خطأ في رفع الصورة:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من وجود منتجات في السلة
    if (items.length === 0) {
      router.push("/cart");
      return;
    }
    
    // Validate COD is only for clothing (but not Shein/Trendyol)
    if (paymentMethod === 'CASH_ON_DELIVERY') {
      if (!isAllClothing) {
        toast.error("الدفع عند الاستلام متاح فقط للملابس. يرجى اختيار طريقة دفع أخرى.");
        return;
      }
      if (hasSheinOrTrendyol) {
        toast.error("منتجات شي إن وترينديول تتطلب دفع جزئي أو كامل مقدماً.");
        return;
      }
    }
    
    // Validate Shein/Trendyol requires partial or full payment
    if (hasSheinOrTrendyol && !['PARTIAL_PAYMENT_50', 'FULL_PAYMENT', 'E_WALLET_TRANSFER'].includes(paymentMethod)) {
      toast.error("منتجات شي إن وترينديول تتطلب دفع جزئي (50%) أو دفع كامل مقدماً.");
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

    // للتقسيط: التحويل لصفحة الكمبيالة
    if (paymentMethod === 'INSTALLMENT_4') {
      // حفظ بيانات الطلب في session storage
      sessionStorage.setItem('checkoutData', JSON.stringify({
        items: items,
        deliveryMethod: deliveryMethod,
        formData: formData,
        deliveryFee: deliveryFee,
        selectedAddress: selectedAddress,
        selectedPickupLocation: selectedPickupLocation,
        paymentMethod: paymentMethod
      }));
      
      // التوجيه لصفحة الكمبيالة
      const totalAmount = getTotalPrice() + deliveryFee;
      router.push(`/installment-agreement?totalAmount=${totalAmount}&downPayment=${totalAmount/4}&installments=4&monthlyAmount=${totalAmount/4}`);
      return;
    }

    //  التحقق من رفع صورة إيصال التحويل للتحويل البنكي
    if (paymentMethod === 'BANK_TRANSFER' && !bankTransferReceipt) {
      toast.error("يرجى رفع صورة إيصال التحويل البنكي");
      return;
    }

    // التحقق من رفع صورة إيصال التحويل للمحفظة الإلكترونية
    if (paymentMethod === 'E_WALLET_TRANSFER' && !eWalletReceipt) {
      toast.error("يرجى رفع صورة إيصال التحويل من المحفظة");
      return;
    }

    // التحقق من رفع صورة إيصال التحويل لمحفظة وي باي
    if (paymentMethod === 'WE_PAY' && !wePayReceipt) {
      toast.error("يرجى رفع صورة إيصال التحويل من وي باي");
      return;
    }

    setIsSubmitting(true);

    try {
      // حفظ العنوان إذا طلب المستخدم
      await saveNewAddress();

      // رفع صورة إيصال التحويل البنكي إلى Cloudinary
      let receiptUrl: string | undefined;
      if (paymentMethod === 'BANK_TRANSFER' && bankTransferReceipt) {
        setUploadingReceipt(true);
        toast.loading("جاري رفع صورة الإيصال...", { id: 'uploading-receipt' });
        try {
          receiptUrl = await uploadReceiptToCloudinary(bankTransferReceipt);
          toast.success("تم رفع صورة الإيصال بنجاح", { id: 'uploading-receipt' });
        } catch (error) {
          toast.error("فشل رفع صورة الإيصال. يرجى المحاولة مرة أخرى", { id: 'uploading-receipt' });
          setIsSubmitting(false);
          setUploadingReceipt(false);
          return;
        }
        setUploadingReceipt(false);
      }

      // رفع صورة إيصال التحويل من المحفظة إلى Cloudinary
      let eWalletReceiptUrl: string | undefined;
      if (paymentMethod === 'E_WALLET_TRANSFER' && eWalletReceipt) {
        setUploadingEWalletReceipt(true);
        toast.loading("جاري رفع صورة إيصال المحفظة...", { id: 'uploading-ewallet-receipt' });
        try {
          eWalletReceiptUrl = await uploadReceiptToCloudinary(eWalletReceipt);
          toast.success("تم رفع صورة إيصال المحفظة بنجاح", { id: 'uploading-ewallet-receipt' });
        } catch (error) {
          toast.error("فشل رفع صورة الإيصال. يرجى المحاولة مرة أخرى", { id: 'uploading-ewallet-receipt' });
          setIsSubmitting(false);
          setUploadingEWalletReceipt(false);
          return;
        }
        setUploadingEWalletReceipt(false);
      }

      // رفع صورة إيصال التحويل من وي باي إلى Cloudinary
      let wePayReceiptUrl: string | undefined;
      if (paymentMethod === 'WE_PAY' && wePayReceipt) {
        setUploadingWePayReceipt(true);
        toast.loading("جاري رفع صورة إيصال وي باي...", { id: 'uploading-wepay-receipt' });
        try {
          wePayReceiptUrl = await uploadReceiptToCloudinary(wePayReceipt);
          toast.success("تم رفع صورة إيصال وي باي بنجاح", { id: 'uploading-wepay-receipt' });
        } catch (error) {
          toast.error("فشل رفع صورة الإيصال. يرجى المحاولة مرة أخرى", { id: 'uploading-wepay-receipt' });
          setIsSubmitting(false);
          setUploadingWePayReceipt(false);
          return;
        }
        setUploadingWePayReceipt(false);
      }

      // رفع مستندات التقسيط إلى Cloudinary (أو جلبها من sessionStorage)
      let idCardFrontUrl: string | undefined;
      let idCardBackUrl: string | undefined;
      let signedPromissoryNoteUrl: string | undefined;
      let firstPaymentReceiptUrl: string | undefined;
      
      if (paymentMethod === 'INSTALLMENT_4') {
        // تحقق من وجود مستندات محفوظة من صفحة الكمبيالة
        const storedDocs = sessionStorage.getItem('installmentDocuments');
        
        if (storedDocs) {
          // استخدام المستندات من صفحة الكمبيالة
          const docs = JSON.parse(storedDocs);
          idCardFrontUrl = docs.nationalIdImage;
          idCardBackUrl = docs.nationalIdImage; // نفس البطاقة (الصفحة الحالية تجمع front/back)
          signedPromissoryNoteUrl = docs.signature;
          firstPaymentReceiptUrl = docs.selfieImage; // نستخدم السيلفي كإثبات
          
          toast.success("تم استخدام المستندات الموثقة من الكمبيالة ✓");
          
        } else {
          // لا توجد مستندات - إعادة توجيه لصفحة الكمبيالة
          toast.error("يرجى توثيق الكمبيالة أولاً");
          const totalAmount = getTotalPrice() + deliveryFee;
          router.push(`/installment-agreement?totalAmount=${totalAmount}&downPayment=${totalAmount/4}&installments=4&monthlyAmount=${totalAmount/4}`);
          setIsSubmitting(false);
          return;
        }
      }

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
        ...((paymentMethod === 'PARTIAL_PAYMENT_50' || paymentMethod === 'FULL_PAYMENT') && {
          downPayment: downPayment,
          remainingAmount: remainingAmount,
          isPartialPayment: paymentMethod === 'PARTIAL_PAYMENT_50'
        }),
        ...(paymentMethod === 'E_WALLET_TRANSFER' && { 
          eWalletType,
          ...(eWalletReceiptUrl && { eWalletReceipt: eWalletReceiptUrl })
        }),
        ...(paymentMethod === 'WE_PAY' && {
          ...(wePayReceiptUrl && { wePayReceipt: wePayReceiptUrl })
        }),
        ...(paymentMethod === 'BANK_TRANSFER' && receiptUrl && { bankTransferReceipt: receiptUrl }),
      };

      // إضافة بيانات الأقساط إذا كانت الدفع بالتقسيط
      if (paymentMethod.startsWith('INSTALLMENT_') && selectedInstallmentPlan) {
        orderData.installmentPlan = {
          totalAmount: selectedInstallmentPlan.totalAmount || finalTotal,
          firstPayment: selectedInstallmentPlan.firstPayment || (finalTotal / 4),
          monthlyAmount: selectedInstallmentPlan.monthlyPayment || (finalTotal / 4),
          numberOfMonths: selectedInstallmentPlan.months || 4,
          remainingPayments: selectedInstallmentPlan.remainingPayments || 3,
        };
        
        // إضافة مستندات التقسيط
        if (paymentMethod === 'INSTALLMENT_4') {
          orderData.installmentDocuments = {
            idCardFront: idCardFrontUrl,
            idCardBack: idCardBackUrl,
            signedPromissoryNote: signedPromissoryNoteUrl,
            firstPaymentReceipt: firstPaymentReceiptUrl,
          };
        }
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
      
      // مسح المستندات المحفوظة
      sessionStorage.removeItem('installmentDocuments');
      sessionStorage.removeItem('checkoutData');
      
      if (deliveryMethod === 'STORE_PICKUP') {
        toast.success(`تم إنشاء الطلب بنجاح! 🎉\nالمبلغ المدفوع مقدماً: ${downPayment.toFixed(2)} ج.م\nالمبلغ المتبقي: ${remainingAmount.toFixed(2)} ج.م`);
      } else if (paymentMethod === 'BANK_TRANSFER') {
        toast.success("تم إنشاء الطلب بنجاح! جاري مراجعة طلبك 🎉");
      } else if (paymentMethod === 'PARTIAL_PAYMENT_50') {
        toast.success(`تم إنشاء الطلب بنجاح! 🎉\n✅ المبلغ المدفوع: ${downPayment.toFixed(2)} ج.م\n📦 المبلغ عند الاستلام: ${(remainingAmount + deliveryFee).toFixed(2)} ج.م`);
      } else if (paymentMethod === 'FULL_PAYMENT') {
        toast.success(`تم إنشاء الطلب بنجاح! 🎉\n✅ تم دفع المبلغ كاملاً: ${(downPayment + deliveryFee).toFixed(2)} ج.م\n📦 لا توجد مبالغ إضافية`);
      } else {
        toast.success("تم إنشاء الطلب بنجاح! 🎉");
      }
      
      // تأخير التوجيه قليلاً لتجنب خطأ Router أثناء الـ render
      setTimeout(() => {
        // توجيه للصفحة المناسبة حسب طريقة الدفع
        if (paymentMethod === 'BANK_TRANSFER') {
          router.push(`/order-pending?orderNumber=${order.orderNumber}`);
        } else {
          router.push(`/orders/${order.id}`);
        }
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
                  {checkoutSettings.deliveryMethodHomeDelivery && (
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
                  )}

                  {/* Store Pickup */}
                  {checkoutSettings.deliveryMethodStorePickup && (
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
                  )}
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
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                    اختر طريقة الدفع
                  </CardTitle>
                  <p className="text-gray-300 text-sm mt-2">
                    💳 اختر الطريقة الأنسب لك
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  
                  {/* قائمة اختيار طرق الدفع */}
                  <div className="space-y-3">
                    {/* WE Pay Option */}
                    <div
                      onClick={() => setPaymentMethod('WE_PAY')}
                      className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${
                        paymentMethod === 'WE_PAY'
                          ? 'border-purple-500 bg-purple-900/30 shadow-lg'
                          : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          paymentMethod === 'WE_PAY'
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-500'
                        }`}>
                          {paymentMethod === 'WE_PAY' && (
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-purple-400" />
                            محفظة وي باي (WE Pay)
                          </h3>
                          <p className="text-gray-300 text-sm mt-1">
                            حوّل على المحفظة وارفع صورة الإيصال
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Google Pay Option */}
                    {checkoutSettings.paymentMethodGooglePay && (
                      <div
                        onClick={() => setPaymentMethod('GOOGLE_PAY')}
                        className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${
                          paymentMethod === 'GOOGLE_PAY'
                            ? 'border-yellow-500 bg-yellow-900/30 shadow-lg'
                            : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            paymentMethod === 'GOOGLE_PAY'
                              ? 'border-yellow-500 bg-yellow-500'
                              : 'border-gray-500'
                          }`}>
                            {paymentMethod === 'GOOGLE_PAY' && (
                              <div className="w-3 h-3 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                              <CreditCard className="w-5 h-5 text-yellow-400" />
                              Google Pay
                              <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">سريع</span>
                            </h3>
                            <p className="text-gray-300 text-sm mt-1">
                              دفع فوري وآمن بالبطاقة بضغطة واحدة
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 🏦 التقسيط على 4 دفعات - SIMPLE VERSION */}
                    {(() => {
                      const shouldShowInstallment = checkoutSettings.paymentMethodInstallment && hasInstallmentItems;
                      
                      // Enhanced logging with actual values
                      console.log('🔍 [RENDER CHECK] Installment Rendering:');
                      console.log('  ⚙️ paymentMethodInstallment:', checkoutSettings.paymentMethodInstallment);
                      console.log('  📦 hasInstallmentItems:', hasInstallmentItems);
                      console.log('  🛒 itemsInCart:', items.length);
                      console.log('  ✅ shouldShow:', shouldShowInstallment);
                      
                      if (!shouldShowInstallment) {
                        console.log('❌ [RENDER] التقسيط مخفي - السبب:');
                        console.log('  - settingDisabled:', !checkoutSettings.paymentMethodInstallment, '(paymentMethodInstallment =', checkoutSettings.paymentMethodInstallment, ')');
                        console.log('  - noEligibleItems:', !hasInstallmentItems, '(hasInstallmentItems =', hasInstallmentItems, ')');
                        console.log('  - cartEmpty:', items.length === 0, '(items.length =', items.length, ')');
                      } else {
                        console.log('✅ [RENDER] التقسيط ظاهر!');
                      }
                      
                      return shouldShowInstallment;
                    })() && (
                      <div
                        onClick={() => {
                          setPaymentMethod('INSTALLMENT_4');
                          // تعيين خطة التقسيط تلقائياً
                          setSelectedInstallmentPlan({
                            months: 4,
                            monthlyPayment: finalTotal / 4,
                            firstPayment: finalTotal / 4,
                            remainingPayments: 3,
                            totalAmount: finalTotal
                          });
                        }}
                        className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${
                          paymentMethod === 'INSTALLMENT_4'
                            ? 'border-blue-500 bg-blue-900/30 shadow-lg'
                            : 'border-gray-600 bg-gray-700/30 hover:border-blue-500'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            paymentMethod === 'INSTALLMENT_4'
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-500'
                          }`}>
                            {paymentMethod === 'INSTALLMENT_4' && (
                              <div className="w-3 h-3 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-blue-400" />
                              🏦 التقسيط على 4 دفعات
                              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full animate-pulse">🔥 جديد</span>
                            </h3>
                            <p className="text-gray-300 text-sm mt-1">
                              قسّط مشترياتك - دفع {(finalTotal / 4).toFixed(0)} ج × 4 دفعات
                            </p>
                            <div className="mt-2 text-xs text-emerald-300 bg-emerald-900/20 border border-emerald-500/30 rounded px-2 py-1 inline-block">
                              ✅ {installmentEligibleItems.length} منتج قابل للتقسيط
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cash on Delivery Option */}
                    {checkoutSettings.paymentMethodCashOnDelivery && isAllClothing && !hasSheinOrTrendyol && (
                      <div
                        onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                        className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${
                          paymentMethod === 'CASH_ON_DELIVERY'
                            ? 'border-teal-500 bg-teal-900/30 shadow-lg'
                            : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            paymentMethod === 'CASH_ON_DELIVERY'
                              ? 'border-teal-500 bg-teal-500'
                              : 'border-gray-500'
                          }`}>
                            {paymentMethod === 'CASH_ON_DELIVERY' && (
                              <div className="w-3 h-3 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                              <Banknote className="w-5 h-5 text-teal-400" />
                              الدفع عند الاستلام (COD)
                            </h3>
                            <p className="text-gray-300 text-sm mt-1">
                              ادفع نقداً عند استلام الطلب - افحص المنتج أولاً
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* تفاصيل طريقة الدفع المختارة */}
                  <div className="mt-6">
                    {/* WE Pay Details */}
                    {paymentMethod === 'WE_PAY' && (
                      <div className="bg-gradient-to-r from-purple-600 to-emerald-600 text-white rounded-xl p-6 shadow-2xl animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-white/20 p-3 rounded-full">
                        <CreditCard className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">محفظة وي باي</h3>
                        <p className="text-white/80 text-sm">WE Pay Wallet</p>
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-lg p-5 backdrop-blur-sm border border-white/20">
                      <p className="text-white/90 mb-3 text-sm font-medium">رقم التحويل:</p>
                      <div className="bg-white text-purple-700 rounded-lg p-4 text-center">
                        <p className="text-3xl font-black tracking-wider">01555512778</p>
                      </div>
                    </div>

                    <div className="mt-4 bg-yellow-400/20 border border-yellow-400/40 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <div className="text-yellow-200 mt-0.5">💡</div>
                        <p className="text-yellow-100 text-sm">
                          قم بتحويل المبلغ على الرقم أعلاه ثم ارفع صورة إيصال التحويل أدناه
                        </p>
                      </div>
                    </div>

                    {/* رفع صورة إيصال وي باي */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-white" />
                        <span className="text-white font-semibold">
                          ارفع صورة إيصال التحويل <span className="text-red-400">*</span>
                        </span>
                      </div>
                      
                      {wePayReceiptPreview ? (
                        <div className="relative">
                          <img 
                            src={wePayReceiptPreview} 
                            alt="معاينة إيصال وي باي" 
                            className="w-full h-48 object-cover rounded-lg border-2 border-green-500"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setWePayReceipt(null);
                              setWePayReceiptPreview(null);
                            }}
                          >
                            حذف
                          </Button>
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type="file"
                            id="wepay-receipt"
                            accept="image/*"
                            onChange={handleWePayReceiptChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="wepay-receipt"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/40 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                          >
                            <Package className="w-8 h-8 text-white/80 mb-2" />
                            <span className="text-sm text-white/90">اضغط لاختيار صورة الإيصال</span>
                            <span className="text-xs text-white/60 mt-1">PNG, JPG أو JPEG - حد أقصى 5MB</span>
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-blue-300 text-sm">
                        <strong>ملحوظة:</strong> بعد إتمام الطلب، سيتم مراجعة الإيصال وتأكيد الطلب في أسرع وقت
                      </p>
                    </div>
                  </div>
                    )}

                    {/* Google Pay Details */}
                    {paymentMethod === 'GOOGLE_PAY' && checkoutSettings.paymentMethodGooglePay && (
                      <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-xl p-6 shadow-2xl border-2 border-yellow-500/30 animate-in fade-in duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-white/20 p-3 rounded-full">
                          <CreditCard className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold flex items-center gap-2">
                            Google Pay
                            <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full">سريع وآمن</span>
                          </h3>
                          <p className="text-white/80 text-sm">ادفع بأمان بضغطة واحدة</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-white/10 rounded-lg p-5 backdrop-blur-sm border border-white/20">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-white/90 font-medium">المبلغ المطلوب:</p>
                            <p className="text-3xl font-black text-yellow-400">{finalTotal.toFixed(2)} ج.م</p>
                          </div>
                          
                          {/* Google Pay Button (mockup) */}
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentMethod('GOOGLE_PAY');
                              toast.info('🔒 خدمة Google Pay قريباً! سيتم التفعيل الكامل قريباً.');
                            }}
                            className="w-full bg-white hover:bg-gray-100 text-black font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
                          >
                            <svg className="w-6 h-6" viewBox="0 0 512 512" fill="currentColor">
                              <path d="M473.16 221.48l-2.26-9.59H262.46v88.22H387c-12.93 61.4-72.93 93.72-121.94 93.72-35.66 0-73.25-15-98.13-39.11a140.08 140.08 0 01-41.8-98.88c0-37.16 16.7-74.33 41-98.78s61-38.13 97.49-38.13c41.79 0 71.74 22.19 82.94 32.31l62.69-62.36C390.86 72.72 340.34 32 261.6 32c-60.75 0-119 23.27-161.58 65.71C58 139.5 36.25 199.93 36.25 256s20.58 113.48 61.3 154.84c42.43 42.29 100.58 64.85 162.13 64.85 87.32 0 162.25-61.09 162.25-163.58 0-15.16-1.77-29.51-3.44-41.37z"/>
                            </svg>
                            <span className="text-xl">ادفع باستخدام Google Pay</span>
                          </button>
                        </div>

                        <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <div className="text-green-300 mt-0.5">🔒</div>
                            <div className="flex-1">
                              <p className="text-green-100 text-sm font-semibold">دفع آمن 100%</p>
                              <ul className="text-green-200 text-xs mt-1 space-y-1">
                                <li>✓ لا يتم مشاركة بيانات بطاقتك مع أحد</li>
                                <li>✓ معالجة فورية - تأكيد الطلب خلال ثوانٍ</li>
                                <li>✓ متوافق مع جميع البطاقات المحلية والدولية</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
                          <p className="text-blue-300 text-sm">
                            <strong>💡 نصيحة:</strong> Google Pay يوفر عليك إدخال معلومات البطاقة يدوياً وأسرع في الدفع
                          </p>
                        </div>
                      </div>
                      </div>
                    )}

                    {/* Cash on Delivery Details */}
                    {paymentMethod === 'CASH_ON_DELIVERY' && checkoutSettings.paymentMethodCashOnDelivery && isAllClothing && !hasSheinOrTrendyol && (
                      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl p-6 shadow-2xl animate-in fade-in duration-300">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-white/20 p-3 rounded-full">
                            <Banknote className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">الدفع عند الاستلام</h3>
                            <p className="text-white/80 text-sm">Cash on Delivery (COD)</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-white/10 rounded-lg p-5 backdrop-blur-sm border border-white/20">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-white/90 font-medium">المبلغ المطلوب عند الاستلام:</p>
                              <p className="text-3xl font-black text-teal-400">{finalTotal.toFixed(2)} ج.م</p>
                            </div>
                            
                            <div className="mt-4 space-y-2 text-sm text-white/90">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-teal-300" />
                                <span>قم بفحص المنتجات قبل الدفع</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-teal-300" />
                                <span>ادفع المبلغ نقداً لموظف التوصيل</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-teal-300" />
                                <span>في حالة عدم الرضا، ادفع رسوم التوصيل فقط</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <div className="text-yellow-200 mt-0.5">⚠️</div>
                              <p className="text-yellow-100 text-sm">
                                <strong>ملحوظة مهمة:</strong> يرجى التأكد من توفر المبلغ الكامل عند الاستلام. في حالة رفض الطلب بعد الفحص، يجب دفع رسوم التوصيل فقط.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* HIDDEN - Keep old payment methods hidden but in code for later use */}
                  {false && (
                    <>
                  {/* Info message for non-clothing items */}
                  {!isAllClothing && (
                    <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 mb-4">
                      <p className="text-blue-300 text-sm">
                        💡 <strong>ملحوظة:</strong> الدفع عند الاستلام متاح فقط للملابس. يرجى اختيار طريقة دفع أخرى.
                      </p>
                    </div>
                  )}
                  
                  {/* Cash on Delivery - Only for regular clothing (not Shein/Trendyol) */}
                  {checkoutSettings.paymentMethodCashOnDelivery && isAllClothing && !hasSheinOrTrendyol && (
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
                  )}
                  
                  {/* Special Payment for Shein/Trendyol - Partial or Full Payment */}
                  {hasSheinOrTrendyol && (
                    <>
                      {/* Info message for Shein/Trendyol */}
                      <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3 mb-4">
                        <p className="text-purple-300 text-sm">
                          ⭐ <strong>منتجات شي إن وترينديول:</strong> يجب دفع نصف المبلغ على الأقل مقدماً أو دفع المبلغ كاملاً.
                        </p>
                      </div>

                      {/* Partial Payment 50% */}
                      <div
                        onClick={() => setPaymentMethod('PARTIAL_PAYMENT_50')}
                        className={`cursor-pointer border-2 rounded-lg p-3 sm:p-4 transition-all ${
                          paymentMethod === 'PARTIAL_PAYMENT_50'
                            ? 'border-purple-500 bg-purple-900/30'
                            : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            paymentMethod === 'PARTIAL_PAYMENT_50'
                              ? 'border-purple-500 bg-purple-500'
                              : 'border-gray-500'
                          }`}>
                            {paymentMethod === 'PARTIAL_PAYMENT_50' && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 sm:mb-2">
                              <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                              <h3 className="text-base sm:text-lg font-bold text-white">
                                دفع جزئي (50% مقدم)
                              </h3>
                            </div>
                            <p className="text-gray-300 text-xs sm:text-sm mb-2">
                              ادفع نصف المبلغ الآن والنصف الآخر عند استلام الطلب
                            </p>
                            <div className="bg-purple-900/20 border border-purple-500/20 rounded p-2 mb-2">
                              <div className="flex justify-between items-center text-xs sm:text-sm">
                                <span className="text-gray-300">المبلغ المطلوب الآن:</span>
                                <span className="text-purple-300 font-bold">{(totalPrice / 2).toFixed(2)} ج.م</span>
                              </div>
                              <div className="flex justify-between items-center text-xs sm:text-sm mt-1">
                                <span className="text-gray-300">المبلغ عند الاستلام:</span>
                                <span className="text-purple-300 font-bold">{(totalPrice / 2 + deliveryFee).toFixed(2)} ج.م</span>
                              </div>
                            </div>
                            <div className="space-y-0.5 sm:space-y-1">
                              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-400">
                                <CheckCircle2 className="w-3 h-3 text-purple-400 flex-shrink-0" />
                                مناسب لمن يريد تقسيم المبلغ
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <CheckCircle2 className="w-3 h-3 text-purple-400" />
                                توفير في السيولة المالية
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Full Payment */}
                      <div
                        onClick={() => setPaymentMethod('FULL_PAYMENT')}
                        className={`cursor-pointer border-2 rounded-lg p-3 sm:p-4 transition-all ${
                          paymentMethod === 'FULL_PAYMENT'
                            ? 'border-amber-500 bg-amber-900/30'
                            : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            paymentMethod === 'FULL_PAYMENT'
                              ? 'border-amber-500 bg-amber-500'
                              : 'border-gray-500'
                          }`}>
                            {paymentMethod === 'FULL_PAYMENT' && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 sm:mb-2">
                              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                              <h3 className="text-base sm:text-lg font-bold text-white">
                                دفع كامل مقدماً 💎
                              </h3>
                            </div>
                            <p className="text-gray-300 text-xs sm:text-sm mb-2">
                              ادفع المبلغ كاملاً الآن واستلم طلبك بدون أي مبالغ إضافية
                            </p>
                            <div className="bg-amber-900/20 border border-amber-500/20 rounded p-2 mb-2">
                              <div className="flex justify-between items-center text-xs sm:text-sm">
                                <span className="text-gray-300">المبلغ المطلوب الآن:</span>
                                <span className="text-amber-300 font-bold">{(totalPrice + deliveryFee).toFixed(2)} ج.م</span>
                              </div>
                              <div className="flex justify-between items-center text-xs sm:text-sm mt-1">
                                <span className="text-gray-300">المبلغ عند الاستلام:</span>
                                <span className="text-green-400 font-bold">0.00 ج.م</span>
                              </div>
                            </div>
                            <div className="space-y-0.5 sm:space-y-1">
                              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-400">
                                <CheckCircle2 className="w-3 h-3 text-amber-400 flex-shrink-0" />
                                لا توجد مبالغ إضافية عند الاستلام
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <CheckCircle2 className="w-3 h-3 text-amber-400" />
                                استلام سريع وآمن
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Payment Instructions for Shein/Trendyol Partial/Full Payment */}
                  {(paymentMethod === 'PARTIAL_PAYMENT_50' || paymentMethod === 'FULL_PAYMENT') && (
                    <div className="bg-gradient-to-r from-purple-900/40 to-amber-900/40 border-2 border-purple-500/50 rounded-lg p-4 space-y-3">
                      <div className="text-center">
                        <p className="text-white font-bold text-lg mb-3">
                          📱 معلومات الدفع
                        </p>
                        <p className="text-purple-300 font-semibold mb-2">
                          يرجى التحويل على إحدى المحافظ التالية:
                        </p>
                        <div className="space-y-2">
                          <div className="bg-white/10 rounded-lg p-3">
                            <p className="text-white text-2xl font-bold tracking-wider">
                              01555512778
                            </p>
                            <p className="text-gray-300 text-sm mt-1">
                              فودافون كاش 📱 | وي باي 💳 | إتصالات كاش ✨
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 bg-purple-900/30 border border-purple-500/30 rounded p-2">
                          <p className="text-purple-200 text-sm">
                            المبلغ المطلوب تحويله: <span className="font-bold">{downPayment.toFixed(2)} ج.م</span>
                          </p>
                        </div>
                      </div>

                      <div className="bg-yellow-900/30 border border-yellow-500/30 rounded p-3 text-xs text-yellow-300">
                        <strong>⚠️ هام:</strong> بعد إتمام التحويل، سيتم التواصل معك لتأكيد الطلب. يرجى الاحتفاظ بإيصال التحويل.
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer - HIDDEN */}
                  {false && checkoutSettings.paymentMethodBankTransfer && (
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
                            تحويل بنكي / إنستاباي
                          </h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">
                          احصل على خصم 5% بالدفع المسبق عبر التحويل البنكي
                        </p>
                        
                        {/* معلومات المحفظة */}
                        {paymentMethod === 'BANK_TRANSFER' && (
                          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 space-y-3">
                            <div className="text-center">
                              <p className="text-blue-300 font-semibold mb-2">
                                يرجى التحويل على محفظة إنستاباي
                              </p>
                              <div className="bg-white/10 rounded-lg p-3 inline-block">
                                <p className="text-white text-2xl font-bold tracking-wider">
                                  01555512778
                                </p>
                              </div>
                            </div>

                            {/* رفع صورة الإيصال */}
                            <div className="space-y-2">
                              <Label htmlFor="receipt" className="text-white">
                                إرفاق صورة إيصال التحويل <span className="text-red-400">*</span>
                              </Label>
                              
                              {receiptPreview ? (
                                <div className="relative">
                                  <img 
                                    src={receiptPreview || ''} 
                                    alt="معاينة الإيصال" 
                                    className="w-full h-48 object-cover rounded-lg border-2 border-blue-500"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setBankTransferReceipt(null);
                                      setReceiptPreview(null);
                                    }}
                                  >
                                    حذف
                                  </Button>
                                </div>
                              ) : (
                                <div className="relative">
                                  <input
                                    type="file"
                                    id="receipt"
                                    accept="image/*"
                                    onChange={handleReceiptChange}
                                    className="hidden"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <label
                                    htmlFor="receipt"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-500 rounded-lg cursor-pointer hover:bg-blue-900/20 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Package className="w-8 h-8 text-blue-400 mb-2" />
                                    <span className="text-sm text-blue-300">اضغط لاختيار صورة الإيصال</span>
                                    <span className="text-xs text-gray-400 mt-1">PNG, JPG أو JPEG - حد أقصى 5MB</span>
                                  </label>
                                </div>
                              )}
                            </div>

                            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded p-2 text-xs text-yellow-300">
                              <strong>ملحوظة:</strong> بعد إتمام الطلب، سيتم مراجعة الإيصال وتأكيد الطلب في أسرع وقت
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  )}

                  {/* E-Wallet Transfer */}
                  {checkoutSettings.paymentMethodEWallet && (
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
                          <div className="space-y-3 mt-3">
                            {/* Phone Number Display */}
                            <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
                              <div className="text-center">
                                <p className="text-green-300 font-semibold mb-2">
                                  رقم التليفون للتحويل
                                </p>
                                <div className="bg-white/10 rounded-lg p-3 inline-block">
                                  <p className="text-white text-2xl font-bold tracking-wider">
                                    01555512778
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
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

                            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded p-2 text-xs text-yellow-300 mb-3">
                              💡 حول على الرقم أعلاه وارفع صورة إيصال التحويل
                            </div>

                            {/* رفع صورة إيصال المحفظة */}
                            <div className="space-y-2">
                              <Label htmlFor="ewallet-receipt" className="text-white font-semibold">
                                إرفاق صورة إيصال التحويل <span className="text-red-400">*</span>
                              </Label>
                              
                              {eWalletReceiptPreview ? (
                                <div className="relative">
                                  <img 
                                    src={eWalletReceiptPreview || ''} 
                                    alt="معاينة إيصال المحفظة" 
                                    className="w-full h-48 object-cover rounded-lg border-2 border-green-500"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEWalletReceipt(null);
                                      setEWalletReceiptPreview(null);
                                    }}
                                  >
                                    حذف
                                  </Button>
                                </div>
                              ) : (
                                <div className="relative">
                                  <input
                                    type="file"
                                    id="ewallet-receipt"
                                    accept="image/*"
                                    onChange={handleEWalletReceiptChange}
                                    className="hidden"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <label
                                    htmlFor="ewallet-receipt"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-green-500 rounded-lg cursor-pointer hover:bg-green-900/20 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Package className="w-8 h-8 text-green-400 mb-2" />
                                    <span className="text-sm text-green-300">اضغط لاختيار صورة إيصال المحفظة</span>
                                    <span className="text-xs text-gray-400 mt-1">PNG, JPG أو JPEG - حد أقصى 5MB</span>
                                  </label>
                                </div>
                              )}
                            </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Installment Documents Upload */}
                  {paymentMethod === 'INSTALLMENT_4' && (
                    <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-xl p-6 border-2 border-blue-500/30 animate-in fade-in duration-300">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-500/20 p-3 rounded-full">
                          📄
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">المستندات المطلوبة للتقسيط</h3>
                          <p className="text-blue-200 text-sm">يرجى رفع جميع المستندات لإتمام الطلب</p>
                        </div>
                      </div>

                      {/* First Payment Amount */}
                      <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-emerald-100 text-sm">الدفعة الأولى المطلوبة:</p>
                            <p className="text-3xl font-black text-white">{(finalTotal / 4).toFixed(0)} جنيه</p>
                          </div>
                          <div className="text-5xl">💰</div>
                        </div>
                        <p className="text-emerald-200 text-xs mt-2">
                          حوّل على محفظة WE Pay: <span className="font-bold text-white">01555512778</span>
                        </p>
                      </div>

                      <div className="space-y-4">
                        {/* ID Card Front */}
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                            <span className="text-2xl">🆔</span>
                            صورة البطاقة الشخصية (الوجه الأمامي) *
                          </label>
                          {idCardFrontPreview ? (
                            <div className="relative">
                              <img 
                                src={idCardFrontPreview || ''} 
                                alt="معاينة البطاقة الأمامية" 
                                className="w-full h-48 object-cover rounded-lg border-2 border-blue-500"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  setIdCardFront(null);
                                  setIdCardFrontPreview(null);
                                }}
                              >
                                حذف
                              </Button>
                            </div>
                          ) : (
                            <div className="relative">
                              <input
                                type="file"
                                id="id-card-front"
                                accept="image/*"
                                onChange={handleIdCardFrontChange}
                                className="hidden"
                              />
                              <label
                                htmlFor="id-card-front"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-500 rounded-lg cursor-pointer hover:bg-blue-900/20 transition-colors"
                              >
                                <Package className="w-8 h-8 text-blue-400 mb-2" />
                                <span className="text-sm text-blue-300">اضغط لاختيار صورة البطاقة الأمامية</span>
                                <span className="text-xs text-gray-400 mt-1">PNG, JPG أو JPEG - حد أقصى 5MB</span>
                              </label>
                            </div>
                          )}
                        </div>

                        {/* ID Card Back */}
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                            <span className="text-2xl">🆔</span>
                            صورة البطاقة الشخصية (الوجه الخلفي) *
                          </label>
                          {idCardBackPreview ? (
                            <div className="relative">
                              <img 
                                src={idCardBackPreview || ''} 
                                alt="معاينة البطاقة الخلفية" 
                                className="w-full h-48 object-cover rounded-lg border-2 border-blue-500"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  setIdCardBack(null);
                                  setIdCardBackPreview(null);
                                }}
                              >
                                حذف
                              </Button>
                            </div>
                          ) : (
                            <div className="relative">
                              <input
                                type="file"
                                id="id-card-back"
                                accept="image/*"
                                onChange={handleIdCardBackChange}
                                className="hidden"
                              />
                              <label
                                htmlFor="id-card-back"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-500 rounded-lg cursor-pointer hover:bg-blue-900/20 transition-colors"
                              >
                                <Package className="w-8 h-8 text-blue-400 mb-2" />
                                <span className="text-sm text-blue-300">اضغط لاختيار صورة البطاقة الخلفية</span>
                                <span className="text-xs text-gray-400 mt-1">PNG, JPG أو JPEG - حد أقصى 5MB</span>
                              </label>
                            </div>
                          )}
                        </div>

                        {/* Signed Promissory Note */}
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                            <span className="text-2xl">📝</span>
                            صورة الكمبيالة الموقعة *
                          </label>
                          <p className="text-yellow-200 text-sm mb-2 bg-yellow-900/20 border border-yellow-500/30 rounded p-2">
                            💡 يرجى تحميل نموذج الكمبيالة، التوقيع عليها، ثم رفع صورة منها
                          </p>
                          {signedPromissoryNotePreview ? (
                            <div className="relative">
                              <img 
                                src={signedPromissoryNotePreview || ''} 
                                alt="معاينة الكمبيالة" 
                                className="w-full h-48 object-cover rounded-lg border-2 border-blue-500"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  setSignedPromissoryNote(null);
                                  setSignedPromissoryNotePreview(null);
                                }}
                              >
                                حذف
                              </Button>
                            </div>
                          ) : (
                            <div className="relative">
                              <input
                                type="file"
                                id="signed-promissory-note"
                                accept="image/*"
                                onChange={handleSignedPromissoryNoteChange}
                                className="hidden"
                              />
                              <label
                                htmlFor="signed-promissory-note"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-500 rounded-lg cursor-pointer hover:bg-blue-900/20 transition-colors"
                              >
                                <Package className="w-8 h-8 text-blue-400 mb-2" />
                                <span className="text-sm text-blue-300">اضغط لاختيار صورة الكمبيالة الموقعة</span>
                                <span className="text-xs text-gray-400 mt-1">PNG, JPG أو JPEG - حد أقصى 5MB</span>
                              </label>
                            </div>
                          )}
                        </div>

                        {/* First Payment Receipt */}
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                            <span className="text-2xl">🧾</span>
                            صورة إيصال الدفعة الأولى (WE Pay) *
                          </label>
                          <p className="text-emerald-200 text-sm mb-2 bg-emerald-900/20 border border-emerald-500/30 rounded p-2">
                            💰 يرجى تحويل {(finalTotal / 4).toFixed(0)} ج على محفظة WE Pay: <span className="font-bold">01555512778</span>
                          </p>
                          {firstPaymentReceiptPreview ? (
                            <div className="relative">
                              <img 
                                src={firstPaymentReceiptPreview || ''} 
                                alt="معاينة إيصال الدفعة الأولى" 
                                className="w-full h-48 object-cover rounded-lg border-2 border-emerald-500"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  setFirstPaymentReceipt(null);
                                  setFirstPaymentReceiptPreview(null);
                                }}
                              >
                                حذف
                              </Button>
                            </div>
                          ) : (
                            <div className="relative">
                              <input
                                type="file"
                                id="first-payment-receipt"
                                accept="image/*"
                                onChange={handleFirstPaymentReceiptChange}
                                className="hidden"
                              />
                              <label
                                htmlFor="first-payment-receipt"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-emerald-500 rounded-lg cursor-pointer hover:bg-emerald-900/20 transition-colors"
                              >
                                <Package className="w-8 h-8 text-emerald-400 mb-2" />
                                <span className="text-sm text-emerald-300">اضغط لاختيار صورة إيصال الدفعة الأولى</span>
                                <span className="text-xs text-gray-400 mt-1">PNG, JPG أو JPEG - حد أقصى 5MB</span>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Important Notes */}
                      <div className="mt-6 bg-amber-900/20 border border-amber-500/40 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <div className="text-amber-200 mt-0.5">⚠️</div>
                          <div className="text-amber-100 text-sm space-y-1">
                            <p><strong>ملاحظات هامة:</strong></p>
                            <ul className="list-disc list-inside space-y-1 mr-4">
                              <li>جميع المستندات مطلوبة لإتمام عملية التقسيط</li>
                              <li>يجب أن تكون صور المستندات واضحة وقابلة للقراءة</li>
                              <li>الدفعة الأولى تمثل 25% من إجمالي المبلغ</li>
                              <li>باقي المبلغ يُقسط على 3 دفعات متساوية</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Installment Calculator */}
                  {paymentMethod.startsWith('INSTALLMENT_') && checkoutSettings.paymentMethodInstallment && (
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
                  </>
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
