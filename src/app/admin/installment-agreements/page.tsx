import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Eye,
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Calendar,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import { BackButton } from "@/components/BackButton";

const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  APPROVED: { label: "تمت الموافقة", color: "bg-green-100 text-green-800", icon: CheckCircle },
  REJECTED: { label: "مرفوض", color: "bg-red-100 text-red-800", icon: XCircle },
  COMPLETED: { label: "مكتمل", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
};

export default async function InstallmentAgreementsPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const agreements = await prisma.installmentAgreement.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          phone: true,
          email: true,
        },
      },
      order: {
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <BackButton />
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              📄 اتفاقيات التقسيط
            </h1>
            <p className="text-gray-600 mt-2">
              عرض وإدارة جميع اتفاقيات التقسيط
            </p>
          </div>
          <div className="bg-purple-100 px-6 py-3 rounded-lg">
            <p className="text-sm text-purple-700">إجمالي الاتفاقيات</p>
            <p className="text-3xl font-bold text-purple-900">{agreements.length}</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">قيد المراجعة</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {agreements.filter(a => a.status === 'PENDING').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تمت الموافقة</p>
                <p className="text-2xl font-bold text-green-700">
                  {agreements.filter(a => a.status === 'APPROVED').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مرفوض</p>
                <p className="text-2xl font-bold text-red-700">
                  {agreements.filter(a => a.status === 'REJECTED').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مكتمل</p>
                <p className="text-2xl font-bold text-blue-700">
                  {agreements.filter(a => a.status === 'COMPLETED').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agreements List */}
      <div className="grid grid-cols-1 gap-4">
        {agreements.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              لا توجد اتفاقيات حتى الآن
            </h3>
            <p className="text-gray-500">
              سيتم عرض اتفاقيات التقسيط هنا عند إنشائها من قبل العملاء
            </p>
          </Card>
        ) : (
          agreements.map((agreement) => {
            const statusInfo = statusLabels[agreement.status] || statusLabels.PENDING;
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={agreement.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Right Side: Agreement Info */}
                    <div className="flex-1 space-y-3">
                      {/* Agreement Number & Status */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-bold text-purple-700">
                          {agreement.agreementNumber}
                        </h3>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-sm font-semibold">{statusInfo.label}</span>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="font-medium">
                          {agreement.fullName || agreement.user.name || agreement.user.username}
                        </span>
                        {agreement.user.phone && (
                          <span className="text-sm">• {agreement.user.phone}</span>
                        )}
                      </div>

                      {/* Financial Info */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                        <div className="bg-purple-50 p-2 rounded">
                          <p className="text-gray-600">المبلغ الإجمالي</p>
                          <p className="font-bold text-purple-700">
                            {agreement.totalAmount.toFixed(2)} ج.م
                          </p>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <p className="text-gray-600">الدفعة المقدمة</p>
                          <p className="font-bold text-green-700">
                            {agreement.downPayment.toFixed(2)} ج.م
                          </p>
                        </div>
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-gray-600">القسط الشهري</p>
                          <p className="font-bold text-blue-700">
                            {agreement.monthlyInstallment.toFixed(2)} ج.م
                          </p>
                        </div>
                        <div className="bg-orange-50 p-2 rounded">
                          <p className="text-gray-600">عدد الأقساط</p>
                          <p className="font-bold text-orange-700">
                            {agreement.numberOfInstallments} شهر
                          </p>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>تاريخ الإنشاء: {new Date(agreement.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                        {agreement.order && (
                          <div>
                            <span>رقم الطلب: </span>
                            <Link 
                              href={`/admin/orders/${agreement.order.id}`}
                              className="text-purple-600 hover:underline font-medium"
                            >
                              {agreement.order.orderNumber}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Left Side: Actions */}
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      {/* View PDF Button */}
                      <Button
                        asChild
                        className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto"
                      >
                        <a
                          href={`/api/admin/installment-agreements/${agreement.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="w-4 h-4 ml-2" />
                          عرض الاتفاقية PDF
                        </a>
                      </Button>

                      {/* View Order Button (if exists) */}
                      {agreement.order && (
                        <Button
                          asChild
                          variant="outline"
                          className="w-full md:w-auto"
                        >
                          <Link href={`/admin/orders/${agreement.order.id}`}>
                            <FileText className="w-4 h-4 ml-2" />
                            عرض الطلب
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
