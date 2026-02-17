"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Sparkles, Loader2 } from "lucide-react";

export function AddCampaignButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    platform: "",
    budget: "",
    targetAudience: "",
    keywords: "",
    adCopy: "",
    country: "مصر",
    productDescription: "",
  });

  const handleAIAssist = async () => {
    if (!formData.productDescription || selectedTypes.length === 0) {
      alert("اكتب وصف المنتج/الخدمة واختر نوع الحملة أولاً");
      return;
    }

    setAiLoading(true);

    try {
      const res = await fetch("/api/marketing/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productDescription: formData.productDescription,
          campaignTypes: selectedTypes,
          country: formData.country,
        }),
      });

      if (res.ok) {
        const suggestions = await res.json();
        setFormData({
          ...formData,
          name: suggestions.name || formData.name,
          platform: suggestions.platform || formData.platform,
          budget: suggestions.budget || formData.budget,
          targetAudience: suggestions.targetAudience || formData.targetAudience,
          keywords: suggestions.keywords || formData.keywords,
          adCopy: suggestions.adCopy || formData.adCopy,
        });
        setAiDialogOpen(false);
      } else {
        alert("فشل الحصول على اقتراحات الذكاء الاصطناعي");
      }
    } catch (error) {
      console.error("AI assist error:", error);
      alert("حدث خطأ");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formDataObj = new FormData(e.currentTarget);
    const data = {
      name: formDataObj.get("name"),
      type: selectedTypes[0] || "OTHER",
      types: selectedTypes,
      platform: formDataObj.get("platform"),
      budget: parseFloat(formDataObj.get("budget") as string),
      startDate: new Date(formDataObj.get("startDate") as string),
      endDate: new Date(formDataObj.get("endDate") as string),
      targetAudience: formDataObj.get("targetAudience"),
      keywords: formDataObj.get("keywords"),
      adCopy: formDataObj.get("adCopy"),
      facebookCampaignId: formDataObj.get("facebookCampaignId") || undefined,
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
      <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-2xl lg:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">إنشاء حملة تسويقية جديدة</DialogTitle>
          <DialogDescription>
            <Button
              type="button"
              onClick={() => setAiDialogOpen(true)}
              className="mt-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 w-full"
            >
              <Sparkles className="w-5 h-5 ml-2" />
              🤖 اطلب من المساعد الذكي ملء البيانات تلقائياً
            </Button>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">اسم الحملة *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="مثال: حملة الصيف 2024"
              />
            </div>

            <div className="md:col-span-2">
              <Label>أنواع الحملة * (اختر واحد أو أكثر)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2 p-4 border rounded-md bg-gray-50">
                {[
                  { value: "GOOGLE_ADS", label: "🔍 Google Ads" },
                  { value: "FACEBOOK", label: "👥 Facebook" },
                  { value: "INSTAGRAM", label: "📸 Instagram" },
                  { value: "TIKTOK", label: "🎵 TikTok" },
                  { value: "SNAPCHAT", label: "👻 Snapchat" },
                  { value: "EMAIL", label: "📧 البريد الإلكتروني" },
                  { value: "SEO", label: "🔍 SEO" },
                  { value: "INFLUENCER", label: "🌟 Influencer Marketing" },
                  { value: "OTHER", label: "📱 أخرى" },
                ].map((campaignType) => (
                  <label
                    key={campaignType.value}
                    className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-purple-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(campaignType.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTypes([...selectedTypes, campaignType.value]);
                        } else {
                          setSelectedTypes(selectedTypes.filter((t) => t !== campaignType.value));
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm">{campaignType.label}</span>
                  </label>
                ))}
              </div>
              {selectedTypes.length === 0 && (
                <p className="text-xs text-red-500 mt-1">* يجب اختيار نوع واحد على الأقل</p>
              )}
            </div>

            <div>
              <Label htmlFor="platform">المنصة *</Label>
              <Input
                id="platform"
                name="platform"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                required
                placeholder="مثال: Google, Facebook"
              />
            </div>

            <div>
              <Label htmlFor="budget">الميزانية (ج) *</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
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

            <div>
              <Label htmlFor="facebookCampaignId">معرف حملة Facebook (اختياري)</Label>
              <Input
                id="facebookCampaignId"
                name="facebookCampaignId"
                type="text"
                placeholder="مثال: 120210000000000"
                className="text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                لربط الحملة بحملة موجودة على Facebook Ads Manager
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="targetAudience">الجمهور المستهدف</Label>
            <Textarea
              id="targetAudience"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              placeholder="مثال: نساء 25-40 سنة في القاهرة"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="keywords">الكلمات المفتاحية</Label>
            <Input
              id="keywords"
              name="keywords"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="مثال: ملابس, فساتين, أزياء"
            />
          </div>

          <div>
            <Label htmlFor="adCopy">نص الإعلان</Label>
            <Textarea
              id="adCopy"
              name="adCopy"
              value={formData.adCopy}
              onChange={(e) => setFormData({ ...formData, adCopy: e.target.value })}
              placeholder="اكتب نص الإعلان هنا..."
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={loading || selectedTypes.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
          >
            {loading ? "جاري الإنشاء..." : "إنشاء الحملة"}
          </Button>
        </form>
      </DialogContent>

      {/* AI Assistant Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              مساعد التسويق الذكي
            </DialogTitle>
            <DialogDescription>
              أنا موظف الميديا باير بتاعك! اكتبلي عاوز تعمل إعلان عن إيه وأنا هساعدك
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="productDescription">وصف المنتج/الخدمة *</Label>
              <Textarea
                id="productDescription"
                value={formData.productDescription}
                onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                placeholder="مثال: محل ملابس نسائية عصرية، أسعار رخيصة، توصيل لكل مصر"
                rows={3}
                className="resize-none"
              />
            </div>

            <div>
              <Label htmlFor="country">البلد المستهدف</Label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full border rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-orange-500"
              >
                <option value="مصر">🇪🇬 مصر</option>
                <option value="السعودية">🇸🇦 السعودية</option>
                <option value="الإمارات">🇦🇪 الإمارات</option>
                <option value="الكويت">🇰🇼 الكويت</option>
                <option value="قطر">🇶🇦 قطر</option>
                <option value="الأردن">🇯🇴 الأردن</option>
                <option value="لبنان">🇱🇧 لبنان</option>
                <option value="المغرب">🇲🇦 المغرب</option>
                <option value="تونس">🇹🇳 تونس</option>
                <option value="الجزائر">🇩🇿 الجزائر</option>
              </select>
            </div>

            {selectedTypes.length === 0 && (
              <p className="text-sm text-red-500">⚠️ اختر نوع الحملة الأول من النموذج!</p>
            )}

            <Button
              onClick={handleAIAssist}
              disabled={aiLoading || !formData.productDescription || selectedTypes.length === 0}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري التحليل والبحث...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 ml-2" />
                  ابدأ التحليل وامل البيانات
                </>
              )}
            </Button>

            <div className="text-xs text-gray-500 bg-orange-50 p-3 rounded-md">
              <strong>💡 هعمل إيه:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>هحلل منتجك/خدمتك</li>
                <li>هدور على أفضل الكلمات المفتاحية</li>
                <li>هحدد الجمهور الأنسب</li>
                <li>هكتبلك نص إعلان احترافي</li>
                <li>هقترح ميزانية مناسبة</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
      <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-lg max-h-[85vh] overflow-y-auto">
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
