"use client";

import { useState } from "react";
import { Plus, Trash2, Move } from "lucide-react";

export type VariantType = "SIZE" | "AGE" | "COLOR" | "CUSTOM";

export interface ProductVariant {
  id?: string;
  variantType: VariantType;
  name: string;
  nameAr: string;
  sku?: string;
  price: number;
  stock: number;
  isActive: boolean;
  sortOrder: number;
}

interface ProductVariantsManagerProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

// مقاسات معرفة مسبقاً
const PRESET_SIZES = [
  { name: "Small", nameAr: "صغير", sortOrder: 1 },
  { name: "Medium", nameAr: "متوسط", sortOrder: 2 },
  { name: "Large", nameAr: "كبير", sortOrder: 3 },
  { name: "XL", nameAr: "كبير جداً", sortOrder: 4 },
  { name: "XXL", nameAr: "كبير جداً جداً", sortOrder: 5 },
  { name: "3XL", nameAr: "3XL", sortOrder: 6 },
];

// أعمار معرفة مسبقاً للأطفال
const PRESET_AGES = [
  { name: "0-3 months", nameAr: "من 0 إلى 3 شهور", sortOrder: 1 },
  { name: "3-6 months", nameAr: "من 3 إلى 6 شهور", sortOrder: 2 },
  { name: "6-9 months", nameAr: "من 6 إلى 9 شهور", sortOrder: 3 },
  { name: "9-12 months", nameAr: "من 9 إلى 12 شهر", sortOrder: 4 },
  { name: "1 year", nameAr: "سنة", sortOrder: 5 },
  { name: "2 years", nameAr: "سنتين", sortOrder: 6 },
  { name: "3 years", nameAr: "3 سنين", sortOrder: 7 },
  { name: "4 years", nameAr: "4 سنين", sortOrder: 8 },
  { name: "5 years", nameAr: "5 سنين", sortOrder: 9 },
  { name: "6 years", nameAr: "6 سنين", sortOrder: 10 },
  { name: "7 years", nameAr: "7 سنين", sortOrder: 11 },
  { name: "8 years", nameAr: "8 سنين", sortOrder: 12 },
];

// مقاسات أحذية الكبار
const PRESET_SHOE_SIZES_ADULT = [
  { name: "36", nameAr: "36", sortOrder: 1 },
  { name: "37", nameAr: "37", sortOrder: 2 },
  { name: "38", nameAr: "38", sortOrder: 3 },
  { name: "39", nameAr: "39", sortOrder: 4 },
  { name: "40", nameAr: "40", sortOrder: 5 },
  { name: "41", nameAr: "41", sortOrder: 6 },
  { name: "42", nameAr: "42", sortOrder: 7 },
  { name: "43", nameAr: "43", sortOrder: 8 },
  { name: "44", nameAr: "44", sortOrder: 9 },
  { name: "45", nameAr: "45", sortOrder: 10 },
];

// مقاسات أحذية الأطفال
const PRESET_SHOE_SIZES_KIDS = [
  { name: "20", nameAr: "20", sortOrder: 1 },
  { name: "21", nameAr: "21", sortOrder: 2 },
  { name: "22", nameAr: "22", sortOrder: 3 },
  { name: "23", nameAr: "23", sortOrder: 4 },
  { name: "24", nameAr: "24", sortOrder: 5 },
  { name: "25", nameAr: "25", sortOrder: 6 },
  { name: "26", nameAr: "26", sortOrder: 7 },
  { name: "27", nameAr: "27", sortOrder: 8 },
  { name: "28", nameAr: "28", sortOrder: 9 },
  { name: "29", nameAr: "29", sortOrder: 10 },
  { name: "30", nameAr: "30", sortOrder: 11 },
  { name: "31", nameAr: "31", sortOrder: 12 },
  { name: "32", nameAr: "32", sortOrder: 13 },
  { name: "33", nameAr: "33", sortOrder: 14 },
  { name: "34", nameAr: "34", sortOrder: 15 },
  { name: "35", nameAr: "35", sortOrder: 16 },
];

export function ProductVariantsManager({ variants, onChange }: ProductVariantsManagerProps) {
  const [variantType, setVariantType] = useState<VariantType>("SIZE");

  const addVariant = () => {
    const newVariant: ProductVariant = {
      variantType,
      name: "",
      nameAr: "",
      sku: "",
      price: 0,
      stock: 0,
      isActive: true,
      sortOrder: variants.length + 1,
    };
    onChange([...variants, newVariant]);
  };

  const addPresetSizes = () => {
    const newVariants = PRESET_SIZES.map((size) => ({
      variantType: "SIZE" as VariantType,
      name: size.name,
      nameAr: size.nameAr,
      sku: "",
      price: 0,
      stock: 0,
      isActive: true,
      sortOrder: size.sortOrder,
    }));
    onChange([...variants, ...newVariants]);
  };

  const addPresetAges = () => {
    const newVariants = PRESET_AGES.map((age) => ({
      variantType: "AGE" as VariantType,
      name: age.name,
      nameAr: age.nameAr,
      sku: "",
      price: 0,
      stock: 0,
      isActive: true,
      sortOrder: age.sortOrder,
    }));
    onChange([...variants, ...newVariants]);
  };

  const addPresetShoeSizesAdult = () => {
    const newVariants = PRESET_SHOE_SIZES_ADULT.map((size) => ({
      variantType: "SIZE" as VariantType,
      name: size.name,
      nameAr: size.nameAr,
      sku: "",
      price: 0,
      stock: 0,
      isActive: true,
      sortOrder: size.sortOrder,
    }));
    onChange([...variants, ...newVariants]);
  };

  const addPresetShoeSizesKids = () => {
    const newVariants = PRESET_SHOE_SIZES_KIDS.map((size) => ({
      variantType: "SIZE" as VariantType,
      name: size.name,
      nameAr: size.nameAr,
      sku: "",
      price: 0,
      stock: 0,
      isActive: true,
      sortOrder: size.sortOrder,
    }));
    onChange([...variants, ...newVariants]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const moveVariant = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === variants.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...variants];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    
    // تحديث sortOrder
    updated[index].sortOrder = index + 1;
    updated[newIndex].sortOrder = newIndex + 1;
    
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <span className="text-3xl">📏</span>
          المقاسات والأسعار
        </h3>
        <p className="text-gray-300 text-sm">
          أضف المقاسات المختلفة للمنتج مع السعر والكمية لكل مقاس
        </p>
      </div>

      {/* Preset Buttons - منظمة في مجموعات */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* مقاسات الملابس */}
          <button
            type="button"
            onClick={addPresetSizes}
            className="group relative overflow-hidden p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-500/30 rounded-xl hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-2xl">
                👕
              </div>
              <div className="text-right flex-1">
                <div className="text-white font-bold text-lg">مقاسات ملابس كبار</div>
                <div className="text-gray-300 text-sm">S, M, L, XL, XXL, 3XL</div>
              </div>
            </div>
          </button>

          {/* أعمار الأطفال */}
          <button
            type="button"
            onClick={addPresetAges}
            className="group relative overflow-hidden p-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-2 border-blue-500/30 rounded-xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-2xl">
                👶
              </div>
              <div className="text-right flex-1">
                <div className="text-white font-bold text-lg">ملابس أطفال (بالعمر)</div>
                <div className="text-gray-300 text-sm">من 0-3 شهور حتى 8 سنوات</div>
              </div>
            </div>
          </button>

          {/* أحذية كبار */}
          <button
            type="button"
            onClick={addPresetShoeSizesAdult}
            className="group relative overflow-hidden p-4 bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-2 border-amber-500/30 rounded-xl hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-2xl">
                👞
              </div>
              <div className="text-right flex-1">
                <div className="text-white font-bold text-lg">أحذية كبار</div>
                <div className="text-gray-300 text-sm">مقاسات 36 إلى 45</div>
              </div>
            </div>
          </button>

          {/* أحذية أطفال */}
          <button
            type="button"
            onClick={addPresetShoeSizesKids}
            className="group relative overflow-hidden p-4 bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border-2 border-yellow-500/30 rounded-xl hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-500/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center text-2xl">
                👟
              </div>
              <div className="text-right flex-1">
                <div className="text-white font-bold text-lg">أحذية أطفال</div>
                <div className="text-gray-300 text-sm">مقاسات 20 إلى 35</div>
              </div>
            </div>
          </button>
        </div>

        {/* زر إضافة مخصص */}
        <button
          type="button"
          onClick={addVariant}
          className="w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all font-bold text-lg"
        >
          <Plus className="w-5 h-5 inline ml-2" />
          إضافة مقاس مخصص
        </button>
      </div>

      {/* Variants List */}
      {variants.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-white/20 rounded-xl bg-white/5">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-white text-lg font-bold mb-2">
            لم تُضف أي مقاسات بعد
          </p>
          <p className="text-gray-400">
            اضغط على أحد الأزرار أعلاه لإضافة مقاسات جاهزة أو أضف مقاس مخصص
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* عداد المقاسات */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
            <span className="text-white font-bold">
              📊 إجمالي المقاسات: {variants.length}
            </span>
            <span className="text-gray-300 text-sm">
              إجمالي الكميات: {variants.reduce((sum, v) => sum + (v.stock || 0), 0)}
            </span>
          </div>

          {variants.map((variant, index) => (
            <div
              key={index}
              className="p-5 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl hover:border-purple-500/50 transition-all shadow-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* رقم الترتيب */}
                <div className="md:col-span-1 flex items-center justify-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </div>
                </div>

                {/* نوع المقاس */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-white mb-2">
                    النوع
                  </label>
                  <select
                    value={variant.variantType}
                    onChange={(e) =>
                      updateVariant(index, "variantType", e.target.value as VariantType)
                    }
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/30 rounded-lg text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="SIZE" className="bg-gray-800">مقاس 👕</option>
                    <option value="AGE" className="bg-gray-800">عمر 👶</option>
                    <option value="COLOR" className="bg-gray-800">لون 🎨</option>
                    <option value="CUSTOM" className="bg-gray-800">مخصص ✨</option>
                  </select>
                </div>

                {/* المقاس بالعربي */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-bold text-white mb-2">
                    المقاس/العمر
                  </label>
                  <input
                    type="text"
                    value={variant.nameAr}
                    onChange={(e) => updateVariant(index, "nameAr", e.target.value)}
                    placeholder="مثال: كبير أو 36"
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* السعر */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-white mb-2">
                    💰 السعر (ج.م)
                  </label>
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) =>
                      updateVariant(index, "price", parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                  />
                </div>

                {/* الكمية */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-white mb-2">
                    📦 الكمية
                  </label>
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) =>
                      updateVariant(index, "stock", parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                {/* أزرار التحكم */}
                <div className="md:col-span-2 flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => moveVariant(index, "up")}
                    disabled={index === 0}
                    className="flex-1 p-2.5 bg-white/10 text-white hover:bg-white/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="للأعلى"
                  >
                    ⬆️
                  </button>
                  <button
                    type="button"
                    onClick={() => moveVariant(index, "down")}
                    disabled={index === variants.length - 1}
                    className="flex-1 p-2.5 bg-white/10 text-white hover:bg-white/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="للأسفل"
                  >
                    ⬇️
                  </button>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="flex-1 p-2.5 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg transition-all"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>

              {/* الاسم بالإنجليزي - سطر منفصل */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  الاسم بالإنجليزي (اختياري)
                </label>
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) => updateVariant(index, "name", e.target.value)}
                  placeholder="Example: Large or 36"
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ملاحظة توضيحية */}
      <div className="p-5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="text-3xl">💡</div>
          <div className="flex-1">
            <p className="text-white font-bold mb-2">كيف يعمل نظام المقاسات؟</p>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• كل مقاس له سعر وكمية منفصلة في المخزون</li>
              <li>• يمكنك إضافة مقاسات جاهزة أو إنشاء مقاسات مخصصة</li>
              <li>• العميل سيختار المقاس عند الشراء</li>
              <li>• المخزون يتحدث تلقائياً عند البيع لكل مقاس</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
