"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface DeliveryStaff {
  id: string;
  name: string;
  currentLat: number | null;
  currentLng: number | null;
  lastLocationUpdate: Date | null;
}

interface DeliveryLocationMapProps {
  deliveryStaff: DeliveryStaff;
  orderId: string;
}

export function DeliveryLocationMap({ deliveryStaff, orderId }: DeliveryLocationMapProps) {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(
    deliveryStaff.currentLat && deliveryStaff.currentLng 
      ? { lat: deliveryStaff.currentLat, lng: deliveryStaff.currentLng }
      : null
  );
  const [lastUpdate, setLastUpdate] = useState(deliveryStaff.lastLocationUpdate);

  useEffect(() => {
    // Poll for location updates every 30 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/delivery-staff/${deliveryStaff.id}/location`);
        if (response.ok) {
          const data = await response.json();
          if (data.currentLat && data.currentLng) {
            setLocation({ lat: data.currentLat, lng: data.currentLng });
            setLastUpdate(data.lastLocationUpdate);
          }
        }
      } catch (error) {
        console.error("Failed to fetch location:", error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [deliveryStaff.id]);

  const getMapUrl = () => {
    if (!location) return null;
    // Using Google Maps static API (you can replace with your preferred map service)
    return `https://www.google.com/maps?q=${location.lat},${location.lng}&output=embed`;
  };

  const getDirectionsUrl = () => {
    if (!location) return null;
    return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
  };

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return "غير محدد";
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "الآن";
    if (minutes === 1) return "منذ دقيقة";
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return "منذ ساعة";
    if (hours < 24) return `منذ ${hours} ساعة`;
    return new Date(date).toLocaleDateString("ar-EG");
  };

  if (!location) {
    return (
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-teal-600" />
            الموقع الحالي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <Navigation className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">
              الموقع غير متاح حالياً
            </p>
            <p className="text-sm text-gray-500 mt-2">
              سيتم تحديث الموقع عندما يبدأ موظف التوصيل رحلته
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-teal-600" />
            الموقع الحالي
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {formatLastUpdate(lastUpdate)}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Map Embed */}
        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
          <iframe
            src={getMapUrl() || ''}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        {/* Location Info */}
        <div className="bg-teal-50 p-3 rounded-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-1">الإحداثيات</p>
              <p className="text-sm font-mono text-gray-800">
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            </div>
            <a
              href={getDirectionsUrl() || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded-lg transition-colors"
            >
              <Navigation className="w-3 h-3" />
              اتجاهات
            </a>
          </div>
        </div>

        {/* Live Status */}
        <div className="flex items-center gap-2 justify-center">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-600">يتم التحديث كل 30 ثانية</span>
        </div>
      </CardContent>
    </Card>
  );
}
