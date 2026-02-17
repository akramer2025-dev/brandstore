"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Gavel, Timer, TrendingUp, Users, Eye, ShoppingCart, 
  Loader2, AlertCircle, CheckCircle2, Calendar, Tag
} from "lucide-react";
import { useSession } from "next-auth/react";

export const dynamic = 'force-dynamic';

interface Bid {
  id: string;
  amount: number;
  createdAt: string;
  bidder: {
    id: string;
    name: string | null;
  };
}

interface Auction {
  id: string;
  title: string;
  titleAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  startingPrice: number;
  currentPrice: number;
  reservePrice: number | null;
  buyNowPrice: number | null;
  minimumBidIncrement: number;
  startDate: string;
  endDate: string;
  status: string;
  featured: boolean;
  images: string[];
  viewCount: number;
  bidCount: number;
  termsAndConditions: string | null;
  product: {
    id: string;
    name: string;
    nameAr: string | null;
    description: string | null;
    descriptionAr: string | null;
    images: string | null;
    category: {
      name: string;
      nameAr: string | null;
    };
  };
  winner: {
    id: string;
    name: string | null;
  } | null;
  bids: Bid[];
  _count: {
    bids: number;
  };
}

// Helper function to safely parse product images from various formats
function parseProductImages(images: any): string[] {
  if (!images) return [];
  
  try {
    // Already an array
    if (Array.isArray(images)) return images;
    
    if (typeof images === 'string') {
      // Comma-separated URLs (e.g., "url1,url2,url3")
      if (images.includes(',') && images.includes('http')) {
        return images.split(',').map(url => url.trim()).filter(Boolean);
      }
      
      // Single URL
      if (images.startsWith('http')) return [images];
      
      // JSON string
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    }
    
    return [];
  } catch (error) {
    // Fallback: if it's a string that looks like a URL, use it
    if (typeof images === 'string' && images.startsWith('http')) {
      return [images];
    }
    return [];
  }
}

export default function AuctionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const auctionId = params?.id as string;

  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [bidding, setBidding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (auctionId) {
      fetchAuction();
    }
  }, [auctionId]);

  // Update timer every second
  useEffect(() => {
    if (!auction) return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(auction.endDate);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("انتهى المزاد");
        setIsExpired(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days} يوم ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes} دقيقة ${seconds} ثانية`);
      } else {
        setTimeRemaining(`${seconds} ثانية`);
      }

      setIsExpired(false);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [auction]);

  const fetchAuction = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/auctions/${auctionId}`);
      const data = await response.json();

      if (data.success) {
        setAuction(data.auction);
        
        // Set default bid amount to minimum required
        const currentHighest = data.auction.currentPrice;
        const minimumRequired = currentHighest + data.auction.minimumBidIncrement;
        setBidAmount(minimumRequired.toString());

        // Set first image
        const firstImage = data.auction.images[0] || 
          (data.auction.product.images ? JSON.parse(data.auction.product.images)[0] : null);
        setSelectedImage(firstImage || "");
      } else {
        setError(data.error || "فشل في تحميل المزاد");
      }
    } catch (error) {
      console.error('Error fetching auction:', error);
      setError("حدث خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async () => {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    setError(null);
    setSuccess(null);
    setBidding(true);

    try {
      const amount = parseFloat(bidAmount);
      
      if (isNaN(amount) || amount <= 0) {
        setError("الرجاء إدخال مبلغ صحيح");
        setBidding(false);
        return;
      }

      const response = await fetch(`/api/auctions/${auctionId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("تم تقديم المزايدة بنجاح! 🎉");
        // Refresh auction data
        await fetchAuction();
      } else {
        setError(data.error || "فشل في تقديم المزايدة");
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      setError("حدث خطأ في تقديم المزايدة");
    } finally {
      setBidding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (!auction?.buyNowPrice) return;

    // Here you would implement buy now logic
    // For now, just place a bid at buy now price
    setBidAmount(auction.buyNowPrice.toString());
    await handlePlaceBid();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <Loader2 className="w-16 h-16 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">المزاد غير موجود</h2>
          <p className="text-gray-600 mb-4">{error || "لم يتم العثور على المزاد المطلوب"}</p>
          <Link href="/auctions">
            <Button>العودة للمزادات</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const allImages = [
    ...auction.images,
    ...parseProductImages(auction.product.images)
  ].filter(Boolean);

  const canBid = auction.status === "ACTIVE" && !isExpired && session;
  const isWinning = auction.bids.length > 0 && 
    auction.bids[0].bidder.id === session?.user?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white py-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <BackButton fallbackUrl="/auctions" label="العودة للمزادات" className="mb-4" />
          <div className="flex items-center gap-4">
            <Gavel className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold drop-shadow-lg">
                {auction.titleAr || auction.title}
              </h1>
              <p className="text-purple-100 mt-1">
                {auction.product.category.nameAr || auction.product.category.name}
              </p>
            </div>
            {auction.featured && (
              <Badge className="bg-yellow-500 text-white border-0 text-lg px-4 py-2">
                ⭐ مميز
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <Card className="overflow-hidden shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <div className="relative h-96 bg-gradient-to-br from-purple-100 to-pink-100">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={auction.titleAr || auction.title}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Gavel className="w-32 h-32 text-purple-300" />
                  </div>
                )}
              </div>
              
              {/* Image Thumbnails */}
              {allImages.length > 1 && (
                <div className="p-4 bg-white flex gap-2 overflow-x-auto">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === img ? "border-purple-600 shadow-lg" : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`صورة ${index + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Description */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>الوصف</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {auction.descriptionAr || auction.description || auction.product.descriptionAr || auction.product.description || "لا يوجد وصف"}
                </p>
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            {auction.termsAndConditions && (
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>الشروط والأحكام</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {auction.termsAndConditions}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Bid History */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  سجل المزايدات ({auction._count.bids})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auction.bids.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا توجد مزايدات حتى الآن. كن أول من يزايد!</p>
                ) : (
                  <div className="space-y-3">
                    {auction.bids.map((bid, index) => (
                      <div
                        key={bid.id}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          index === 0 ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400" : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {index === 0 && <Badge className="bg-yellow-500 text-white border-0">🏆 الأعلى</Badge>}
                          <div>
                            <p className="font-semibold">{bid.bidder.name || "مزايد"}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(bid.createdAt).toLocaleString('ar-EG')}
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-2xl font-bold text-purple-600">{bid.amount.toFixed(2)} ج.م</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Bidding Panel */}
          <div className="space-y-6">
            {/* Timer Card */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Timer className="w-8 h-8" />
                  <h3 className="text-xl font-bold">الوقت المتبقي</h3>
                </div>
                <div className={`text-3xl font-bold text-center py-4 px-6 rounded-lg ${
                  isExpired ? "bg-red-500" : "bg-white/20 backdrop-blur-sm"
                }`}>
                  {timeRemaining}
                </div>
                <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-sm">
                  <div>
                    <p className="text-purple-100">ينتهي في:</p>
                    <p className="font-semibold">{new Date(auction.endDate).toLocaleDateString('ar-EG')}</p>
                  </div>
                  <Calendar className="w-6 h-6 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            {/* Price Info */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">السعر الحالي</p>
                  <p className="text-4xl font-bold text-purple-600">{auction.currentPrice.toFixed(2)} ج.م</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600">السعر الابتدائي</p>
                    <p className="text-lg font-semibold text-gray-700">{auction.startingPrice.toFixed(2)} ج.م</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">الحد الأدنى للزيادة</p>
                    <p className="text-lg font-semibold text-gray-700">{auction.minimumBidIncrement.toFixed(2)} ج.م</p>
                  </div>
                </div>

                {auction.buyNowPrice && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">سعر الشراء الفوري</p>
                    <p className="text-2xl font-bold text-green-600">{auction.buyNowPrice.toFixed(2)} ج.م</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{auction._count.bids} مزايدة</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{auction.viewCount} مشاهدة</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            {error && (
              <div className="border-2 border-red-500 bg-red-50 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="text-green-800">{success}</p>
              </div>
            )}

            {isWinning && canBid && (
              <div className="border-2 border-yellow-500 bg-yellow-50 rounded-lg p-4 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-800 font-semibold">
                  🏆 أنت حالياً صاحب أعلى مزايدة!
                </p>
              </div>
            )}

            {/* Bidding Form */}
            {canBid ? (
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gavel className="w-5 h-5" />
                    ضع مزايدتك
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المبلغ (ج.م)
                    </label>
                    <Input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={auction.currentPrice + auction.minimumBidIncrement}
                      step={auction.minimumBidIncrement}
                      className="text-2xl font-bold text-center"
                      disabled={bidding}
                    />
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      الحد الأدنى: {(auction.currentPrice + auction.minimumBidIncrement).toFixed(2)} ج.م
                    </p>
                  </div>

                  <Button
                    onClick={handlePlaceBid}
                    disabled={bidding}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-6"
                  >
                    {bidding ? (
                      <>
                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                        جاري المزايدة...
                      </>
                    ) : (
                      <>
                        <Gavel className="w-5 h-5 ml-2" />
                        زايد الآن
                      </>
                    )}
                  </Button>

                  {auction.buyNowPrice && (
                    <Button
                      onClick={handleBuyNow}
                      disabled={bidding}
                      variant="outline"
                      className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 text-lg py-6"
                    >
                      <ShoppingCart className="w-5 h-5 ml-2" />
                      اشترِ الآن بـ {auction.buyNowPrice.toFixed(2)} ج.م
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : !session ? (
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-orange-500 mb-4" />
                  <p className="text-gray-700 mb-4">يجب تسجيل الدخول للمشاركة في المزايدة</p>
                  <Link href="/auth/login">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      تسجيل الدخول
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-700">
                    {isExpired ? "انتهى وقت المزاد" : "المزاد غير نشط حالياً"}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Status Badge */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">حالة المزاد:</span>
                  <Badge className={`
                    ${auction.status === 'ACTIVE' ? 'bg-green-500' : ''}
                    ${auction.status === 'SCHEDULED' ? 'bg-blue-500' : ''}
                    ${auction.status === 'ENDED' ? 'bg-gray-500' : ''}
                    ${auction.status === 'SOLD' ? 'bg-purple-500' : ''}
                    ${auction.status === 'CANCELLED' ? 'bg-red-500' : ''}
                    text-white border-0
                  `}>
                    {auction.status === 'ACTIVE' && 'نشط'}
                    {auction.status === 'SCHEDULED' && 'مجدول'}
                    {auction.status === 'ENDED' && 'انتهى'}
                    {auction.status === 'SOLD' && 'تم البيع'}
                    {auction.status === 'CANCELLED' && 'ملغي'}
                    {auction.status === 'NO_SALE' && 'لم يباع'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
