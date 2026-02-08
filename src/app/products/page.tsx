"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProductCardPro } from "@/components/ProductCardPro";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";

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

  // Read category from URL on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, sortBy]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch products
      const productsRes = await fetch('/api/products');
      const productsJson = await productsRes.json();
      let productsData = productsJson.products || [];

      // Apply filters
      if (selectedCategory) {
        productsData = productsData.filter((p: Product) => p.categoryId === selectedCategory);
      }

      // Apply sorting
      if (sortBy === 'price-asc') {
        productsData.sort((a: Product, b: Product) => a.price - b.price);
      } else if (sortBy === 'price-desc') {
        productsData.sort((a: Product, b: Product) => b.price - a.price);
      } else if (sortBy === 'name') {
        productsData.sort((a: Product, b: Product) => a.nameAr.localeCompare(b.nameAr));
      }

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

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesSearch && matchesPrice;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setPriceRange([0, 10000]);
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-4">
            جميع المنتجات
          </h1>
          <p className="text-gray-500 text-lg">
            تصفح مجموعتنا الكاملة من المنتجات
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="bg-white border-purple-200 shadow-lg sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-purple-600" />
                    الفلاتر
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
                    <X className="w-4 h-4" />
                    مسح الكل
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
            <div className="mb-6 space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="ابحث عن المنتجات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10 bg-white border-purple-200 text-gray-700 placeholder:text-gray-400 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 text-white"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
              </div>

              {/* Active Filters */}
              {(selectedCategory || searchQuery || priceRange[1] < 10000) && (
                <div className="flex flex-wrap gap-2">
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white text-sm rounded-full">
                      {categories.find(c => c.id === selectedCategory)?.nameAr}
                      <button onClick={() => setSelectedCategory(null)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white text-sm rounded-full">
                      بحث: {searchQuery}
                      <button onClick={() => setSearchQuery("")}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="mb-6 text-gray-600">
              عرض {filteredProducts.length} من {products.length} منتج
            </div>

            {/* Products */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card className="bg-white border-purple-200 shadow-lg p-12 text-center">
                <p className="text-xl text-gray-600 mb-4">لا توجد منتجات تطابق البحث</p>
                <Button onClick={clearFilters} className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 text-white">
                  مسح الفلاتر
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
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
