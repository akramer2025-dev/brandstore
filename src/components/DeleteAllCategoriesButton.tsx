"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function DeleteAllCategoriesButton() {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('⚠️ هل أنت متأكد من حذف جميع الأصناف والمنتجات؟\n\nسيتم حذف:\n• جميع الأصناف\n• جميع المنتجات المرتبطة\n\nهذا الإجراء لا يمكن التراجع عنه!')) {
      return;
    }

    if (!confirm('تأكيد نهائي: سيتم حذف جميع الأصناف والمنتجات من قاعدة البيانات!')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/admin/categories/delete-all', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ تم حذف جميع الأصناف والمنتجات بنجاح');
        window.location.reload();
      } else {
        alert(data.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ أثناء حذف الأصناف والمنتجات');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      onClick={handleDelete}
      disabled={isDeleting}
      variant="destructive"
      size="lg"
      className="bg-red-600 hover:bg-red-700 shadow-xl"
    >
      <Trash2 className="w-5 h-5 ml-2" />
      {isDeleting ? 'جاري الحذف...' : 'حذف جميع الأصناف والمنتجات'}
    </Button>
  );
}
