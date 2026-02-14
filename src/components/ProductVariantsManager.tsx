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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          المقاسات/الأعمار والأسعار
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addPresetSizes}
            className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
          >
            + مقاسات جاهزة
          </button>
          <button
            type="button"
            onClick={addPresetAges}
            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            + أعمار أطفال جاهزة
          </button>
          <button
            type="button"
            onClick={addPresetShoeSizesAdult}
            className="px-3 py-1.5 text-sm bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"
          >
            + مقاسات أحذية كبار
          </button>
          <button
            type="button"
            onClick={addPresetShoeSizesKids}
            className="px-3 py-1.5 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
          >
            + مقاسات أحذية أطفال
          </button>
          <button
            type="button"
            onClick={addVariant}
            className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            إضافة مقاس مخصص
          </button>
        </div>
      </div>

      {variants.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">
            لا توجد مقاسات بعد. اضغط على الأزرار أعلاه لإضافة مقاسات أو أعمار
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {variants.map((variant, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                {/* نوع المقاس */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    النوع
                  </label>
                  <select
                    value={variant.variantType}
                    onChange={(e) =>
                      updateVariant(index, "variantType", e.target.value as VariantType)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="SIZE">مقاس</option>
                    <option value="AGE">عمر</option>
                    <option value="COLOR">لون</option>
                    <option value="CUSTOM">مخصص</option>
                  </select>
                </div>

                {/* الاسم بالعربي */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المقاس/العمر بالعربي
                  </label>
                  <input
                    type="text"
                    value={variant.nameAr}
                    onChange={(e) => updateVariant(index, "nameAr", e.target.value)}
                    placeholder="مثال: متوسط أو من 3 إلى 6 شهور"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                {/* السعر */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    السعر (جنيه)
                  </label>
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) =>
                      updateVariant(index, "price", parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    step="0.01"
                    min="0"
                  />
                </div>

                {/* الكمية */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الكمية
                  </label>
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) =>
                      updateVariant(index, "stock", parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    min="0"
                  />
                </div>

                {/* الأزرار */}
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => moveVariant(index, "up")}
                    disabled={index === 0}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30"
                    title="للأعلى"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveVariant(index, "down")}
                    disabled={index === variants.length - 1}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30"
                    title="للأسفل"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* الاسم بالإنجليزي - سطر منفصل */}
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المقاس/العمر بالإنجليزي (اختياري)
                </label>
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) => updateVariant(index, "name", e.target.value)}
                  placeholder="Example: Medium or 3-6 months"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 ملاحظة:</strong> كل مقاس/عمر له سعر وكمية منفصلة. مثال:
          <br />
          - مقاس Small بسعر 250 جنيه، الكمية 10
          <br />
          - مقاس Medium بسعر 300 جنيه، الكمية 15
          <br />
          - من 3 إلى 6 شهور بسعر 200 جنيه، الكمية 8
        </p>
      </div>
    </div>
  );
}
