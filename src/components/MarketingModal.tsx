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
      <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-800 bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30 p-3 sm:p-6">
        <DialogHeader className="space-y-2 pb-3">
          <DialogTitle className="text-base sm:text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0" />
            <span className="leading-tight">محتوى تسويقي احترافي</span>
          </DialogTitle>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            منشورات جاهزة لمنصات التواصل الاجتماعي
          </p>
        </DialogHeader>

        {/* Product Info */}
        <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700 mb-3 sm:mb-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {productImage && (
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-purple-500/30">
                <Image
                  src={productImage}
                  alt={productName}
                  fill
                  sizes="(max-width: 640px) 48px, 56px"
                  className="object-contain"
                  priority={false}
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-bold text-base sm:text-lg truncate leading-tight mb-1">{productName}</h3>
              <p className="text-gray-400 text-sm sm:text-base">جاري توليد محتوى تسويقي احترافي...</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 sm:py-12">
            <Loader2 className="w-12 h-12 sm:w-14 sm:h-14 text-purple-500 animate-spin mb-4" />
            <p className="text-gray-300 text-base sm:text-lg font-semibold text-center px-4 leading-relaxed">جاري توليد المحتوى بالذكاء الاصطناعي...</p>
            <p className="text-gray-400 text-sm sm:text-base mt-3">قد يستغرق الأمر بضع ثوانٍ ⏳</p>
          </div>
        ) : content ? (
          <Tabs defaultValue="facebook" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1.5 bg-gray-800/50 h-auto p-1.5 rounded-xl">
              <TabsTrigger value="facebook" className="data-[state=active]:bg-blue-600 text-sm sm:text-base py-2.5 px-3 rounded-lg font-medium transition-all">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">فيسبوك</span>
              </TabsTrigger>
              <TabsTrigger value="instagram" className="data-[state=active]:bg-pink-600 text-sm sm:text-base py-2.5 px-3 rounded-lg font-medium transition-all">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">إنستجرام</span>
              </TabsTrigger>
              <TabsTrigger value="twitter" className="data-[state=active]:bg-sky-500 text-sm sm:text-base py-2.5 px-3 rounded-lg font-medium transition-all">
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">تويتر</span>
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="data-[state=active]:bg-green-600 text-sm sm:text-base py-2.5 px-3 rounded-lg font-medium transition-all">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">واتساب</span>
              </TabsTrigger>
            </TabsList>

            {/* Facebook Content */}
            <TabsContent value="facebook" className="space-y-3 sm:space-y-4 mt-3">
              <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700 overflow-hidden">
                <pre className="text-white whitespace-pre-wrap break-words font-sans text-sm sm:text-base leading-relaxed max-w-full">
                  {content.facebook}
                </pre>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={() => copyToClipboard(content.facebook, "فيسبوك")}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base h-11 sm:h-12 font-semibold rounded-xl"
                >
                  {copiedTab === "فيسبوك" ? (
                    <Check className="w-5 h-5 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  ) : (
                    <Copy className="w-5 h-5 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  )}
                  <span>نسخ النص</span>
                </Button>
                <Button
                  onClick={() => shareToFacebook()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base h-11 sm:h-12 font-semibold rounded-xl"
                >
                  <Share2 className="w-5 h-5 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  <span>مشاركة</span>
                </Button>
              </div>
            </TabsContent>

            {/* Instagram Content */}
            <TabsContent value="instagram" className="space-y-3 sm:space-y-4 mt-3">
              <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700 overflow-hidden">
                <pre className="text-white whitespace-pre-wrap break-words font-sans text-sm sm:text-base leading-relaxed max-w-full">
                  {content.instagram}
                </pre>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <Button
                  onClick={() => copyToClipboard(content.instagram, "إنستجرام")}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm sm:text-base h-11 sm:h-12 font-semibold rounded-xl"
                >
                  {copiedTab === "إنستجرام" ? (
                    <Check className="w-5 h-5 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  ) : (
                    <Copy className="w-5 h-5 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  )}
                  <span>نسخ النص</span>
                </Button>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 sm:p-4">
                <p className="text-yellow-400 text-sm sm:text-base flex items-start gap-2 leading-relaxed">
                  <Sparkles className="w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                  <span>ملاحظة: انسخ النص والصق في منشور إنستجرام مع صورة المنتج</span>
                </p>
              </div>
            </TabsContent>

            {/* Twitter Content */}
            <TabsContent value="twitter" className="space-y-3 sm:space-y-4 mt-3">
              <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700 overflow-hidden">
                <pre className="text-white whitespace-pre-wrap break-words font-sans text-sm sm:text-base leading-relaxed max-w-full">
                  {content.twitter}
                </pre>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={() => copyToClipboard(content.twitter, "تويتر")}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-sm sm:text-base h-11 sm:h-12 font-semibold rounded-xl"
                >
                  {copiedTab === "تويتر" ? (
                    <Check className="w-5 h-5 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  ) : (
                    <Copy className="w-5 h-5 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  )}
                  <span>نسخ النص</span>
                </Button>
                <Button
                  onClick={() => shareToTwitter(content.twitter)}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-sm sm:text-base h-11 sm:h-12 font-semibold rounded-xl"
                >
                  <Share2 className="w-5 h-5 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  <span>مشاركة</span>
                </Button>
              </div>
            </TabsContent>

            {/* WhatsApp Content */}
            <TabsContent value="whatsapp" className="space-y-3 sm:space-y-4 mt-3">
              <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700 overflow-hidden">
                <pre className="text-white whitespace-pre-wrap break-words font-sans text-sm sm:text-base leading-relaxed max-w-full">
                  {content.whatsapp}
                </pre>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={() => copyToClipboard(content.whatsapp, "واتساب")}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-sm sm:text-base h-11 sm:h-12 font-semibold rounded-xl"
                >
                  {copiedTab === "واتساب" ? (
                    <Check className="w-5 h-5 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  ) : (
                    <Copy className="w-5 h-5 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  )}
                  <span>نسخ النص</span>
                </Button>
                <Button
                  onClick={() => shareToWhatsApp(content.whatsapp)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-sm sm:text-base h-11 sm:h-12 font-semibold rounded-xl"
                >
                  <Share2 className="w-5 h-5 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  <span>مشاركة</span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-10 sm:py-12">
            <p className="text-gray-300 text-base sm:text-lg font-semibold mb-4">لم يتم توليد المحتوى بعد</p>
            <Button
              onClick={generateContent}
              className="mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-sm sm:text-base h-11 sm:h-12 px-6 font-semibold rounded-xl"
            >
              <Sparkles className="w-5 h-5 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              <span>توليد المحتوى</span>
            </Button>
          </div>
        )}

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 sm:p-4 mt-3 sm:mt-4">
          <p className="text-purple-300 text-sm sm:text-base flex items-start gap-2 leading-relaxed">
            <Sparkles className="w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
            <span>تم توليد هذا المحتوى بالذكاء الاصطناعي بشكل احترافي. يمكنك تعديله حسب رغبتك قبل النشر.</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
