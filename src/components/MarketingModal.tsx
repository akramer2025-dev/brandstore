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

export default function MarketingModal({
  open,
  onClose,
  productId,
  productName,
  productImage,
}: MarketingModalProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<MarketingContent | null>(null);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const generateContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketing/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) throw new Error("فشل توليد المحتوى");

      const data = await res.json();
      setContent(data.content);
      toast.success("✨ تم توليد المحتوى التسويقي بنجاح!");
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("فشل توليد المحتوى التسويقي");
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

  const shareToFacebook = (text: string) => {
    const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`;
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            محتوى تسويقي احترافي
          </DialogTitle>
          <p className="text-gray-400 text-sm">
            منشورات جاهزة لمنصات التواصل الاجتماعي
          </p>
        </DialogHeader>

        {/* Product Info */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 mb-4">
          <div className="flex items-center gap-4">
            {productImage && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                <Image
                  src={productImage}
                  alt={productName}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="text-white font-semibold">{productName}</h3>
              <p className="text-gray-400 text-sm">جاري توليد محتوى تسويقي احترافي...</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
            <p className="text-gray-400">جاري توليد المحتوى بالذكاء الاصطناعي...</p>
            <p className="text-gray-500 text-sm mt-2">قد يستغرق الأمر بضع ثوانٍ ⏳</p>
          </div>
        ) : content ? (
          <Tabs defaultValue="facebook" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
              <TabsTrigger value="facebook" className="data-[state=active]:bg-blue-600">
                <Facebook className="w-4 h-4 mr-2" />
                فيسبوك
              </TabsTrigger>
              <TabsTrigger value="instagram" className="data-[state=active]:bg-pink-600">
                <Instagram className="w-4 h-4 mr-2" />
                إنستجرام
              </TabsTrigger>
              <TabsTrigger value="twitter" className="data-[state=active]:bg-sky-500">
                <Twitter className="w-4 h-4 mr-2" />
                تويتر
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="data-[state=active]:bg-green-600">
                <MessageCircle className="w-4 h-4 mr-2" />
                واتساب
              </TabsTrigger>
            </TabsList>

            {/* Facebook Content */}
            <TabsContent value="facebook" className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <pre className="text-white whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {content.facebook}
                </pre>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => copyToClipboard(content.facebook, "فيسبوك")}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {copiedTab === "فيسبوك" ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  نسخ النص
                </Button>
                <Button
                  onClick={() => shareToFacebook(content.facebook)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  مشاركة على فيسبوك
                </Button>
              </div>
            </TabsContent>

            {/* Instagram Content */}
            <TabsContent value="instagram" className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <pre className="text-white whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {content.instagram}
                </pre>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => copyToClipboard(content.instagram, "إنستجرام")}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {copiedTab === "إنستجرام" ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  نسخ النص
                </Button>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-400 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  ملاحظة: انسخ النص والصق في منشور إنستجرام مع صورة المنتج
                </p>
              </div>
            </TabsContent>

            {/* Twitter Content */}
            <TabsContent value="twitter" className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <pre className="text-white whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {content.twitter}
                </pre>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => copyToClipboard(content.twitter, "تويتر")}
                  className="flex-1 bg-sky-500 hover:bg-sky-600"
                >
                  {copiedTab === "تويتر" ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  نسخ النص
                </Button>
                <Button
                  onClick={() => shareToTwitter(content.twitter)}
                  className="flex-1 bg-sky-500 hover:bg-sky-600"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  مشاركة على تويتر
                </Button>
              </div>
            </TabsContent>

            {/* WhatsApp Content */}
            <TabsContent value="whatsapp" className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <pre className="text-white whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {content.whatsapp}
                </pre>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => copyToClipboard(content.whatsapp, "واتساب")}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {copiedTab === "واتساب" ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  نسخ النص
                </Button>
                <Button
                  onClick={() => shareToWhatsApp(content.whatsapp)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  مشاركة على واتساب
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">لم يتم توليد المحتوى بعد</p>
            <Button
              onClick={generateContent}
              className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              توليد المحتوى
            </Button>
          </div>
        )}

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mt-4">
          <p className="text-purple-300 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            تم توليد هذا المحتوى بالذكاء الاصطناعي بشكل احترافي. يمكنك تعديله حسب رغبتك قبل النشر.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
