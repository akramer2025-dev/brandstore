"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Star, Eye, Zap, TrendingUp, Award, Shield, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { toast } from "sonner";
import { useState, useMemo } from "react";

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

export function ProductCardPro({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const inWishlist = isInWishlist(product.id);
  
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
      { text: 'شحن مجاني', icon: Truck, color: 'from-blue-500 to-cyan-500' },
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

  return (
    <Link href={`/products/${product.id}`}>
      <Card 
        className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-2 border-orange-500/40 hover:border-orange-400 transition-all duration-500 cursor-pointer group relative overflow-hidden h-full hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated Gradient Border Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-500/20 animate-pulse" />
        </div>

        {/* Badge - Top Right */}
        {badge && (
          <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-20 bg-gradient-to-r ${badge.color} text-white font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs shadow-lg flex items-center gap-1`}>
            <badge.icon className="w-3 h-3" />
            <span>{badge.text}</span>
          </div>
        )}

        {/* Discount Badge - Top Left */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 bg-gradient-to-r from-red-600 to-orange-500 text-white font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm shadow-lg animate-bounce">
            -{discount}%
          </div>
        )}

        {/* Product Image */}
        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
          <Image
            src={firstImage}
            alt={product.nameAr}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600';
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick Actions - Show on Hover */}
          <div className={`absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button
              onClick={handleToggleWishlist}
              disabled={isAddingToWishlist}
              className={`p-2.5 rounded-full transition-all duration-300 shadow-xl backdrop-blur-sm ${
                inWishlist 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white scale-110' 
                  : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
              } ${isAddingToWishlist ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart className={`w-4 h-4 transition-all ${inWishlist ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2.5 rounded-full bg-white/90 text-gray-700 hover:bg-teal-500 hover:text-white transition-all duration-300 shadow-xl backdrop-blur-sm">
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Stock Badge */}
          {product.stock === 0 ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white text-sm font-bold px-4 py-2 rounded-lg backdrop-blur-sm">
              نفذت الكمية
            </div>
          ) : product.stock <= 10 && (
            <div className="absolute bottom-2 left-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] sm:text-xs font-bold px-2 py-1 rounded-full animate-pulse shadow-lg flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {product.stock} متبقي فقط!
            </div>
          )}
        </div>

        <CardContent className="p-3 sm:p-4 space-y-2.5 sm:space-y-3 relative z-10">
          {/* Category */}
          {product.category && (
            <span className="inline-block text-[10px] sm:text-xs text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full font-medium">
              {product.category.nameAr}
            </span>
          )}

          {/* Product Name */}
          <h3 className="text-white font-bold text-xs sm:text-sm md:text-base line-clamp-2 group-hover:text-teal-400 transition-colors min-h-[2.5rem] sm:min-h-[3rem]">
            {product.nameAr}
          </h3>
          
          {/* Rating & Reviews */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {renderStars(rating)}
              <span className="text-yellow-400 font-bold text-xs">{rating}</span>
              <span className="text-gray-500 text-[10px] sm:text-xs">({reviewCount})</span>
            </div>
          </div>

          {/* Sales Count */}
          <div className="flex items-center gap-1 text-gray-400 text-[10px] sm:text-xs">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-green-400 font-medium">
              {soldCount > 999 ? `${(soldCount / 1000).toFixed(1)}K` : soldCount}+ تم بيعه
            </span>
          </div>

          {/* Price */}
          <div className="flex items-end justify-between">
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  {product.price.toLocaleString('en-US')}
                </span>
                <span className="text-gray-400 text-[10px] sm:text-xs">جنيه</span>
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="text-gray-500 line-through text-[10px] sm:text-xs">
                  {product.originalPrice.toLocaleString('en-US')} جنيه
                </div>
              )}
            </div>
            {discount > 0 && (
              <span className="text-green-400 text-[10px] sm:text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full">
                وفر {(product.originalPrice! - product.price).toLocaleString()} جنيه
              </span>
            )}
          </div>

          {/* Features Icons */}
          <div className="flex items-center gap-2 text-gray-400 text-[10px]">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-teal-400" />
              <span>ضمان</span>
            </div>
            <div className="flex items-center gap-1">
              <Truck className="w-3 h-3 text-teal-400" />
              <span>توصيل سريع</span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 hover:from-teal-500 hover:via-cyan-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-teal-500/30 group/btn"
          >
            <ShoppingCart className="w-4 h-4 ml-2 group-hover/btn:animate-bounce" />
            أضف للسلة
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
