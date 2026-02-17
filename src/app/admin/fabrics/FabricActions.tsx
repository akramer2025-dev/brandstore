"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Scissors } from "lucide-react";
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

export function AddFabricButton() {
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
      type: formData.get("type") as string,
      color: formData.get("color") as string,
      totalLength: parseFloat(formData.get("totalLength") as string),
      purchasePrice: parseFloat(formData.get("purchasePrice") as string),
      supplier: formData.get("supplier") as string,
    };

    try {
      const res = await fetch("/api/fabrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        alert("حدث خطأ أثناء إضافة القماش");
      }
    } catch (error) {
      alert("حدث خطأ أثناء إضافة القماش");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50 shadow-xl">
          <Plus className="w-5 h-5 ml-2" />
          شراء قماش جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>شراء قماش جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">اسم القماش (English)</Label>
            <Input id="name" name="name" required placeholder="Cotton" />
          </div>
          <div>
            <Label htmlFor="nameAr">اسم القماش (عربي)</Label>
            <Input id="nameAr" name="nameAr" required placeholder="قطن" />
          </div>
          <div>
            <Label htmlFor="type">النوع</Label>
            <Input id="type" name="type" required placeholder="قطن، حرير، بوليستر" />
          </div>
          <div>
            <Label htmlFor="color">اللون</Label>
            <Input id="color" name="color" required placeholder="أبيض، أزرق، أحمر" />
          </div>
          <div>
            <Label htmlFor="totalLength">الطول الإجمالي (متر)</Label>
            <Input
              id="totalLength"
              name="totalLength"
              type="number"
              step="0.01"
              required
              placeholder="100"
            />
          </div>
          <div>
            <Label htmlFor="purchasePrice">سعر الشراء (جنيه/متر)</Label>
            <Input
              id="purchasePrice"
              name="purchasePrice"
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
          <div className="flex gap-2">
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

export function CutFabricButton({
  fabricId,
  remainingLength,
}: {
  fabricId: string;
  remainingLength: number;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      fabricId,
      productId: formData.get("productId") as string,
      lengthUsed: parseFloat(formData.get("lengthUsed") as string),
      quantity: parseInt(formData.get("quantity") as string),
      notes: formData.get("notes") as string,
    };

    try {
      const res = await fetch("/api/fabrics/cut", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || "حدث خطأ أثناء تفصيل القماش");
      }
    } catch (error) {
      alert("حدث خطأ أثناء تفصيل القماش");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700"
          disabled={remainingLength < 1}
        >
          <Scissors className="w-4 h-4 ml-2" />
          تفصيل قطعة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تفصيل قطعة من القماش</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="productId">المنتج</Label>
            <Input
              id="productId"
              name="productId"
              required
              placeholder="معرف المنتج"
            />
          </div>
          <div>
            <Label htmlFor="lengthUsed">الطول المستخدم (متر)</Label>
            <Input
              id="lengthUsed"
              name="lengthUsed"
              type="number"
              step="0.01"
              max={remainingLength}
              required
              placeholder="2.5"
            />
            <p className="text-xs text-gray-500 mt-1">
              المتبقي: {remainingLength.toFixed(2)} متر
            </p>
          </div>
          <div>
            <Label htmlFor="quantity">عدد القطع</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              required
              placeholder="10"
            />
          </div>
          <div>
            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
            <Input id="notes" name="notes" placeholder="أي ملاحظات" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "جاري التفصيل..." : "تفصيل"}
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
