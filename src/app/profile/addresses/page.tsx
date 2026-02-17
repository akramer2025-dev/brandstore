"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Edit, Trash2, Star, Phone, Home, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddressForm from "@/components/AddressForm";

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

export default function AddressesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchAddresses();
    }
  }, [session]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/addresses");
      
      if (!response.ok) {
        throw new Error("فشل في جلب العناوين");
      }

      const data = await response.json();
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("حدث خطأ أثناء جلب العناوين");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العنوان؟")) {
      return;
    }

    try {
      setDeleting(id);
      const response = await fetch(`/api/addresses?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("فشل في حذف العنوان");
      }

      toast.success("تم حذف العنوان بنجاح");
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("حدث خطأ أثناء حذف العنوان");
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const address = addresses.find(a => a.id === id);
      if (!address) return;

      const response = await fetch("/api/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          isDefault: true,
        }),
      });

      if (!response.ok) {
        throw new Error("فشل في تحديث العنوان");
      }

      toast.success("تم تعيين العنوان كافتراضي");
      fetchAddresses();
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("حدث خطأ أثناء تحديث العنوان");
    }
  };

  const handleSaveAddress = async (addressData: any) => {
    try {
      const url = editingAddress ? "/api/addresses" : "/api/addresses";
      const method = editingAddress ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingAddress ? { id: editingAddress.id, ...addressData } : addressData),
      });

      if (!response.ok) {
        throw new Error("فشل في حفظ العنوان");
      }

      toast.success(editingAddress ? "تم تحديث العنوان بنجاح" : "تم إضافة العنوان بنجاح");
      setShowAddDialog(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("حدث خطأ أثناء حفظ العنوان");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-8 w-8 text-primary" />
              عناويني المحفوظة
            </h1>
            <p className="text-gray-600 mt-2">إدارة عناوين التوصيل الخاصة بك</p>
          </div>
          
          <Button 
            onClick={() => {
              setEditingAddress(null);
              setShowAddDialog(true);
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-5 w-5 ml-2" />
            إضافة عنوان جديد
          </Button>
        </div>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                لا توجد عناوين محفوظة
              </h3>
              <p className="text-gray-500 mb-6">
                أضف عنوان توصيل لتسريع عملية الشراء
              </p>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Plus className="h-5 w-5 ml-2" />
                أضف عنوان الآن
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {addresses.map((address) => (
              <Card 
                key={address.id}
                className={`hover:shadow-lg transition-all duration-300 ${
                  address.isDefault ? 'border-2 border-primary shadow-md' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Home className="h-5 w-5 text-primary" />
                      {address.title}
                      {address.isDefault && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          افتراضي
                        </span>
                      )}
                    </CardTitle>
                    
                    <div className="flex gap-2">
                      {!address.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                          className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingAddress(address);
                          setShowAddDialog(true);
                        }}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(address.id)}
                        disabled={deleting === address.id}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        {deleting === address.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{address.fullName}</p>
                      <p className="text-gray-600 text-sm">
                        {[
                          address.street,
                          address.buildingNumber && `عمارة ${address.buildingNumber}`,
                          address.floorNumber && `طابق ${address.floorNumber}`,
                          address.apartmentNumber && `شقة ${address.apartmentNumber}`,
                        ].filter(Boolean).join(', ')}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {address.district}, {address.city}, {address.governorate}
                      </p>
                      {address.landmark && (
                        <p className="text-gray-500 text-xs mt-1">
                          بجوار {address.landmark}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {address.phone}
                    </div>
                    {address.alternativePhone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {address.alternativePhone}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Address Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? "تعديل العنوان" : "إضافة عنوان جديد"}
              </DialogTitle>
            </DialogHeader>
            
            <AddressForm
              initialData={editingAddress || undefined}
              onSave={handleSaveAddress}
              onCancel={() => {
                setShowAddDialog(false);
                setEditingAddress(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
