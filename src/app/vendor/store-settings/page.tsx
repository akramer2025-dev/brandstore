"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Camera, 
  Image as ImageIcon,
  Save,
  Loader2,
  X,
  Upload,
  Palette,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// دالة رفع الصور
async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "remostore");
  formData.append("folder", "vendor-stores");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dgrcwhfl5"}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  const data = await response.json();
  return data.secure_url;
}

interface VendorSettings {
  coverImage: string | null;
  logo: string | null;
  storeBio: string | null;
  storeBioAr: string | null;
  storeThemeColor: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  youtubeUrl: string | null;
}

export default function VendorStoreSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const [settings, setSettings] = useState<VendorSettings>({
    coverImage: null,
    logo: null,
    storeBio: null,
    storeBioAr: null,
    storeThemeColor: "#9333ea",
    facebookUrl: null,
    instagramUrl: null,
    twitterUrl: null,
    youtubeUrl: null,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "VENDOR") {
        router.push("/");
      } else {
        fetchSettings();
      }
    }
  }, [status, session, router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/vendor/store-settings");
      
      if (!response.ok) {
        throw new Error("فشل في جلب الإعدادات");
      }

      const data = await response.json();
      setSettings({
        coverImage: data.coverImage || null,
        logo: data.logo || null,
        storeBio: data.storeBio || "",
        storeBioAr: data.storeBioAr || "",
        storeThemeColor: data.storeThemeColor || "#9333ea",
        facebookUrl: data.facebookUrl || "",
        instagramUrl: data.instagramUrl || "",
        twitterUrl: data.twitterUrl || "",
        youtubeUrl: data.youtubeUrl || "",
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("حدث خطأ أثناء جلب الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (
    file: File, 
    type: "cover" | "logo"
  ) => {
    const setUploading = type === "cover" ? setUploadingCover : setUploadingLogo;
    
    try {
      setUploading(true);
      
      // التحقق من نوع الملف
      if (!file.type.startsWith("image/")) {
        toast.error("يرجى اختيار صورة");
        return;
      }

      // التحقق من حجم الملف (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجا");
        return;
      }

      const imageUrl = await uploadToCloudinary(file);
      
      setSettings(prev => ({
        ...prev,
        [type === "cover" ? "coverImage" : "logo"]: imageUrl,
      }));
      
      toast.success(`تم رفع ${type === "cover" ? "صورة الغلاف" : "الشعار"} بنجاح`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("حدث خطأ أثناء رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await fetch("/api/vendor/store-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("فشل في حفظ الإعدادات");
      }

      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text mb-2">
            إعدادات صفحة المتجر
          </h1>
          <p className="text-gray-600">
            خصص مظهر صفحة متجرك وحدّث معلوماتك
          </p>
        </div>

        {/* Cover Image */}
        <Card className="mb-6 overflow-hidden border-2 border-purple-200">
          <CardContent className="p-0">
            <div className="relative h-64 md:h-80 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500">
              {settings.coverImage ? (
                <Image
                  src={settings.coverImage}
                  alt="Cover"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <ImageIcon className="w-20 h-20 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">صورة الغلاف</p>
                  </div>
                </div>
              )}
              
              {/* Upload Button */}
              <div className="absolute bottom-4 right-4">
                <label className="cursor-pointer">
                  <div className="bg-white hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all">
                    {uploadingCover ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>جاري الرفع...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
                        <span>تغيير الغلاف</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, "cover");
                    }}
                    disabled={uploadingCover}
                  />
                </label>
              </div>

              {/* Remove Button */}
              {settings.coverImage && (
                <button
                  onClick={() => setSettings(prev => ({ ...prev, coverImage: null }))}
                  className="absolute bottom-4 left-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Logo Section */}
            <div className="relative -mt-16 px-6 pb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
                {/* Logo */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-xl overflow-hidden">
                    {settings.logo ? (
                      <Image
                        src={settings.logo}
                        alt="Logo"
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-purple-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Logo Button */}
                  <label className="absolute bottom-0 right-0 cursor-pointer">
                    <div className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-lg transition-all">
                      {uploadingLogo ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, "logo");
                      }}
                      disabled={uploadingLogo}
                    />
                  </label>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-right">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {session?.user?.name || "متجرك"}
                  </h2>
                  <p className="text-gray-600">
                    صمم صفحة متجرك بشكل احترافي
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio Section */}
        <Card className="mb-6 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-purple-600" />
              نبذة عن المتجر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>نبذة بالعربية</Label>
              <Textarea
                value={settings.storeBioAr || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, storeBioAr: e.target.value }))}
                placeholder="اكتب نبذة مختصرة عن متجرك..."
                rows={4}
                className="resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                {settings.storeBioAr?.length || 0} / 500 حرف
              </p>
            </div>

            <div>
              <Label>نبذة بالإنجليزية (اختياري)</Label>
              <Textarea
                value={settings.storeBio || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, storeBio: e.target.value }))}
                placeholder="Brief description about your store..."
                rows={4}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Theme Color */}
        <Card className="mb-6 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-600" />
              لون الثيم المخصص
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={settings.storeThemeColor || "#9333ea"}
                onChange={(e) => setSettings(prev => ({ ...prev, storeThemeColor: e.target.value }))}
                className="w-20 h-20 rounded-lg cursor-pointer border-2 border-gray-300"
              />
              <div className="flex-1">
                <Label>اختر لون مخصص لصفحة متجرك</Label>
                <Input
                  type="text"
                  value={settings.storeThemeColor || ""}
                  onChange={(e) => setSettings(prev => ({ ...prev, storeThemeColor: e.target.value }))}
                  placeholder="#9333ea"
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  سيتم استخدام هذا اللون في العناوين والأزرار
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="mb-6 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-600" />
              روابط التواصل الاجتماعي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-600" />
                فيسبوك
              </Label>
              <Input
                type="url"
                value={settings.facebookUrl || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, facebookUrl: e.target.value }))}
                placeholder="https://facebook.com/yourusername"
                className="mt-2"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-600" />
                إنستجرام
              </Label>
              <Input
                type="url"
                value={settings.instagramUrl || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, instagramUrl: e.target.value }))}
                placeholder="https://instagram.com/yourusername"
                className="mt-2"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Twitter className="w-4 h-4 text-blue-400" />
                تويتر / X
              </Label>
              <Input
                type="url"
                value={settings.twitterUrl || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, twitterUrl: e.target.value }))}
                placeholder="https://twitter.com/yourusername"
                className="mt-2"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-600" />
                يوتيوب
              </Label>
              <Input
                type="url"
                value={settings.youtubeUrl || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                placeholder="https://youtube.com/@yourchannel"
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="sticky bottom-4 z-10">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin ml-2" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 ml-2" />
                حفظ الإعدادات
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
