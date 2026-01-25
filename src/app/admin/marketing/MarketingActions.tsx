"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

export function AddCampaignButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      type: formData.get("type"),
      platform: formData.get("platform"),
      budget: parseFloat(formData.get("budget") as string),
      startDate: new Date(formData.get("startDate") as string),
      endDate: new Date(formData.get("endDate") as string),
      targetAudience: formData.get("targetAudience"),
      keywords: formData.get("keywords"),
      adCopy: formData.get("adCopy"),
    };

    try {
      const res = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setOpen(false);
        window.location.reload();
      } else {
        alert("فشل إنشاء الحملة");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg">
          <Plus className="w-4 h-4 ml-2" />
          إنشاء حملة
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">إنشاء حملة تسويقية جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">اسم الحملة *</Label>
              <Input id="name" name="name" required placeholder="مثال: حملة الصيف 2024" />
            </div>

            <div>
              <Label htmlFor="type">نوع الحملة *</Label>
              <select
                id="type"
                name="type"
                required
                className="w-full border rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="">اختر النوع</option>
                <option value="GOOGLE_ADS">🔍 Google Ads</option>
                <option value="FACEBOOK">👥 Facebook</option>
                <option value="INSTAGRAM">📸 Instagram</option>
                <option value="TIKTOK">🎵 TikTok</option>
                <option value="SNAPCHAT">👻 Snapchat</option>
                <option value="EMAIL">📧 البريد الإلكتروني</option>
                <option value="SEO">🔍 SEO</option>
                <option value="INFLUENCER">🌟 Influencer Marketing</option>
                <option value="OTHER">📱 أخرى</option>
              </select>
            </div>

            <div>
              <Label htmlFor="platform">المنصة *</Label>
              <Input id="platform" name="platform" required placeholder="مثال: Google, Facebook" />
            </div>

            <div>
              <Label htmlFor="budget">الميزانية (ج) *</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                step="0.01"
                required
                placeholder="1000"
              />
            </div>

            <div>
              <Label htmlFor="startDate">تاريخ البداية *</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>

            <div>
              <Label htmlFor="endDate">تاريخ النهاية *</Label>
              <Input id="endDate" name="endDate" type="date" required />
            </div>
          </div>

          <div>
            <Label htmlFor="targetAudience">الجمهور المستهدف</Label>
            <Textarea
              id="targetAudience"
              name="targetAudience"
              placeholder="مثال: نساء 25-40 سنة في القاهرة"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="keywords">الكلمات المفتاحية</Label>
            <Input
              id="keywords"
              name="keywords"
              placeholder="مثال: ملابس, فساتين, أزياء"
            />
          </div>

          <div>
            <Label htmlFor="adCopy">نص الإعلان</Label>
            <Textarea
              id="adCopy"
              name="adCopy"
              placeholder="اكتب نص الإعلان هنا..."
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? "جاري الإنشاء..." : "إنشاء الحملة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddKeywordButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      keyword: formData.get("keyword"),
      searchVolume: parseInt(formData.get("searchVolume") as string) || null,
      difficulty: parseInt(formData.get("difficulty") as string) || null,
      currentRank: parseInt(formData.get("currentRank") as string) || null,
      targetRank: parseInt(formData.get("targetRank") as string) || null,
      url: formData.get("url") || null,
      status: formData.get("status") || "TRACKING",
    };

    try {
      const res = await fetch("/api/marketing/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setOpen(false);
        window.location.reload();
      } else {
        alert("فشل إضافة الكلمة المفتاحية");
      }
    } catch (error) {
      console.error("Error adding keyword:", error);
      alert("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg">
          <Plus className="w-4 h-4 ml-2" />
          إضافة كلمة مفتاحية
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">إضافة كلمة SEO جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="keyword">الكلمة المفتاحية *</Label>
            <Input
              id="keyword"
              name="keyword"
              required
              placeholder="مثال: فساتين سهرة"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="searchVolume">حجم البحث الشهري</Label>
              <Input
                id="searchVolume"
                name="searchVolume"
                type="number"
                placeholder="1000"
              />
            </div>

            <div>
              <Label htmlFor="difficulty">الصعوبة (0-100)</Label>
              <Input
                id="difficulty"
                name="difficulty"
                type="number"
                min="0"
                max="100"
                placeholder="50"
              />
            </div>

            <div>
              <Label htmlFor="currentRank">الترتيب الحالي</Label>
              <Input
                id="currentRank"
                name="currentRank"
                type="number"
                placeholder="25"
              />
            </div>

            <div>
              <Label htmlFor="targetRank">الترتيب المستهدف</Label>
              <Input
                id="targetRank"
                name="targetRank"
                type="number"
                placeholder="1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="url">رابط الصفحة</Label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://example.com/page"
            />
          </div>

          <div>
            <Label htmlFor="status">الحالة</Label>
            <Input
              id="status"
              name="status"
              placeholder="TRACKING, OPTIMIZING, ACHIEVED"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            {loading ? "جاري الإضافة..." : "إضافة الكلمة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
