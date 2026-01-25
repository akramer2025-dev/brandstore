"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateRawMaterialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameAr: "",
    name: "",
    category: "FABRIC",
    unit: "متر",
    quantity: 0,
    unitPrice: 0,
    supplier: "",
    location: "",
    minQuantity: 10
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nameAr) {
      toast.error("يجب إدخال اسم المادة");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/raw-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل إضافة المادة');
      }

      toast.success("تمت إضافة المادة بنجاح");
      router.push('/admin/raw-materials');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "فشل إضافة المادة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/raw-materials">
            <Button variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">إضافة مادة خام جديدة</h1>
            <p className="text-gray-400 mt-1">إضافة صنف جديد للمخزون</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">معلومات المادة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">اسم المادة (عربي) *</Label>
                  <Input
                    value={formData.nameAr}
                    onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                    placeholder="مثال: قماش قطن أبيض"
                    className="bg-gray-800/50 border-teal-700/50 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">اسم المادة (English)</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="White Cotton Fabric"
                    className="bg-gray-800/50 border-teal-700/50 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">التصنيف *</Label>
                  <Select 
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger className="bg-gray-800/50 border-teal-700/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FABRIC">أقمشة</SelectItem>
                      <SelectItem value="THREAD">خيوط</SelectItem>
                      <SelectItem value="BUTTON">أزرار</SelectItem>
                      <SelectItem value="ZIPPER">سحابات</SelectItem>
                      <SelectItem value="ACCESSORY">إكسسوارات</SelectItem>
                      <SelectItem value="PACKAGING">تغليف</SelectItem>
                      <SelectItem value="OTHER">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">الوحدة *</Label>
                  <Select 
                    value={formData.unit}
                    onValueChange={(value) => setFormData({...formData, unit: value})}
                  >
                    <SelectTrigger className="bg-gray-800/50 border-teal-700/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="متر">متر</SelectItem>
                      <SelectItem value="كيلو">كيلو</SelectItem>
                      <SelectItem value="قطعة">قطعة</SelectItem>
                      <SelectItem value="علبة">علبة</SelectItem>
                      <SelectItem value="لفة">لفة</SelectItem>
                      <SelectItem value="مجموعة">مجموعة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">الكمية الأولية</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value) || 0})}
                    className="bg-gray-800/50 border-teal-700/50 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">سعر الوحدة (ج.م)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({...formData, unitPrice: parseFloat(e.target.value) || 0})}
                    className="bg-gray-800/50 border-teal-700/50 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">المورد</Label>
                  <Input
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    placeholder="اسم المورد أو التاجر"
                    className="bg-gray-800/50 border-teal-700/50 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">الموقع/المخزن</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="مثال: مخزن 1 - رف A"
                    className="bg-gray-800/50 border-teal-700/50 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">حد الإنذار</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({...formData, minQuantity: parseFloat(e.target.value) || 10})}
                    className="bg-gray-800/50 border-teal-700/50 text-white"
                  />
                  <p className="text-xs text-gray-500">سيتم التنبيه عند وصول الكمية لهذا الحد</p>
                </div>
              </div>

              {/* حساب القيمة الإجمالية */}
              {formData.quantity > 0 && formData.unitPrice > 0 && (
                <div className="bg-teal-900/30 border border-teal-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">القيمة الإجمالية:</span>
                    <span className="text-2xl font-bold text-teal-400">
                      {(formData.quantity * formData.unitPrice).toFixed(2)} ج.م
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-6"
                >
                  {loading ? "جاري الحفظ..." : "حفظ المادة"}
                </Button>
                <Link href="/admin/raw-materials" className="flex-none">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 py-6"
                  >
                    إلغاء
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
