"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { toast } from "sonner";
import { useState } from "react";

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
}

export function ProductCardFlashStyle({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  
  const inWishlist = isInWishlist(product.id);
  
  // Extract first image from comma-separated images
  const firstImage = product.images 
    ? product.images.split(',')[0]?.trim() 
    : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600';

  // Calculate discount percentage
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Calculate average rating
  const avgRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
    : 0;

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
    toast.success("تمت الإضافة إلى السلة");
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
        toast.success("تمت الإضافة إلى المفضلة");
      }
    } catch (error) {
      toast.error("حدث خطأ، حاول مرة أخرى");
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="bg-gray-800/80 border-2 border-teal-500/30 hover:border-teal-500 transition-all duration-300 cursor-pointer group relative overflow-hidden h-full">
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm shadow-lg animate-pulse">
            ‪-{discount}%‬
          </div>
        )}

        {/* Product Image */}
        <div className="aspect-square relative overflow-hidden bg-gray-900">
          <Image
            src={firstImage}
            alt={product.nameAr}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600';
            }}
          />
          
          {/* Wishlist Button - Floating */}
          <button
            onClick={handleToggleWishlist}
            disabled={isAddingToWishlist}
            className={`absolute top-2 left-2 sm:top-3 sm:left-3 p-1.5 sm:p-2 rounded-full transition-all duration-300 shadow-lg z-20 ${
              inWishlist 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white scale-110' 
                : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-red-500 hover:text-white'
            } ${isAddingToWishlist ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart 
              className={`w-3 h-3 sm:w-4 sm:h-4 transition-all ${inWishlist ? 'fill-current' : ''}`}
            />
          </button>

          {/* Stock Badge - Overlay on Image */}
          {product.stock === 0 ? (
            <div className="absolute bottom-2 right-2 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[9px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              نفذت الكمية
            </div>
          ) : product.stock <= 10 ? (
            <div className="absolute bottom-2 right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] sm:text-xs font-bold px-2 py-1 rounded-full animate-pulse shadow-lg">
              {product.stock} متبقي
            </div>
          ) : null}
        </div>

        <CardContent className="p-2.5 sm:p-3 md:p-4 space-y-2 sm:space-y-2.5">
          {/* Product Name */}
          <h3 className="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg line-clamp-2 group-hover:text-teal-400 transition-colors min-h-[2.5rem] sm:min-h-[3rem]">
            {product.nameAr}
          </h3>
          
          {/* Rating & Sales Count */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs">
            {avgRating > 0 && (
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-yellow-400 font-bold">{avgRating.toFixed(1)}</span>
                <span className="text-gray-500 hidden sm:inline">({product.reviews?.length || 0})</span>
              </div>
            )}
            {product.soldCount && product.soldCount > 0 && (
              <span className="text-teal-400 text-[9px] sm:text-xs font-medium">
                {product.soldCount > 999 ? `${(product.soldCount / 1000).toFixed(1)}K` : product.soldCount}+ مبيعات
              </span>
            )}
          </div>

          {/* Price */}
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-teal-400">
                {product.price.toLocaleString('en-US')}
              </span>
              <span className="text-gray-400 text-[9px] sm:text-xs">جنيه</span>
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-gray-500 line-through text-[9px] sm:text-xs">
                {product.originalPrice.toLocaleString('en-US')} جنيه
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold text-xs sm:text-sm py-1.5 sm:py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
            أضف للسلة
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
