"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Settings,
  User,
  Lock,
  Building,
  Save,
  Eye,
  EyeOff,
  Loader2,
  Check,
  Store,
  Camera,
  ImageIcon,
  X,
  Palette,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// دالة رفع الصور عبر API الآمن
async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("files", file);
  formData.append("folder", "vendor-stores"); // Specify folder for vendor store images

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to upload image");
  }

  const data = await response.json();
  
  // API ترجع array من URLs، نأخذ أول واحد
  if (data.urls && data.urls.length > 0) {
    return data.urls[0];
  }
  
  throw new Error("No image URL returned from upload");
}

export default function VendorSettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Store settings
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [isSavingStore, setIsSavingStore] = useState(false);

  // Store page customization
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [storeBio, setStoreBio] = useState("");
  const [storeBioAr, setStoreBioAr] = useState("");
  const [storeThemeColor, setStoreThemeColor] = useState("#9333ea");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isSavingCustomization, setIsSavingCustomization] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "store" | "customize">("profile");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login");
      return;
    }
    if (session.user.role !== "ADMIN" && session.user.role !== "VENDOR") {
      router.push("/");
      return;
    }

    // تحميل البيانات الأولية فقط عند أول تحميل
    // بعد ذلك نعتمد على API لتحديث البيانات
  }, [status, session, router]);

  // Read tab from URL and set active tab
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "customize") {
      setActiveTab("customize");
    } else if (tab === "password") {
      setActiveTab("password");
    } else if (tab === "store") {
      setActiveTab("store");
    } else if (tab === "profile") {
      setActiveTab("profile");
    }
  }, [searchParams]);

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const data = await res.json();
          // تحميل كل البيانات من API
          if (data.name) setName(data.name);
          if (data.email) setEmail(data.email);
          if (data.phone) setPhone(data.phone);
          if (data.storeName) setStoreName(data.storeName);
          if (data.storeDescription) setStoreDescription(data.storeDescription);
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    };
    
    if (session?.user) {
      fetchUserDetails();
    }
  }, [session?.user?.id]); // نعتمد على ID فقط، مش كل session

  // Fetch store customization settings
  useEffect(() => {
    const fetchCustomizationSettings = async () => {
      try {
        const res = await fetch("/api/vendor/store-settings");
        if (res.ok) {
          const data = await res.json();
          setCoverImage(data.coverImage || null);
          setLogo(data.logo || null);
          setStoreBio(data.storeBio || "");
          setStoreBioAr(data.storeBioAr || "");
          setStoreThemeColor(data.storeThemeColor || "#9333ea");
          setFacebookUrl(data.facebookUrl || "");
          setInstagramUrl(data.instagramUrl || "");
          setTwitterUrl(data.twitterUrl || "");
          setYoutubeUrl(data.youtubeUrl || "");
        }
      } catch (error) {
        console.error("Failed to fetch customization settings:", error);
      }
    };
    
    if (session?.user?.role === "VENDOR") {
      fetchCustomizationSettings();
    }
  }, [session]);

  const handleImageUpload = async (file: File, type: "cover" | "logo") => {
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
      
      // حفظ الصورة فوراً في قاعدة البيانات
      const updateData = type === "cover" 
        ? { coverImage: imageUrl }
        : { logo: imageUrl };

      const res = await fetch("/api/vendor/store-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coverImage: type === "cover" ? imageUrl : coverImage,
          logo: type === "logo" ? imageUrl : logo,
          storeBio,
          storeBioAr,
          storeThemeColor,
          facebookUrl,
          instagramUrl,
          twitterUrl,
          youtubeUrl,
        }),
      });

      if (!res.ok) {
        throw new Error(`فشل في حفظ ${type === "cover" ? "صورة الغلاف" : "الشعار"}`);
      }
      
      if (type === "cover") {
        setCoverImage(imageUrl);
      } else {
        setLogo(imageUrl);
      }
      
      toast.success(`تم رفع وحفظ ${type === "cover" ? "صورة الغلاف" : "الشعار"} بنجاح ✅`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "فشل في تحديث الملف الشخصي");
      }

      const updatedData = await res.json();
      
      // تحديث البيانات المحلية من الـ response
      setName(updatedData.name || "");
      setEmail(updatedData.email || "");
      setPhone(updatedData.phone || "");

      // تحديث الـ session
      await update({ name: updatedData.name, email: updatedData.email });
      
      toast.success("تم تحديث الملف الشخصي بنجاح");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("كلمة المرور الجديدة غير متطابقة");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setIsSavingPassword(true);

    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "فشل في تغيير كلمة المرور");
      }

      toast.success("تم تغيير كلمة المرور بنجاح");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStore(true);

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, storeDescription }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "فشل في تحديث إعدادات المتجر");
      }

      toast.success("تم تحديث إعدادات المتجر بنجاح");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    } finally {
      setIsSavingStore(false);
    }
  };

  const handleRemoveImage = async (type: "cover" | "logo") => {
    try {
      const res = await fetch("/api/vendor/store-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coverImage: type === "cover" ? null : coverImage,
          logo: type === "logo" ? null : logo,
          storeBio,
          storeBioAr,
          storeThemeColor,
          facebookUrl,
          instagramUrl,
          twitterUrl,
          youtubeUrl,
        }),
      });

      if (!res.ok) {
        throw new Error("فشل في إزالة الصورة");
      }

      if (type === "cover") {
        setCoverImage(null);
      } else {
        setLogo(null);
      }

      toast.success(`تم إزالة ${type === "cover" ? "صورة الغلاف" : "الشعار"} بنجاح`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ");
    }
  };

  const handleSaveCustomization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCustomization(true);

    try {
      const res = await fetch("/api/vendor/store-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coverImage,
          logo,
          storeBio,
          storeBioAr,
          storeThemeColor,
          facebookUrl,
          instagramUrl,
          twitterUrl,
          youtubeUrl,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "فشل في حفظ إعدادات التخصيص");
      }

      toast.success("تم حفظ إعدادات التخصيص بنجاح");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    } finally {
      setIsSavingCustomization(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tabs = [
    { id: "profile" as const, label: "الملف الشخصي", icon: User },
    { id: "password" as const, label: "كلمة المرور", icon: Lock },
    { id: "store" as const, label: "المتجر", icon: Building },
    { id: "customize" as const, label: "تخصيص الصفحة", icon: Store },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800" dir="rtl">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackUrl="/vendor/dashboard" />
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-slate-500 to-slate-600 rounded-lg text-white">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">الإعدادات</h1>
                <p className="text-sm text-muted-foreground">إدارة حسابك ومتجرك</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg"
                    : "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">الملف الشخصي</h2>
                <p className="text-sm text-muted-foreground">تحديث معلوماتك الشخصية</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">الاسم</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="أدخل اسمك"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="أدخل بريدك الإلكتروني"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="أدخل رقم هاتفك"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                حفظ التغييرات
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <Lock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">تغيير كلمة المرور</h2>
                <p className="text-sm text-muted-foreground">تحديث كلمة المرور الخاصة بك</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">كلمة المرور الحالية</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all pl-12"
                    placeholder="أدخل كلمة المرور الحالية"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all pl-12"
                    placeholder="أدخل كلمة المرور الجديدة"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  dir="ltr"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">كلمة المرور غير متطابقة</p>
                )}
                {confirmPassword && newPassword === confirmPassword && confirmPassword.length >= 6 && (
                  <p className="text-green-500 text-sm mt-1 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    كلمة المرور متطابقة
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSavingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
              >
                {isSavingPassword ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
                تغيير كلمة المرور
              </button>
            </form>
          </div>
        )}

        {/* Store Tab */}
        {activeTab === "store" && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">إعدادات المتجر</h2>
                <p className="text-sm text-muted-foreground">تخصيص متجرك</p>
              </div>
            </div>

            <form onSubmit={handleSaveStore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">اسم المتجر</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="أدخل اسم متجرك"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">وصف المتجر</label>
                <textarea
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  placeholder="أدخل وصف متجرك"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingStore}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
              >
                {isSavingStore ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                حفظ الإعدادات
              </button>
            </form>
          </div>
        )}

        {/* Customize Tab - صفحة المتجر */}
        {activeTab === "customize" && (
          <div className="space-y-6">
            {/* Cover Image */}
            <Card className="overflow-hidden border-2 border-purple-200">
              <CardContent className="p-0">
                <div className="relative h-64 md:h-80 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 group">
                  {coverImage ? (
                    <>
                      <Image
                        src={coverImage}
                        alt="Cover"
                        fill
                        className="object-cover"
                      />
                      {/* Hover Overlay - يظهر عند التحويم */}
                      <label className="absolute inset-0 cursor-pointer">
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                            {uploadingCover ? (
                              <div className="bg-white/95 backdrop-blur-sm px-8 py-6 rounded-2xl shadow-2xl">
                                <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-3" />
                                <p className="text-xl font-bold text-gray-900">جاري رفع الغلاف...</p>
                                <p className="text-sm text-gray-600 mt-1">الرجاء الانتظار</p>
                              </div>
                            ) : (
                              <div className="bg-white/95 backdrop-blur-sm px-8 py-6 rounded-2xl shadow-2xl">
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl mx-auto mb-3">
                                  <Camera className="w-10 h-10 text-white" />
                                </div>
                                <p className="text-xl font-bold text-gray-900 mb-1">تغيير صورة الغلاف</p>
                                <p className="text-sm text-gray-600">اضغط لاختيار صورة جديدة</p>
                                <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP - حتى 5 ميجا</p>
                              </div>
                            )}
                          </div>
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
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <ImageIcon className="w-20 h-20 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-semibold">صورة الغلاف</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Button - يظهر في المنتصف إذا لم تكن هناك صورة */}
                  {!coverImage && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <label className="cursor-pointer group">
                        <div className="relative">
                          {/* الخلفية مع التأثير */}
                          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl group-hover:scale-105 transition-all duration-300"></div>
                          
                          {/* المحتوى */}
                          <div className="relative px-8 py-4 flex flex-col items-center gap-3">
                            {uploadingCover ? (
                              <>
                                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                                <span className="text-lg font-bold text-gray-900">جاري رفع الغلاف...</span>
                                <span className="text-sm text-gray-600">الرجاء الانتظار</span>
                              </>
                            ) : (
                              <>
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                                  <Camera className="w-10 h-10 text-white" />
                                </div>
                                <div className="text-center">
                                  <p className="text-xl font-bold text-gray-900 mb-1">
                                    إضافة صورة الغلاف
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    اضغط هنا لاختيار صورة (JPG, PNG, WEBP)
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    الحد الأقصى: 5 ميجابايت
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
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
                  )}

                  {/* Remove Button */}
                  {coverImage && (
                    <button
                      onClick={() => handleRemoveImage("cover")}
                      className="absolute bottom-4 left-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-lg transition-all"
                      title="إزالة صورة الغلاف"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Logo Section */}
                <div className="relative -mt-16 px-6 pb-6">
                  <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
                    {/* Logo */}
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-xl overflow-hidden relative">
                        {logo ? (
                          <>
                            <Image
                              src={logo}
                              alt="Logo"
                              width={128}
                              height={128}
                              className="object-cover w-full h-full"
                            />
                            {/* Hover indicator - للإشارة أنه يمكن التغيير */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                                <Camera className="w-8 h-8 text-white drop-shadow-lg" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                            <ImageIcon className="w-16 h-16 text-purple-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Upload Logo Button */}
                      <label className="absolute bottom-0 right-0 cursor-pointer group/btn">
                        <div className="bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-full shadow-lg transition-all group-hover/btn:scale-110 group-hover/btn:shadow-xl">
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

                      {/* Remove Logo Button */}
                      {logo && (
                        <button
                          onClick={() => handleRemoveImage("logo")}
                          className="absolute bottom-0 left-0 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                          title="إزالة الشعار"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
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
            <Card className="border-2 border-purple-200">
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
                    value={storeBioAr}
                    onChange={(e) => setStoreBioAr(e.target.value)}
                    placeholder="اكتب نبذة مختصرة عن متجرك..."
                    rows={4}
                    className="resize-none"
                    maxLength={500}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {storeBioAr.length} / 500 حرف
                  </p>
                </div>

                <div>
                  <Label>نبذة بالإنجليزية (اختياري)</Label>
                  <Textarea
                    value={storeBio}
                    onChange={(e) => setStoreBio(e.target.value)}
                    placeholder="Brief description about your store..."
                    rows={4}
                    className="resize-none"
                    maxLength={500}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Theme Color */}
            <Card className="border-2 border-purple-200">
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
                    value={storeThemeColor}
                    onChange={(e) => setStoreThemeColor(e.target.value)}
                    className="w-20 h-20 rounded-lg cursor-pointer border-2 border-gray-300"
                  />
                  <div className="flex-1">
                    <Label>اختر لون مخصص لصفحة متجرك</Label>
                    <Input
                      type="text"
                      value={storeThemeColor}
                      onChange={(e) => setStoreThemeColor(e.target.value)}
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
            <Card className="border-2 border-purple-200">
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
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
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
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
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
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
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
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/@yourchannel"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs mt-0.5">
                  ℹ
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">📌 ملاحظة هامة:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>الصور (الغلاف والشعار) تُحفظ تلقائياً عند رفعها ✅</li>
                    <li>النبذة والروابط تحتاج للضغط على "حفظ إعدادات التخصيص" أدناه 👇</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <form onSubmit={handleSaveCustomization}>
              <Button
                type="submit"
                disabled={isSavingCustomization}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl"
              >
                {isSavingCustomization ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 ml-2" />
                    حفظ النبذة والروابط
                  </>
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
