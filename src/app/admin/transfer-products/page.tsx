'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowRightLeft,
  Search,
  Filter,
  Store,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';

interface Vendor {
  id: string;
  businessName: string | null;
  storeName: string | null;
  userName: string | null;
  email: string;
  isActive: boolean;
  isSuspended: boolean;
  productsCount: number;
}

interface Product {
  id: string;
  name: string;
  nameAr: string;
  sku: string | null;
  price: number;
  stock: number | null;
  isActive: boolean;
  images: string[];
  vendor: {
    id: string;
    businessName: string | null;
    storeName: string | null;
    isActive: boolean;
    isSuspended: boolean;
    user: {
      name: string | null;
      email: string;
    };
  } | null;
  category: {
    name: string;
    nameAr: string;
  };
  stats: {
    orders: number;
    reviews: number;
    inCart: number;
    inWishlist: number;
  };
}

export default function TransferProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVendorId, setFilterVendorId] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // جلب البيانات
  useEffect(() => {
    fetchData();
  }, [page, searchTerm, filterVendorId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // جلب المنتجات
      const productsUrl = new URL('/api/admin/products/all', window.location.origin);
      productsUrl.searchParams.set('page', page.toString());
      productsUrl.searchParams.set('limit', '20');
      if (searchTerm) productsUrl.searchParams.set('search', searchTerm);
      if (filterVendorId && filterVendorId !== 'all')
        productsUrl.searchParams.set('vendorId', filterVendorId);

      const [productsRes, vendorsRes] = await Promise.all([
        fetch(productsUrl),
        fetch('/api/admin/vendors/list'),
      ]);

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
      }

      if (vendorsRes.ok) {
        const data = await vendorsRes.json();
        setVendors(data.vendors);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  // فتح نافذة النقل
  const openTransferDialog = (product: Product) => {
    if (!product.vendor) {
      toast.error('هذا المنتج ليس له بائع حالياً');
      return;
    }

    setSelectedProduct(product);
    setSelectedVendorId('');
    setShowTransferDialog(true);
  };

  // نقل المنتج
  const handleTransfer = async () => {
    if (!selectedProduct || !selectedVendorId) return;

    if (selectedProduct.vendor?.id === selectedVendorId) {
      toast.error('المنتج موجود بالفعل عند هذا البائع');
      return;
    }

    setTransferring(true);
    try {
      const response = await fetch('/api/admin/products/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: [selectedProduct.id],
          fromVendorId: selectedProduct.vendor?.id,
          toVendorId: selectedVendorId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setShowTransferDialog(false);
        fetchData(); // إعادة تحميل البيانات
      } else {
        toast.error(data.error || 'حدث خطأ أثناء نقل المنتج');
      }
    } catch (error) {
      console.error('Error transferring product:', error);
      toast.error('حدث خطأ أثناء نقل المنتج');
    } finally {
      setTransferring(false);
    }
  };

  // الحصول على اسم البائع
  const getVendorName = (vendor: any) => {
    return vendor?.businessName || vendor?.storeName || vendor?.user?.name || 'بدون اسم';
  };

  // تصفية البائعين (استبعاد البائع الحالي)
  const availableVendors = vendors.filter(
    (v) =>
      v.isActive &&
      !v.isSuspended &&
      v.id !== selectedProduct?.vendor?.id
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl" dir="rtl">
      {/* الرأس */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <ArrowRightLeft className="h-8 w-8 text-primary" />
          نقل المنتجات بين البائعين
        </h1>
        <p className="text-muted-foreground">
          قم بنقل المنتجات من بائع إلى آخر بسهولة وأمان
        </p>
      </div>

      {/* أدوات البحث والتصفية */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* البحث */}
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث عن منتج (الاسم، SKU)"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pr-10"
            />
          </div>

          {/* تصفية حسب البائع */}
          <div className="relative">
            <Filter className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Select
              value={filterVendorId}
              onValueChange={(value) => {
                setFilterVendorId(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="pr-10">
                <SelectValue placeholder="جميع البائعين" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع البائعين</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {getVendorName(vendor)} ({vendor.productsCount} منتج)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* جدول المنتجات */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Package className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg">لا توجد منتجات</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المنتج</TableHead>
                <TableHead className="text-right">القسم</TableHead>
                <TableHead className="text-right">البائع الحالي</TableHead>
                <TableHead className="text-right">السعر</TableHead>
                <TableHead className="text-right">المخزون</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الطلبات</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  {/* المنتج */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-md overflow-hidden bg-gray-100">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.sku || 'بدون SKU'}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* القسم */}
                  <TableCell>
                    <span className="text-sm">{product.category.nameAr}</span>
                  </TableCell>

                  {/* البائع */}
                  <TableCell>
                    {product.vendor ? (
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {getVendorName(product.vendor)}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {product.vendor.isActive ? (
                              <Badge variant="outline" className="text-xs bg-green-50">
                                نشط
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-red-50">
                                غير نشط
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">بدون بائع</span>
                    )}
                  </TableCell>

                  {/* السعر */}
                  <TableCell>
                    <span className="text-sm font-medium">
                      {product.price.toLocaleString('ar-EG')} ج.م
                    </span>
                  </TableCell>

                  {/* المخزون */}
                  <TableCell>
                    <Badge
                      variant={
                        !product.stock || product.stock === 0
                          ? 'destructive'
                          : product.stock < 5
                          ? 'outline'
                          : 'default'
                      }
                      className="text-xs"
                    >
                      {product.stock || 0} قطعة
                    </Badge>
                  </TableCell>

                  {/* الحالة */}
                  <TableCell>
                    {product.isActive ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </TableCell>

                  {/* الطلبات */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{product.stats.orders}</span>
                      {product.stats.orders > 0 && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </TableCell>

                  {/* إجراءات */}
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => openTransferDialog(product)}
                      disabled={!product.vendor}
                      className="w-full"
                    >
                      <ArrowRightLeft className="h-4 w-4 ml-1" />
                      نقل
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            السابق
          </Button>
          <span className="flex items-center px-4">
            صفحة {page} من {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            التالي
          </Button>
        </div>
      )}

      {/* نافذة النقل */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              نقل المنتج
            </DialogTitle>
            <DialogDescription>
              اختر البائع الجديد لنقل المنتج إليه
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4 py-4">
              {/* معلومات المنتج */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">المنتج المحدد:</p>
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                    {selectedProduct.images[0] ? (
                      <Image
                        src={selectedProduct.images[0]}
                        alt={selectedProduct.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Package className="h-8 w-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{selectedProduct.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedProduct.category.nameAr}
                    </p>
                  </div>
                </div>
              </div>

              {/* البائع الحالي */}
              <div>
                <Label className="text-sm text-muted-foreground">البائع الحالي:</Label>
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {getVendorName(selectedProduct.vendor)}
                    </span>
                  </div>
                </div>
              </div>

              {/* اختيار البائع الجديد */}
              <div>
                <Label htmlFor="new-vendor" className="mb-2 block">
                  البائع الجديد: <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
                  <SelectTrigger id="new-vendor">
                    <SelectValue placeholder="اختر البائع الجديد" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4" />
                          <span>
                            {getVendorName(vendor)} ({vendor.productsCount} منتج)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* تحذيرات */}
              {selectedProduct.stats.orders > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-900 dark:text-yellow-100">
                        تحذير: المنتج له طلبات سابقة
                      </p>
                      <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                        عدد الطلبات: {selectedProduct.stats.orders} طلب. الطلبات القديمة
                        ستظل مرتبطة بالبائع الحالي.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowTransferDialog(false)}
              disabled={transferring}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={!selectedVendorId || transferring}
            >
              {transferring ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري النقل...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="h-4 w-4 ml-2" />
                  نقل المنتج
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
