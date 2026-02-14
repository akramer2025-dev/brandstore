"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  Calendar,
  User,
  ShoppingCart,
  Package,
  DollarSign,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
} from "lucide-react";
import { BackButton } from "@/components/BackButton";

// Action types with icons and colors
const actionConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  login: { icon: LogIn, color: "text-green-500", label: "تسجيل دخول" },
  logout: { icon: LogOut, color: "text-slate-500", label: "تسجيل خروج" },
  sale: { icon: ShoppingCart, color: "text-blue-500", label: "بيع" },
  refund: { icon: RefreshCw, color: "text-amber-500", label: "استرجاع" },
  product_add: { icon: Plus, color: "text-green-500", label: "إضافة منتج" },
  product_edit: { icon: Edit, color: "text-blue-500", label: "تعديل منتج" },
  product_delete: { icon: Trash2, color: "text-red-500", label: "حذف منتج" },
  inventory_add: { icon: Package, color: "text-green-500", label: "إضافة للمخزون" },
  inventory_remove: { icon: Package, color: "text-red-500", label: "سحب من المخزون" },
  capital_deposit: { icon: DollarSign, color: "text-green-500", label: "إيداع رأس مال" },
  capital_withdraw: { icon: DollarSign, color: "text-red-500", label: "سحب رأس مال" },
  order_update: { icon: ShoppingCart, color: "text-blue-500", label: "تحديث طلب" },
};

interface ActivityLog {
  id: string;
  action: string;
  details: string | null;
  userName: string;
  userRole: string;
  ipAddress: string | null;
  createdAt: string;
}

export default function ActivityLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login");
      return;
    }
    if (session.user.role !== "ADMIN" && session.user.role !== "VENDOR") {
      router.push("/");
      return;
    }
    fetchLogs();
  }, [session, status, router]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filterAction) params.append("action", filterAction);
      if (filterDate) params.append("date", filterDate);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/activity-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      const debounce = setTimeout(() => {
        fetchLogs();
      }, 300);
      return () => clearTimeout(debounce);
    }
  }, [searchQuery, filterAction, filterDate]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getActionInfo = (action: string) => {
    return actionConfig[action] || { icon: ClipboardList, color: "text-slate-500", label: action };
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800" dir="rtl">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackUrl="/vendor/dashboard" />
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg text-white">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">سجل النشاط</h1>
                <p className="text-sm text-muted-foreground">متابعة جميع العمليات</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في السجل..."
                className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
            </div>

            {/* Action Filter */}
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 appearance-none"
              >
                <option value="">جميع العمليات</option>
                <option value="login">تسجيل دخول</option>
                <option value="sale">مبيعات</option>
                <option value="refund">استرجاع</option>
                <option value="product_add">إضافة منتج</option>
                <option value="product_edit">تعديل منتج</option>
                <option value="inventory_add">إضافة مخزون</option>
                <option value="inventory_remove">سحب مخزون</option>
                <option value="capital_deposit">إيداع</option>
                <option value="capital_withdraw">سحب</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Logs List */}
        {logs.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <ClipboardList className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">لا يوجد سجلات</h3>
            <p className="text-muted-foreground">
              سيظهر هنا سجل جميع العمليات التي تتم في المتجر
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {logs.map((log) => {
                const actionInfo = getActionInfo(log.action);
                const Icon = actionInfo.icon;
                return (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 ${actionInfo.color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{actionInfo.label}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                            {log.userRole === "VENDOR" ? "مالك" : log.userRole}
                          </span>
                        </div>
                        {log.details && (
                          <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.userName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(log.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
