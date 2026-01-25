"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRightLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export function AddMaterialButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      nameAr: formData.get("nameAr") as string,
      category: formData.get("category") as string,
      unit: formData.get("unit") as string,
      quantity: parseFloat(formData.get("quantity") as string),
      minQuantity: parseFloat(formData.get("minQuantity") as string),
      unitPrice: parseFloat(formData.get("unitPrice") as string),
      supplier: formData.get("supplier") as string || undefined,
      location: formData.get("location") as string || undefined,
    };

    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setOpen(false);
        router.refresh();
        (e.target as HTMLFormElement).reset();
      } else {
        const error = await res.json();
        alert(error.error || "حدث خطأ أثناء إضافة المادة");
      }
    } catch (error) {
      alert("حدث خطأ أثناء إضافة المادة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl">
          <Plus className="w-5 h-5 ml-2" />
          إضافة مادة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة مادة جديدة للمخزون</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">اسم المادة (English)</Label>
            <Input id="name" name="name" required placeholder="Cotton Fabric" />
          </div>
          <div>
            <Label htmlFor="nameAr">اسم المادة (عربي)</Label>
            <Input id="nameAr" name="nameAr" required placeholder="قماش قطني" />
          </div>
          <div>
            <Label htmlFor="category">الفئة</Label>
            <select
              id="category"
              name="category"
              required
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">اختر الفئة</option>
              <option value="FABRIC">أقمشة</option>
              <option value="THREAD">خيوط</option>
              <option value="BUTTON">أزرار</option>
              <option value="ZIPPER">سحابات</option>
              <option value="ACCESSORY">إكسسوارات</option>
              <option value="PACKAGING">تغليف</option>
              <option value="OTHER">أخرى</option>
            </select>
          </div>
          <div>
            <Label htmlFor="unit">الوحدة</Label>
            <Input id="unit" name="unit" required placeholder="متر، كيلو، قطعة" />
          </div>
          <div>
            <Label htmlFor="quantity">الكمية</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              step="0.01"
              required
              placeholder="100"
            />
          </div>
          <div>
            <Label htmlFor="minQuantity">الحد الأدنى للتنبيه</Label>
            <Input
              id="minQuantity"
              name="minQuantity"
              type="number"
              step="0.01"
              required
              placeholder="10"
            />
          </div>
          <div>
            <Label htmlFor="unitPrice">سعر الوحدة (جنيه)</Label>
            <Input
              id="unitPrice"
              name="unitPrice"
              type="number"
              step="0.01"
              required
              placeholder="50"
            />
          </div>
          <div>
            <Label htmlFor="supplier">المورد (اختياري)</Label>
            <Input id="supplier" name="supplier" placeholder="اسم المورد" />
          </div>
          <div>
            <Label htmlFor="location">موقع التخزين (اختياري)</Label>
            <Input id="location" name="location" placeholder="المخزن الرئيسي - رف 3" />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "جاري الحفظ..." : "حفظ"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MaterialMovementButton({
  materialId,
  materialName,
  unit,
}: {
  materialId: string;
  materialName: string;
  unit: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      materialId,
      type: formData.get("type") as string,
      quantity: parseFloat(formData.get("quantity") as string),
      unitPrice: formData.get("unitPrice") ? parseFloat(formData.get("unitPrice") as string) : undefined,
      reference: formData.get("reference") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    };

    try {
      const res = await fetch("/api/materials/movement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setOpen(false);
        router.refresh();
        (e.target as HTMLFormElement).reset();
      } else {
        const error = await res.json();
        alert(error.error || "حدث خطأ أثناء تسجيل الحركة");
      }
    } catch (error) {
      alert("حدث خطأ أثناء تسجيل الحركة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <ArrowRightLeft className="w-4 h-4 ml-2" />
          تسجيل حركة
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>تسجيل حركة - {materialName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">نوع الحركة</Label>
            <select
              id="type"
              name="type"
              required
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">اختر النوع</option>
              <option value="PURCHASE">شراء</option>
              <option value="PRODUCTION">استخدام في الإنتاج</option>
              <option value="RETURN">إرجاع</option>
              <option value="ADJUSTMENT">تسوية</option>
              <option value="DAMAGE">تالف</option>
              <option value="TRANSFER">نقل</option>
            </select>
          </div>
          <div>
            <Label htmlFor="quantity">الكمية ({unit})</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              step="0.01"
              required
              placeholder="10"
            />
            <p className="text-xs text-gray-500 mt-1">
              استخدم قيمة موجبة للإضافة وسالبة للخصم
            </p>
          </div>
          <div>
            <Label htmlFor="unitPrice">سعر الوحدة (اختياري)</Label>
            <Input
              id="unitPrice"
              name="unitPrice"
              type="number"
              step="0.01"
              placeholder="50"
            />
          </div>
          <div>
            <Label htmlFor="reference">المرجع (اختياري)</Label>
            <Input
              id="reference"
              name="reference"
              placeholder="رقم الفاتورة أو أمر الإنتاج"
            />
          </div>
          <div>
            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
            <Input id="notes" name="notes" placeholder="أي ملاحظات" />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "جاري الحفظ..." : "تسجيل"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
