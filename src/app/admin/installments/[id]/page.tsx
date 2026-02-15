'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

type InstallmentStatus =
  | 'PENDING'
  | 'DOCUMENTS_COMPLETE'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED';

interface Agreement {
  id: string;
  agreementNumber: string;
  status: InstallmentStatus;
  totalAmount: number;
  downPayment: number;
  numberOfInstallments: number;
  monthlyInstallment: number;
  interestRate: number;
  nationalIdImage: string | null;
  signature: string | null;
  selfieImage: string | null;
  fullName: string | null;
  nationalId: string | null;
  address: string | null;
  acceptedTerms: boolean;
  acceptedAt: string | null;
  ip: string | null;
  userAgent: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  verificationNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    image: string | null;
    createdAt: string;
  };
  order: {
    id: string;
    orderNumber: string;  
    status: string;
    totalAmount: number;
    shippingAddress: any;
    createdAt: string;
    items: Array<{
      id: string;
      quantity: number;
      price: number;
      product: {
        id: string;
        name: string;
        images: string[];
      };
    }>;
  } | null;
}

export default function InstallmentDetailPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const agreementId = params.id as string;

  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (sessionStatus === 'authenticated') {
      fetchAgreement();
    }
  }, [sessionStatus, agreementId]);

  const fetchAgreement = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/installments/${agreementId}`);
      const data = await response.json();

      if (data.success) {
        setAgreement(data.agreement);
        setVerificationNotes(data.agreement.verificationNotes || '');
      } else {
        toast.error('فشل في جلب الاتفاقية');
        router.push('/admin/installments');
      }
    } catch (error) {
      console.error('Error fetching agreement:', error);
      toast.error('حدث خطأ في جلب الاتفاقية');
    } finally {
      setLoading(false);
    }
  };

  const updateAgreementStatus = async (newStatus: InstallmentStatus) => {
    if (!agreement) return;

    if (newStatus === 'REJECTED' && !rejectionReason.trim()) {
      toast.error('يجب إدخال سبب الرفض');
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/installments/${agreementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          verificationNotes,
          rejectionReason: newStatus === 'REJECTED' ? rejectionReason : null
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('تم تحديث حالة الاتفاقية بنجاح');
        setAgreement(data.agreement);
      } else {
        toast.error(data.error || 'فشل في تحديث الاتفاقية');
      }
    } catch (error) {
      console.error('Error updating agreement:', error);
      toast.error('حدث خطأ في تحديث الاتفاقية');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: InstallmentStatus) => {
    const statusConfig = {
      PENDING: { label: 'في الانتظار', color: 'bg-yellow-500' },
      DOCUMENTS_COMPLETE: { label: 'جاهز للمراجعة', color: 'bg-purple-500' },
      UNDER_REVIEW: { label: 'قيد المراجعة', color: 'bg-blue-500' },
      APPROVED: { label: 'موافق عليه ✅', color: 'bg-green-500' },
      REJECTED: { label: 'مرفوض ❌', color: 'bg-red-500' },
      EXPIRED: { label: 'منتهي', color: 'bg-gray-500' }
    };

    const config = statusConfig[status];
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">الاتفاقية غير موجودة</p>
            <Button
              onClick={() => router.push('/admin/installments')}
              className="mt-4"
            >
              العودة للقائمة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/installments')}
            className="mb-2"
          >
            ← العودة للقائمة
          </Button>
          <h1 className="text-3xl font-bold">مراجعة اتفاقية التقسيط</h1>
          <p className="text-muted-foreground mt-1">
            رقم الاتفاقية: <span className="font-mono">{agreement.agreementNumber}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(agreement.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* المستندات المطلوبة */}
          <Card>
            <CardHeader>
              <CardTitle>📸 المستندات المرفوعة</CardTitle>
              <CardDescription>جميع المستندات المطلوبة للاتفاقية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* البطاقة الشخصية */}
              <div>
                <Label className="text-base font-semibold">1. صورة البطاقة الشخصية</Label>
                {agreement.nationalIdImage ? (
                  <div className="mt-2 relative group">
                    <Image
                      src={agreement.nationalIdImage}
                      alt="National ID"
                      width={400}
                      height={250}
                      className="rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition"
                      onClick={() => setImagePreview(agreement.nationalIdImage)}
                    />
                    <Button
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                      onClick={() => window.open(agreement.nationalIdImage!, '_blank')}
                    >
                      🔍 عرض بالحجم الكامل
                    </Button>
                  </div>
                ) : (
                  <p className="text-red-500 text-sm mt-2">❌ لم يتم رفع الصورة</p>
                )}
              </div>

              <Separator />

              {/* التوقيع */}
              <div>
                <Label className="text-base font-semibold">2. التوقيع الإلكتروني</Label>
                {agreement.signature ? (
                  <div className="mt-2 relative group">
                    <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <Image
                        src={agreement.signature}
                        alt="Signature"
                        width={300}
                        height={150}
                        className="mx-auto cursor-pointer"
                        onClick={() => setImagePreview(agreement.signature)}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-red-500 text-sm mt-2">❌ لم يتم التوقيع</p>
                )}
              </div>

              <Separator />

              {/* الصورة الشخصية */}
              <div>
                <Label className="text-base font-semibold">3. الصورة الشخصية (سيلفي)</Label>
                {agreement.selfieImage ? (
                  <div className="mt-2 relative group">
                    <Image
                      src={agreement.selfieImage}
                      alt="Selfie"
                      width={300}
                      height={300}
                      className="rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition"
                      onClick={() => setImagePreview(agreement.selfieImage)}
                    />
                    <Button
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                      onClick={() => window.open(agreement.selfieImage!, '_blank')}
                    >
                      🔍 عرض بالحجم الكامل
                    </Button>
                  </div>
                ) : (
                  <p className="text-red-500 text-sm mt-2">❌ لم يتم رفع الصورة</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* بيانات العميل */}
          <Card>
            <CardHeader>
              <CardTitle>👤 بيانات العميل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">الاسم الكامل</Label>
                  <p className="font-medium">{agreement.fullName || 'غير محدد'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">الرقم القومي</Label>
                  <p className="font-mono font-medium">{agreement.nationalId || 'غير محدد'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">البريد الإلكتروني</Label>
                  <p className="font-medium">{agreement.user.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">رقم الهاتف</Label>
                  <p className="font-medium">{agreement.user.phone || 'غير محدد'}</p>
                </div>
              </div>
              {agreement.address && (
                <div>
                  <Label className="text-xs text-muted-foreground">العنوان</Label>
                  <p className="font-medium">{agreement.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* تفاصيل التقسيط */}
          <Card>
            <CardHeader>
              <CardTitle>💰 تفاصيل التقسيط</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Label className="text-xs text-muted-foreground">المبلغ الإجمالي</Label>
                  <p className="text-2xl font-bold text-blue-600">
                    {agreement.totalAmount.toFixed(2)} ج
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <Label className="text-xs text-muted-foreground">المقدم (30%)</Label>
                  <p className="text-2xl font-bold text-green-600">
                    {agreement.downPayment.toFixed(2)} ج
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <Label className="text-xs text-muted-foreground">عدد الأقساط</Label>
                  <p className="text-2xl font-bold text-purple-600">
                    {agreement.numberOfInstallments} شهر
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <Label className="text-xs text-muted-foreground">القسط الشهري</Label>
                  <p className="text-2xl font-bold text-orange-600">
                    {agreement.monthlyInstallment.toFixed(2)} ج
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <Label className="text-xs text-muted-foreground">نسبة الفائدة</Label>
                <p className="text-lg font-bold">{agreement.interestRate}%</p>
              </div>
            </CardContent>
          </Card>

          {/* معلومات إضافية */}
          <Card>
            <CardHeader>
              <CardTitle>🔍 معلومات إضافية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">IP Address:</span>
                <span className="font-mono">{agreement.ip || 'غير متوفر'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">User Agent:</span>
                <span className="font-mono text-xs">{agreement.userAgent?.substring(0, 50) || 'غير متوفر'}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">تاريخ الإنشاء:</span>
                <span>{new Date(agreement.createdAt).toLocaleString('ar-EG')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">آخر تحديث:</span>
                <span>{new Date(agreement.updatedAt).toLocaleString('ar-EG')}</span>
              </div>
              {agreement.acceptedTerms && agreement.acceptedAt && (
                <div className="flex justify-between text-green-600">
                  <span>✅ تم قبول الشروط:</span>
                  <span>{new Date(agreement.acceptedAt).toLocaleString('ar-EG')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* إجراءات */}
          <Card>
            <CardHeader>
              <CardTitle>⚡ الإجراءات</CardTitle>
              <CardDescription>تغيير حالة الاتفاقية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* بدء المراجعة */}
              {(agreement.status === 'PENDING' || agreement.status === 'DOCUMENTS_COMPLETE') && (
                <Button
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  onClick={() => updateAgreementStatus('UNDER_REVIEW')}
                  disabled={updating}
                >
                  🔍 بدء المراجعة
                </Button>
              )}

              {/* الموافقة */}
              {(agreement.status === 'UNDER_REVIEW' || agreement.status === 'DOCUMENTS_COMPLETE') && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full bg-green-500 hover:bg-green-600" disabled={updating}>
                      ✅ الموافقة على الاتفاقية
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>تأكيد الموافقة</AlertDialogTitle>
                      <AlertDialogDescription>
                        هل أنت متأكد من الموافقة على هذه الاتفاقية؟ سيتم السماح للعميل بإتمام الطلب.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => updateAgreementStatus('APPROVED')}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        تأكيد الموافقة
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* الرفض */}
              {agreement.status !== 'REJECTED' && agreement.status !== 'APPROVED' && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full"
                      disabled={updating}
                    >
                      ❌ رفض الاتفاقية
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>رفض الاتفاقية</DialogTitle>
                      <DialogDescription>
                        يرجى إدخال سبب الرفض. سيتم إرسال هذا السبب للعميل.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Textarea
                        placeholder="اكتب سبب الرفض هنا..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setRejectionReason('')}>
                        إلغاء
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => updateAgreementStatus('REJECTED')}
                        disabled={!rejectionReason.trim() || updating}
                      >
                        تأكيد الرفض
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              <Separator />

              {/* ملاحظات التحقق */}
              <div className="space-y-2">
                <Label>ملاحظات المراجعة</Label>
                <Textarea
                  placeholder="أضف ملاحظاتك هنا..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  rows={4}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => updateAgreementStatus(agreement.status)}
                  disabled={updating}
                >
                  💾 حفظ الملاحظات
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* معلومات التحقق */}
          {agreement.verifiedBy && (
            <Card>
              <CardHeader>
                <CardTitle>✅ معلومات التحقق</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">تم المراجعة بواسطة</Label>
                  <p className="font-medium">{agreement.verifiedBy}</p>
                </div>
                {agreement.verifiedAt && (
                  <div>
                    <Label className="text-xs text-muted-foreground">تاريخ المراجعة</Label>
                    <p className="font-medium">
                      {new Date(agreement.verifiedAt).toLocaleString('ar-EG')}
                    </p>
                  </div>
                )}
                {agreement.rejectionReason && (
                  <div>
                    <Label className="text-xs text-muted-foreground">سبب الرفض</Label>
                    <p className="font-medium text-red-600">{agreement.rejectionReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* الطلب المرتبط */}
          {agreement.order && (
            <Card>
              <CardHeader>
                <CardTitle>📦 الطلب المرتبط</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-xs text-muted-foreground">رقم الطلب</Label>
                  <p className="font-mono font-medium">{agreement.order.orderNumber}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">حالة الطلب</Label>
                  <Badge>{agreement.order.status}</Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">المبلغ</Label>
                  <p className="font-semibold">{agreement.order.totalAmount.toFixed(2)} ج</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => router.push(`/admin/orders/${agreement.order!.id}`)}
                >
                  عرض الطلب
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Image Preview Dialog */}
      {imagePreview && (
        <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>معاينة الصورة</DialogTitle>
            </DialogHeader>
            <div className="relative w-full h-[600px]">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
