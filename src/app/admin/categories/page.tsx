'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit, Trash2, Tag, Upload, X, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Category {
  id: string
  name: string
  nameAr: string
  description: string | null
  image: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
}

export default function CategoriesManagement() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    image: '',
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}` 
        : '/api/admin/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        await fetchCategories()
        resetForm()
        alert(editingCategory ? 'تم تحديث الفئة بنجاح!' : 'تم إضافة الفئة بنجاح!')
      } else {
        const error = await res.json()
        alert(error.error || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('فشل في حفظ الفئة')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchCategories()
        alert('تم حذف الفئة بنجاح!')
      } else {
        const error = await res.json()
        alert(error.error || 'فشل في حذف الفئة')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('فشل في حذف الفئة')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      nameAr: category.nameAr,
      description: category.description || '',
      image: category.image || '',
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      description: '',
      image: '',
    })
    setEditingCategory(null)
    setShowForm(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setFormData(prev => ({ ...prev, image: data.url }))
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('فشل في رفع الصورة')
    } finally {
      setUploading(false)
    }
  }

  if (loading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">إدارة الفئات</h1>
              <p className="text-purple-300 text-sm">إجمالي الفئات: {categories.length}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {showForm ? (
              <>
                <X className="w-5 h-5 ml-2" />
                إلغاء
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 ml-2" />
                إضافة فئة جديدة
              </>
            )}
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-6 bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white">
                {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">الاسم بالإنجليزية</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Shein"
                      required
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">الاسم بالعربية</Label>
                    <Input
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                      placeholder="مثال: شي إن"
                      required
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">الوصف (اختياري)</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="وصف الفئة..."
                    className="bg-white/10 border-white/20 text-white"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-white">صورة الفئة (اختياري)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="bg-white/10 border-white/20 text-white"
                    />
                    {uploading && <div className="text-white">جاري الرفع...</div>}
                    {formData.image && (
                      <div className="relative w-20 h-20">
                        <Image
                          src={formData.image}
                          alt="Preview"
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                  {formData.image && (
                    <Input
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="أو أدخل رابط الصورة"
                      className="bg-white/10 border-white/20 text-white mt-2"
                    />
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Check className="w-5 h-5 ml-2" />
                    {editingCategory ? 'تحديث' : 'إضافة'}
                  </Button>
                  <Button
                    type="button"
                    onClick={resetForm}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {category.image && (
                      <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden">
                        <Image
                          src={category.image}
                          alt={category.nameAr}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-white">{category.nameAr}</h3>
                    <p className="text-gray-400 text-sm">{category.name}</p>
                    {category.description && (
                      <p className="text-gray-300 text-sm mt-2">{category.description}</p>
                    )}
                    <div className="mt-2 text-purple-300 text-sm">
                      {category._count?.products || 0} منتج
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(category)}
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    تعديل
                  </Button>
                  <Button
                    onClick={() => handleDelete(category.id)}
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 ml-1" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardContent className="p-12 text-center">
              <Tag className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/50 text-lg">لا توجد فئات حتى الآن</p>
              <p className="text-white/30 text-sm mt-2">ابدأ بإضافة فئة جديدة</p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}
