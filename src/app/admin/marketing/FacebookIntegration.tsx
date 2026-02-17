"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Facebook, RefreshCw, Loader2, Link as LinkIcon, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FacebookIntegrationProps {
  campaignId: string;
  campaignName: string;
  campaignDescription?: string;
  campaignBudget?: number;
  facebookCampaignId: string | null;
  onSync?: () => void;
  language?: "ar" | "en";
}

export function FacebookIntegration({
  campaignId,
  campaignName,
  campaignDescription,
  campaignBudget,
  facebookCampaignId,
  onSync,
  language = "ar",
}: FacebookIntegrationProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    targetUrl: process.env.NEXT_PUBLIC_APP_URL || "https://www.remostore.net",
    adMessage: campaignDescription || `اكتشف ${campaignName}! 🔥 أفضل العروض والمنتجات بأسعار منافسة`,
    adTitle: campaignName,
    adDescription: campaignDescription || "عروض حصرية لفترة محدودة - اطلب الآن واستمتع بأفضل الأسعار",
    imageUrl: "",
  });

  const t = {
    ar: {
      linkToFacebook: "ربط بفيسبوك",
      linkedToFacebook: "مربوط بفيسبوك",
      syncData: "مزامنة البيانات",
      createCampaign: "إنشاء حملة على فيسبوك",
      creating: "جاري الإنشاء...",
      syncing: "جاري المزامنة...",
      targetUrl: "رابط الهبوط",
      adMessage: "نص الإعلان",
      adTitle: "عنوان الإعلان",
      adDescription: "وصف الإعلان",
      imageUrl: "رابط الصورة (اختياري)",
      create: "إنشاء",
      cancel: "إلغاء",
      success: "تم بنجاح!",
      error: "حدث خطأ",
      syncSuccess: "تم تحديث البيانات من فيسبوك",
      createSuccess: "تم إنشاء الحملة على فيسبوك",
    },
    en: {
      linkToFacebook: "Link to Facebook",
      linkedToFacebook: "Linked to Facebook",
      syncData: "Sync Data",
      createCampaign: "Create Facebook Campaign",
      creating: "Creating...",
      syncing: "Syncing...",
      targetUrl: "Landing Page URL",
      adMessage: "Ad Message",
      adTitle: "Ad Title",
      adDescription: "Ad Description",
      imageUrl: "Image URL (optional)",
      create: "Create",
      cancel: "Cancel",
      success: "Success!",
      error: "Error occurred",
      syncSuccess: "Data synced from Facebook",
      createSuccess: "Campaign created on Facebook",
    },
  };

  const translations = t[language];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("❌ الصورة كبيرة جداً! الحد الأقصى 5 ميجابايت");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("❌ من فضلك اختار صورة صحيحة");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      
      // استخدام API endpoint الخاص بنا بدلاً من Cloudinary مباشرة
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل رفع الصورة");
      }

      const data = await response.json();
      const imageUrl = data.urls?.[0] || data.url;
      
      if (!imageUrl) {
        throw new Error("لم يتم إرجاع رابط الصورة");
      }
      
      setFormData(prev => ({ ...prev, imageUrl }));
      alert("✅ تم رفع الصورة بنجاح!");
    } catch (error: any) {
      console.error("Image upload error:", error);
      alert(`❌ فشل رفع الصورة: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/marketing/facebook/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create campaign");
      }

      const data = await response.json();
      alert(`✅ ${translations.createSuccess}\nCampaign ID: ${data.facebook.campaignId}`);
      setIsDialogOpen(false);
      
      // Refresh page to show updated data
      window.location.reload();
    } catch (error: any) {
      console.error("Create campaign error:", error);
      alert(`❌ ${translations.error}: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/marketing/facebook/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ campaignId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to sync");
      }

      const data = await response.json();
      alert(`✅ ${translations.syncSuccess}\n` +
        `الظهور: ${data.insights.impressions}\n` +
        `النقرات: ${data.insights.clicks}\n` +
        `المصروف: ${data.insights.spent} ج`
      );
      
      if (onSync) {
        onSync();
      }
      
      // Refresh page to show updated data
      window.location.reload();
    } catch (error: any) {
      console.error("Sync error:", error);
      alert(`❌ ${translations.error}: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {facebookCampaignId ? (
        <>
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {translations.linkedToFacebook}
          </Badge>
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            size="sm"
            variant="outline"
            className="border-blue-500/50 hover:bg-blue-500/10"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                {translations.syncing}
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 ml-2" />
                {translations.syncData}
              </>
            )}
          </Button>
        </>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            >
              <Facebook className="w-4 h-4 ml-2" />
              {translations.linkToFacebook}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-gray-100 w-[95vw] sm:w-[90vw] md:max-w-2xl lg:max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Facebook className="w-6 h-6 text-blue-400" />
                {translations.createCampaign}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* Info Banner */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-sm text-blue-200">
                  💡 <strong>البيانات محملة من حملتك:</strong> "{campaignName}"
                  <br />
                  يمكنك تعديلها قبل إنشاء الحملة على فيسبوك
                </p>
              </div>

              <div>
                <Label htmlFor="targetUrl" className="text-gray-300">
                  {translations.targetUrl}
                </Label>
                <Input
                  id="targetUrl"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                  placeholder="https://yourstore.com/products"
                />
              </div>

              <div>
                <Label htmlFor="adTitle" className="text-gray-300">
                  {translations.adTitle}
                </Label>
                <Input
                  id="adTitle"
                  value={formData.adTitle}
                  onChange={(e) => setFormData({ ...formData, adTitle: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                  placeholder="عنوان جذاب للإعلان"
                />
              </div>

              <div>
                <Label htmlFor="adMessage" className="text-gray-300">
                  {translations.adMessage}
                </Label>
                <Textarea
                  id="adMessage"
                  value={formData.adMessage}
                  onChange={(e) => setFormData({ ...formData, adMessage: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                  rows={3}
                  placeholder="نص الإعلان الذي سيظهر على فيسبوك"
                />
              </div>

              <div>
                <Label htmlFor="adDescription" className="text-gray-300">
                  {translations.adDescription}
                </Label>
                <Textarea
                  id="adDescription"
                  value={formData.adDescription}
                  onChange={(e) => setFormData({ ...formData, adDescription: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                  rows={2}
                  placeholder="وصف إضافي للإعلان"
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <Label className="text-gray-300">
                  صورة الإعلان
                </Label>
                <div className="space-y-3">
                  {/* Upload Button */}
                  <div className="flex gap-2">
                    <label htmlFor="image-upload" className="flex-1">
                      <div className="cursor-pointer bg-gray-800 hover:bg-gray-750 border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-lg p-4 text-center transition-all">
                        {uploadingImage ? (
                          <div className="flex items-center justify-center gap-2 text-blue-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>جاري رفع الصورة...</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-3xl">📸</div>
                            <div className="text-sm text-gray-300">
                              اضغط لرفع صورة من جهازك
                            </div>
                            <div className="text-xs text-gray-500">
                              PNG, JPG, GIF (حد أقصى 5MB)
                            </div>
                          </div>
                        )}
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>

                  {/* Image Preview */}
                  {formData.imageUrl && (
                    <div className="relative">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-700"
                      />
                      <button
                        onClick={() => setFormData({ ...formData, imageUrl: "" })}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                        type="button"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Or Manual URL */}
                  <div className="text-center text-xs text-gray-500">
                    أو
                  </div>
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-gray-100 text-sm"
                    placeholder="أو ضع رابط الصورة هنا مباشرة"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                      {translations.creating}
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-4 h-4 ml-2" />
                      {translations.create}
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  variant="outline"
                  className="border-gray-700 hover:bg-gray-800"
                >
                  {translations.cancel}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
