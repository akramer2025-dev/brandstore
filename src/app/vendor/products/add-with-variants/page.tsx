"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ProductVariantsManager, ProductVariant } from "@/components/ProductVariantsManager";
import { Upload, Save, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  nameAr: string;
}

export default function AddProductWithVariants() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // بيانات المنتج
  const [formData, setFormData] = useState({
    nameAr: "",
    name: "",
    descriptionAr: "",
    description: "",
    categoryId: "",
    images: "",
    badge: "",
    isOwnProduct: true,
  });

  // التحقق من الصلاحيات
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.role !== "VENDOR" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  // جلب الفئات
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // التحقق من البيانات
      if (!formData.nameAr || !formData.categoryId) {
        alert("الرجاء ملء جميع الحقول المطلوبة");
        setLoading(false);
        return;
      }

      if (variants.length === 0) {
        alert("يجب إضافة مقاس واحد على الأقل");
        setLoading(false);
        return;
      }

      // التحقق من أن كل variant له سعر وكمية
      const invalidVariants = variants.filter((v) => !v.nameAr || v.price <= 0);
      if (invalidVariants.length > 0) {
        alert("الرجاء ملء بيانات جميع المقاسات (الاسم والسعر)");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/vendor/products/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          variants,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ تم إضافة المنتج بنجاح!");
        router.push("/vendor/products");
      } else {
        alert(data.error || "حدث خطأ أثناء إضافة المنتج");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("حدث خطأ أثناء إضافة المنتج");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              إضافة منتج جديد
            </h1>
            <p className="text-gray-600 mt-1">
              أضف منتجك مع المقاسات والأسعار المختلفة
            </p>
          </div>
          <Link
            href="/vendor/products"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowRight className="w-5 h-5" />
            <span>رجوع</span>
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* بيانات المنتج الأساسية */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              المعلومات الأساسية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* اسم المنتج بالعربي */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المنتج بالعربي <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nameAr"
                  value={formData.nameAr}
                  onChange={handleInputChange}
                  required
                  placeholder="مثال: فستان أطفال قطن"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* اسم المنتج بالإنجليزي */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المنتج بالإنجليزي (اختياري)
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Example: Kids Cotton Dress"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* الفئة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الفئة <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">اختر الفئة</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Badge */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الشارة (Badge)
                </label>
                <select
                  name="badge"
                  value={formData.badge}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">بدون شارة</option>
                  <option value="جديد">جديد</option>
                  <option value="الأكثر مبيعاً">الأكثر مبيعاً</option>
                  <option value="عرض خاص">عرض خاص</option>
                  <option value="تخفيضات">تخفيضات</option>
                </select>
              </div>

              {/* الوصف بالعربي */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوصف بالعربي
                </label>
                <textarea
                  name="descriptionAr"
                  value={formData.descriptionAr}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="وصف المنتج بالتفصيل..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* روابط الصور */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  روابط الصور (مفصولة بفواصل)
                </label>
                <textarea
                  name="images"
                  value={formData.images}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="https://example.com/image1.jpg,https://example.com/image2.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* نظام المقاسات/الأعمار */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <ProductVariantsManager
              variants={variants}
              onChange={setVariants}
            />
          </div>

          {/* أزرار الحفظ */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-bold rounded-lg hover:shadow-xl transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  جاري الحفظ...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  حفظ المنتج
                </span>
              )}
            </button>

            <Link
              href="/vendor/products"
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition"
            >
              إلغاء
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
