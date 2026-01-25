"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DeliveryStaff {
  id: string;
  name: string;
  phone: string;
}

interface OrderActionsProps {
  orderId: string;
  currentStatus: string;
  deliveryStaffList: DeliveryStaff[];
  currentDeliveryStaffId: string | null;
}

export function OrderActions({
  orderId,
  currentStatus,
  deliveryStaffList,
  currentDeliveryStaffId,
}: OrderActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(currentDeliveryStaffId || "");

  const updateOrderStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      toast.success("تم تحديث حالة الطلب بنجاح");
      router.refresh();
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الطلب");
    } finally {
      setLoading(false);
    }
  };

  const assignDeliveryStaff = async () => {
    if (!selectedStaff) {
      toast.error("يرجى اختيار موظف التوصيل");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/assign-delivery`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryStaffId: selectedStaff }),
      });

      if (!response.ok) throw new Error("Failed to assign delivery staff");

      toast.success("تم تعيين موظف التوصيل بنجاح");
      router.refresh();
    } catch (error) {
      toast.error("حدث خطأ أثناء تعيين موظف التوصيل");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Actions */}
      <div className="space-y-3">
        {currentStatus === "PENDING" && (
          <div className="flex gap-2">
            <Button
              onClick={() => updateOrderStatus("CONFIRMED")}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              تأكيد الطلب
            </Button>
            <Button
              onClick={() => updateOrderStatus("CANCELLED")}
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              إلغاء الطلب
            </Button>
          </div>
        )}

        {currentStatus === "CONFIRMED" && (
          <Button
            onClick={() => updateOrderStatus("PREPARING")}
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
            بدء التحضير
          </Button>
        )}

        {currentStatus === "PREPARING" && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="deliveryStaff" className="mb-2 block">
                اختر موظف التوصيل
              </Label>
              <select
                id="deliveryStaff"
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- اختر موظف --</option>
                {deliveryStaffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} - {staff.phone}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={assignDeliveryStaff}
              disabled={loading || !selectedStaff}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              تعيين وإرسال للتوصيل
            </Button>
          </div>
        )}

        {currentStatus === "OUT_FOR_DELIVERY" && (
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-center">
            <p className="text-teal-800 font-medium">
              الطلب في الطريق - بانتظار التسليم من موظف التوصيل
            </p>
          </div>
        )}

        {currentStatus === "DELIVERED" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-800 font-medium">✅ تم تسليم الطلب بنجاح</p>
          </div>
        )}

        {currentStatus === "REJECTED" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800 font-medium">❌ تم رفض الطلب من قبل العميل</p>
          </div>
        )}

        {currentStatus === "CANCELLED" && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-800 font-medium">الطلب ملغي</p>
          </div>
        )}
      </div>
    </div>
  );
}
