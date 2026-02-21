"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Store, 
  ShoppingBag, 
  Star, 
  Search, 
  Filter,
  Grid3x3,
  LayoutGrid,
  TrendingUp,
  Package,
  Sparkles,
  Heart,
  ShoppingCart,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { ImageLightbox } from "@/components/ImageLightbox";

interface Product {
  id: string;
  nameAr: string;
  descriptionAr: string;
  price: number;
  stock: number;
  images: string | null;
  isFlashDeal: boolean;
  rating: number;
  reviewCount: number;
  category: {
    id: string;
    nameAr: string;
  };
}

interface Vendor {
  id: string;
  storeName: string;
  storeNameAr: string;
  businessName: string;
  logo: string | null;
  coverImage: string | null;
  storeBio: string | null;
  storeBioAr: string | null;
  storeThemeColor: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  youtubeUrl: string | null;
  description: string | null;
  rating: number;
  totalProducts: number;
  totalOrders: number;
}

export default function VendorProductsPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params?.vendorId as string;
  
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high" | "popular">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);
  const [lightboxProductName, setLightboxProductName] = useState("");

  const { addItem } = useCartStore();
  const { addToWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    fetchVendorData();
  }, [vendorId]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, selectedCategory, sortBy]);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vendor/${vendorId}/products`);
      
      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }

      const data = await response.json();
      console.log('Vendor data:', data.vendor);
      console.log('Vendor logo:', data.vendor?.logo);
      console.log('Vendor cover:', data.vendor?.coverImage);
      setVendor(data.vendor);
      setProducts(data.products);
      setFilteredProducts(data.products);
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ أثناء جلب المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // البحث
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.descriptionAr?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // التصفية حسب الفئة
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category.id === selectedCategory);
    }

    // الترتيب
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "popular":
        filtered.sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount));
        break;
      case "newest":
      default:
        // Already sorted by newest in API
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.nameAr,
      price: product.price,
      image: product.images?.split(',')[0] || '',
    });
    toast.success('تم إضافة المنتج إلى السلة');
  };

  const handleBuyNow = (product: Product) => {
    addItem({
      id: product.id,
      name: product.nameAr,
      price: product.price,
      image: product.images?.split(',')[0] || '',
    });
    router.push('/checkout');
    toast.success('جاري التوجيه للدفع...');
  };

  const handleToggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      toast.info('تمت الإزالة من المفضلة');
    } else {
      addToWishlist(product.id);
      toast.success('تم إضافة المنتج للمفضلة');
    }
  };

  const handleImageClick = (product: Product, initialIndex: number = 0) => {
    const images = product.images ? product.images.split(',') : [];
    if (images.length > 0) {
      setLightboxImages(images);
      setLightboxInitialIndex(initialIndex);
      setLightboxProductName(product.nameAr);
      setIsLightboxOpen(true);
    }
  };

  const categories = products.reduce((acc, product) => {
    if (!acc.find(c => c.id === product.category.id)) {
      acc.push(product.category);
    }
    return acc;
  }, [] as Array<{ id: string; nameAr: string }>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-3 sm:p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 font-semibold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-3 sm:p-4">
        <Card className="max-w-md w-full rounded-lg sm:rounded-xl">
          <CardContent className="p-4 sm:p-6 md:p-8 text-center">
            <Store className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto text-gray-400 mb-2 sm:mb-3 md:mb-4" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">المتجر غير موجود</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">عذراً، لم نتمكن من العثور على هذا المتجر</p>
            <Button onClick={() => router.push('/')} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-sm sm:text-base">
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const vendorDisplayName = vendor.storeNameAr || vendor.storeName || vendor.businessName;
  const themeColor = vendor.storeThemeColor || "#9333ea";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header Banner with Cover Image */}
      <div className="relative text-white overflow-hidden">
        {vendor.coverImage ? (
          <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[400px]">
            <Image
              src={vendor.coverImage}
              alt={vendorDisplayName}
              fill
              className="object-cover"
              priority
              fetchPriority="high"
              loading="eager"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
          </div>
        ) : (
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[400px]">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
                                 radial-gradient(circle at 80% 80%, white 1px, transparent 1px)`,
                backgroundSize: '100px 100px',
                animation: 'movePattern 20s linear infinite',
              }}></div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-3 sm:px-4 relative" style={{ marginTop: vendor.coverImage ? '-40px' : '0' }}>
          <div className="bg-transparent rounded-2xl p-3 sm:p-4 md:p-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 md:gap-6 text-center sm:text-right">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-white p-2 sm:p-2.5 shadow-lg ring-4 ring-purple-100">
                  {vendor.logo ? (
                    <Image
                      src={vendor.logo}
                      alt={vendorDisplayName}
                      width={128}
                      height={128}
                      quality={95}
                      className="w-full h-full object-contain rounded-full"
                      priority
                      fetchPriority="high"
                      loading="eager"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                      <Store className="w-12 h-12 sm:w-14 sm:h-14 text-purple-600" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 sm:mb-3 mt-4 sm:mt-6">
                  {vendorDisplayName}
                </h1>
                {(vendor.storeBioAr || vendor.storeBio) && (
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2 max-w-2xl mx-auto sm:mx-0">
                    {vendor.storeBioAr || vendor.storeBio}
                  </p>
                )}
                
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-yellow-50 rounded-lg px-3 py-1.5 sm:py-2">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-gray-900 text-sm sm:text-base">{vendor.rating.toFixed(1)}</span>
                    <span className="text-gray-600 text-xs sm:text-sm">تقييم</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-purple-50 rounded-lg px-3 py-1.5 sm:py-2">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    <span className="font-bold text-gray-900 text-sm sm:text-base">{vendor.totalProducts}</span>
                    <span className="text-gray-600 text-xs sm:text-sm">منتج</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-pink-50 rounded-lg px-3 py-1.5 sm:py-2">
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                    <span className="font-bold text-gray-900 text-sm sm:text-base">{vendor.totalOrders}+</span>
                    <span className="text-gray-600 text-xs sm:text-sm">طلب</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!vendor.coverImage && (
          <div className="relative -mt-1">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 md:h-16">
              <path d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z" 
                    fill="#fdf4ff" opacity="1"></path>
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <Card className="mb-4 sm:mb-6 md:mb-8 shadow-lg border-2 border-purple-100 rounded-lg sm:rounded-xl">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="w-full relative">
                <Search className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  type="text"
                  placeholder="ابحث عن منتج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-8 sm:pr-10 h-9 sm:h-10 md:h-12 text-sm sm:text-base md:text-lg border-2 border-purple-200 focus:border-purple-500"
                />
              </div>

              <div className="flex gap-1.5 sm:gap-2 md:gap-3">
                {categories.length > 0 && (
                  <select
                    value={selectedCategory || ""}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="flex-1 h-9 sm:h-10 md:h-12 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base border-2 border-purple-200 rounded-md focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">كل الفئات</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nameAr}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 h-9 sm:h-10 md:h-12 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base border-2 border-purple-200 rounded-md focus:border-purple-500 focus:outline-none"
                >
                  <option value="newest">الأحدث</option>
                  <option value="price-low">السعر: الأقل أولاً</option>
                  <option value="price-high">السعر: الأعلى أولاً</option>
                  <option value="popular">الأكثر شعبية</option>
                </select>

                <div className="flex gap-1 sm:gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12"
                  >
                    <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12"
                  >
                    <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 text-gray-600">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-semibold text-xs sm:text-sm md:text-base">
                عرض {filteredProducts.length} من {products.length} منتج
              </span>
            </div>
          </CardContent>
        </Card>

        {filteredProducts.length === 0 ? (
          <Card className="p-6 sm:p-8 md:p-12 text-center rounded-lg sm:rounded-xl">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto text-gray-400 mb-2 sm:mb-3 md:mb-4" />
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">لا توجد منتجات</h3>
            <p className="text-sm sm:text-base text-gray-600">
              {searchQuery || selectedCategory 
                ? "حاول تغيير معايير البحث" 
                : "لم يتم إضافة منتجات بعد"}
            </p>
          </Card>
        ) : (
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
              : "flex flex-col gap-4"
          }>
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-300 overflow-hidden"
              >
                <CardContent className="p-0">
                  <div 
                    className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
                    onClick={() => handleImageClick(product, 0)}
                  >
                    {product.images ? (
                      <>
                        <Image
                          src={product.images.split(',')[0]}
                          alt={product.nameAr}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {product.images.split(',').length > 1 && (
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <span>{product.images.split(',').length}</span>
                            <span>صور</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                            <Search className="w-6 h-6 text-purple-600" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                        <Package className="w-20 h-20 text-purple-300" />
                      </div>
                    )}

                    <div className="absolute top-1.5 sm:top-2 md:top-3 right-1.5 sm:right-2 md:right-3 flex flex-col gap-1 sm:gap-1.5 md:gap-2">
                      {product.isFlashDeal && (
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-0.5 md:py-1 rounded-full text-[8px] sm:text-[10px] md:text-xs font-bold shadow-lg flex items-center gap-0.5 sm:gap-1">
                          <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 fill-current" />
                          <span className="hidden sm:inline">عرض خاص</span>
                          <span className="inline sm:hidden">عرض</span>
                        </div>
                      )}
                      {product.stock < 5 && product.stock > 0 && (
                        <div className="bg-red-500 text-white px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-0.5 md:py-1 rounded-full text-[8px] sm:text-[10px] md:text-xs font-bold shadow-lg">
                          <span className="hidden sm:inline">آخر {product.stock} قطع</span>
                          <span className="inline sm:hidden">{product.stock}</span>
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="bg-gray-900 text-white px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-0.5 md:py-1 rounded-full text-[8px] sm:text-[10px] md:text-xs font-bold shadow-lg">
                          <span className="hidden sm:inline">نفذت الكمية</span>
                          <span className="inline sm:hidden">نفذ</span>
                        </div>
                      )}
                    </div>

                    <div className="absolute top-1.5 sm:top-2 md:top-3 left-1.5 sm:left-2 md:left-3 flex flex-col gap-1 sm:gap-1.5 md:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleWishlist(product);
                        }}
                        className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-pink-50 transition-colors"
                      >
                        <Heart 
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${isInWishlist(product.id) ? 'fill-pink-500 text-pink-500' : 'text-gray-600'}`} 
                        />
                      </button>
                    </div>
                  </div>

                  <div className="p-2 sm:p-3 md:p-4">
                    <div className="text-[10px] sm:text-xs text-purple-600 font-semibold mb-1">
                      {product.category.nameAr}
                    </div>

                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2 line-clamp-2 hover:text-purple-600 transition-colors min-h-[2rem] sm:min-h-[2.5rem] md:min-h-[3.5rem]">
                        {product.nameAr}
                      </h3>
                    </Link>

                    {product.reviewCount > 0 && (
                      <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                i < Math.round(product.rating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] sm:text-sm text-gray-600">
                          ({product.reviewCount})
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="text-sm sm:text-lg md:text-2xl font-black text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
                        {product.price.toLocaleString('ar-EG')} ج.م
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 sm:gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow(product);
                        }}
                        disabled={product.stock === 0}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold h-9 sm:h-10 md:h-11 text-xs sm:text-sm shadow-lg"
                      >
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 ml-2 fill-current" />
                        <span>اشتري الآن</span>
                      </Button>
                      
                      <div className="flex gap-1.5 sm:gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          disabled={product.stock === 0}
                          variant="outline"
                          className="flex-1 border-2 border-purple-300 hover:bg-purple-50 text-purple-700 font-bold h-8 sm:h-9 text-[10px] sm:text-xs px-2"
                        >
                          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                          <span className="hidden sm:inline">للسلة</span>
                          <span className="inline sm:hidden">سلة</span>
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/products/${product.id}`);
                          }}
                          variant="outline"
                          className="border-2 border-purple-300 hover:bg-purple-50 h-8 sm:h-9 w-8 sm:w-9 p-0"
                        >
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxInitialIndex}
        productName={lightboxProductName}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />

      <style jsx global>{`
        @keyframes movePattern {
          0% { background-position: 0 0; }
          100% { background-position: 100px 100px; }
        }
      `}</style>
    </div>
  );
}
