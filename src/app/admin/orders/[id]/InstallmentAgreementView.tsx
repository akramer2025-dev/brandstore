"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Send, 
  CheckCircle, 
  XCircle,
  User,
  IdCard,
  Camera,
  PenTool,
  FileSignature,
  Printer,
  Mail,
  MessageSquare
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface InstallmentAgreementViewProps {
  agreement: {
    id: string;
    agreementNumber: string;
    status: string;
    nationalIdImage: string | null;
    nationalIdBack: string | null;
    selfieImage: string | null;
    signature: string | null;
    fullName: string | null;
    nationalId: string | null;
    address: string | null;
    totalAmount: number;
    downPayment: number;
    numberOfInstallments: number;
    monthlyInstallment: number;
    acceptedTerms: boolean;
    createdAt: Date;
  };
  orderId: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
}

const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-800", icon: FileText },
  APPROVED: { label: "تمت الموافقة", color: "bg-green-100 text-green-800", icon: CheckCircle },
  REJECTED: { label: "مرفوض", color: "bg-red-100 text-red-800", icon: XCircle },
  COMPLETED: { label: "مكتمل", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
};

export function InstallmentAgreementView({ 
  agreement, 
  orderId,
  customerEmail,
  customerPhone 
}: InstallmentAgreementViewProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const statusInfo = statusLabels[agreement.status] || statusLabels.PENDING;
  const StatusIcon = statusInfo.icon;

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const response = await fetch(`/api/admin/installment-agreements/${agreement.id}/approve`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("فشل في الموافقة");

      toast.success("✅ تمت الموافقة على الاتفاقية بنجاح");
      window.location.reload();
    } catch (error) {
      toast.error("❌ حدث خطأ أثناء الموافقة");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt("سبب الرفض:");
    if (!reason) return;

    setIsRejecting(true);
    try {
      const response = await fetch(`/api/admin/installment-agreements/${agreement.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error("فشل في الرفض");

      toast.success("✅ تم رفض الاتفاقية");
      window.location.reload();
    } catch (error) {
      toast.error("❌ حدث خطأ أثناء الرفض");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!customerPhone) {
      toast.error("رقم الهاتف غير متوفر");
      return;
    }

    const message = `
مرحباً! 🎉

تم ${agreement.status === 'APPROVED' ? 'الموافقة على' : 'مراجعة'} اتفاقية التقسيط الخاصة بك

📋 رقم الاتفاقية: ${agreement.agreementNumber}
💰 المبلغ الإجمالي: ${agreement.totalAmount} جنيه
💳 الدفعة المقدمة: ${agreement.downPayment} جنيه
📅 عدد الأقساط: ${agreement.numberOfInstallments}
💵 القسط الشهري: ${agreement.monthlyInstallment} جنيه

للمزيد من التفاصيل، يرجى زيارة الموقع.
    `.trim();

    window.open(
      `https://wa.me/${customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
    toast.success("تم فتح WhatsApp");
  };

  const handleDownloadPDF = async () => {
    toast.info("جاري تحضير الملف...");
    try {
      const response = await fetch(`/api/admin/installment-agreements/${agreement.id}/pdf`);
      if (!response.ok) throw new Error("فشل في تحميل الملف");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `اتفاقية-تقسيط-${agreement.agreementNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("✅ تم تحميل الملف");
    } catch (error) {
      toast.error("❌ حدث خطأ أثناء تحميل الملف");
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success("تم فتح نافذة الطباعة");
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="w-6 h-6 text-purple-600" />
              اتفاقية التقسيط
            </CardTitle>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.color}`}>
              <StatusIcon className="w-5 h-5" />
              <span className="font-bold">{statusInfo.label}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">رقم الاتفاقية</p>
              <p className="font-bold text-lg">{agreement.agreementNumber}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">تاريخ الإنشاء</p>
              <p className="font-bold text-lg">
                {new Date(agreement.createdAt).toLocaleDateString("ar-EG")}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {agreement.status === "PENDING" && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  {isApproving ? "جاري الموافقة..." : "الموافقة على الاتفاقية"}
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isRejecting}
                  variant="destructive"
                >
                  <XCircle className="w-4 h-4 ml-2" />
                  {isRejecting ? "جاري الرفض..." : "رفض الاتفاقية"}
                </Button>
              </>
            )}
            
            <Button onClick={handleDownloadPDF} variant="outline">
              <Download className="w-4 h-4 ml-2" />
              تحميل PDF
            </Button>

            <Button onClick={handlePrint} variant="outline">
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>

            {customerPhone && (
              <Button onClick={handleSendWhatsApp} variant="outline" className="bg-green-50">
                <MessageSquare className="w-4 h-4 ml-2" />
                إرسال واتساب
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            بيانات العميل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">الاسم الكامل</p>
              <p className="font-bold">{agreement.fullName || "غير متوفر"}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">رقم البطاقة</p>
              <p className="font-bold">{agreement.nationalId || "غير متوفر"}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">العنوان</p>
              <p className="font-bold">{agreement.address || "غير متوفر"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-green-600" />
            تفاصيل التقسيط
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">المبلغ الإجمالي</p>
              <p className="font-bold text-xl">{agreement.totalAmount} جنيه</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">الدفعة المقدمة</p>
              <p className="font-bold text-xl">{agreement.downPayment} جنيه</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">عدد الأقساط</p>
              <p className="font-bold text-xl">{agreement.numberOfInstallments}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">القسط الشهري</p>
              <p className="font-bold text-xl">{agreement.monthlyInstallment} جنيه</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl print:break-inside-avoid">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IdCard className="w-6 h-6 text-orange-600" />
            المستندات والصور
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selfie Image */}
            {agreement.selfieImage && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <Camera className="w-5 h-5 text-orange-600" />
                  <span>صورة شخصية (سيلفي)</span>
                </div>
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-orange-200">
                  <Image
                    src={agreement.selfieImage}
                    alt="صورة شخصية"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {/* National ID Front */}
            {agreement.nationalIdImage && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <IdCard className="w-5 h-5 text-blue-600" />
                  <span>البطاقة (الوجه الأمامي)</span>
                </div>
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-200">
                  <Image
                    src={agreement.nationalIdImage}
                    alt="البطاقة الأمامي"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {/* National ID Back */}
            {agreement.nationalIdBack && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <IdCard className="w-5 h-5 text-blue-600" />
                  <span>البطاقة (الوجه الخلفي)</span>
                </div>
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-200">
                  <Image
                    src={agreement.nationalIdBack}
                    alt="البطاقة الخلفي"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {/* Signature */}
            {agreement.signature && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <PenTool className="w-5 h-5 text-purple-600" />
                  <span>التوقيع الإلكتروني</span>
                </div>
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-purple-200">
                  <Image
                    src={agreement.signature}
                    alt="التوقيع"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Terms Acceptance */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {agreement.acceptedTerms ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <span className="font-medium">
                {agreement.acceptedTerms
                  ? "✅ العميل وافق على الشروط والأحكام"
                  : "❌ العميل لم يوافق على الشروط بعد"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:break-inside-avoid,
          .print\\:break-inside-avoid * {
            visibility: visible;
          }
          button,
          nav,
          aside {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
