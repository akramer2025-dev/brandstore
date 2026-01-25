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
import { useSession } from "next-auth/react";
import ProductBadge from "./ProductBadge";

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

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { data: session } = useSession();
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
      nameAr: product.nameAr,
      price: product.price,
      image: firstImage,
    });

    toast.success("تمت الإضافة إلى السلة");
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    setIsAddingToWishlist(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
        toast.success("تم الحذف من المفضلة");
      } else {
        await addToWishlist(product.id);
        toast.success("تمت الإضافة للمفضلة");
      }
    } catch (error) {
      toast.error("حدث خطأ، حاول مرة أخرى");
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="border-0 shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 overflow-hidden group hover:-translate-y-2 bg-white h-full animate-card-float">
        {/* Image Container */}
        <div className="relative h-56 md:h-72 overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4 md:p-6">
          {/* Product Badge */}
          <ProductBadge badge={product.badge || null} soldCount={product.soldCount} />

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg">
              ‪-{discount}%‬
            </div>
          )}

          {/* Circular Image */}
          <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white shadow-2xl">
            <img
              src={firstImage}
              alt={product.nameAr}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600';
              }}
            />
          </div>
          
          {/* Brand Logo Badge - Embroidered Style */}
          <div className="absolute bottom-4 left-4 z-20">
            <div className="relative group/logo">
              {/* Embroidered Effect Background */}
              <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-lg blur-sm"></div>
              
              {/* Main Badge */}
              <div className="relative bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-md px-3 py-2 rounded-lg shadow-2xl border-2 border-white/50 flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-3xl">
                {/* Logo */}
                <div className="w-8 h-8 flex-shrink-0">
                  <img 
                    src="/logo.png" 
                    alt="BS Brand" 
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
                
                {/* Text */}
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] font-bold text-gray-700 tracking-wide">تطريز أصلي</span>
                  <span className="text-[8px] text-teal-600 font-semibold">براند ستور</span>
                </div>
                
                {/* Embroidered Stitch Effect */}
                <div className="absolute -right-1 -bottom-1 w-2 h-2">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg animate-pulse"></div>
                </div>
              </div>
              
              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-gray-900/95 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                  منتج أصلي بتطريز الشعار
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900/95"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stock Badge */}
          <div className="absolute bottom-3 right-3">
            {product.stock === 0 ? (
              <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                نفذت الكمية
              </span>
            ) : product.stock <= 10 ? (
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-lg">
                {product.stock} متبقي
              </span>
            ) : null}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            disabled={isAddingToWishlist}
            className={`absolute top-3 left-3 p-2 rounded-full transition-all duration-300 shadow-lg ${
              inWishlist 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white scale-110' 
                : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
            } ${isAddingToWishlist ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart 
              className={`w-5 h-5 transition-all ${inWishlist ? 'fill-current' : ''}`}
            />
          </button>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Quick Add to Cart Button */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
            >
              <ShoppingCart className="w-4 h-4 ml-2" />
              أضف للسلة
            </Button>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-3 md:p-5 space-y-2 md:space-y-3">
          <h3 className="font-bold text-base md:text-lg group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-fuchsia-600 group-hover:bg-clip-text group-hover:text-transparent transition-all line-clamp-2">
            {product.nameAr}
          </h3>
          
          {/* Rating & Sales Count */}
          <div className="flex items-center gap-3 text-sm">
            {avgRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-gray-700 font-medium">{avgRating.toFixed(1)}</span>
                <span className="text-gray-400">({product.reviews?.length})</span>
              </div>
            )}
            {product.soldCount && product.soldCount > 0 && (
              <span className="text-teal-600 text-xs font-medium">
                {product.soldCount.toLocaleString('en-US')}+ مبيعات
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between pt-1 md:pt-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1 md:gap-2">
                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  {product.price.toLocaleString('en-US')}
                </span>
                <span className="text-gray-500 text-xs md:text-sm">ج.م</span>
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-gray-400 line-through text-xs">
                  {product.originalPrice.toLocaleString('en-US')} ج.م
                </span>
              )}
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              size="sm"
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white p-2"
            >
              <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
