"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Store, Package, TrendingUp, MapPin, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  images: string | null;
  price: number;
  originalPrice: number | null;
  stock: number;
}

interface Vendor {
  id: string;
  storeName: string;
  storeDescription: string | null;
  address: string | null;
  phone: string | null;
  totalSales: number;
  products: Product[];
}

export default function VendorPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id as string;
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendor();
  }, [vendorId]);

  const fetchVendor = async () => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}`);
      const data = await response.json();
      
      if (data.success) {
        setVendor(data.vendor);
      }
    } catch (error) {
      console.error('Error fetching vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFirstImage = (images: string | null) => {
    if (!images) return '/placeholder-product.jpg';
    const imageArray = images.split(',');
    return imageArray[0] || '/placeholder-product.jpg';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Store className="w-20 h-20 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">المتجر غير موجود</h2>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Store Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-2xl p-6 sm:p-8 border-2 border-purple-500/30 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Store className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {vendor.storeName}
              </h1>
              
              {vendor.storeDescription && (
                <p className="text-gray-300 mb-4">{vendor.storeDescription}</p>
              )}
              
              <div className="flex flex-wrap gap-4">
                {vendor.address && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{vendor.address}</span>
                  </div>
                )}
                
                {vendor.phone && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{vendor.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-bold">{vendor.totalSales} مبيعات</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">منتجات المتجر</h2>
            <span className="text-gray-400">({vendor.products.length})</span>
          </div>
        </div>

        {vendor.products.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 rounded-2xl">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">لا توجد منتجات حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {vendor.products.map((product) => (
              <button
                key={product.id}
                onClick={() => router.push(`/products/${product.id}`)}
                className="group bg-gradient-to-br from-gray-800/50 to-gray-700/50 hover:from-cyan-900/30 hover:to-blue-900/30 border-2 border-gray-700/50 hover:border-cyan-500/50 rounded-xl overflow-hidden transition-all duration-300 active:scale-95 shadow-lg hover:shadow-cyan-500/20"
              >
                <div className="aspect-square relative overflow-hidden bg-gray-900/50">
                  <img
                    src={getFirstImage(product.images)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <span className="text-red-400 font-bold">نفذ</span>
                    </div>
                  )}
                </div>
                
                <div className="p-3">
                  <h3 className="text-white text-sm font-semibold mb-2 line-clamp-2 text-right">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 text-lg font-bold">
                      {product.price.toFixed(0)} ج.م
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-gray-500 text-xs line-through">
                        {product.originalPrice.toFixed(0)} ج.م
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
