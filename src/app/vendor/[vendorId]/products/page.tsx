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
  Award,
  Sparkles,
  Heart,
  ShoppingCart,
  ArrowRight,
  CheckCircle,
  Truck,
  Shield,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";

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

  const handleToggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      toast.info('تمت الإزالة من المفضلة');
    } else {
      addToWishlist(product.id);
      toast.success('تم إضافة المنتج للمفضلة');
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Store className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">المتجر غير موجود</h2>
            <p className="text-gray-600 mb-6">عذراً، لم نتمكن من العثور على هذا المتجر</p>
            <Button onClick={() => router.push('/')} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
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
        {/* Cover Image or Gradient Background */}
        {vendor.coverImage ? (
          <div className="relative h-80 sm:h-96 md:h-[400px] lg:h-[450px]">
            <Image
              src={vendor.coverImage}
              alt={vendorDisplayName}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
          </div>
        ) : (
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 h-80 sm:h-96 md:h-[400px]">
            {/* Animated Background Pattern */}
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

        <div className="container mx-auto px-4 relative" style={{ marginTop: vendor.coverImage ? '-100px' : '0' }}>
          {/* Profile Section */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-4 md:px-8 py-6 md:py-8">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
                {/* Logo */}
                <div className="flex-shrink-0 -mt-20 md:-mt-24">
                  <div className="w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full bg-white p-2 shadow-2xl ring-4 md:ring-8 ring-white">
                    {vendor.logo ? (
                      <Image
                        src={vendor.logo}
                        alt={vendorDisplayName}
                        width={176}
                        height={176}
                        className="w-full h-full object-cover rounded-full"
                        priority
                        sizes="(max-width: 768px) 144px, 176px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                        <Store className="w-16 h-16 text-purple-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-right w-full">
                  <div className="flex flex-col md:flex-row items-center md:items-center md:justify-between gap-3">
                    <div className="w-full md:w-auto">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2">
                        {vendorDisplayName}
                      </h1>
                      {(vendor.storeBioAr || vendor.storeBio) && (
                        <p className="text-sm sm:text-base text-gray-600 mb-3 max-w-2xl mx-auto md:mx-0">
                          {vendor.storeBioAr || vendor.storeBio}
                        </p>
                      )}
                    </div>

                    {/* Social Links */}
                    {(vendor.facebookUrl || vendor.instagramUrl || vendor.twitterUrl || vendor.youtubeUrl) && (
                      <div className="flex items-center gap-2 mt-4 md:mt-0">
                        {vendor.facebookUrl && (
                          <a
                            href={vendor.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-all"
                          >
                            <Facebook className="w-5 h-5" />
                          </a>
                        )}
                        {vendor.instagramUrl && (
                          <a
                            href={vendor.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center justify-center text-white transition-all"
                          >
                            <Instagram className="w-5 h-5" />
                          </a>
                        )}
                        {vendor.twitterUrl && (
                          <a
                            href={vendor.twitterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center text-white transition-all"
                          >
                            <Twitter className="w-5 h-5" />
                          </a>
                        )}
                        {vendor.youtubeUrl && (
                          <a
                            href={vendor.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-all"
                          >
                            <Youtube className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 md:gap-4 mt-4">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-gray-900">{vendor.rating.toFixed(1)}</span>
                      <span className="text-gray-600 text-sm">تقييم</span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                      <Package className="w-5 h-5 text-purple-600" />
                      <span className="font-bold text-gray-900">{vendor.totalProducts}</span>
                      <span className="text-gray-600 text-sm">منتج</span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                      <ShoppingBag className="w-5 h-5 text-pink-600" />
                      <span className="font-bold text-gray-900">{vendor.totalOrders}+</span>
                      <span className="text-gray-600 text-sm">طلب</span>
                    </div>

                    <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full px-4 py-2">
                      <Award className="w-5 h-5" />
                      <span className="font-bold text-sm">بائع موثوق</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Shape - Only if no cover image */}
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
      <div className="container mx-auto px-4 py-8">
        {/* Features Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-2 border-purple-100 hover:border-purple-300 transition-all">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">جودة مضمونة</h3>
                <p className="text-sm text-gray-600">منتجات أصلية 100%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 hover:border-purple-300 transition-all">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">شحن سريع</h3>
                <p className="text-sm text-gray-600">توصيل لجميع المحافظات</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 hover:border-purple-300 transition-all">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">دفع آمن</h3>
                <p className="text-sm text-gray-600">حماية كاملة للمدفوعات</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 shadow-lg border-2 border-purple-100">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="ابحث عن منتج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 h-12 text-lg border-2 border-purple-200 focus:border-purple-500"
                />
              </div>

              {/* Category Filter */}
              {categories.length > 0 && (
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="h-12 px-4 border-2 border-purple-200 rounded-md focus:border-purple-500 focus:outline-none"
                >
                  <option value="">كل الفئات</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameAr}
                    </option>
                  ))}
                </select>
              )}

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-12 px-4 border-2 border-purple-200 rounded-md focus:border-purple-500 focus:outline-none"
              >
                <option value="newest">الأحدث</option>
                <option value="price-low">السعر: الأقل أولاً</option>
                <option value="price-high">السعر: الأعلى أولاً</option>
                <option value="popular">الأكثر شعبية</option>
              </select>

              {/* View Mode */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-12 w-12"
                >
                  <LayoutGrid className="w-5 h-5" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-12 w-12"
                >
                  <Grid3x3 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 flex items-center gap-2 text-gray-600">
              <Filter className="w-4 h-4" />
              <span className="font-semibold">
                عرض {filteredProducts.length} من {products.length} منتج
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-20 h-20 mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory 
                ? "حاول تغيير معايير البحث" 
                : "لم يتم إضافة منتجات بعد"}
            </p>
          </Card>
        ) : (
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "flex flex-col gap-4"
          }>
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-300 overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {product.images ? (
                      <Image
                        src={product.images.split(',')[0]}
                        alt={product.nameAr}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                        <Package className="w-20 h-20 text-purple-300" />
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      {product.isFlashDeal && (
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          عرض خاص
                        </div>
                      )}
                      {product.stock < 5 && product.stock > 0 && (
                        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          آخر {product.stock} قطع
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          نفذت الكمية
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleToggleWishlist(product)}
                        className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-pink-50 transition-colors"
                      >
                        <Heart 
                          className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-pink-500 text-pink-500' : 'text-gray-600'}`} 
                        />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Category */}
                    <div className="text-xs text-purple-600 font-semibold mb-1">
                      {product.category.nameAr}
                    </div>

                    {/* Title */}
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 hover:text-purple-600 transition-colors min-h-[3.5rem]">
                        {product.nameAr}
                      </h3>
                    </Link>

                    {/* Rating */}
                    {product.reviewCount > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.round(product.rating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({product.reviewCount})
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-2xl font-black text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
                        {product.price.toLocaleString('ar-EG')} ج.م
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
                      >
                        <ShoppingCart className="w-4 h-4 ml-2" />
                        أضف للسلة
                      </Button>
                      <Button
                        onClick={() => router.push(`/products/${product.id}`)}
                        variant="outline"
                        className="border-2 border-purple-300 hover:bg-purple-50"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes movePattern {
          0% { background-position: 0 0; }
          100% { background-position: 100px 100px; }
        }
      `}</style>
    </div>
  );
}
