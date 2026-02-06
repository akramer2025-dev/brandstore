'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, Trash2, Edit } from 'lucide-react';
import Image from 'next/image';
import { BackButton } from '@/components/BackButton';

interface Category {
  id: string;
  nameAr: string;
  name: string;
  description: string;
  image: string | null;
  _count?: {
    products: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`هل أنت متأكد من حذف صنف "${categoryName}"؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories?id=${categoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('تم حذف الصنف بنجاح');
        fetchCategories(); // إعادة تحميل البيانات
      } else {
        const error = await response.json();
        alert(error.error || 'فشل في حذف الصنف');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('حدث خطأ أثناء حذف الصنف');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center">
        <div className="text-white">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 p-6" suppressHydrationWarning>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BackButton fallbackUrl="/vendor/dashboard" />
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-cyan-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">إدارة الأصناف</h1>
                <p className="text-gray-300">إضافة وتعديل أصناف المنتجات</p>
              </div>
            </div>
          </div>
          
          <Link href="/vendor/categories/new">
            <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              إضافة صنف جديد
            </Button>
          </Link>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">لا توجد أصناف</h3>
              <p className="text-gray-300 mb-4">ابدأ بإضافة أصناف للمنتجات</p>
              <Link href="/vendor/categories/new">
                <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة أول صنف
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all">
                <CardHeader className="pb-3">
                  {category.image && (
                    <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.nameAr}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400';
                        }}
                      />
                    </div>
                  )}
                  <CardTitle className="text-white text-lg">{category.nameAr}</CardTitle>
                  {category.name && category.name !== category.nameAr && (
                    <p className="text-gray-300 text-sm">{category.name}</p>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  {category.description && (
                    <p className="text-gray-300 text-sm mb-4">{category.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {category._count?.products || 0} منتج
                    </span>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                        onClick={() => deleteCategory(category.id, category.nameAr)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
