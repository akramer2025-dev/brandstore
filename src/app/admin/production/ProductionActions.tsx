"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

export function CreateProductionButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const [productsRes, materialsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/materials"),
      ]);
      const productsData = await productsRes.json();
      const materialsData = await materialsRes.json();
      setProducts(productsData);
      setMaterials(materialsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const addMaterial = () => {
    setSelectedMaterials([...selectedMaterials, { materialId: "", quantityUsed: 0 }]);
  };

  const removeMaterial = (index: number) => {
    setSelectedMaterials(selectedMaterials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, field: string, value: any) => {
    const updated = [...selectedMaterials];
    updated[index][field] = value;
    setSelectedMaterials(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      productId: formData.get("productId") as string,
      quantity: parseInt(formData.get("quantity") as string),
      materials: selectedMaterials,
      laborCost: parseFloat(formData.get("laborCost") as string) || 0,
      overheadCost: parseFloat(formData.get("overheadCost") as string) || 0,
      notes: formData.get("notes") as string || undefined,
    };

    try {
      const res = await fetch("/api/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setOpen(false);
        router.refresh();
        (e.target as HTMLFormElement).reset();
        setSelectedMaterials([]);
      } else {
        const error = await res.json();
        alert(error.error || "حدث خطأ أثناء إنشاء أمر الإنتاج");
      }
    } catch (error) {
      alert("حدث خطأ أثناء إنشاء أمر الإنتاج");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 shadow-xl">
          <Plus className="w-5 h-5 ml-2" />
          أمر إنتاج جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إنشاء أمر إنتاج جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="productId">المنتج</Label>
            <select
              id="productId"
              name="productId"
              required
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">اختر المنتج</option>
              {products.map((product: any) => (
                <option key={product.id} value={product.id}>
                  {product.nameAr} - {product.price} جنيه
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="quantity">الكمية المراد إنتاجها</Label>
            <Input id="quantity" name="quantity" type="number" min="1" required placeholder="10" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>المواد المستخدمة</Label>
              <Button type="button" size="sm" onClick={addMaterial}>
                إضافة مادة
              </Button>
            </div>
            <div className="space-y-2">
              {selectedMaterials.map((mat, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <select
                      value={mat.materialId}
                      onChange={(e) => updateMaterial(index, "materialId", e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    >
                      <option value="">اختر المادة</option>
                      {materials.map((material: any) => (
                        <option key={material.id} value={material.id}>
                          {material.nameAr} ({material.quantity} {material.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      step="0.01"
                      value={mat.quantityUsed || ""}
                      onChange={(e) => updateMaterial(index, "quantityUsed", parseFloat(e.target.value))}
                      placeholder="الكمية"
                      required
                    />
                  </div>
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeMaterial(index)}>
                    حذف
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="laborCost">تكلفة العمالة (جنيه)</Label>
              <Input
                id="laborCost"
                name="laborCost"
                type="number"
                step="0.01"
                defaultValue="0"
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="overheadCost">التكاليف العامة (جنيه)</Label>
              <Input
                id="overheadCost"
                name="overheadCost"
                type="number"
                step="0.01"
                defaultValue="0"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
            <Input id="notes" name="notes" placeholder="أي ملاحظات" />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "جاري الإنشاء..." : "إنشاء أمر الإنتاج"}
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
