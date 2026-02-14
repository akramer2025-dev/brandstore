"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Loader2,
  UserCheck,
  UserX,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/BackButton";

// Role display names
const roleNames: Record<string, string> = {
  CASHIER: "كاشير",
  ACCOUNTANT: "محاسب",
  INVENTORY: "مسؤول مخزون",
  SALES: "مندوب مبيعات",
  MANAGER: "مدير",
};

// Role colors
const roleColors: Record<string, string> = {
  CASHIER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ACCOUNTANT: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  INVENTORY: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  SALES: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  MANAGER: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

// Available permissions
const availablePermissions = [
  { id: "pos", name: "نقطة البيع", description: "الوصول لنقطة البيع وإتمام المبيعات" },
  { id: "products_view", name: "عرض المنتجات", description: "مشاهدة قائمة المنتجات" },
  { id: "products_edit", name: "تعديل المنتجات", description: "إضافة وتعديل المنتجات" },
  { id: "inventory", name: "إدارة المخزون", description: "إضافة وسحب من المخزون" },
  { id: "orders_view", name: "عرض الطلبات", description: "مشاهدة الطلبات" },
  { id: "orders_manage", name: "إدارة الطلبات", description: "تغيير حالة الطلبات" },
  { id: "reports_sales", name: "تقارير المبيعات", description: "عرض تقارير المبيعات" },
  { id: "reports_financial", name: "التقارير المالية", description: "عرض التقارير المالية" },
  { id: "suppliers", name: "الموردين", description: "إدارة الموردين والمشتريات" },
];

interface SubUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  permissions: string[];
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export default function SubUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SubUser | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "CASHIER",
    permissions: [] as string[],
    isActive: true,
  });
  const [showPassword, setShowPassword] = useState(false);

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
    fetchSubUsers();
  }, [session, status, router]);

  const fetchSubUsers = async () => {
    try {
      const res = await fetch("/api/sub-users");
      if (res.ok) {
        const data = await res.json();
        setSubUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch sub-users:", error);
      toast.error("فشل في تحميل المستخدمين");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      id: "",
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "CASHIER",
      permissions: [],
      isActive: true,
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (user: SubUser) => {
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      password: "",
      phone: user.phone || "",
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = isEditing ? `/api/sub-users/${formData.id}` : "/api/sub-users";
      const method = isEditing ? "PATCH" : "POST";

      const body: Record<string, unknown> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        role: formData.role,
        permissions: formData.permissions,
        isActive: formData.isActive,
      };

      // Only include password if provided
      if (formData.password) {
        body.password = formData.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "فشل في حفظ المستخدم");
      }

      toast.success(isEditing ? "تم تحديث المستخدم بنجاح" : "تم إضافة المستخدم بنجاح");
      setShowModal(false);
      fetchSubUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      const res = await fetch(`/api/sub-users/${userToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("فشل في حذف المستخدم");
      }

      toast.success("تم حذف المستخدم بنجاح");
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      fetchSubUsers();
    } catch (error) {
      toast.error("فشل في حذف المستخدم");
    }
  };

  const togglePermission = (permId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId],
    }));
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackUrl="/vendor/dashboard" />
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">المستخدمون الفرعيون</h1>
                  <p className="text-sm text-muted-foreground">إدارة فريق العمل والصلاحيات</p>
                </div>
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">إضافة مستخدم</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Users List */}
        {subUsers.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">لا يوجد مستخدمون فرعيون</h3>
            <p className="text-muted-foreground mb-4">
              أضف مستخدمين فرعيين لمساعدتك في إدارة المتجر
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg"
            >
              <Plus className="w-5 h-5" />
              إضافة أول مستخدم
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {subUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      user.isActive
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-slate-100 dark:bg-slate-700"
                    }`}
                  >
                    {user.isActive ? (
                      <UserCheck className="w-6 h-6 text-green-600" />
                    ) : (
                      <UserX className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${roleColors[user.role]}`}>
                        {roleNames[user.role]}
                      </span>
                      {user.permissions.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          +{user.permissions.length} صلاحية
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(user)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit2 className="w-5 h-5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => {
                      setUserToDelete(user);
                      setShowDeleteConfirm(true);
                    }}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {isEditing ? "تعديل مستخدم" : "إضافة مستخدم جديد"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">الاسم *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    placeholder="اسم المستخدم"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    placeholder="email@example.com"
                    dir="ltr"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    كلمة المرور {isEditing ? "(اتركها فارغة للإبقاء)" : "*"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-12"
                      placeholder="••••••••"
                      dir="ltr"
                      required={!isEditing}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium mb-2">الدور *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  >
                    {Object.entries(roleNames).map(([key, name]) => (
                      <option key={key} value={key}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <div>
                    <p className="font-medium">الحساب نشط</p>
                    <p className="text-sm text-muted-foreground">
                      يمكن للمستخدم تسجيل الدخول والعمل
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      formData.isActive ? "bg-green-500" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        formData.isActive ? "translate-x-1" : "translate-x-6"
                      }`}
                    />
                  </button>
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Shield className="w-4 h-4 inline ml-1" />
                    صلاحيات إضافية
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    {availablePermissions.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="w-4 h-4 rounded text-primary"
                        />
                        <div>
                          <p className="text-sm font-medium">{perm.name}</p>
                          <p className="text-xs text-muted-foreground">{perm.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isEditing ? "حفظ التغييرات" : "إضافة المستخدم"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">حذف المستخدم</h3>
              <p className="text-muted-foreground mb-6">
                هل أنت متأكد من حذف <strong>{userToDelete.name}</strong>؟
                <br />
                <span className="text-red-500 text-sm">هذا الإجراء لا يمكن التراجع عنه</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setUserToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
