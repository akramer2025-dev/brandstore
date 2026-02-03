'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface ProductActionsProps {
  productId: string;
  productName: string;
}

export default function ProductActions({ productId, productName }: ProductActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleEdit = () => {
    router.push(`/vendor/products/${productId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm(`هل أنت متأكد من حذف "${productName}"؟\n\nسيتم حذف المنتج نهائياً.`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/vendor/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('✅ تم حذف المنتج بنجاح');
        router.refresh();
      } else {
        const error = await response.json();
        alert(`❌ ${error.error || 'فشل حذف المنتج'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ أثناء الحذف');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        className="flex-1 bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30 text-blue-200"
        onClick={handleEdit}
      >
        <Edit className="h-4 w-4 mr-2" />
        تعديل
      </Button>
      <Button 
        variant="outline" 
        className="bg-red-500/20 border-red-500/30 hover:bg-red-500/30 text-red-200"
        onClick={handleDelete}
        disabled={deleting}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
