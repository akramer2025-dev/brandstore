'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

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
  fullName: string | null;
  nationalId: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    image: string | null;
  };
  order: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  } | null;
}

export default function AdminInstallmentsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    underReview: 0
  });

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (sessionStatus === 'authenticated') {
      fetchAgreements();
    }
  }, [sessionStatus, statusFilter, currentPage]);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      console.log('🔄 [Installments Page] جاري جلب الاتفاقيات...');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      console.log('📡 [Installments Page] Request URL:', `/api/admin/installments?${params}`);
      const response = await fetch(`/api/admin/installments?${params}`);
      
      console.log('📨 [Installments Page] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [Installments Page] Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ [Installments Page] Data received:', data);

      if (data.success) {
        setAgreements(data.agreements);
        setTotalPages(data.pagination.totalPages);
        
        // حساب الإحصائيات
        console.log('📊 [Installments Page] جاري جلب الإحصائيات...');
        const allAgreementsResponse = await fetch('/api/admin/installments?limit=1000');
        
        if (allAgreementsResponse.ok) {
          const allData = await allAgreementsResponse.json();
          
          if (allData.success) {
            const allAgreements = allData.agreements;
            setStats({
              total: allAgreements.length,
              pending: allAgreements.filter((a: Agreement) => 
                a.status === 'PENDING' || a.status === 'DOCUMENTS_COMPLETE'
              ).length,
              approved: allAgreements.filter((a: Agreement) => a.status === 'APPROVED').length,
              rejected: allAgreements.filter((a: Agreement) => a.status === 'REJECTED').length,
              underReview: allAgreements.filter((a: Agreement) => a.status === 'UNDER_REVIEW').length
            });
            console.log('✅ [Installments Page] Stats updated:', stats);
          }
        }
      } else {
        console.error('❌ [Installments Page] API returned success: false', data);
      }
    } catch (error) {
      console.error('❌ [Installments Page] Error fetching agreements:', error);
      console.error('📋 [Installments Page] Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: InstallmentStatus) => {
    const statusConfig = {
      PENDING: { label: 'في الانتظار', variant: 'secondary' as const },
      DOCUMENTS_COMPLETE: { label: 'جاهز للمراجعة', variant: 'default' as const },
      UNDER_REVIEW: { label: 'قيد المراجعة', variant: 'default' as const },
      APPROVED: { label: 'موافق عليه', variant: 'default' as const },
      REJECTED: { label: 'مرفوض', variant: 'destructive' as const },
      EXPIRED: { label: 'منتهي', variant: 'secondary' as const }
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={
        status === 'APPROVED' ? 'bg-green-500 hover:bg-green-600' :
        status === 'UNDER_REVIEW' ? 'bg-blue-500 hover:bg-blue-600' :
        status === 'DOCUMENTS_COMPLETE' ? 'bg-purple-500 hover:bg-purple-600' :
        ''
      }>
        {config.label}
      </Badge>
    );
  };

  const filteredAgreements = agreements.filter(agreement => {
    if (!searchQuery) return true;
    
    const search = searchQuery.toLowerCase();
    return (
      agreement.agreementNumber.toLowerCase().includes(search) ||
      agreement.user.name?.toLowerCase().includes(search) ||
      agreement.user.email.toLowerCase().includes(search) ||
      agreement.nationalId?.toLowerCase().includes(search) ||
      agreement.fullName?.toLowerCase().includes(search)
    );
  });

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🏦 إدارة اتفاقيات التقسيط</h1>
          <p className="text-blue-200 mt-1">
            مراجعة وإدارة طلبات التقسيط من العملاء
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>إجمالي الطلبات</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>في الانتظار</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>قيد المراجعة</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.underReview}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>تمت الموافقة</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>مرفوض</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.rejected}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>تصفية الاتفاقيات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="🔍 ابحث برقم الاتفاقية، الاسم، البريد، أو الرقم القومي..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="PENDING">في الانتظار</SelectItem>
                <SelectItem value="DOCUMENTS_COMPLETE">جاهز للمراجعة</SelectItem>
                <SelectItem value="UNDER_REVIEW">قيد المراجعة</SelectItem>
                <SelectItem value="APPROVED">موافق عليه</SelectItem>
                <SelectItem value="REJECTED">مرفوض</SelectItem>
                <SelectItem value="EXPIRED">منتهي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الاتفاقية</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>المبلغ الإجمالي</TableHead>
                <TableHead>المقدم</TableHead>
                <TableHead>عدد الأقساط</TableHead>
                <TableHead>القسط الشهري</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgreements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    لا توجد اتفاقيات
                  </TableCell>
                </TableRow>
              ) : (
                filteredAgreements.map((agreement) => (
                  <TableRow key={agreement.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      {agreement.agreementNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {agreement.user.image && (
                          <Image
                            src={agreement.user.image}
                            alt={agreement.user.name || 'User'}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        )}
                        <div>
                          <div className="font-medium">
                            {agreement.fullName || agreement.user.name || 'بدون اسم'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {agreement.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {agreement.totalAmount.toFixed(2)} ج
                    </TableCell>
                    <TableCell>
                      {agreement.downPayment.toFixed(2)} ج
                    </TableCell>
                    <TableCell>
                      {agreement.numberOfInstallments} شهر
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {agreement.monthlyInstallment.toFixed(2)} ج
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(agreement.status)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(agreement.createdAt).toLocaleDateString('ar-EG')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/installments/${agreement.id}`)}
                      >
                        عرض التفاصيل
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            السابق
          </Button>
          <div className="text-sm text-muted-foreground">
            صفحة {currentPage} من {totalPages}
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            التالي
          </Button>
        </div>
      )}
      </div>
    </div>
  );
}
