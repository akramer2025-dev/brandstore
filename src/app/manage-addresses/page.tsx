'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Trash2, MapPin, Phone, Home, Edit } from 'lucide-react';

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

export default function ManageAddressesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchAddresses();
    }
  }, [status, router]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/addresses');
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('فشل تحميل العناوين');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنوان؟')) {
      return;
    }

    setDeletingId(addressId);
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('تم حذف العنوان بنجاح');
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      } else {
        throw new Error('فشل حذف العنوان');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('فشل حذف العنوان');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });

      if (response.ok) {
        toast.success('تم تعيين العنوان الافتراضي');
        fetchAddresses();
      } else {
        throw new Error('فشل تعيين العنوان الافتراضي');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('فشل تعيين العنوان الافتراضي');
    }
  };

  const handleDeleteDuplicates = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع العناوين المكررة؟\nسيتم الاحتفاظ بأول عنوان من كل مجموعة متطابقة.')) {
      return;
    }

    try {
      const response = await fetch('/api/addresses/remove-duplicates', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`تم حذف ${data.deletedCount} عنوان مكرر`);
        fetchAddresses();
      } else {
        throw new Error('فشل حذف العناوين المكررة');
      }
    } catch (error) {
      console.error('Error deleting duplicates:', error);
      toast.error('فشل حذف العناوين المكررة');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // اكتشاف العناوين المكررة
  const duplicatesCount = addresses.reduce((count, addr, index) => {
    const duplicate = addresses.findIndex((a, i) => 
      i < index &&
      a.governorate === addr.governorate &&
      a.city === addr.city &&
      a.district === addr.district &&
      a.street === addr.street &&
      a.buildingNumber === addr.buildingNumber
    );
    return duplicate >= 0 ? count + 1 : count;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            <MapPin className="inline-block ml-2 -mt-1" />
            عناويني المحفوظة
          </h1>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700"
          >
            رجوع
          </button>
        </div>

        {duplicatesCount > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-800 font-medium">
                  ⚠️ تم اكتشاف {duplicatesCount} عنوان مكرر
                </p>
                <p className="text-yellow-600 text-sm mt-1">
                  يمكنك حذف العناوين المكررة للحفاظ على قائمة نظيفة
                </p>
              </div>
              <button
                onClick={handleDeleteDuplicates}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                حذف المكرر
              </button>
            </div>
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <MapPin className="mx-auto h-16 w-16 text-gray-400" />
            <p className="mt-4 text-gray-600">لا توجد عناوين محفوظة</p>
            <button
              onClick={() => router.push('/checkout')}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              أضف عنوان من صفحة الطلب
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => {
              const isDuplicate = addresses.some((a, i) => 
                a.id !== address.id &&
                addresses.findIndex(x => x.id === a.id) < addresses.findIndex(x => x.id === address.id) &&
                a.governorate === address.governorate &&
                a.city === address.city &&
                a.district === address.district &&
                a.street === address.street &&
                a.buildingNumber === address.buildingNumber
              );

              return (
                <div
                  key={address.id}
                  className={`bg-white rounded-lg shadow p-6 ${
                    isDuplicate ? 'border-2 border-yellow-300' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {address.title}
                        </h3>
                        {address.isDefault && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            افتراضي
                          </span>
                        )}
                        {isDuplicate && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            مكرر
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-gray-600">
                        <p className="flex items-center">
                          <Home className="w-4 h-4 ml-2" />
                          {address.fullName}
                        </p>
                        <p className="flex items-center">
                          <Phone className="w-4 h-4 ml-2" />
                          {address.phone}
                          {address.alternativePhone && ` / ${address.alternativePhone}`}
                        </p>
                        <p className="flex items-start">
                          <MapPin className="w-4 h-4 ml-2 mt-1 flex-shrink-0" />
                          <span>
                            {[
                              address.street,
                              address.buildingNumber && `عمارة ${address.buildingNumber}`,
                              address.floorNumber && `طابق ${address.floorNumber}`,
                              address.apartmentNumber && `شقة ${address.apartmentNumber}`,
                              address.landmark && `بجوار ${address.landmark}`,
                              address.district,
                              address.city,
                              address.governorate,
                            ].filter(Boolean).join(', ')}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="text-gray-400 hover:text-blue-600"
                          title="تعيين كافتراضي"
                        >
                          <Home className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(address.id)}
                        disabled={deletingId === address.id}
                        className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                        title="حذف"
                      >
                        {deletingId === address.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
