'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
}

export default function AddImportedProduct() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    price: '',
    stock: '',
    categoryId: '',
    images: '',
    importSource: 'SHEIN',
    importLink: '',
    downPaymentPercent: '30',
    estimatedDeliveryDays: '14',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (session?.user?.role !== 'MARKETING_STAFF') {
      router.push('/');
      return;
    }

    fetchCategories();
  }, [session, status, router]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('خطأ في جلب الفئات:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nameAr || !formData.price || !formData.categoryId || !formData.importSource) {
      alert('❌ يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/marketing-staff/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ ' + data.message);
        router.push('/marketing-staff');
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      console.error('خطأ في إضافة المنتج:', error);
      alert('❌ حدث خطأ في إضافة المنتج');
    } finally {
      setLoading(false);
    }
  };

  const importSources = [
    { value: 'SHEIN', label: 'Shein' },
    { value: 'ALIEXPRESS', label: 'AliExpress' },
    { value: 'ALIBABA', label: 'Alibaba' },
    { value: 'TAOBAO', label: 'Taobao' },
    { value: 'TEMU', label: 'Temu' },
    { value: 'OTHER', label: 'أخرى' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white mb-8">
          <h1 className="text-2xl font-bold">➕ إضافة منتج مستورد</h1>
          <p className="text-purple-100 mt-1">أضف منتجاً جديداً من مصادر الاستيراد</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* معلومات المنتج */}
          <div>
            <h2 className="text-lg font-bold mb-4">معلومات المنتج</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  الاسم بالعربي <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="مثال: فستان صيفي أنيق"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  الاسم بالإنجليزي
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Example: Summer Elegant Dress"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  الفئة <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">اختر الفئة</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  مصدر الاستيراد <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.importSource}
                  onChange={(e) => setFormData({ ...formData, importSource: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {importSources.map((source) => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  السعر (جنيه) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="299.99"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  الكمية المتوفرة
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* الوصف */}
          <div>
            <h2 className="text-lg font-bold mb-4">الوصف</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  الوصف بالعربي
                </label>
                <textarea
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  rows={4}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="وصف تفصيلي للمنتج..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  الوصف بالإنجليزي
                </label>
                <textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  rows={4}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Detailed product description..."
                />
              </div>
            </div>
          </div>

          {/* الصور */}
          <div>
            <h2 className="text-lg font-bold mb-4">الصور</h2>
            <div>
              <label className="block text-sm font-medium mb-2">
                روابط الصور (JSON Array)
              </label>
              <textarea
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                rows={3}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                placeholder='["https://example.com/image1.jpg", "https://example.com/image2.jpg"]'
              />
              <p className="text-xs text-gray-500 mt-1">
                أدخل روابط الصور كـ JSON Array أو اتركه فارغاً
              </p>
            </div>
          </div>

          {/* تفاصيل الاستيراد */}
          <div>
            <h2 className="text-lg font-bold mb-4">تفاصيل الاستيراد</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  رابط المنتج الأصلي
                </label>
                <input
                  type="url"
                  value={formData.importLink}
                  onChange={(e) => setFormData({ ...formData, importLink: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  نسبة الدفعة المقدمة (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.downPaymentPercent}
                  onChange={(e) => setFormData({ ...formData, downPaymentPercent: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  مدة التوصيل المتوقعة (أيام)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.estimatedDeliveryDays}
                  onChange={(e) => setFormData({ ...formData, estimatedDeliveryDays: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* معاينة العمولة */}
              {formData.price && (
                <div className="bg-purple-50 rounded-lg p-4 md:col-span-1">
                  <p className="text-sm font-medium text-gray-700 mb-1">عمولتك المتوقعة:</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(parseFloat(formData.price || '0') * 5 / 100).toFixed(2)} جنيه
                  </p>
                  <p className="text-xs text-gray-500 mt-1">لكل عملية بيع (5%)</p>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ جاري الإضافة...' : '✅ إضافة المنتج'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/marketing-staff')}
              className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
