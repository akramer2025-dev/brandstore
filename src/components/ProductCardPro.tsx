"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Star, Zap, TrendingUp, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { toast } from "sonner";
import { useState, useMemo, useEffect, useRef } from "react";

interface ProductCardProps {
  product: {
    id: string;
    nameAr: string;
    descriptionAr?: string | null;
    price: number;
    originalPrice?: number | null;
    stock: number;
    images: string | null;
    badge?: string | null;
    soldCount?: number;
    reviews?: { rating: number }[];
    category?: {
      id: string;
      nameAr: string;
    };
  };
  index?: number;
  isCompact?: boolean; // للعرض الصغير الدائري
}

// Generate consistent random rating based on product id
function generateRating(productId: string): { rating: number; count: number } {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    const char = productId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // Generate rating between 3.5 and 5.0
  const rating = 3.5 + (Math.abs(hash % 16) / 10);
  // Generate review count between 15 and 250
  const count = 15 + Math.abs(hash % 236);
  
  return { rating: Math.round(rating * 10) / 10, count };
}

// Generate consistent sold count
function generateSoldCount(productId: string): number {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    const char = productId.charCodeAt(i);
    hash = ((hash << 3) + hash) + char;
    hash = hash & hash;
  }
  return 50 + Math.abs(hash % 950);
}

export function ProductCardPro({ product, index = 0, isCompact = false }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const inWishlist = isInWishlist(product.id);

  // ⚡ أنيميشن معطل للأداء - المنتجات تظهر مباشرة
  
  // Extract first image from comma-separated images
  const firstImage = product.images 
    ? product.images.split(',')[0]?.trim() 
    : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600';

  // Calculate discount percentage
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Generate consistent rating and sold count for this product
  const { rating, count: reviewCount } = useMemo(() => {
    if (product.reviews && product.reviews.length > 0) {
      const avg = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
      return { rating: Math.round(avg * 10) / 10, count: product.reviews.length };
    }
    return generateRating(product.id);
  }, [product.id, product.reviews]);

  const soldCount = useMemo(() => {
    return product.soldCount || generateSoldCount(product.id);
  }, [product.id, product.soldCount]);

  // Random badge for some products
  const badge = useMemo(() => {
    const badges = [
      { text: 'الأكثر مبيعاً', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
      { text: 'جديد', icon: Zap, color: 'from-green-500 to-emerald-500' },
      { text: 'مميز', icon: Award, color: 'from-purple-500 to-pink-500' },
      { text: 'عرض خاص', icon: Award, color: 'from-blue-500 to-cyan-500' },
    ];
    
    let hash = 0;
    for (let i = 0; i < product.id.length; i++) {
      hash = ((hash << 2) + hash) + product.id.charCodeAt(i);
    }
    
    // Only show badge for ~40% of products
    if (hash % 10 < 4) {
      return badges[Math.abs(hash) % badges.length];
    }
    return null;
  }, [product.id]);

  // إضافة originalPrice افتراضي إذا لم يكن موجوداً (لإظهار الخصم)
  const displayOriginalPrice = useMemo(() => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return product.originalPrice;
    }
    // إنشاء سعر أصلي افتراضي (40% أعلى من السعر الحالي)
    return Math.round(product.price * 1.4);
  }, [product.price, product.originalPrice]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock === 0) {
      toast.error("المنتج غير متوفر حالياً");
      return;
    }

    addItem({
      id: product.id,
      name: product.nameAr,
      price: product.price,
      originalPrice: product.originalPrice || undefined,
      image: firstImage,
    });
    toast.success("تمت الإضافة إلى السلة 🛒");
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAddingToWishlist(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
        toast.success("تمت الإزالة من المفضلة");
      } else {
        await addToWishlist(product.id);
        toast.success("تمت الإضافة إلى المفضلة ❤️");
      }
    } catch (error) {
      toast.error("حدث خطأ، حاول مرة أخرى");
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  // Render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : star <= rating + 0.5
                ? 'fill-yellow-400/50 text-yellow-400'
                : 'fill-gray-600 text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  // ✨ العرض الصغير الدائري للشريط المتحرك - احترافي مثل Shein & Noon
  if (isCompact) {
    return (
      <Link href={`/products/${product.id}`} className="block group">
        <div className="flex flex-col items-center gap-1.5">
          {/* صورة دائرية صغيرة احترافية */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-purple-200 group-hover:border-purple-500 transition-all duration-300 group-hover:scale-110 shadow-md group-hover:shadow-xl">
            <Image
              src={firstImage}
              alt={product.nameAr}
              fill
              sizes="(max-width: 640px) 80px, 96px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              quality={95}
              priority={index < 4}
            />
            {discount > 0 && (
              <div className="absolute top-0 right-0 bg-gradient-to-br from-red-500 to-red-600 text-white text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-bl-lg shadow-lg">
                -{discount}%
              </div>
            )}
            {/* طبقة overlay عند الـ hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          {/* اسم المنتج */}
          <p className="text-[10px] sm:text-xs font-semibold text-center text-gray-800 group-hover:text-purple-600 line-clamp-2 w-full px-1 transition-colors duration-300">
            {product.nameAr}
          </p>
          
          {/* تقييم + عدد المبيعات */}
          <div className="flex items-center gap-1 text-[8px] sm:text-[10px]">
            {renderStars(Math.floor(rating))}
            <span className="text-gray-500">({reviewCount})</span>
          </div>
          
          {/* السعر */}
          <div className="flex flex-col items-center gap-0.5">
            <p className="text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {product.price.toFixed(2)} ج.م
            </p>
            {discount > 0 && (
              <p className="text-[8px] sm:text-[10px] text-gray-400 line-through">
                {displayOriginalPrice.toFixed(2)}
              </p>
            )}
          </div>
          
          {/* مؤشر المبيعات */}
          {soldCount > 100 && (
            <div className="flex items-center gap-0.5 text-[8px] sm:text-[9px] text-orange-500">
              <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="font-medium">{soldCount}+ تم بيعه</span>
            </div>
          )}
        </div>
      </Link>
    );
  }

  // العرض العادي
  return (
    <div ref={cardRef}>
      <Link href={`/products/${product.id}`}>
        <Card 
          className="group relative overflow-hidden h-full transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-1 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-2xl"
          style={{
            border: '2px solid transparent',
            backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, rgb(147, 51, 234), rgb(236, 72, 153), rgb(249, 115, 22))',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
        {/* Badge - Top Left */}
        {badge && (
          <div className={`absolute top-1.5 sm:top-3 left-1.5 sm:left-3 z-20 bg-gradient-to-r ${badge.color} text-white font-bold px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full text-[9px] sm:text-xs shadow-lg flex items-center gap-0.5 sm:gap-1.5`}>
            <badge.icon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">{badge.text}</span>
          </div>
        )}

        {/* Discount Badge - Top Right */}
        {discount > 0 && (
          <div className="absolute top-1.5 sm:top-3 right-1.5 sm:right-3 z-20 bg-gradient-to-r from-red-500 to-orange-500 text-white font-black px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-sm shadow-lg">
            -{discount}%
          </div>
        )}

        {/* Product Image - احترافي نظيف */}
        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 rounded-t-2xl">
          <Image
            src={firstImage}
            alt={product.nameAr}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            quality={95}
            loading={index && index > 3 ? "lazy" : "eager"}
            priority={index !== undefined && index <= 3}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600';
            }}
          />
          
          {/* Wishlist Button - Bottom Right of Image */}
          <button
            onClick={handleToggleWishlist}
            disabled={isAddingToWishlist}
            className={`absolute bottom-1.5 sm:bottom-3 right-1.5 sm:right-3 p-1.5 sm:p-2.5 rounded-full transition-all duration-300 shadow-lg backdrop-blur-md z-30 ${
              inWishlist 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white scale-110' 
                : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
            } ${isAddingToWishlist ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart className={`w-3 h-3 sm:w-4 sm:h-4 transition-all ${inWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* Stock Badge */}
          {product.stock === 0 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white text-sm font-bold px-6 py-3 rounded-xl backdrop-blur-md z-20">
              نفذت الكمية
            </div>
          )}
        </div>

        <CardContent className="p-1.5 sm:p-2.5 space-y-1 sm:space-y-1.5 bg-white rounded-b-2xl">
          {/* Product Name */}
          <h3 className="font-bold text-[10px] sm:text-xs md:text-sm line-clamp-1 bg-gradient-to-r from-purple-700 via-pink-600 to-orange-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:via-pink-500 group-hover:to-orange-500 transition-all">
            {product.nameAr}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-0.5 sm:gap-1.5">
            {renderStars(rating)}
            <span className="text-yellow-600 font-bold text-[9px] sm:text-xs">{rating}</span>
            <span className="text-gray-400 text-[8px] sm:text-[10px]">({reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 bg-clip-text text-transparent">
              {product.price.toLocaleString('en-US')}
            </span>
            <span className="text-green-600 text-[10px] sm:text-xs font-bold">ج.م</span>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 text-white font-bold text-[10px] sm:text-xs py-1.5 sm:py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl group/btn"
          >
            <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1 sm:ml-1.5 group-hover/btn:scale-110 transition-transform" />
            أضف للسلة
          </Button>
        </CardContent>
      </Card>
    </Link>
    </div>
  );
}
