"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download, Printer, FileText, ArrowRight } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface Agreement {
  id: string;
  agreementNumber: string;
  fullName: string | null;
  nationalId: string | null;
  address: string | null;
  totalAmount: number;
  downPayment: number;
  numberOfInstallments: number;
  monthlyInstallment: number;
  interestRate: number;
  status: string;
  createdAt: string;
  selfieImage: string | null;
  nationalIdImage: string | null;
  nationalIdBack: string | null;
  signature: string | null;
  user: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  order?: {
    id: string;
    items: Array<{
      quantity: number;
      price: number;
      product: {
        nameAr: string | null;
        name: string;
      };
    }>;
  };
}

export default function InstallmentAgreementViewPage() {
  const params = useParams();
  const router = useRouter();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAgreement();
  }, [params.id]);

  const fetchAgreement = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/installment-agreements/${params.id}`);
      if (!response.ok) throw new Error("فشل في تحميل الاتفاقية");
      
      const data = await response.json();
      setAgreement(data.agreement);
    } catch (error) {
      console.error("Error fetching agreement:", error);
      toast.error("حدث خطأ أثناء تحميل الاتفاقية");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      toast.info("جاري تحضير ملف PDF...");
      
      // Use browser's print to PDF functionality
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("يرجى السماح للنوافذ المنبثقة");
        return;
      }

      const content = printRef.current?.innerHTML || "";
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>اتفاقية تقسيط - ${agreement?.agreementNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              direction: rtl;
              padding: 30px;
              background: white;
              color: #111827;
              line-height: 1.8;
            }
            .container { max-width: 900px; margin: 0 auto; }
            .header {
              text-align: center;
              padding: 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 16px;
              margin-bottom: 40px;
              color: white;
            }
            .logo { max-width: 180px; background: white; padding: 15px; border-radius: 12px; margin-bottom: 20px; }
            .agreement-number {
              background: white;
              color: #667eea;
              padding: 12px 30px;
              border-radius: 50px;
              font-size: 18px;
              font-weight: bold;
              display: inline-block;
              margin: 10px 0;
            }
            .section {
              margin-bottom: 30px;
              padding: 25px;
              background: #f9fafb;
              border-radius: 12px;
              border: 2px solid #e5e7eb;
            }
            .section h2 {
              color: #667eea;
              border-bottom: 3px solid #667eea;
              padding-bottom: 12px;
              margin-bottom: 20px;
              font-size: 22px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 15px 20px;
              margin-bottom: 8px;
              background: white;
              border-radius: 8px;
              border-right: 4px solid #667eea;
            }
            .info-label { font-weight: 600; color: #4b5563; }
            .info-value { font-weight: 700; color: #667eea; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 15px;
              font-weight: 600;
              text-align: center;
            }
            td {
              padding: 12px 15px;
              text-align: center;
              background: white;
              border-bottom: 1px solid #e5e7eb;
            }
            tr:nth-child(even) td { background: #f9fafb; }
            .terms {
              background: #fef3c7;
              padding: 25px;
              border-radius: 12px;
              border: 2px solid #f59e0b;
              margin-top: 30px;
            }
            .terms-title { color: #92400e; font-size: 20px; font-weight: bold; margin-bottom: 15px; }
            .terms-content { color: #78350f; line-height: 2; }
            .image-container {
              page-break-before: always;
              margin: 30px 0;
              text-align: center;
              padding: 25px;
              background: white;
              border-radius: 12px;
            }
            .image-label {
              font-weight: bold;
              color: #667eea;
              margin-bottom: 15px;
              font-size: 18px;
              display: block;
            }
            img { max-width: 100%; border-radius: 12px; }
            .footer {
              margin-top: 60px;
              padding: 30px;
              text-align: center;
              background: #f9fafb;
              border-radius: 12px;
              border: 2px dashed #d1d5db;
            }
            @media print {
              body { padding: 15px; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Auto-trigger print dialog after a short delay
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("حدث خطأ أثناء إنشاء ملف PDF");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الاتفاقية...</p>
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <Card className="p-12 text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">الاتفاقية غير موجودة</h3>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة
        </Button>
      </Card>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-700" };
      case "APPROVED":
        return { label: "موافق عليها", color: "bg-green-100 text-green-700" };
      case "REJECTED":
        return { label: "مرفوضة", color: "bg-red-100 text-red-700" };
      case "COMPLETED":
        return { label: "مكتملة", color: "bg-blue-100 text-blue-700" };
      default:
        return { label: status, color: "bg-gray-100 text-gray-700" };
    }
  };

  const statusInfo = getStatusInfo(agreement.status);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Action Buttons - Hidden in Print */}
      <div className="no-print flex gap-3 mb-6 justify-between items-center">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة
        </Button>
        
        <div className="flex gap-3">
          <Button onClick={handlePrint} variant="outline" className="bg-white">
            <Printer className="w-4 h-4 ml-2" />
            طباعة
          </Button>
          
          <Button onClick={handleDownloadPDF} className="bg-purple-600 hover:bg-purple-700">
            <Download className="w-4 h-4 ml-2" />
            تحميل PDF
          </Button>
        </div>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="print-content">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-2xl p-8 mb-8 text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="mb-6">
              <Image 
                src="/rimo-full-logo.png" 
                alt="Rimo Store" 
                width={180} 
                height={60}
                className="mx-auto bg-white rounded-xl p-4 shadow-lg"
              />
            </div>
            <h1 className="text-4xl font-bold mb-4">📄 اتفاقية تقسيط</h1>
            <div className="bg-white text-purple-600 px-8 py-3 rounded-full inline-block font-bold text-lg shadow-lg">
              🔖 رقم الاتفاقية: {agreement.agreementNumber}
            </div>
            <p className="mt-4 text-purple-100">
              📅 تاريخ الإصدار: {new Date(agreement.createdAt).toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <div className="mt-4">
              <span className={`${statusInfo.color} px-6 py-2 rounded-full font-bold text-sm`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="text-purple-700 flex items-center gap-2">
              👤 بيانات العميل
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border-r-4 border-purple-500">
                <p className="text-sm text-gray-600">الاسم الكامل</p>
                <p className="font-bold text-lg text-purple-700">{agreement.fullName || "غير متوفر"}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-r-4 border-purple-500">
                <p className="text-sm text-gray-600">رقم البطاقة الشخصية</p>
                <p className="font-bold text-lg text-purple-700">{agreement.nationalId || "غير متوفر"}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-r-4 border-purple-500">
                <p className="text-sm text-gray-600">رقم الهاتف</p>
                <p className="font-bold text-lg text-purple-700">{agreement.user?.phone || "غير متوفر"}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-r-4 border-purple-500">
                <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                <p className="font-bold text-lg text-purple-700">{agreement.user?.email || "غير متوفر"}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-r-4 border-purple-500 md:col-span-2">
                <p className="text-sm text-gray-600">العنوان الكامل</p>
                <p className="font-bold text-lg text-purple-700">{agreement.address || "غير متوفر"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Details */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="text-green-700 flex items-center gap-2">
              💰 تفاصيل التقسيط
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">المبلغ الإجمالي</p>
                <p className="font-bold text-2xl text-purple-700">{agreement.totalAmount.toLocaleString()} ج.م</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">الدفعة المقدمة</p>
                <p className="font-bold text-2xl text-green-700">{agreement.downPayment.toLocaleString()} ج.م</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">المبلغ المتبقي</p>
                <p className="font-bold text-2xl text-red-700">
                  {(agreement.totalAmount - agreement.downPayment).toLocaleString()} ج.م
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">القسط الشهري</p>
                <p className="font-bold text-2xl text-blue-700">{agreement.monthlyInstallment.toLocaleString()} ج.م</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">عدد الأقساط</p>
                <p className="font-bold text-2xl text-orange-700">{agreement.numberOfInstallments} شهر</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">نسبة الفائدة</p>
                <p className="font-bold text-2xl text-yellow-700">{agreement.interestRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Order */}
        {agreement.order && agreement.order.items.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="text-blue-700 flex items-center gap-2">
                🛍️ تفاصيل المنتجات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
                      <th className="p-4 text-right rounded-tr-lg">المنتج</th>
                      <th className="p-4 text-center">الكمية</th>
                      <th className="p-4 text-center">السعر</th>
                      <th className="p-4 text-center rounded-tl-lg">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agreement.order.items.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="p-4 text-right font-semibold">
                          {item.product.nameAr || item.product.name}
                        </td>
                        <td className="p-4 text-center">{item.quantity}</td>
                        <td className="p-4 text-center">{item.price.toLocaleString()} ج.م</td>
                        <td className="p-4 text-center font-bold text-purple-700">
                          {(item.quantity * item.price).toLocaleString()} ج.م
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold">
                      <td colSpan={3} className="p-4 text-right text-lg">
                        الإجمالي الكلي
                      </td>
                      <td className="p-4 text-center text-xl">
                        {agreement.totalAmount.toLocaleString()} ج.م
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Installment Schedule */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardTitle className="text-orange-700 flex items-center gap-2">
              📋 جدول الأقساط المتوقعة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
                    <th className="p-4 rounded-tr-lg">رقم القسط</th>
                    <th className="p-4">تاريخ الاستحقاق</th>
                    <th className="p-4">المبلغ المستحق</th>
                    <th className="p-4 rounded-tl-lg">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: agreement.numberOfInstallments }, (_, index) => {
                    const dueDate = new Date(agreement.createdAt);
                    dueDate.setMonth(dueDate.getMonth() + index + 1);
                    return (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="p-4 text-center font-bold text-purple-700">القسط {index + 1}</td>
                        <td className="p-4 text-center">
                          {dueDate.toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td className="p-4 text-center font-bold">{agreement.monthlyInstallment.toLocaleString()} ج.م</td>
                        <td className="p-4 text-center">
                          <span className={index === 0 ? "text-orange-600 font-semibold" : "text-gray-500"}>
                            {index === 0 ? "⏳ قيد الانتظار" : "⏱️ مستقبلي"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        <Card className="mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-300">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              ✅ الشروط والأحكام
            </CardTitle>
          </CardHeader>
          <CardContent className="text-orange-900 space-y-3">
            <p><strong>• الالتزام بالسداد:</strong> يلتزم العميل بسداد الأقساط الشهرية في مواعيدها المحددة دون تأخير.</p>
            <p><strong>• غرامة التأخير:</strong> في حالة التأخير عن سداد أي قسط، سيتم احتساب غرامة تأخير بنسبة 5% من قيمة القسط.</p>
            <p><strong>• الإلغاء والاسترجاع:</strong> لا يمكن إلغاء الاتفاقية بعد استلام المنتجات إلا بموافقة الإدارة.</p>
            <p><strong>• الملكية:</strong> تظل ملكية المنتجات للشركة حتى سداد كامل المبلغ المستحق.</p>
            <p><strong>• الموافقة:</strong> بالتوقيع، يقر العميل بقراءة وفهم جميع الشروط والموافقة عليها.</p>
            <div className="mt-6 pt-4 border-t-2 border-dashed border-orange-400">
              <p className="font-bold text-lg">✍️ تم التوقيع والموافقة بتاريخ:</p>
              <p className="mt-2">
                {new Date(agreement.createdAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Documents and Images */}
        {(agreement.selfieImage || agreement.nationalIdImage || agreement.nationalIdBack || agreement.signature) && (
          <Card className="mb-6">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
              <CardTitle className="text-pink-700 flex items-center gap-2">
                📸 المستندات والصور المرفقة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {agreement.selfieImage && (
                  <div className="text-center bg-white p-4 rounded-lg shadow">
                    <p className="font-bold text-purple-700 mb-3">🤳 صورة شخصية (سيلفي)</p>
                    <Image
                      src={agreement.selfieImage}
                      alt="صورة شخصية"
                      width={400}
                      height={400}
                      className="rounded-lg border-2 border-purple-200 w-full"
                    />
                  </div>
                )}
                
                {agreement.nationalIdImage && (
                  <div className="text-center bg-white p-4 rounded-lg shadow">
                    <p className="font-bold text-purple-700 mb-3">🪪 البطاقة الشخصية (الأمامية)</p>
                    <Image
                      src={agreement.nationalIdImage}
                      alt="البطاقة الأمامية"
                      width={400}
                      height={400}
                      className="rounded-lg border-2 border-purple-200 w-full"
                    />
                  </div>
                )}
                
                {agreement.nationalIdBack && (
                  <div className="text-center bg-white p-4 rounded-lg shadow">
                    <p className="font-bold text-purple-700 mb-3">🪪 البطاقة الشخصية (الخلفية)</p>
                    <Image
                      src={agreement.nationalIdBack}
                      alt="البطاقة الخلفية"
                      width={400}
                      height={400}
                      className="rounded-lg border-2 border-purple-200 w-full"
                    />
                  </div>
                )}
                
                {agreement.signature && (
                  <div className="text-center bg-white p-4 rounded-lg shadow">
                    <p className="font-bold text-purple-700 mb-3">✍️ التوقيع الإلكتروني</p>
                    <Image
                      src={agreement.signature}
                      alt="التوقيع"
                      width={400}
                      height={200}
                      className="rounded-lg border-2 border-purple-200 w-full"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300">
          <CardContent className="p-6 text-center text-gray-600">
            <p className="font-bold text-lg text-gray-800 mb-3">🔒 مستند قانوني معتمد</p>
            <p className="mb-2">📄 هذا المستند تم إنشاؤه إلكترونياً ويعتبر ملزماً قانونياً بين الطرفين</p>
            <p className="mb-2">
              📅 تاريخ إصدار المستند: {new Date().toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="mb-2">🏢 <strong>شركة ريمو للتجارة الإلكترونية</strong></p>
            <p className="mb-2">🌐 الموقع: <strong>www.remostore.net</strong></p>
            <p className="mb-2">📧 البريد: support@remostore.net</p>
            <p className="mt-4 text-purple-700 font-bold">
              ⚖️ جميع الحقوق محفوظة © {new Date().getFullYear()} - Rimo Store
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
