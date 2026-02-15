"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";

export default function TestInstallmentPage() {
  const [settings, setSettings] = useState<any>(null);
  const [apiResult, setApiResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { items } = useCartStore();

  useEffect(() => {
    const test = async () => {
      try {
        // 1. جلب الإعدادات
        console.log('1️⃣ جلب الإعدادات...');
        const settingsRes = await fetch('/api/settings');
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
        
        console.log('✅ الإعدادات:', settingsData);
        
        // 2. اختبار الـ API
        if (items.length > 0) {
          console.log('2️⃣ اختبار API...');
          const productIds = items.map(item => item.id).join(',');
          const apiRes = await fetch(`/api/products/check-installment?ids=${productIds}`);
          const apiData = await apiRes.json();
          setApiResult(apiData);
          
          console.log('✅ API Result:', apiData);
        }
      } catch (error) {
        console.error('❌ خطأ:', error);
      } finally {
        setLoading(false);
      }
    };
    
    test();
  }, [items]);

  if (loading) {
    return <div className="p-8 text-white">جاري التحميل...</div>;
  }

  const installmentSetting = settings?.find
((s: any) => s.key === 'payment_method_installment');
  const checkoutSettingsData = {
    paymentMethodInstallment: installmentSetting?.value !== 'false',
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white">
      <h1 className="text-3xl font-bold mb-8">🧪 اختبار نظام التقسيط</h1>
      
      {/* السلة */}
      <div className="bg-slate-800 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-4">🛒 السلة</h2>
        <p className="mb-2">عدد المنتجات: <span className="font-bold text-green-400">{items.length}</span></p>
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map(item => (
              <li key={item.id} className="bg-slate-700 p-3 rounded">
                <p className="font-bold">{item.name}</p>
                <p className="text-sm text-gray-400">ID: {item.id}</p>
                <p className="text-sm">السعر: {item.price} ج</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-red-400">❌ السلة فاضية! ضيف منتج الأول</p>
        )}
      </div>

      {/* الإعدادات */}
      <div className="bg-slate-800 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-4">⚙️ الإعدادات</h2>
        <div className="space-y-2">
          <p>
            payment_method_installment: 
            <span className={`ml-2 font-bold ${installmentSetting?.value === 'true' || installmentSetting?.value === true ? 'text-green-400' : 'text-red-400'}`}>
              {installmentSetting?.value || 'غير موجود'} ({typeof installmentSetting?.value})
            </span>
          </p>
          <p>
            checkoutSettings.paymentMethodInstallment: 
            <span className={`ml-2 font-bold ${checkoutSettingsData.paymentMethodInstallment ? 'text-green-400' : 'text-red-400'}`}>
              {checkoutSettingsData.paymentMethodInstallment ? '✅ true' : '❌ false'}
            </span>
          </p>
        </div>
      </div>

      {/* نتيجة API */}
      {items.length > 0 && (
        <div className="bg-slate-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">🔌 نتيجة API</h2>
          {apiResult ? (
            <div className="space-y-2">
              <p>
                Success: 
                <span className={`ml-2 font-bold ${apiResult.success ? 'text-green-400' : 'text-red-400'}`}>
                  {apiResult.success ? '✅ true' : '❌ false'}
                </span>
              </p>
              <p>
                عدد المنتجات المرجعة: 
                <span className="ml-2 font-bold text-blue-400">
                  {apiResult.products?.length || 0}
                </span>
              </p>
              {apiResult.products && apiResult.products.length > 0 && (
                <div>
                  <p className="font-bold mt-4 mb-2">المنتجات القابلة للتقسيط:</p>
                  <ul className="space-y-2">
                    {apiResult.products.map((p: any) => (
                      <li key={p.id} className="bg-slate-700 p-3 rounded">
                        <p className="font-bold">{p.name}</p>
                        <p className="text-sm">السعر: {p.price} ج</p>
                        <p className="text-sm">allowInstallment: 
                          <span className="text-green-400 font-bold"> ✅ {String(p.allowInstallment)}</span>
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {apiResult.error && (
                <p className="text-red-400 mt-2">❌ خطأ: {apiResult.error}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-400">جاري التحميل...</p>
          )}
        </div>
      )}

      {/* التوصيات */}
      <div className="bg-gradient-to-r from-blue-900 to-cyan-900 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">💡 التوصيات</h2>
        <ul className="space-y-2 text-sm">
          {items.length === 0 && (
            <li className="text-red-300">⚠️ ضيف منتج للسلة عشان تختبر النظام</li>
          )}
          {!checkoutSettingsData.paymentMethodInstallment && (
            <li className="text-red-300">⚠️ إعداد التقسيط مش مفعّل</li>
          )}
          {apiResult && apiResult.products && apiResult.products.length === 0 && items.length > 0 && (
            <li className="text-red-300">⚠️ المنتجات في السلة مش مفعّلة للتقسيط</li>
          )}
          {checkoutSettingsData.paymentMethodInstallment && apiResult?.products?.length > 0 && (
            <li className="text-green-300">✅ كل حاجة تمام! خيار التقسيط المفروض يظهر في checkout</li>
          )}
        </ul>
        
        <div className="mt-6 space-x-4">
          <a 
            href="/checkout" 
            className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition"
          >
            اذهب إلى Checkout
          </a>
          <a 
            href="/" 
            className="inline-block bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-bold transition"
          >
            ضيف منتجات
          </a>
        </div>
      </div>
    </div>
  );
}
