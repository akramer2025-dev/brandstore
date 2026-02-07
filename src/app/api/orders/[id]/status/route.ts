import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";



























































































































































































































































































































































































































































































}  );    </div>      </div>        </div>          </div>            </table>              </tbody>                ))}                  </tr>                    </td>                      {new Date(commission.createdAt).toLocaleDateString('ar-EG')}                    <td className="px-4 py-3 text-sm text-gray-600">                    </td>                      )}                        </span>                          ⏳ معلق                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">                      ) : (                        </span>                          ✅ تم الصrف                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">                      {commission.isPaid ? (                    <td className="px-4 py-3">                    </td>                      {commission.commissionAmount.toFixed(2)} جنيه                    <td className="px-4 py-3 text-purple-600 font-semibold">                    <td className="px-4 py-3">{commission.saleAmount.toFixed(2)} جنيه</td>                    <td className="px-4 py-3">{commission.quantity}</td>                    <td className="px-4 py-3">{commission.product.nameAr}</td>                  <tr key={commission.id} className="border-t hover:bg-gray-50">                {commissions.slice(0, 20).map((commission) => (              <tbody>              </thead>                </tr>                  <th className="px-4 py-2 text-right">التاريخ</th>                  <th className="px-4 py-2 text-right">الحالة</th>                  <th className="px-4 py-2 text-right">العمولة</th>                  <th className="px-4 py-2 text-right">المبلغ</th>                  <th className="px-4 py-2 text-right">الكمية</th>                  <th className="px-4 py-2 text-right">المنتج</th>                <tr>              <thead className="bg-gray-50">            <table className="w-full">          <div className="overflow-x-auto">          <h2 className="text-xl font-bold mb-4">العمولات ({commissions.length})</h2>        <div className="bg-white rounded-lg shadow-lg p-6">        {/* Commissions Table */}        </div>          </div>            </table>              </tbody>                ))}                  </tr>                    </td>                      {(product.price * product.soldCount * staff.commissionRate / 100).toFixed(2)} جنيه                    <td className="px-4 py-3 text-purple-600 font-semibold">                    <td className="px-4 py-3 text-green-600 font-semibold">{product.soldCount}</td>                    <td className="px-4 py-3">{product.stock}</td>                    <td className="px-4 py-3 font-semibold">{product.price} جنيه</td>                    </td>                      </span>                        {product.importSource}                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">                    <td className="px-4 py-3">                    <td className="px-4 py-3 text-sm text-gray-600">{product.category.nameAr}</td>                    <td className="px-4 py-3">{product.nameAr}</td>                  <tr key={product.id} className="border-t hover:bg-gray-50">                {products.map((product) => (              <tbody>              </thead>                </tr>                  <th className="px-4 py-2 text-right">العمولة المتوقعة</th>                  <th className="px-4 py-2 text-right">المبيعات</th>                  <th className="px-4 py-2 text-right">المخزون</th>                  <th className="px-4 py-2 text-right">السعر</th>                  <th className="px-4 py-2 text-right">المصدر</th>                  <th className="px-4 py-2 text-right">الفئة</th>                  <th className="px-4 py-2 text-right">المنتج</th>                <tr>              <thead className="bg-gray-50">            <table className="w-full">          <div className="overflow-x-auto">          <h2 className="text-xl font-bold mb-4">منتجاتي ({products.length})</h2>        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">        {/* Products Table */}        )}          </div>            </form>              </div>                </button>                  إلغاء                >                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"                  onClick={() => setShowPaymentForm(false)}                  type="button"                <button                </button>                  حفظ                >                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"                  type="submit"                <button              <div className="flex gap-4">              </div>                </div>                  />                    className="border rounded px-3 py-2"                    onChange={(e) => setPaymentData({ ...paymentData, wePay: e.target.value })}                    value={paymentData.wePay}                    placeholder="WePay"                    type="text"                  <input                  />                    className="border rounded px-3 py-2"                    onChange={(e) => setPaymentData({ ...paymentData, vodafoneCash: e.target.value })}                    value={paymentData.vodafoneCash}                    placeholder="Vodafone Cash"                    type="text"                  <input                  />                    className="border rounded px-3 py-2"                    onChange={(e) => setPaymentData({ ...paymentData, etisalatCash: e.target.value })}                    value={paymentData.etisalatCash}                    placeholder="Etisalat Cash"                    type="text"                  <input                  />                    className="border rounded px-3 py-2"                    onChange={(e) => setPaymentData({ ...paymentData, instaPay: e.target.value })}                    value={paymentData.instaPay}                    placeholder="InstaPay"                    type="text"                  <input                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                <h3 className="font-semibold mb-2">المحافظ الإلكترونية</h3>              <div>              {/* المحافظ الإلكترونية */}              </div>                </div>                  />                    className="border rounded px-3 py-2"                    onChange={(e) => setPaymentData({ ...paymentData, bankBranch: e.target.value })}                    value={paymentData.bankBranch}                    placeholder="الفرع"                    type="text"                  <input                  />                    className="border rounded px-3 py-2"                    onChange={(e) => setPaymentData({ ...paymentData, bankAccountName: e.target.value })}                    value={paymentData.bankAccountName}                    placeholder="صاحب الحساب"                    type="text"                  <input                  />                    className="border rounded px-3 py-2"                    onChange={(e) => setPaymentData({ ...paymentData, bankAccountNumber: e.target.value })}                    value={paymentData.bankAccountNumber}                    placeholder="رقم الحساب"                    type="text"                  <input                  />                    className="border rounded px-3 py-2"                    onChange={(e) => setPaymentData({ ...paymentData, bankName: e.target.value })}                    value={paymentData.bankName}                    placeholder="اسم البنك"                    type="text"                  <input                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                <h3 className="font-semibold mb-2">بيانات البنك</h3>              <div className="border-b pb-4">              {/* بيانات البنك */}            <form onSubmit={handlePaymentUpdate} className="space-y-4">            <h2 className="text-xl font-bold mb-4">طرق الدفع</h2>          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">        {showPaymentForm && (        {/* Payment Form */}        </div>          </button>            💳 طرق الدفع          >            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"            onClick={() => setShowPaymentForm(!showPaymentForm)}          <button          </button>            ➕ إضافة منتج مستورد          >            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"            onClick={() => router.push('/marketing-staff/add-product')}          <button        <div className="flex gap-4 mb-8">        {/* Actions */}        </div>          </div>            </p>              {stats.estimatedCommission.toFixed(2)} جنيه            <p className="text-2xl font-bold text-purple-600">            <p className="text-sm text-gray-600">عمولة متوقعة</p>          <div className="bg-purple-50 rounded-lg p-4">          </div>            <p className="text-2xl font-bold text-yellow-600">{stats.totalSold}</p>            <p className="text-sm text-gray-600">المبيعات</p>          <div className="bg-yellow-50 rounded-lg p-4">          </div>            <p className="text-2xl font-bold text-green-600">{stats.totalStock}</p>            <p className="text-sm text-gray-600">المخزون</p>          <div className="bg-green-50 rounded-lg p-4">          </div>            <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>            <p className="text-sm text-gray-600">عدد المنتجات</p>          <div className="bg-blue-50 rounded-lg p-4">        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">        {/* Products Stats */}        </div>          </div>            </p>              {commissionsStats.unpaidCount} عملية            <p className="text-xs text-gray-500 mt-1">            </p>              {commissionsStats.unpaidAmount.toFixed(2)} جنيه            <p className="text-2xl font-bold text-orange-600">            </div>              <span className="text-2xl">⏳</span>              <h3 className="text-gray-600 text-sm">في الانتظار</h3>            <div className="flex items-center justify-between mb-2">          <div className="bg-white rounded-lg shadow p-6">          {/* العمولات المعلقة */}          </div>            </p>              {commissionsStats.paidCount} عملية            <p className="text-xs text-gray-500 mt-1">            </p>              {commissionsStats.paidAmount.toFixed(2)} جنيه            <p className="text-2xl font-bold text-green-600">            </div>              <span className="text-2xl">✅</span>              <h3 className="text-gray-600 text-sm">تم صرفها</h3>            <div className="flex items-center justify-between mb-2">          <div className="bg-white rounded-lg shadow p-6">          {/* العمولات المدفوعة */}          </div>            </p>              {staff.totalCommission.toFixed(2)} جنيه            <p className="text-2xl font-bold text-purple-600">            </div>              <span className="text-2xl">🎯</span>              <h3 className="text-gray-600 text-sm">إجمالي العمولات</h3>            <div className="flex items-center justify-between mb-2">          <div className="bg-white rounded-lg shadow p-6">          {/* إجمالي العمولات */}          </div>            </p>              {staff.totalSales.toFixed(2)} جنيه            <p className="text-2xl font-bold text-gray-800">            </div>              <span className="text-2xl">💰</span>              <h3 className="text-gray-600 text-sm">إجمالي المبيعات</h3>            <div className="flex items-center justify-between mb-2">          <div className="bg-white rounded-lg shadow p-6">          {/* إجمالي المبيعات */}        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">        {/* Stats Cards */}        </div>          </div>            </span>              عمولة: {staff.commissionRate}%            <span className="bg-white/20 px-3 py-1 rounded-full">            {staff.email && <span>✉️ {staff.email}</span>}            <span>📞 {staff.phone}</span>          <div className="mt-4 flex items-center gap-4 text-sm">          <p className="text-purple-100">لوحة تحكم موظف التسويق</p>          <h1 className="text-3xl font-bold mb-2">مرحباً {staff.name} 👋</h1>        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white mb-8">        {/* Header */}      <div className="max-w-7xl mx-auto">    <div className="min-h-screen bg-gray-50 py-8 px-4">  return (  }    );      </div>        </div>          <p>حسابك غير مفعّل. يرجى التواصل مع الإدارة.</p>        <div className="text-center text-red-600">      <div className="flex items-center justify-center min-h-screen">    return (  if (!staff) {  }    );      </div>        </div>          <p className="text-gray-600">جاري التحميل...</p>          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>        <div className="text-center">      <div className="flex items-center justify-center min-h-screen">    return (  if (loading) {  };    }      alert('❌ حدث خطأ في التحديث');      console.error('خطأ في التحديث:', error);    } catch (error) {      }        alert('❌ ' + data.error);      } else {        fetchData();        setShowPaymentForm(false);        alert('✅ تم تحديث طرق الدفع بنجاح');      if (data.success) {      const data = await response.json();      });        body: JSON.stringify(paymentData),        headers: { 'Content-Type': 'application/json' },        method: 'PUT',      const response = await fetch('/api/marketing-staff/payment-methods', {    try {    e.preventDefault();  const handlePaymentUpdate = async (e: React.FormEvent) => {  };    }      setLoading(false);    } finally {      console.error('خطأ في جلب البيانات:', error);    } catch (error) {      }        });          wePay: staffData.staff.wePay || '',          vodafoneCash: staffData.staff.vodafoneCash || '',          etisalatCash: staffData.staff.etisalatCash || '',          instaPay: staffData.staff.instaPay || '',          bankBranch: staffData.staff.bankBranch || '',          bankAccountName: staffData.staff.bankAccountName || '',          bankAccountNumber: staffData.staff.bankAccountNumber || '',          bankName: staffData.staff.bankName || '',        setPaymentData({      if (staffData.staff) {      // ملء بيانات الدفع الحالية      setCommissionsStats(commissionsData.stats);      setCommissions(commissionsData.commissions || []);      const commissionsData = await commissionsResponse.json();      const commissionsResponse = await fetch('/api/marketing-staff/commissions');      // جلب العمولات      setStats(productsData.stats);      setProducts(productsData.products || []);      const productsData = await productsResponse.json();      const productsResponse = await fetch('/api/marketing-staff/products');      // جلب المنتجات      setStaff(staffData.staff);      const staffData = await staffResponse.json();      const staffResponse = await fetch('/api/marketing-staff');      // جلب بيانات الموظف      setLoading(true);    try {  const fetchData = async () => {  }, [session, status, router]);    fetchData();    }      return;      router.push('/');    if (session?.user?.role !== 'MARKETING_STAFF') {    }      return;      router.push('/auth/signin');    if (status === 'unauthenticated') {  useEffect(() => {  });    wePay: '',    vodafoneCash: '',    etisalatCash: '',    instaPay: '',    bankBranch: '',    bankAccountName: '',    bankAccountNumber: '',    bankName: '',  const [paymentData, setPaymentData] = useState({  const [showPaymentForm, setShowPaymentForm] = useState(false);  });    unpaidCount: 0,    paidCount: 0,    unpaidAmount: 0,    paidAmount: 0,    totalAmount: 0,  const [commissionsStats, setCommissionsStats] = useState({  });    estimatedCommission: 0,    totalRevenue: 0,    totalSold: 0,    totalStock: 0,    totalProducts: 0,  const [stats, setStats] = useState({  const [loading, setLoading] = useState(true);  const [commissions, setCommissions] = useState<Commission[]>([]);  const [products, setProducts] = useState<Product[]>([]);  const [staff, setStaff] = useState<MarketingStaff | null>(null);  const router = useRouter();  const { data: session, status } = useSession();export default function MarketingStaffDashboard() {}  };    status: string;    id: string;  order: {  };    nameAr: string;  product: {  createdAt: string;  paidAt: string | null;  isPaid: boolean;  quantity: number;  commissionRate: number;  commissionAmount: number;  saleAmount: number;  id: string;interface Commission {}  };    nameAr: string;  category: {  importSource: string;  soldCount: number;  stock: number;  price: number;  nameAr: string;  id: string;interface Product {}  wePay: string | null;  vodafoneCash: string | null;  etisalatCash: string | null;  instaPay: string | null;  bankAccountNumber: string | null;  bankName: string | null;  isApproved: boolean;  totalCommission: number;  totalSales: number;  commissionRate: number;  email: string | null;  phone: string;  name: string;  id: string;interface MarketingStaff {import { useSession } from 'next-auth/react';import { useRouter } from 'next/navigation';import { useEffect, useState } from 'react';import { prisma } from "@/lib/prisma";
import { calculateCommissionsForOrder } from "@/lib/marketing-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "REJECTED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const resolvedParams = await params;

    const order = await prisma.order.update({
      where: { id: resolvedParams.id },
      data: { status },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // حساب العمولات تلقائياً عند إتمام الطلب
    if (status === "DELIVERED") {
      const commissionResult = await calculateCommissionsForOrder(order.id);
      
      if (commissionResult.success && commissionResult.commissionsCreated && commissionResult.commissionsCreated.length > 0) {
        console.log(`✅ تم حساب ${commissionResult.commissionsCreated.length} عمولة للطلب ${order.id}`);
      }
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}
