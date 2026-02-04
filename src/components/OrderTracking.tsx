"use client";

import { CheckCircle, Clock, Package, Truck, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface OrderTrackingProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    status: string;
    orderNumber: string;
    createdAt: string;
    updatedAt: string;
  };
}

const orderSteps = [
  { key: "PENDING", label: "تم استلام الطلب", icon: Clock },
  { key: "CONFIRMED", label: "تم تأكيد الطلب", icon: CheckCircle },
  { key: "PREPARING", label: "جاري التحضير", icon: Package },
  { key: "OUT_FOR_DELIVERY", label: "في الطريق للتوصيل", icon: Truck },
  { key: "DELIVERED", label: "تم التوصيل", icon: CheckCircle },
];

export default function OrderTracking({ isOpen, onClose, order }: OrderTrackingProps) {
  const getCurrentStepIndex = () => {
    if (order.status === "CANCELLED" || order.status === "REJECTED") {
      return -1;
    }
    return orderSteps.findIndex((step) => step.key === order.status);
  };

  const currentStepIndex = getCurrentStepIndex();
  const isCancelled = order.status === "CANCELLED" || order.status === "REJECTED";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 border-purple-500/30 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            تتبع الطلب #{order.orderNumber.slice(0, 8)}
          </DialogTitle>
          <p className="text-gray-400 text-center text-sm">
            تاريخ الطلب: {new Date(order.createdAt).toLocaleDateString('ar-EG')}
          </p>
        </DialogHeader>

        <div className="mt-6">
          {isCancelled ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-red-500/20 rounded-full p-4 mb-4">
                <XCircle className="h-12 w-12 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-red-400 mb-2">تم إلغاء الطلب</h3>
              <p className="text-gray-400 text-center">
                {order.status === "CANCELLED" ? "تم إلغاء الطلب بناءً على طلبك" : "تم رفض الطلب من قبل التاجر"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {orderSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.key} className="relative flex items-start">
                    {/* الخط الرأسي */}
                    {index < orderSteps.length - 1 && (
                      <div
                        className={`absolute right-[19px] top-10 w-0.5 h-12 ${
                          isCompleted ? "bg-purple-500" : "bg-gray-700"
                        }`}
                      />
                    )}

                    {/* الأيقونة */}
                    <div
                      className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        isCompleted
                          ? "bg-purple-500 border-purple-500"
                          : "bg-gray-800 border-gray-700"
                      } ${isCurrent ? "ring-4 ring-purple-500/30 animate-pulse" : ""}`}
                    >
                      <StepIcon className={`h-5 w-5 ${isCompleted ? "text-white" : "text-gray-500"}`} />
                    </div>

                    {/* النص */}
                    <div className="mr-4 flex-1">
                      <h4
                        className={`font-bold mb-1 ${
                          isCompleted ? "text-white" : "text-gray-500"
                        } ${isCurrent ? "text-purple-400" : ""}`}
                      >
                        {step.label}
                      </h4>
                      {isCompleted && (
                        <p className="text-sm text-gray-400">
                          {isCurrent ? "الحالة الحالية" : "تم"}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* معلومات إضافية */}
          <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">آخر تحديث:</span>
              <span className="text-white font-medium">
                {new Date(order.updatedAt).toLocaleString('ar-EG')}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
