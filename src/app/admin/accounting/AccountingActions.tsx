"use client";

import { useState } from "react";
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

export function AddVoucherButton({ type }: { type: "RECEIPT" | "PAYMENT" }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      type,
      amount: parseFloat(formData.get("amount") as string),
      paymentMethod: formData.get("paymentMethod") as string,
      recipientName: type === "PAYMENT" ? formData.get("name") as string : undefined,
      payerName: type === "RECEIPT" ? formData.get("name") as string : undefined,
      category: type === "PAYMENT" ? formData.get("category") as string : undefined,
      reference: formData.get("reference") as string || undefined,
      description: formData.get("description") as string || undefined,
    };

    try {
      const res = await fetch("/api/accounting/vouchers", {
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
        alert(error.error || "حدث خطأ أثناء إنشاء السند");
      }
    } catch (error) {
      alert("حدث خطأ أثناء إنشاء السند");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className={`${type === "RECEIPT" ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white shadow-xl`}>
          <Plus className="w-5 h-5 ml-2" />
          {type === "RECEIPT" ? "سند قبض جديد" : "سند صرف جديد"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{type === "RECEIPT" ? "إنشاء سند قبض" : "إنشاء سند صرف"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{type === "RECEIPT" ? "اسم الدافع" : "اسم المستلم"}</Label>
            <Input id="name" name="name" required placeholder="الاسم" />
          </div>
          
          <div>
            <Label htmlFor="amount">المبلغ (جنيه)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              required
              placeholder="1000"
            />
          </div>

          <div>
            <Label htmlFor="paymentMethod">طريقة الدفع</Label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              required
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">اختر طريقة الدفع</option>
              <option value="CASH">نقدي</option>
              <option value="BANK_TRANSFER">تحويل بنكي</option>
              <option value="CHECK">شيك</option>
              <option value="CARD">بطاقة</option>
              <option value="MOBILE_WALLET">محفظة إلكترونية</option>
            </select>
          </div>

          {type === "PAYMENT" && (
            <div>
              <Label htmlFor="category">الفئة</Label>
              <select
                id="category"
                name="category"
                required
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">اختر الفئة</option>
                <option value="MATERIALS">مواد خام</option>
                <option value="SALARIES">رواتب</option>
                <option value="RENT">إيجار</option>
                <option value="UTILITIES">مرافق</option>
                <option value="MARKETING">تسويق</option>
                <option value="TRANSPORT">نقل</option>
                <option value="MAINTENANCE">صيانة</option>
                <option value="OTHER">أخرى</option>
              </select>
            </div>
          )}

          <div>
            <Label htmlFor="reference">المرجع (اختياري)</Label>
            <Input
              id="reference"
              name="reference"
              placeholder="رقم الفاتورة أو الطلب"
            />
          </div>

          <div>
            <Label htmlFor="description">الوصف (اختياري)</Label>
            <Input id="description" name="description" placeholder="وصف المعاملة" />
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
