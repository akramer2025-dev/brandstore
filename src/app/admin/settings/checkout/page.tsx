'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Save, CreditCard, Truck, Store, Banknote, Wallet, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutSettings {
  // Delivery Methods
  deliveryMethodHomeDelivery: boolean;
  deliveryMethodStorePickup: boolean;
  
  // Payment Methods
  paymentMethodCashOnDelivery: boolean;
  paymentMethodBankTransfer: boolean;
  paymentMethodEWallet: boolean;
  paymentMethodGooglePay: boolean;    // إضافة Google Pay
  paymentMethodInstallment: boolean;
}

export default function CheckoutSettingsPage() {
  const [settings, setSettings] = useState<CheckoutSettings>({
    deliveryMethodHomeDelivery: true,
    deliveryMethodStorePickup: true,
    paymentMethodCashOnDelivery: true,
    paymentMethodBankTransfer: true,
    paymentMethodEWallet: true,
    paymentMethodGooglePay: true,
    paymentMethodInstallment: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const keys = [
        'delivery_method_home_delivery',
        'delivery_method_store_pickup',
        'payment_method_cash_on_delivery',
        'payment_method_bank_transfer',
        'payment_method_e_wallet',
        'payment_method_google_pay',
        'payment_method_installment',
      ];
      
      const res = await fetch(`/api/settings?keys=${keys.join(',')}`);
      if (res.ok) {
        const data = await res.json();
        
        // تحويل البيانات من قاعدة البيانات إلى state
        const settingsObj: CheckoutSettings = {
          deliveryMethodHomeDelivery: data.find((s: any) => s.key === 'delivery_method_home_delivery')?.value !== 'false',
          deliveryMethodStorePickup: data.find((s: any) => s.key === 'delivery_method_store_pickup')?.value !== 'false',
          paymentMethodCashOnDelivery: data.find((s: any) => s.key === 'payment_method_cash_on_delivery')?.value !== 'false',
          paymentMethodBankTransfer: data.find((s: any) => s.key === 'payment_method_bank_transfer')?.value !== 'false',
          paymentMethodEWallet: data.find((s: any) => s.key === 'payment_method_e_wallet')?.value !== 'false',
          paymentMethodGooglePay: data.find((s: any) => s.key === 'payment_method_google_pay')?.value !== 'false',
          paymentMethodInstallment: data.find((s: any) => s.key === 'payment_method_installment')?.value !== 'false',
        };
        
        setSettings(settingsObj);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('فشل في تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // التحقق من أن هناك على الأقل طريقة دفع واحدة مفعّلة
      if (!settings.paymentMethodCashOnDelivery && 
          !settings.paymentMethodBankTransfer && 
          !settings.paymentMethodEWallet && 
          !settings.paymentMethodGooglePay && 
          !settings.paymentMethodInstallment) {
        toast.error('يجب تفعيل طريقة دفع واحدة على الأقل');
        setSaving(false);
        return;
      }
      
      // التحقق من أن هناك على الأقل طريقة استلام واحدة مفعّلة
      if (!settings.deliveryMethodHomeDelivery && 
          !settings.deliveryMethodStorePickup) {
        toast.error('يجب تفعيل طريقة استلام واحدة على الأقل');
        setSaving(false);
        return;
      }

      // حفظ كل إعداد
      const settingsToSave = [
        {
          key: 'delivery_method_home_delivery',
          value: String(settings.deliveryMethodHomeDelivery),
          description: 'تفعيل التوصيل للمنزل'
        },
        {
          key: 'delivery_method_store_pickup',
          value: String(settings.deliveryMethodStorePickup),
          description: 'تفعيل الاستلام من المتجر'
        },
        {
          key: 'payment_method_cash_on_delivery',
          value: String(settings.paymentMethodCashOnDelivery),
          description: 'تفعيل الدفع عند الاستلام'
        },
        {
          key: 'payment_method_bank_transfer',
          value: String(settings.paymentMethodBankTransfer),
          description: 'تفعيل التحويل البنكي'
        },
        {
          key: 'payment_method_e_wallet',
          value: String(settings.paymentMethodEWallet),
          description: 'تفعيل المحفظة الإلكترونية'
        },
        {
          key: 'payment_method_google_pay',
          value: String(settings.paymentMethodGooglePay),
          description: 'تفعيل الدفع عبر Google Pay'
        },
        {
          key: 'payment_method_installment',
          value: String(settings.paymentMethodInstallment),
          description: 'تفعيل التقسيط'
        },
      ];

      // حفظ كل إعداد
      for (const setting of settingsToSave) {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(setting),
        });
      }

      toast.success('✅ تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('❌ فشل في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">إعدادات الدفع والاستلام</h1>
            <p className="text-gray-600">تحكم في طرق الدفع والاستلام المتاحة للعملاء</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 ml-2" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>

        {/* تحذير */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-semibold mb-1">ملاحظة هامة:</p>
              <p>يجب تفعيل طريقة دفع واحدة على الأقل وطريقة استلام واحدة على الأقل. إذا تم إيقاف جميع الخيارات، لن يتمكن العملاء من إتمام طلباتهم.</p>
            </div>
          </CardContent>
        </Card>

        {/* طرق الاستلام */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-6 h-6 text-blue-600" />
              طرق الاستلام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* التوصيل للمنزل */}
            <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="home-delivery" className="text-base font-semibold text-gray-900 cursor-pointer">
                    التوصيل للمنزل
                  </Label>
                  <p className="text-sm text-gray-600">
                    يمكن للعملاء طلب توصيل المنتجات إلى عنوانهم مع دفع رسوم التوصيل
                  </p>
                  {settings.deliveryMethodHomeDelivery && (
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>مُفَعَّل</span>
                    </div>
                  )}
                </div>
              </div>
              <Switch
                id="home-delivery"
                checked={settings.deliveryMethodHomeDelivery}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, deliveryMethodHomeDelivery: checked })
                }
              />
            </div>

            {/* الاستلام من المتجر */}
            <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Store className="w-5 h-5 text-purple-600" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="store-pickup" className="text-base font-semibold text-gray-900 cursor-pointer">
                    الاستلام من المتجر
                  </Label>
                  <p className="text-sm text-gray-600">
                    يمكن للعملاء اختيار استلام المنتجات من الفروع المتاحة بدون رسوم توصيل
                  </p>
                  {settings.deliveryMethodStorePickup && (
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>مُفَعَّل</span>
                    </div>
                  )}
                </div>
              </div>
              <Switch
                id="store-pickup"
                checked={settings.deliveryMethodStorePickup}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, deliveryMethodStorePickup: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* طرق الدفع */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-green-600" />
              طرق الدفع
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* الدفع عند الاستلام */}
            <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Banknote className="w-5 h-5 text-green-600" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cash-delivery" className="text-base font-semibold text-gray-900 cursor-pointer">
                    الدفع عند الاستلام
                  </Label>
                  <p className="text-sm text-gray-600">
                    يدفع العميل نقداً عند استلام المنتج مع إمكانية الفحص قبل الدفع
                  </p>
                  {settings.paymentMethodCashOnDelivery && (
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>مُفَعَّل</span>
                    </div>
                  )}
                </div>
              </div>
              <Switch
                id="cash-delivery"
                checked={settings.paymentMethodCashOnDelivery}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, paymentMethodCashOnDelivery: checked })
                }
              />
            </div>

            {/* التحويل البنكي */}
            <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bank-transfer" className="text-base font-semibold text-gray-900 cursor-pointer">
                    التحويل البنكي / إنستاباي
                  </Label>
                  <p className="text-sm text-gray-600">
                    التحويل المباشر على محفظة إنستاباي مع خصم 5% على الطلب
                  </p>
                  {settings.paymentMethodBankTransfer && (
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>مُفَعَّل</span>
                    </div>
                  )}
                </div>
              </div>
              <Switch
                id="bank-transfer"
                checked={settings.paymentMethodBankTransfer}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, paymentMethodBankTransfer: checked })
                }
              />
            </div>

            {/* المحفظة الإلكترونية */}
            <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-5 h-5 text-orange-600" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="e-wallet" className="text-base font-semibold text-gray-900 cursor-pointer">
                    المحفظة الإلكترونية
                  </Label>
                  <p className="text-sm text-gray-600">
                    الدفع عبر فودافون كاش، اتصالات كاش، أو وي باي
                  </p>
                  {settings.paymentMethodEWallet && (
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>مُفَعَّل</span>
                    </div>
                  )}
                </div>
              </div>
              <Switch
                id="e-wallet"
                checked={settings.paymentMethodEWallet}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, paymentMethodEWallet: checked })
                }
              />
            </div>

            {/* Google Pay */}
            <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="google-pay" className="text-base font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
                    Google Pay
                    <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">جديد</span>
                  </Label>
                  <p className="text-sm text-gray-600">
                    الدفع الفوري والآمن عبر Google Pay بضغطة واحدة
                  </p>
                  {settings.paymentMethodGooglePay && (
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>مُفَعَّل</span>
                    </div>
                  )}
                </div>
              </div>
              <Switch
                id="google-pay"
                checked={settings.paymentMethodGooglePay}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, paymentMethodGooglePay: checked })
                }
              />
            </div>

            {/* التقسيط */}
            <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="installment" className="text-base font-semibold text-gray-900 cursor-pointer">
                    الدفع بالتقسيط
                  </Label>
                  <p className="text-sm text-gray-600">
                    تقسيط المشتريات على 4، 6، 12، أو 24 شهر
                  </p>
                  {settings.paymentMethodInstallment && (
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>مُفَعَّل</span>
                    </div>
                  )}
                </div>
              </div>
              <Switch
                id="installment"
                checked={settings.paymentMethodInstallment}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, paymentMethodInstallment: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* ملخص الإعدادات */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ملخص الإعدادات الحالية</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">طرق الاستلام المفعّلة:</p>
                <ul className="space-y-1">
                  {settings.deliveryMethodHomeDelivery && (
                    <li className="text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      التوصيل للمنزل
                    </li>
                  )}
                  {settings.deliveryMethodStorePickup && (
                    <li className="text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      الاستلام من المتجر
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">طرق الدفع المفعّلة:</p>
                <ul className="space-y-1">
                  {settings.paymentMethodCashOnDelivery && (
                    <li className="text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      الدفع عند الاستلام
                    </li>
                  )}
                  {settings.paymentMethodBankTransfer && (
                    <li className="text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      التحويل البنكي
                    </li>
                  )}
                  {settings.paymentMethodEWallet && (
                    <li className="text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      المحفظة الإلكترونية
                    </li>
                  )}
                  {settings.paymentMethodGooglePay && (
                    <li className="text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Google Pay
                    </li>
                  )}
                  {settings.paymentMethodInstallment && (
                    <li className="text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      التقسيط
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
