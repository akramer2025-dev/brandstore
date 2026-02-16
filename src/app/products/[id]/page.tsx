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
  Download,
  Smartphone,
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
  allowInstallment?: boolean;
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
  variants?: ProductVariant[];
}

interface ProductVariant {
  id: string;
  variantType: string;
  name: string;
  nameAr: string;
  price: number;
  stock: number;
  isActive: boolean;
  sortOrder: number;
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
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const { addItem } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Get current price and stock based on selected variant or product default
  const getCurrentPrice = () => {
    return selectedVariant ? selectedVariant.price : product?.price || 0;
  };

  const getCurrentStock = () => {
    return selectedVariant ? selectedVariant.stock : product?.stock || 0;
  };

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
    if (productId && typeof window !== 'undefined') {
      // Scroll to top when page loads
      window.scrollTo({ top: 0, behavior: 'smooth' });
      fetchProduct();
    }
  }, [productId]);

  // Check if PWA is installed
  useEffect(() => {
    // Guard: Only run on client side
    if (typeof window === 'undefined') return;
    
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(isStandaloneMode);
    
    // Show banner if not standalone and not dismissed
    if (!isStandaloneMode) {
      const dismissed = localStorage.getItem('product-page-install-banner-dismissed');
      if (!dismissed) {
        // Check if coming from social media
        const referrer = typeof document !== 'undefined' ? document.referrer : '';
        const isFromSocial = /facebook|instagram|fb\.com|t\.co|twitter|tiktok/i.test(referrer);
        
        if (isFromSocial) {
          setShowInstallBanner(true);
          // Auto dismiss after 10 seconds
          setTimeout(() => setShowInstallBanner(false), 10000);
        }
      }
    }
  }, []);

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

    // التحقق من اختيار المقاس إذا كان المنتج يحتوي على مقاسات
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      toast.error('⚠️ يرجى اختيار المقاس أولاً');
      return;
    }

    const currentStock = getCurrentStock();
    const currentPrice = getCurrentPrice();

    if (quantity > currentStock) {
      toast.error(`الكمية المتاحة فقط ${currentStock}`);
      return;
    }

    addItem({
      id: product.id,
      name: product.nameAr,
      nameAr: product.nameAr,
      price: currentPrice,
      image: images[0],
      variant: selectedVariant ? {
        id: selectedVariant.id,
        nameAr: selectedVariant.nameAr,
        price: selectedVariant.price,
      } : undefined,
    });

    // إظهار الـ modal بدلاً من toast
    setShowCartModal(true);
  };

  const incrementQuantity = () => {
    const currentStock = getCurrentStock();
    if (quantity < currentStock) {
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
      <div className="min-h-screen bg-gradient-to-b from-purple-100 via-purple-50 to-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 via-purple-50 to-white flex items-center justify-center">
        <Card className="bg-white border-purple-200 p-12 text-center">
          <p className="text-xl text-gray-600 mb-4">المنتج غير موجود</p>
          <Link href="/products">
            <Button className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 text-white">
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
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-purple-50 to-white">
      {/* Background Effects - hidden on mobile */}
      <div className="hidden md:block fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 relative z-10">
        {/* Install App Banner */}
        {showInstallBanner && !isStandalone && (
          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-xl p-3 sm:p-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-white/20 rounded-full p-2 backdrop-blur-sm">
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm sm:text-base">حمّل تطبيق Remostore</h3>
                  <p className="text-white/90 text-xs sm:text-sm">تجربة أسرع وأسهل مع التطبيق 🚀</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setShowInstallBanner(false);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('product-page-install-banner-dismissed', 'true');
                  }
                }}
                variant="ghost"
                size="sm"
                className="hover:bg-white/20 text-white p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-8 overflow-x-auto">
          <Link href="/" className="hover:text-purple-600">الرئيسية</Link>
          <ArrowRight className="w-4 h-4 rotate-180" />
          <Link href="/products" className="hover:text-purple-600">المنتجات</Link>
          <ArrowRight className="w-4 h-4 rotate-180" />
          <Link href={`/products?category=${product.categoryId}`} className="hover:text-purple-600">
            {product.category.nameAr}
          </Link>
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span className="text-gray-900 font-semibold">{product.nameAr}</span>
        </div>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-12 mb-8 sm:mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Card className="bg-white border-purple-200 overflow-hidden shadow-xl">
              <div className="aspect-square relative bg-purple-50">
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
                        ? 'border-purple-600 ring-2 ring-purple-500/50'
                        : 'border-purple-200 hover:border-purple-400'
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
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm mb-3 sm:mb-4 border border-purple-200">
                <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {product.category.nameAr}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{product.nameAr}</h1>
              
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
                <span className="text-gray-500 text-sm">
                  {product.reviews && product.reviews.length > 0 
                    ? `(${product.reviews.length} ${product.reviews.length === 1 ? 'تقييم' : 'تقييمات'})`
                    : 'لا توجد تقييمات بعد'}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed">{product.descriptionAr}</p>
            </div>

            {/* Price & Stock */}
            <div className="space-y-3">
              <div className="flex items-baseline gap-2 sm:gap-4">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                  {getCurrentPrice().toLocaleString()}
                </span>
                <span className="text-lg sm:text-xl md:text-2xl text-gray-600">جنيه</span>
              </div>
              
              {/* Installment Badge - Professional & Eye-catching */}
              {product.allowInstallment && getCurrentPrice() >= 100 && (
                <div className="relative group">
                  <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3.5 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-400/30 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5 sm:gap-2 animate-pulse">
                      <span className="text-lg sm:text-2xl">🏦</span>
                      <div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="font-black text-xs sm:text-sm">متاح التقسيط!</span>
                          <span className="hidden sm:inline bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            بدون فوائد
                          </span>
                        </div>
                        <div className="text-[10px] sm:text-xs font-medium text-blue-100 mt-0.5">
                          قسّط على 4 أشهر بدون أي فوائد إضافية
                        </div>
                      </div>
                    </div>
                    <div className="mr-auto bg-white text-blue-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-sm font-black shadow-lg">
                      {(getCurrentPrice() / 4).toFixed(0)} ج.م × 4
                    </div>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap mt-2">
                      💡 اشتري الآن وادفع على 4 دفعات بدون فوائد
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Variants Selection - المقاسات */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <label className="text-gray-900 font-bold text-lg flex items-center gap-2">
                  <span className="text-2xl">📏</span>
                  اختر المقاس:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const isOutOfStock = variant.stock === 0;
                    
                    return (
                      <button
                        key={variant.id}
                        onClick={() => {
                          if (!isOutOfStock) {
                            setSelectedVariant(variant);
                            setQuantity(1); // إعادة تعيين الكمية
                          }
                        }}
                        disabled={isOutOfStock}
                        className={`relative p-3 rounded-xl border-2 font-bold transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                            : isOutOfStock
                            ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                            : 'border-purple-200 bg-white hover:border-purple-400 hover:shadow-md hover:scale-105'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`text-lg ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                            {variant.nameAr}
                          </div>
                          {!isOutOfStock && (
                            <div className={`text-xs mt-1 ${isSelected ? 'text-purple-100' : 'text-gray-500'}`}>
                              {variant.price.toLocaleString()} ج
                            </div>
                          )}
                          {isOutOfStock && (
                            <div className="text-xs text-red-500 mt-1">
                              نفذ
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-purple-600" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedVariant && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">المقاس المختار:</span>
                      <span className="font-bold text-purple-600">{selectedVariant.nameAr}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-700">المتاح:</span>
                      <span className="font-bold text-green-600">{selectedVariant.stock} قطعة</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Vendor Info */}
            {product.vendor && (
              <Card className="backdrop-blur-sm bg-gray-800/90 border-purple-500/40 hover:shadow-xl hover:border-pink-500/50 transition-all duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    {product.vendor.logo && (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
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
                      <p className="text-xs sm:text-sm text-gray-300 mb-0.5 font-medium">بائع المنتج</p>
                      <h3 className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent font-bold text-sm sm:text-base truncate">{product.vendor.storeNameAr}</h3>
                      {product.vendor.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-yellow-400 text-xs sm:text-sm font-medium">{product.vendor.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <Link href={`/products?vendorId=${product.vendor.id}`}>
                      <Button size="sm" variant="outline" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 text-white text-xs sm:text-sm whitespace-nowrap shadow-lg hover:shadow-xl transition-all">
                        منتجات أخرى
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center gap-3">
              {getCurrentStock() > 0 ? (
                <>
                  <div className="flex items-center gap-2 text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">متوفر</span>
                  </div>
                  <span className="text-gray-500">({getCurrentStock()} قطعة متاحة)</span>
                </>
              ) : (
                <div className="flex items-center gap-2 text-red-400">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-medium">غير متوفر</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {getCurrentStock() > 0 && (
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
                      disabled={quantity >= getCurrentStock()}
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </button>
                  </div>
                  <span className="text-sm sm:text-base text-gray-400">
                    الإجمالي: <span className="text-teal-400 font-bold text-base sm:text-xl">
                      {(getCurrentPrice() * quantity).toLocaleString()} جنيه
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* توجيه للعميل - كيفية الشراء */}
            {getCurrentStock() > 0 && (
              <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2 border-purple-300/40 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <h4 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                      كيف تشتري المنتج؟
                      <span className="text-xl">🛒</span>
                    </h4>
                    <div className="space-y-1 text-xs sm:text-sm text-gray-300">
                      <p className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">1</span>
                        اضغط على زر "إضافة للسلة" 👇
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">2</span>
                        اذهب إلى السلة وراجع طلبك 🛍️
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">3</span>
                        أكمل معلومات التوصيل والدفع ✅
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 sm:gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={getCurrentStock() === 0}
                className="flex-1 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 text-white font-bold py-4 sm:py-6 text-sm sm:text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ml-2" />
                إضافة للسلة
              </Button>
              <Button 
                variant="outline" 
                className={`border-purple-300 hover:bg-purple-100 p-3 sm:p-4 md:p-6 transition-all ${isInWishlist(product.id) ? 'bg-red-100 border-red-300' : ''}`}
                onClick={handleToggleWishlist}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-all ${isInWishlist(product.id) ? 'text-red-500 fill-red-500' : 'text-purple-600'}`} />
              </Button>
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="border-purple-300 hover:bg-purple-100 p-3 sm:p-4 md:p-6"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600" />
                </Button>
                
                {/* Share Menu */}
                {showShareMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowShareMenu(false)}
                    />
                    <div className="absolute left-0 sm:right-0 bottom-full mb-2 bg-white border-2 border-purple-200 rounded-xl shadow-2xl z-50 overflow-hidden min-w-[200px]">
                      <div className="p-3 border-b border-purple-200 flex items-center justify-between">
                        <span className="text-gray-900 font-semibold text-sm">مشاركة المنتج</span>
                        <button 
                          onClick={() => setShowShareMenu(false)}
                          className="text-gray-500 hover:text-gray-900"
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
                          <span className="text-gray-900 group-hover:text-green-600 font-medium">واتساب</span>
                        </button>
                        <button
                          onClick={shareToFacebook}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-500/20 rounded-lg transition-colors group"
                        >
                          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
                            <Facebook className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-gray-900 group-hover:text-blue-600 font-medium">فيسبوك</span>
                        </button>
                        <button
                          onClick={copyLink}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-purple-100 rounded-lg transition-colors group"
                        >
                          <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center">
                            <Copy className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-gray-900 group-hover:text-purple-600 font-medium">نسخ الرابط</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Brand & Quality Features - Dynamic based on Product & Vendor */}
            <div className="hidden md:block bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 space-y-4 shadow-lg">
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
                  <h3 className="text-gray-900 font-bold text-lg">
                    {product.vendor ? `منتج من ${product.vendor.storeNameAr || product.vendor.storeName}` : 'منتج أصلي من ريمو ستور'}
                  </h3>
                  <p className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent text-sm font-semibold">
                    {product.category?.nameAr || 'منتج مميز'}
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-purple-100">
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-purple-100 rounded-full">
                    <Check className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 font-semibold mb-1">جودة مضمونة</h4>
                    <p className="text-gray-600 text-sm">منتج أصلي من بائع موثوق - نضمن لك الجودة والأصالة</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-purple-100">
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-purple-100 rounded-full">
                    <Check className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 font-semibold mb-1">خامات عالية الجودة</h4>
                    <p className="text-gray-600 text-sm">
                      {product.category?.nameAr?.includes('ملابس') || product.category?.nameAr?.includes('قميص') || product.category?.nameAr?.includes('بنطلون')
                        ? 'أقمشة مختارة بعناية - راحة ومتانة طوال اليوم'
                        : 'مواد ممتازة تضمن أداء عالي وعمر أطول'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-purple-100">
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-purple-100 rounded-full">
                    <Truck className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 font-semibold mb-1">شحن سريع وآمن</h4>
                    <p className="text-gray-600 text-sm">توصيل لجميع المحافظات مع إمكانية الفحص قبل الاستلام</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-purple-100">
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-purple-100 rounded-full">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 font-semibold mb-1">ضمان الاسترجاع</h4>
                    <p className="text-gray-600 text-sm">استرجع أو استبدل المنتج إذا لم يناسبك</p>
                  </div>
                </div>
              </div>

              {product.vendor && (
                <div className="flex items-center gap-2 pt-3 border-t border-purple-200">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-gray-700 text-sm">
                    {product.vendor.rating > 0 
                      ? `تقييم البائع: ${product.vendor.rating.toFixed(1)} من 5`
                      : 'بائع موثوق على ريمو ستور'}
                  </span>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-purple-200">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1.5 sm:mb-2 flex items-center justify-center bg-purple-100 rounded-full">
                  <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600">شحن سريع</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1.5 sm:mb-2 flex items-center justify-center bg-purple-100 rounded-full">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600">ضمان الجودة</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1.5 sm:mb-2 flex items-center justify-center bg-purple-100 rounded-full">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600">فحص عند الاستلام</p>
              </div>
            </div>

            {/* Installment Information Card - Professional & Detailed */}
            {product.allowInstallment && getCurrentPrice() >= 100 && (
              <Card className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 border-2 border-blue-300 shadow-xl mt-4 sm:mt-6 overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg">
                      <span className="text-2xl sm:text-3xl">🏦</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-blue-900 mb-1">اشتري الآن وادفع على 4 أقساط بدون فوائد!</h3>
                        <p className="text-xs sm:text-sm text-blue-700">احصل على المنتج الآن وادفع على 4 أشهر بدون أي فوائد إضافية</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 bg-white rounded-lg p-3 border border-blue-200">
                        <div>
                          <p className="text-[10px] sm:text-xs text-gray-600 mb-1">الدفعة الشهرية</p>
                          <p className="text-base sm:text-xl font-black text-blue-600">
                            {(getCurrentPrice() / 4).toFixed(0)} ج.م
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs text-gray-600 mb-1">عدد الأقساط</p>
                          <p className="text-base sm:text-xl font-black text-blue-600">4 أشهر</p>
                        </div>
                      </div>

                      <div className="bg-blue-100/50 rounded-lg p-2.5 sm:p-3 border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-900 text-xs sm:text-sm font-semibold mb-2">
                          <Check className="w-4 h-4" />
                          <span>مثال على جدول الأقساط:</span>
                        </div>
                        <div className="space-y-1.5 text-[10px] sm:text-xs text-blue-800">
                          <div className="flex justify-between">
                            <span>• القسط الأول</span>
                            <span className="font-bold">{(getCurrentPrice() / 4).toFixed(2)} ج.م</span>
                          </div>
                          <div className="flex justify-between">
                            <span>• القسط الثاني</span>
                            <span className="font-bold">{(getCurrentPrice() / 4).toFixed(2)} ج.م</span>
                          </div>
                          <div className="flex justify-between">
                            <span>• القسط الثالث</span>
                            <span className="font-bold">{(getCurrentPrice() / 4).toFixed(2)} ج.م</span>
                          </div>
                          <div className="flex justify-between border-t border-blue-300 pt-1.5 mt-1">
                            <span>• القسط الرابع (الأخير)</span>
                            <span className="font-bold">{(getCurrentPrice() / 4).toFixed(2)} ج.م</span>
                          </div>
                          <div className="flex justify-between font-black text-xs sm:text-sm text-blue-900 border-t-2 border-blue-400 pt-1.5 mt-2">
                            <span>الإجمالي</span>
                            <span>{getCurrentPrice().toFixed(2)} ج.م</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[10px] sm:text-xs text-blue-700 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        اختر طريقة الدفع "التقسيط" عند إتمام الطلب
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Browse All Vendor Products Button */}
            {product.vendor && (
              <div className="pt-4 sm:pt-6">
                <Link href={`/products?vendorId=${product.vendor.id}`}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 text-white font-bold py-4 sm:py-5 text-base sm:text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 group">
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
            <h2 className="text-3xl font-bold text-gray-900">منتجات مشابهة</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/products/${relatedProduct.id}`}>
                  <Card className="bg-white border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all cursor-pointer group">
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
                      <h3 className="text-gray-900 font-bold mb-2 group-hover:text-purple-600 transition-colors">
                        {relatedProduct.nameAr}
                      </h3>
                      <p className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent font-bold text-xl">
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
            <h2 className="text-3xl font-bold text-gray-900">آراء العملاء</h2>
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
                <span className="text-gray-600 text-lg">
                  ({product.reviews.length} {product.reviews.length === 1 ? 'تقييم' : 'تقييمات'})
                </span>
              </div>
            ) : (
              <span className="text-gray-500">لا توجد تقييمات بعد</span>
            )}
          </div>

          {product.reviews && product.reviews.length > 0 ? (
            <div className="grid gap-6">
              {product.reviews.map((review) => (
                <Card key={review.id} className="bg-white border-purple-200 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h3 className="text-gray-900 font-bold text-lg">{review.user.name}</h3>
                          <span className="text-gray-500 text-sm">
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
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white border-purple-200 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-gray-900 font-bold text-xl mb-2">كن أول من يقيّم هذا المنتج!</h3>
                <p className="text-gray-600 mb-4">
                  شاركنا رأيك بعد الشراء لمساعدة الآخرين في اتخاذ قرارهم
                </p>
                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-8 h-8 text-gray-300" />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Cart Modal */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom duration-300">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-green-600" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
              تمت الإضافة للسلة! 🎉
            </h3>
            
            {/* Product Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 flex gap-3 items-center">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={images[0] || '/placeholder.jpg'}
                  alt={product?.nameAr || ''}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 line-clamp-1">{product?.nameAr}</p>
                {selectedVariant && (
                  <p className="text-sm text-gray-600">المقاس: {selectedVariant.nameAr}</p>
                )}
                <p className="text-purple-600 font-bold">
                  {getCurrentPrice().toLocaleString()} جنيه × {quantity}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setShowCartModal(false)}
                variant="outline"
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-bold py-6 text-base"
              >
                <ShoppingCart className="w-5 h-5 ml-2" />
                كمل شراء
              </Button>
              <Link href="/cart">
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 text-base"
                >
                  <Package className="w-5 h-5 ml-2" />
                  عرض السلة
                </Button>
              </Link>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowCartModal(false)}
              className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
