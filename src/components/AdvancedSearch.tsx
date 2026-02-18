"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Package, Store, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  fakePrice: number | null;
  category: string;
  brand: string | null;
  inStock: boolean;
  vendor: {
    id: string;
    name: string;
  } | null;
}

interface Vendor {
  id: string;
  storeName: string;
  storeDescription: string | null;
  storeLogo: string | null;
  ownerName: string | null;
  productsCount: number;
}

interface SearchResults {
  products: Product[];
  vendors: Vendor[];
  totalResults: number;
}

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdvancedSearch({ isOpen, onClose }: AdvancedSearchProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResults>({
    products: [],
    vendors: [],
    totalResults: 0,
  });
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'vendors'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // التركيز على input عند الفتح
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setSearchTerm("");
      setResults({ products: [], vendors: [], totalResults: 0 });
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // البحث مع debounce
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim().length < 2) {
        setResults({ products: [], vendors: [], totalResults: 0 });
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/search/unified?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        
        if (data.success) {
          setResults({
            products: data.products || [],
            vendors: data.vendors || [],
            totalResults: data.totalResults || 0,
          });
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // إغلاق عند الضغط على Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const productsToShow = activeTab === 'vendors' ? [] : results.products;
  const vendorsToShow = activeTab === 'products' ? [] : results.vendors;

  const discountPercentage = (product: Product) => {
    if (product.fakePrice && product.fakePrice > product.price) {
      return Math.round(((product.fakePrice - product.price) / product.fakePrice) * 100);
    }
    return 0;
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/95 via-purple-800/95 to-indigo-900/95 rounded-t-2xl sm:rounded-t-3xl p-4 sm:p-6 border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
              <Search className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                البحث المتقدم
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              </h2>
              <p className="text-sm text-gray-300 mt-0.5">ابحث عن المنتجات ومتاجر الشركاء</p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-red-400 hover:bg-red-900/30 w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 w-5 h-5 sm:w-6 sm:h-6 pointer-events-none" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="ابحث عن منتج، فئة، علامة تجارية، أو متجر شريك..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 sm:pr-14 pl-4 h-12 sm:h-14 bg-gray-900/50 border-2 border-cyan-500/50 text-white placeholder:text-gray-400 text-base sm:text-lg rounded-xl sm:rounded-2xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/30 shadow-lg"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Tabs */}
          {results.totalResults > 0 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                الكل ({results.totalResults})
              </button>
              {results.products.length > 0 && (
                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'products'
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  منتجات ({results.products.length})
                </button>
              )}
              {results.vendors.length > 0 && (
                <button
                  onClick={() => setActiveTab('vendors')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'vendors'
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  متاجر ({results.vendors.length})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 bg-gradient-to-b from-gray-900/95 to-gray-800/95 rounded-b-2xl sm:rounded-b-3xl border-2 border-t-0 border-purple-500/30 overflow-y-auto custom-scrollbar">
          <div className="p-4 sm:p-6">
            {/* حالة البحث */}
            {isSearching && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                <p className="text-gray-400 text-lg">جاري البحث...</p>
              </div>
            )}

            {/* لا يوجد نتائج */}
            {!isSearching && searchTerm.length >= 2 && results.totalResults === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-white text-xl font-bold mb-2">لا توجد نتائج</h3>
                <p className="text-gray-400">حاول البحث بكلمات مختلفة</p>
              </div>
            )}

            {/* حالة البداية */}
            {!isSearching && searchTerm.length < 2 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-600/20 to-purple-600/20 rounded-full flex items-center justify-center animate-pulse">
                  <Search className="w-12 h-12 text-cyan-400" />
                </div>
                <h3 className="text-white text-2xl font-bold mb-3">ابحث عن أي شيء!</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  ابحث عن المنتجات المفضلة لديك أو اكتشف متاجر شركائنا المميزة
                </p>
                
                <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                  {['لابتوب', 'موبايل', 'ملابس', 'أحذية', 'ساعات', 'اكسسوارات'].map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => setSearchTerm(keyword)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-800/50 to-indigo-800/50 hover:from-purple-700/50 hover:to-indigo-700/50 text-cyan-400 hover:text-cyan-300 rounded-lg text-sm border border-purple-500/30 hover:border-cyan-500/50 transition-all active:scale-95 shadow-lg"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* نتائج المنتجات */}
            {!isSearching && productsToShow.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-bold text-white">المنتجات</h3>
                  <span className="text-sm text-gray-400">({productsToShow.length})</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {productsToShow.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        router.push(`/products/${product.id}`);
                        onClose();
                      }}
                      className="group bg-gradient-to-br from-gray-800/50 to-gray-700/50 hover:from-cyan-900/30 hover:to-blue-900/30 border-2 border-gray-700/50 hover:border-cyan-500/50 rounded-xl p-3 sm:p-4 transition-all duration-300 active:scale-95 shadow-lg hover:shadow-cyan-500/20 text-right"
                    >
                      <div className="flex gap-3">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-900/50">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {!product.inStock && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                              <span className="text-red-400 text-xs font-bold">نفذ</span>
                            </div>
                          )}
                          {discountPercentage(product) > 0 && (
                            <div className="absolute top-1 left-1 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
                              -{discountPercentage(product)}%
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm sm:text-base font-semibold mb-1 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                            {product.name}
                          </h4>
                          
                          {product.vendor && (
                            <p className="text-xs text-purple-400 mb-1 flex items-center gap-1">
                              <Store className="w-3 h-3" />
                              {product.vendor.name}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-cyan-400 text-base sm:text-lg font-bold">
                              {product.price.toFixed(0)} ج.م
                            </span>
                            {product.fakePrice && product.fakePrice > product.price && (
                              <span className="text-gray-500 text-xs line-through">
                                {product.fakePrice.toFixed(0)} ج.م
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {product.category && (
                              <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded">
                                {product.category}
                              </span>
                            )}
                            {product.brand && (
                              <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded">
                                {product.brand}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 group-hover:-translate-x-1 transition-all flex-shrink-0 mt-2" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* نتائج المتاجر */}
            {!isSearching && vendorsToShow.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Store className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">متاجر الشركاء</h3>
                  <span className="text-sm text-gray-400">({vendorsToShow.length})</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {vendorsToShow.map((vendor) => (
                    <button
                      key={vendor.id}
                      onClick={() => {
                        router.push(`/vendors/${vendor.id}`);
                        onClose();
                      }}
                      className="group bg-gradient-to-br from-purple-800/30 to-indigo-800/30 hover:from-purple-700/40 hover:to-indigo-700/40 border-2 border-purple-500/30 hover:border-purple-400/50 rounded-xl p-4 transition-all duration-300 active:scale-95 shadow-lg hover:shadow-purple-500/30 text-right"
                    >
                      <div className="flex gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-900/50 border-2 border-purple-500/30">
                          {vendor.storeLogo ? (
                            <img
                              src={vendor.storeLogo}
                              alt={vendor.storeName}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600">
                              <Store className="w-8 h-8 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-base sm:text-lg font-bold mb-1 group-hover:text-purple-300 transition-colors line-clamp-1">
                            {vendor.storeName}
                          </h4>
                          
                          {vendor.ownerName && (
                            <p className="text-sm text-gray-400 mb-2">
                              المالك: {vendor.ownerName}
                            </p>
                          )}
                          
                          {vendor.storeDescription && (
                            <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                              {vendor.storeDescription}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs">
                            <div className="bg-green-600/30 text-green-300 px-3 py-1 rounded-full flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {vendor.productsCount} منتج
                            </div>
                            {vendor.productsCount > 50 && (
                              <div className="bg-amber-600/30 text-amber-300 px-3 py-1 rounded-full flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                متجر نشط
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 group-hover:-translate-x-1 transition-all flex-shrink-0 mt-2" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #3b82f6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #2563eb);
        }
      `}</style>
    </div>
  );
}
