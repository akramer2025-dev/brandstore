"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ProductCardPro } from "@/components/ProductCardPro";
import { BackButton } from "@/components/BackButton";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, X, Loader2, Grid3x3, List } from "lucide-react";

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
}

interface Category {
  id: string;
  nameAr: string;
  _count: {
    products: number;
  };
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Read category and search from URL on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, sortBy, searchQuery]); // أضفنا searchQuery

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch products - إرسال البحث للـ API
      let apiUrl = '/api/products';
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (selectedCategory) {
        params.append('categoryId', selectedCategory);
      }
      params.append('sortBy', sortBy === 'price-asc' || sortBy === 'price-desc' ? 'price' : sortBy);
      params.append('sortOrder', sortBy === 'price-desc' ? 'desc' : 'asc');
      
      if (params.toString()) {
        apiUrl += '?' + params.toString();
      }
      
      const productsRes = await fetch(apiUrl);
      const productsJson = await productsRes.json();
      const productsData = productsJson.products || [];

      // لا حاجة للفلترة هنا - الـ API يتعامل معها
      setProducts(productsData);

      // Fetch categories
      const categoriesRes = await fetch('/api/categories');
      const categoriesData = await categoriesRes.json();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // فلترة محلية للسعر فقط (الـ API يتعامل مع البحث والفئة)
  const filteredProducts = products.filter((product) => {
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesPrice;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setPriceRange([0, 10000]);
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-24 md:pb-8">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 relative z-10">
        {/* Header with Back Button */}
        <div className="mb-4 sm:mb-6">
          <BackButton showHomeButton className="mb-4" />
          
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-2">
              {searchQuery ? `نتائج البحث 🔍` : 'جميع المنتجات 🛍️'}
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              {searchQuery 
                ? <span>نتائج البحث عن: <span className="font-bold text-purple-600">"{searchQuery}"</span></span>
                : 'تصفح مجموعتنا الكاملة من المنتجات المميزة'
              }
            </p>
          </div>
        </div>

        {/* Categories Quick Filter - شريط الفئات في الأعلى */}
        {categories.length > 0 && (
          <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 shadow-md border border-purple-100">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 ${
                  selectedCategory === null
                    ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                الكل ({products.length})
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.nameAr} ({category._count.products})
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Filters Sidebar - Desktop Only */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="bg-white/90 backdrop-blur-sm border-purple-200 shadow-lg sticky top-24">
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    الفلاتر
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 font-medium">
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    مسح
                  </button>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3">الفئات</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-right px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === null
                          ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white'
                          : 'bg-purple-50 text-gray-700 hover:bg-purple-100'
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span>الكل</span>
                        <span className="text-xs">({products.length})</span>
                      </span>
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-right px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white'
                            : 'bg-purple-50 text-gray-700 hover:bg-purple-100'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{category.nameAr}</span>
                          <span className="text-xs">({category._count.products})</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3">نطاق السعر</h4>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full accent-purple-600"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{priceRange[0]} جنيه</span>
                      <span>{priceRange[1]} جنيه</span>
                    </div>
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3">الترتيب</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="newest">الأحدث</option>
                    <option value="price-asc">السعر: من الأقل للأعلى</option>
                    <option value="price-desc">السعر: من الأعلى للأقل</option>
                    <option value="name">الاسم: أبجدياً</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Search Bar & Mobile Filter Toggle */}
            <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
              <div className="flex gap-2 sm:gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="ابحث عن المنتجات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10 sm:pr-12 bg-white border-purple-200 text-gray-700 placeholder:text-gray-400 focus:ring-purple-500 focus:border-purple-500 h-10 sm:h-11 text-sm sm:text-base rounded-xl"
                  />
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 text-white px-3 sm:px-4 rounded-xl shadow-md"
                >
                  <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>

              {/* Active Filters */}
              {(selectedCategory || searchQuery || priceRange[1] < 10000) && (
                <div className="flex flex-wrap gap-2">
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white text-xs font-medium rounded-full shadow-md">
                      {categories.find(c => c.id === selectedCategory)?.nameAr}
                      <button onClick={() => setSelectedCategory(null)} className="hover:bg-white/20 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white text-xs font-medium rounded-full shadow-md">
                      بحث: {searchQuery}
                      <button onClick={() => setSearchQuery("")} className="hover:bg-white/20 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                عرض <span className="text-purple-600 font-bold">{filteredProducts.length}</span> من <span className="font-bold">{products.length}</span> منتج
              </p>
            </div>

            {/* Products */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">جاري تحميل المنتجات...</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card className="bg-white/90 backdrop-blur-sm border-purple-200 shadow-lg p-8 sm:p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-purple-600" />
                </div>
                <p className="text-lg sm:text-xl text-gray-700 font-bold mb-2">لا توجد منتجات تطابق البحث</p>
                <p className="text-sm text-gray-500 mb-4">جرب تغيير الفلاتر أو البحث بكلمات أخرى</p>
                <Button onClick={clearFilters} className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 text-white rounded-xl shadow-md">
                  مسح الفلاتر
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {filteredProducts.map((product, index) => (
                  <ProductCardPro key={product.id} product={product} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
