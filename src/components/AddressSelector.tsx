'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Plus, Check, Edit, Home, Building, Phone } from 'lucide-react';

interface SavedAddress {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  alternativePhone?: string;
  governorate: string;
  city: string;
  district: string;
  street: string;
  buildingNumber?: string;
  floorNumber?: string;
  apartmentNumber?: string;
  landmark?: string;
  postalCode?: string;
  isDefault: boolean;
}

interface AddressSelectorProps {
  savedAddresses: SavedAddress[];
  selectedAddress: string | null;
  onSelectAddress: (id: string) => void;
  onNewAddress: () => void;
  loading?: boolean;
}

export default function AddressSelector({
  savedAddresses,
  selectedAddress,
  onSelectAddress,
  onNewAddress,
  loading = false
}: AddressSelectorProps) {
  
  return (
    <Card className="bg-gray-800/80 border-teal-500/20">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
            عناوين التوصيل المحفوظة
          </CardTitle>
          <Button
            type="button"
            onClick={onNewAddress}
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Plus className="w-4 h-4 ml-1" />
            إضافة عنوان جديد
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 sm:p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-400">
            جاري تحميل العناوين...
          </div>
        ) : savedAddresses.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">لا توجد عناوين محفوظة</p>
            <Button
              type="button"
              onClick={onNewAddress}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Plus className="w-4 h-4 ml-2" />
              أضف عنوانك الأول
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {savedAddresses.map((address) => (
              <div
                key={address.id}
                onClick={() => onSelectAddress(address.id)}
                className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                  selectedAddress === address.id
                    ? 'border-teal-500 bg-teal-900/30'
                    : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                    selectedAddress === address.id
                      ? 'border-teal-500 bg-teal-500'
                      : 'border-gray-500'
                  }`}>
                    {selectedAddress === address.id && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-4 h-4 text-teal-400" />
                      <h3 className="text-lg font-bold text-white">{address.title}</h3>
                      {address.isDefault && (
                        <span className="text-xs bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded">
                          افتراضي
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1.5 text-sm text-gray-300">
                      <p className="font-medium text-white">{address.fullName}</p>
                      
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{address.phone}</span>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Building className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">
                          {[
                            address.street,
                            address.buildingNumber && `عمارة ${address.buildingNumber}`,
                            address.floorNumber && `ط ${address.floorNumber}`,
                            address.apartmentNumber && `شقة ${address.apartmentNumber}`,
                            address.landmark && `بجوار ${address.landmark}`,
                            address.district,
                            address.city,
                            address.governorate
                          ].filter(Boolean).join(' - ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
