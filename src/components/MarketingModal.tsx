"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Copy, 
  Check, 
  Facebook, 
  Instagram, 
  Twitter, 
  MessageCircle,
  Share2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface MarketingModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImage?: string;
}

interface MarketingContent {
  general: string;
  facebook: string;
  instagram: string;
  twitter: string;
  whatsapp: string;
}

interface ProductData {
  id: string;
  name: string;
  price: number;
  url: string;
  image: string | null;
}

export default function MarketingModal({
  open,
  onClose,
  productId,
  productName,
  productImage,
}: MarketingModalProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<MarketingContent | null>(null);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const generateContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketing/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'خطأ غير معروف' }));
        
        if (res.status === 401) {
          toast.error("⚠️ يجب تسجيل الدخول أولاً للوصول لهذه الميزة");
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 2000);
        } else {
          toast.error(errorData.error || "فشل توليد المحتوى التسويقي");
        }
        throw new Error(errorData.error || "فشل توليد المحتوى");
      }

      const data = await res.json();
      setContent(data.content);
      setProductData(data.product);
      toast.success("✨ تم توليد المحتوى التسويقي بنجاح!");
    } catch (error) {
      console.error("Error generating content:", error);
      if (error instanceof Error && !error.message.includes('401')) {
        toast.error("⚠️ حدث خطأ في توليد المحتوى. يرجى المحاولة مرة أخرى");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTab(platform);
      toast.success(`📋 تم نسخ محتوى ${platform}`);
      setTimeout(() => setCopiedTab(null), 2000);
    } catch (error) {
      toast.error("فشل النسخ");
    }
  };

  const shareToFacebook = () => {
    if (!productData?.url) {
      toast.error("رابط المنتج غير متوفر");
      return;
    }
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productData.url)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = (text: string) => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = (text: string) => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // توليد المحتوى تلقائياً عند فتح Modal
  useEffect(() => {
    if (open && !content && !loading) {
      generateContent();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[92vw] sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30 p-2 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400" />
            محتوى تسويقي احترافي
          </DialogTitle>
          <p className="text-gray-400 text-xs sm:text-sm">
            منشورات جاهزة لمنصات التواصل الاجتماعي
          </p>
        </DialogHeader>

        {/* Product Info */}
        <div className="bg-gray-800/50 rounded-lg p-2 sm:p-4 border border-gray-700 mb-2 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-4">
            {productImage && (
              <div className="relative w-10 h-10 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={productImage}
                  alt={productName}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-semibold text-sm sm:text-base truncate">{productName}</h3>
              <p className="text-gray-400 text-xs sm:text-sm">جاري توليد محتوى تسويقي احترافي...</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500 animate-spin mb-4" />
            <p className="text-gray-400 text-sm sm:text-base text-center px-4">جاري توليد المحتوى بالذكاء الاصطناعي...</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">قد يستغرق الأمر بضع ثوانٍ ⏳</p>
          </div>
        ) : content ? (
          <Tabs defaultValue="facebook" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 bg-gray-800/50 h-auto p-1">
              <TabsTrigger value="facebook" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm py-2 px-2">
                <Facebook className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">فيسبوك</span>
              </TabsTrigger>
              <TabsTrigger value="instagram" className="data-[state=active]:bg-pink-600 text-xs sm:text-sm py-2 px-2">
                <Instagram className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">إنستجرام</span>
              </TabsTrigger>
              <TabsTrigger value="twitter" className="data-[state=active]:bg-sky-500 text-xs sm:text-sm py-2 px-2">
                <Twitter className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">تويتر</span>
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="data-[state=active]:bg-green-600 text-xs sm:text-sm py-2 px-2">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">واتساب</span>
              </TabsTrigger>
            </TabsList>

            {/* Facebook Content */}
            <TabsContent value="facebook" className="space-y-2 sm:space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-2 sm:p-4 border border-gray-700 overflow-hidden">
                <pre className="text-white whitespace-pre-wrap break-words font-sans text-xs sm:text-sm leading-relaxed overflow-x-auto max-w-full">
                  {content.facebook}
                </pre>
              </div>
              <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                <Button
                  onClick={() => copyToClipboard(content.facebook, "فيسبوك")}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-8 sm:h-10">
                >
                  {copiedTab === "فيسبوك" ? (
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  ) : (
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  )}
                  <span className="mr-1 sm:mr-0">نسخ النص</span>
                </Button>
                <Button
                  onClick={() => shareToFacebook()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-8 sm:h-10">
                >
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="mr-1 sm:mr-0">مشاركة على فيسبوك</span>
                </Button>
              </div>
            </TabsContent>

            {/* Instagram Content */}
            <TabsContent value="instagram" className="space-y-2 sm:space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-2 sm:p-4 border border-gray-700 overflow-hidden">
                <pre className="text-white whitespace-pre-wrap break-words font-sans text-xs sm:text-sm leading-relaxed overflow-x-auto max-w-full">
                  {content.instagram}
                </pre>
              </div>
              <div className="flex gap-1.5 sm:gap-2">
                <Button
                  onClick={() => copyToClipboard(content.instagram, "إنستجرام")}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xs sm:text-sm h-8 sm:h-10">
                >
                  {copiedTab === "إنستجرام" ? (
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  ) : (
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  )}
                  <span className="mr-1 sm:mr-0">نسخ النص</span>
                </Button>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 sm:p-3">
                <p className="text-yellow-400 text-xs sm:text-sm flex items-center gap-2">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>ملاحظة: انسخ النص والصق في منشور إنستجرام مع صورة المنتج</span>
                </p>
              </div>
            </TabsContent>

            {/* Twitter Content */}
            <TabsContent value="twitter" className="space-y-2 sm:space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-2 sm:p-4 border border-gray-700 overflow-hidden">
                <pre className="text-white whitespace-pre-wrap break-words font-sans text-xs sm:text-sm leading-relaxed overflow-x-auto max-w-full">
                  {content.twitter}
                </pre>
              </div>
              <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                <Button
                  onClick={() => copyToClipboard(content.twitter, "تويتر")}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-xs sm:text-sm h-8 sm:h-10">
                >
                  {copiedTab === "تويتر" ? (
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  ) : (
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  )}
                  <span className="mr-1 sm:mr-0">نسخ النص</span>
                </Button>
                <Button
                  onClick={() => shareToTwitter(content.twitter)}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-xs sm:text-sm h-8 sm:h-10">
                >
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="mr-1 sm:mr-0">مشاركة على تويتر</span>
                </Button>
              </div>
            </TabsContent>

            {/* WhatsApp Content */}
            <TabsContent value="whatsapp" className="space-y-2 sm:space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-2 sm:p-4 border border-gray-700 overflow-hidden">
                <pre className="text-white whitespace-pre-wrap break-words font-sans text-xs sm:text-sm leading-relaxed overflow-x-auto max-w-full">
                  {content.whatsapp}
                </pre>
              </div>
              <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                <Button
                  onClick={() => copyToClipboard(content.whatsapp, "واتساب")}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-xs sm:text-sm h-8 sm:h-10">
                >
                  {copiedTab === "واتساب" ? (
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  ) : (
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  )}
                  <span className="mr-1 sm:mr-0">نسخ النص</span>
                </Button>
                <Button
                  onClick={() => shareToWhatsApp(content.whatsapp)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-xs sm:text-sm h-8 sm:h-10">
                >
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="mr-1 sm:mr-0">مشاركة على واتساب</span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-400 text-sm sm:text-base">لم يتم توليد المحتوى بعد</p>
            <Button
              onClick={generateContent}
              className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-xs sm:text-sm h-8 sm:h-10">
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="mr-1 sm:mr-0">توليد المحتوى</span>
            </Button>
          </div>
        )}

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2 sm:p-4 mt-2 sm:mt-4">
          <p className="text-purple-300 text-xs sm:text-sm flex items-start gap-1.5 sm:gap-2">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
            <span>تم توليد هذا المحتوى بالذكاء الاصطناعي بشكل احترافي. يمكنك تعديله حسب رغبتك قبل النشر.</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
