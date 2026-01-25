"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, Package } from "lucide-react";
import Link from "next/link";

interface MaterialItem {
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  totalCost: number;
}

interface RawMaterial {
  id: string;
  name: string;
  nameAr: string;
  unit: string;
  unitPrice: number;
  category: string;
}

export default function CreatePurchaseVoucherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  
  const [formData, setFormData] = useState({
    recipientName: "",
    category: "RAW_MATERIALS",
    paymentMethod: "CASH",
    description: "",
    reference: ""
  });

  const [items, setItems] = useState<MaterialItem[]>([]);
  const [showNewMaterialDialog, setShowNewMaterialDialog] = useState(false);

  // جلب المواد الخام
  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/raw-materials');
      const data = await response.json();
      setMaterials(data.materials || []);
    } catch (error) {
      toast.error("فشل جلب المواد");
    } finally {
      setLoadingMaterials(false);
    }
  };

  // إضافة صنف جديد
  const addItem = () => {
    setItems([...items, {
      materialId: "",
      materialName: "",
      quantity: 1,
      unitPrice: 0,
      unit: "متر",
      totalCost: 0
    }]);
  };

  // حذف صنف
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // تحديث صنف
  const updateItem = (index: number, field: keyof MaterialItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // إذا تم تغيير المادة، تحديث السعر والوحدة
    if (field === 'materialId') {
      const material = materials.find(m => m.id === value);
      if (material) {
        newItems[index].materialName = material.nameAr;
        newItems[index].unitPrice = material.unitPrice;
        newItems[index].unit = material.unit;
      }
    }
    
    // حساب التكلفة الإجمالية
    newItems[index].totalCost = newItems[index].quantity * newItems[index].unitPrice;
    
    setItems(newItems);
  };

  // حساب الإجمالي
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.totalCost, 0);
  };

  // إرسال النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error("يجب إضافة صنف واحد على الأقل");
      return;
    }

    if (!formData.recipientName) {
      toast.error("يجب إدخال اسم المورد");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/purchase-vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: calculateTotal(),
          items: items.filter(item => item.materialId)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل إنشاء السند');
      }

      toast.success("تم إنشاء سند الصرف بنجاح");
      router.push('/admin/purchase-vouchers');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "فشل إنشاء السند");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/purchase-vouchers">
            <Button variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">إنشاء سند صرف جديد</h1>
            <p className="text-gray-400 mt-1">سند صرف لشراء المواد الخام والأصناف</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* معلومات السند */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">معلومات السند</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">اسم المورد/التاجر *</Label>
                  <Input
                    value={formData.recipientName}
                    onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                    placeholder="مثال: محل أقمشة النيل"
                    className="bg-gray-800/50 border-teal-700/50 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">التصنيف</Label>
                  <Select 
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger className="bg-gray-800/50 border-teal-700/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RAW_MATERIALS">مواد خام</SelectItem>
                      <SelectItem value="FABRIC">أقمشة</SelectItem>
                      <SelectItem value="ACCESSORIES">إكسسوارات</SelectItem>
                      <SelectItem value="SUPPLIES">مستلزمات</SelectItem>
                      <SelectItem value="OTHER">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">طريقة الدفع</Label>
                  <Select 
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({...formData, paymentMethod: value})}
                  >
                    <SelectTrigger className="bg-gray-800/50 border-teal-700/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">نقدي</SelectItem>
                      <SelectItem value="BANK_TRANSFER">تحويل بنكي</SelectItem>
                      <SelectItem value="CHECK">شيك</SelectItem>
                      <SelectItem value="CREDIT">آجل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">رقم مرجعي (اختياري)</Label>
                  <Input
                    value={formData.reference}
                    onChange={(e) => setFormData({...formData, reference: e.target.value})}
                    placeholder="رقم الفاتورة"
                    className="bg-gray-800/50 border-teal-700/50 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">ملاحظات</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="أي ملاحظات إضافية..."
                  className="bg-gray-800/50 border-teal-700/50 text-white"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* الأصناف */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">الأصناف المشتراة</CardTitle>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={addItem}
                    size="sm"
                    className="bg-gradient-to-r from-teal-600 to-cyan-600"
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة صنف
                  </Button>
                  <Link href="/admin/raw-materials/create">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-teal-600 text-teal-400"
                    >
                      <Package className="h-4 w-4 ml-2" />
                      صنف جديد
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 mb-4">لم يتم إضافة أصناف بعد</p>
                  <Button
                    type="button"
                    onClick={addItem}
                    size="sm"
                    className="bg-gradient-to-r from-teal-600 to-cyan-600"
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة أول صنف
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="bg-gray-800/30 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="text-white font-semibold">صنف {index + 1}</h4>
                        <Button
                          type="button"
                          onClick={() => removeItem(index)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-sm">المادة</Label>
                          <Select
                            value={item.materialId}
                            onValueChange={(value) => updateItem(index, 'materialId', value)}
                          >
                            <SelectTrigger className="bg-gray-700/50 border-teal-700/50 text-white">
                              <SelectValue placeholder="اختر المادة" />
                            </SelectTrigger>
                            <SelectContent>
                              {loadingMaterials ? (
                                <SelectItem value="loading" disabled>جاري التحميل...</SelectItem>
                              ) : materials.length === 0 ? (
                                <SelectItem value="empty" disabled>لا توجد مواد</SelectItem>
                              ) : (
                                materials.map((material) => (
                                  <SelectItem key={material.id} value={material.id}>
                                    {material.nameAr} ({material.unit})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-300 text-sm">الكمية</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="bg-gray-700/50 border-teal-700/50 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-300 text-sm">سعر الوحدة (ج.م)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="bg-gray-700/50 border-teal-700/50 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-300 text-sm">الإجمالي</Label>
                          <div className="bg-teal-900/30 border border-teal-700/50 rounded-md px-3 py-2 text-teal-400 font-bold">
                            {item.totalCost.toFixed(2)} ج.م
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* الإجمالي الكلي */}
                  <div className="bg-teal-900/30 border-2 border-teal-600 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-lg font-semibold">الإجمالي الكلي:</span>
                      <span className="text-3xl font-bold text-teal-400">{calculateTotal().toFixed(2)} ج.م</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* أزرار الإجراءات */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading || items.length === 0}
              className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-6 text-lg"
            >
              {loading ? "جاري الحفظ..." : "حفظ سند الصرف"}
            </Button>
            <Link href="/admin/purchase-vouchers" className="flex-none">
              <Button
                type="button"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 py-6"
              >
                إلغاء
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
