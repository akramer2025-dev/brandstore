'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, Eye, Fuel, Calendar, Settings, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Vehicle {
  id: string;
  vehicleNumber: string;
  type: string;
  condition: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  fuelType: string;
  transmission: string;
  mileage: number | null;
  sellingPrice: number;
  negotiable: boolean;
  allowBankFinancing: boolean;
  featuredImage: string | null;
  viewCount: number;
  vendor: {
    businessNameAr: string | null;
    storeNameAr: string | null;
    rating: number;
  };
}

export default function VehiclesSection() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles?limit=8');
      const data = await response.json();
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل المركبات...</p>
          </div>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return null; // لا تعرض القسم إذا لم يكن هناك مركبات
  }

  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🚗 سيارات وموتوسيكلات للبيع
            </h2>
            <p className="text-gray-600 mt-2">
              اختر من بين مجموعة متنوعة من السيارات والموتوسيكلات الجديدة والمستعملة
            </p>
          </div>
          <Link href="/vehicles">
            <Button variant="outline" className="hidden sm:flex">
              عرض الكل
              <ArrowRight className="w-4 h-4 mr-2" />
            </Button>
          </Link>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicles.map((vehicle) => (
            <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`}>
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden">
                {/* Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {vehicle.featuredImage ? (
                    <Image
                      src={vehicle.featuredImage}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-purple-100">
                      <Car className="w-20 h-20 text-blue-400" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    {vehicle.condition === 'NEW' && (
                      <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        جديد
                      </span>
                    )}
                    {vehicle.allowBankFinancing && (
                      <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        🏦 تمويل
                      </span>
                    )}
                  </div>

                  {/* View Count */}
                  <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {vehicle.viewCount}
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Title */}
                  <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {vehicle.brand} {vehicle.model}
                  </h3>

                  {/* Year & Condition */}
                  <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {vehicle.year} • {vehicle.condition === 'NEW' ? 'جديد' : 'مستعمل'}
                  </p>

                  {/* Specs */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Fuel className="w-4 h-4 text-blue-600" />
                        {vehicle.fuelType === 'PETROL' ? 'بنزين' : 
                         vehicle.fuelType === 'DIESEL' ? 'ديزل' : 
                         vehicle.fuelType === 'ELECTRIC' ? 'كهربائي' : 
                         vehicle.fuelType === 'HYBRID' ? 'هجين' : 'غاز'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Settings className="w-4 h-4 text-purple-600" />
                        {vehicle.transmission === 'AUTOMATIC' ? 'أوتوماتيك' : 'يدوي'}
                      </span>
                    </div>
                    {vehicle.mileage && (
                      <p className="text-xs text-gray-500">
                        📊 {vehicle.mileage.toLocaleString()} كم
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <p className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {vehicle.sellingPrice.toLocaleString()} ج.م
                      </p>
                      {vehicle.negotiable && (
                        <p className="text-xs text-green-600 font-medium">قابل للتفاوض</p>
                      )}
                    </div>
                    {vehicle.allowBankFinancing && (
                      <div className="text-left">
                        <p className="text-xs text-gray-500">قسط شهري من</p>
                        <p className="text-sm font-bold text-blue-600">
                          {Math.round(vehicle.sellingPrice * 0.7 / 60).toLocaleString()} ج.م
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Vendor */}
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500">
                      {vehicle.vendor.businessNameAr || vehicle.vendor.storeNameAr}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Button (Mobile) */}
        <div className="mt-8 text-center sm:hidden">
          <Link href="/vehicles">
            <Button className="w-full max-w-xs">
              عرض جميع المركبات
              <ArrowRight className="w-4 h-4 mr-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
