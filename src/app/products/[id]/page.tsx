"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  Package,
  ArrowRight,
  Minus,
  Plus,
  Loader2,
  Check,
  Star,
  User,
  MessageCircle,
  Facebook,
  Copy,
  X,
  Instagram,
  Store,
} from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  nameAr: string;
  descriptionAr: string;
  price: number;
  stock: number;
  images: string | null;
  categoryId: string;
  category: {
    id: string;
    nameAr: string;
  };
  vendor?: {
    id: string;
    storeNameAr: string;
    storeName: string;
    logo: string | null;
    rating: number;
  } | null;
  createdAt: string;
  reviews?: Review[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { addItem } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Wishlist toggle
  const handleToggleWishlist = async () => {
    if (!product) return;
    
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
      toast.success('تم إزالة المنتج من المفضلة');
    } else {
      await addToWishlist(product.id);
      toast.success('تم إضافة المنتج للمفضلة ❤️');
    }
  };

  // Share functions
  const getProductUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  };

  const getShareMessage = () => {
    if (!product) return '';
    return `🛍️ *${product.nameAr}*\n\n💰 السعر: ${product.price.toLocaleString()} جنيه\n\n📦 ${product.descriptionAr?.slice(0, 100)}...\n\n🔗 شاهد المنتج:\n${getProductUrl()}\n\n✨ تسوق الآن من ريمو ستور`;
  };

  const shareToWhatsApp = () => {
    const message = encodeURIComponent(getShareMessage());
    window.open(`https://wa.me/?text=${message}`, '_blank');
    setShowShareMenu(false);
    toast.success('جاري فتح الواتساب...');
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(getProductUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    setShowShareMenu(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getProductUrl());
      toast.success('تم نسخ الرابط بنجاح!');
      setShowShareMenu(false);
    } catch {
      toast.error('فشل نسخ الرابط');
    }
  };

  const shareNative = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.nameAr,
          text: `${product.nameAr} - ${product.price.toLocaleString()} جنيه`,
          url: getProductUrl(),
        });
        setShowShareMenu(false);
      } catch {
        // User cancelled or error
      }
    } else {
      setShowShareMenu(true);
    }
  };

  useEffect(() => {
    if (productId) {
      // Scroll to top when page loads
      window.scrollTo({ top: 0, behavior: 'smooth' });
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) throw new Error("فشل تحميل المنتج");
      const data = await res.json();
      setProduct(data);

      // Fetch related products from same category
      const relatedRes = await fetch(`/api/products?categoryId=${data.categoryId}`);
      const relatedData = await relatedRes.json();
      setRelatedProducts((relatedData.products || []).filter((p: Product) => p.id !== data.id).slice(0, 4));
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("فشل تحميل المنتج");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (quantity > product.stock) {
      toast.error(`الكمية المتاحة فقط ${product.stock}`);
      return;
    }

    addItem({
      id: product.id,
      name: product.nameAr,
      nameAr: product.nameAr,
      price: product.price,
      image: images[0],
    });

    toast.success("تمت الإضافة إلى السلة", {
      icon: <Check className="w-4 h-4" />,
    });
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800/80 border-teal-500/20 p-12 text-center">
          <p className="text-xl text-gray-400 mb-4">المنتج غير موجود</p>
          <Link href="/products">
            <Button className="bg-teal-600 hover:bg-teal-700">
              العودة للمنتجات
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Parse images from comma-separated string
  const images = product.images 
    ? product.images.split(',').map(img => img.trim()).filter(img => img)
    : ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900">
      {/* Background Effects - hidden on mobile */}
      <div className="hidden md:block fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-400 mb-4 sm:mb-8 overflow-x-auto">
          <Link href="/" className="hover:text-teal-400">الرئيسية</Link>
          <ArrowRight className="w-4 h-4 rotate-180" />
          <Link href="/products" className="hover:text-teal-400">المنتجات</Link>
          <ArrowRight className="w-4 h-4 rotate-180" />
          <Link href={`/products?category=${product.categoryId}`} className="hover:text-teal-400">
            {product.category.nameAr}
          </Link>
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span className="text-white">{product.nameAr}</span>
        </div>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-12 mb-8 sm:mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Card className="bg-gray-800/80 border-teal-500/20 overflow-hidden">
              <div className="aspect-square relative bg-gray-900">
                <Image
                  src={images[selectedImage] || '/placeholder.jpg'}
                  alt={product.nameAr}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.jpg';
                  }}
                />
                
                {/* Logo Watermark */}
                <div className="absolute top-4 left-4 w-20 h-20 bg-white/98 backdrop-blur-md shadow-2xl animate-glow-rotate overflow-hidden" style={{ clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)' }}>
                  <img 
                    src="/logo.png?v=2026" 
                    alt="BS Brand Store" 
                    className="w-full h-full scale-150 -translate-y-2 object-contain"
                  />
                </div>
              </div>
            </Card>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-teal-500 ring-2 ring-teal-500/50'
                        : 'border-gray-700 hover:border-teal-500/50'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.nameAr} ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 25vw, 15vw"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-teal-600/20 text-teal-400 rounded-full text-xs sm:text-sm mb-3 sm:mb-4">
                <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {product.category.nameAr}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">{product.nameAr}</h1>
              
              {/* Product Rating */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        product.reviews && product.reviews.length > 0 && star <= Math.round(product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-400 text-sm">
                  {product.reviews && product.reviews.length > 0 
                    ? `(${product.reviews.length} ${product.reviews.length === 1 ? 'تقييم' : 'تقييمات'})`
                    : 'لا توجد تقييمات بعد'}
                </span>
              </div>
              
              <p className="text-gray-400 text-sm sm:text-base md:text-lg leading-relaxed">{product.descriptionAr}</p>
            </div>

            {/* Price & Stock */}
            <div className="flex items-baseline gap-2 sm:gap-4">
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                {product.price.toLocaleString()}
              </span>
              <span className="text-lg sm:text-xl md:text-2xl text-gray-400">جنيه</span>
            </div>

            {/* Vendor Info */}
            {product.vendor && (
              <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/30">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    {product.vendor.logo && (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Image
                          src={product.vendor.logo}
                          alt={product.vendor.storeNameAr}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-400 mb-0.5">بائع المنتج</p>
                      <h3 className="text-white font-bold text-sm sm:text-base truncate">{product.vendor.storeNameAr}</h3>
                      {product.vendor.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-yellow-400 text-xs sm:text-sm font-medium">{product.vendor.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <Link href={`/products?vendorId=${product.vendor.id}`}>
                      <Button size="sm" variant="outline" className="border-purple-500/50 hover:bg-purple-500/10 text-xs sm:text-sm whitespace-nowrap">
                        منتجات أخرى
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center gap-3">
              {product.stock > 0 ? (
                <>
                  <div className="flex items-center gap-2 text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">متوفر</span>
                  </div>
                  <span className="text-gray-500">({product.stock} قطعة متاحة)</span>
                </>
              ) : (
                <div className="flex items-center gap-2 text-red-400">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-medium">غير متوفر</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="space-y-2 sm:space-y-3">
                <label className="text-gray-300 font-medium text-sm sm:text-base">الكمية:</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 bg-gray-800 rounded-lg p-1.5 sm:p-2 border border-gray-700">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </button>
                    <span className="text-xl sm:text-2xl font-bold text-white min-w-[30px] sm:min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </button>
                  </div>
                  <span className="text-sm sm:text-base text-gray-400">
                    الإجمالي: <span className="text-teal-400 font-bold text-base sm:text-xl">
                      {(product.price * quantity).toLocaleString()} جنيه
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 sm:gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-4 sm:py-6 text-sm sm:text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ml-2" />
                إضافة للسلة
              </Button>
              <Button 
                variant="outline" 
                className={`border-teal-500/50 hover:bg-teal-500/10 p-3 sm:p-4 md:p-6 transition-all ${isInWishlist(product.id) ? 'bg-red-500/20 border-red-500/50' : ''}`}
                onClick={handleToggleWishlist}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-all ${isInWishlist(product.id) ? 'text-red-500 fill-red-500' : 'text-teal-400'}`} />
              </Button>
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="border-teal-500/50 hover:bg-teal-500/10 p-3 sm:p-4 md:p-6"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-teal-400" />
                </Button>
                
                {/* Share Menu */}
                {showShareMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowShareMenu(false)}
                    />
                    <div className="absolute left-0 sm:right-0 bottom-full mb-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden min-w-[200px]">
                      <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                        <span className="text-white font-semibold text-sm">مشاركة المنتج</span>
                        <button 
                          onClick={() => setShowShareMenu(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={shareToWhatsApp}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-green-500/20 rounded-lg transition-colors group"
                        >
                          <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-white group-hover:text-green-400 font-medium">واتساب</span>
                        </button>
                        <button
                          onClick={shareToFacebook}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-500/20 rounded-lg transition-colors group"
                        >
                          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
                            <Facebook className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-white group-hover:text-blue-400 font-medium">فيسبوك</span>
                        </button>
                        <button
                          onClick={copyLink}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-600/50 rounded-lg transition-colors group"
                        >
                          <div className="w-9 h-9 bg-gray-600 rounded-full flex items-center justify-center">
                            <Copy className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-white group-hover:text-teal-400 font-medium">نسخ الرابط</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Brand & Quality Features - Dynamic based on Product & Vendor */}
            <div className="hidden md:block bg-gradient-to-br from-teal-900/40 to-cyan-900/40 rounded-xl p-6 border border-teal-500/30 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 flex-shrink-0">
                  {product.vendor?.logo ? (
                    <img 
                      src={product.vendor.logo} 
                      alt={product.vendor.storeNameAr || 'المتجر'} 
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <img 
                      src="/logo.png?v=2026" 
                      alt="ريمو ستور" 
                      className="w-full h-full object-contain drop-shadow-2xl"
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    {product.vendor ? `منتج من ${product.vendor.storeNameAr || product.vendor.storeName}` : 'منتج أصلي من ريمو ستور'}
                  </h3>
                  <p className="text-teal-400 text-sm">
                    {product.category?.nameAr || 'منتج مميز'}
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-teal-600/20 rounded-full">
                    <Check className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">جودة مضمونة</h4>
                    <p className="text-gray-400 text-sm">منتج أصلي من بائع موثوق - نضمن لك الجودة والأصالة</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-teal-600/20 rounded-full">
                    <Check className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">خامات عالية الجودة</h4>
                    <p className="text-gray-400 text-sm">
                      {product.category?.nameAr?.includes('ملابس') || product.category?.nameAr?.includes('قميص') || product.category?.nameAr?.includes('بنطلون')
                        ? 'أقمشة مختارة بعناية - راحة ومتانة طوال اليوم'
                        : 'مواد ممتازة تضمن أداء عالي وعمر أطول'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-teal-600/20 rounded-full">
                    <Truck className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">شحن سريع وآمن</h4>
                    <p className="text-gray-400 text-sm">توصيل لجميع المحافظات مع إمكانية الفحص قبل الاستلام</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-teal-600/20 rounded-full">
                    <Shield className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">ضمان الاسترجاع</h4>
                    <p className="text-gray-400 text-sm">استرجع أو استبدل المنتج إذا لم يناسبك</p>
                  </div>
                </div>
              </div>

              {product.vendor && (
                <div className="flex items-center gap-2 pt-3 border-t border-teal-500/20">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-gray-300 text-sm">
                    {product.vendor.rating > 0 
                      ? `تقييم البائع: ${product.vendor.rating.toFixed(1)} من 5`
                      : 'بائع موثوق على ريمو ستور'}
                  </span>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-700">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1.5 sm:mb-2 flex items-center justify-center bg-teal-600/20 rounded-full">
                  <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
                </div>
                <p className="text-xs sm:text-sm text-gray-400">شحن سريع</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1.5 sm:mb-2 flex items-center justify-center bg-teal-600/20 rounded-full">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
                </div>
                <p className="text-xs sm:text-sm text-gray-400">ضمان الجودة</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1.5 sm:mb-2 flex items-center justify-center bg-teal-600/20 rounded-full">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
                </div>
                <p className="text-xs sm:text-sm text-gray-400">فحص عند الاستلام</p>
              </div>
            </div>

            {/* Browse All Vendor Products Button */}
            {product.vendor && (
              <div className="pt-4 sm:pt-6">
                <Link href={`/products?vendorId=${product.vendor.id}`}>
                  <Button className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:via-amber-600 hover:to-orange-600 text-white font-bold py-4 sm:py-5 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-orange-500/40 transition-all duration-300 group">
                    <Store className="w-5 h-5 sm:w-6 sm:h-6 ml-2 group-hover:scale-110 transition-transform" />
                    تصفح جميع منتجات {product.vendor.storeNameAr || 'التاجر'}
                    <ArrowRight className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">منتجات مشابهة</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/products/${relatedProduct.id}`}>
                  <Card className="bg-gray-800/80 border-teal-500/20 hover:border-teal-500/50 transition-all cursor-pointer group">
                    <div className="aspect-square relative overflow-hidden">
                      <Image
                        src={relatedProduct.images?.split(',')[0]?.trim() || '/placeholder.jpg'}
                        alt={relatedProduct.nameAr}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.jpg';
                        }}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-white font-bold mb-2 group-hover:text-teal-400 transition-colors">
                        {relatedProduct.nameAr}
                      </h3>
                      <p className="text-teal-400 font-bold text-xl">
                        {relatedProduct.price.toLocaleString()} جنيه
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-16 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-3xl font-bold text-white">آراء العملاء</h2>
            {product.reviews && product.reviews.length > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= Math.round(product.reviews!.reduce((acc, r) => acc + r.rating, 0) / product.reviews!.length)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-400 text-lg">
                  ({product.reviews.length} {product.reviews.length === 1 ? 'تقييم' : 'تقييمات'})
                </span>
              </div>
            ) : (
              <span className="text-gray-400">لا توجد تقييمات بعد</span>
            )}
          </div>

          {product.reviews && product.reviews.length > 0 ? (
            <div className="grid gap-6">
              {product.reviews.map((review) => (
                <Card key={review.id} className="bg-gray-800/80 border-teal-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h3 className="text-white font-bold text-lg">{review.user.name}</h3>
                          <span className="text-gray-400 text-sm">
                            {new Date(review.createdAt).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-800/80 border-teal-500/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-600/20 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">كن أول من يقيّم هذا المنتج!</h3>
                <p className="text-gray-400 mb-4">
                  شاركنا رأيك بعد الشراء لمساعدة الآخرين في اتخاذ قرارهم
                </p>
                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-8 h-8 text-gray-600" />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
