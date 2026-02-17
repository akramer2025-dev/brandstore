'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Image as ImageIcon, Plus, Edit, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface SliderImage {
  id: string;
  title: string;
  titleAr: string | null;
  subtitle: string | null;
  subtitleAr: string | null;
  imageUrl: string;
  link: string | null;
  buttonText: string | null;
  buttonTextAr: string | null;
  order: number;
  isActive: boolean;
}

export default function SliderManagementPage() {
  const [sliders, setSliders] = useState<SliderImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlider, setEditingSlider] = useState<SliderImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const res = await fetch('/api/admin/slider');
      if (res.ok) {
        const data = await res.json();
        setSliders(data.sliders || []);
      }
    } catch (error) {
      console.error('Error fetching sliders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (slider: Partial<SliderImage>) => {
    try {
      const method = slider.id ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/slider', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slider),
      });

      if (res.ok) {
        setMessage('✅ تم الحفظ بنجاح');
        fetchSliders();
        setIsDialogOpen(false);
        setEditingSlider(null);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving slider:', error);
      setMessage('❌ فشل في الحفظ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;

    try {
      const res = await fetch('/api/admin/slider', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setMessage('✅ تم الحذف بنجاح');
        fetchSliders();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting slider:', error);
      setMessage('❌ فشل في الحذف');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/admin/slider', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive }),
      });

      if (res.ok) {
        fetchSliders();
      }
    } catch (error) {
      console.error('Error toggling slider:', error);
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = sliders.findIndex(s => s.id === id);
    if (currentIndex === -1) return;

    const newOrder = direction === 'up' 
      ? sliders[currentIndex].order - 1.5
      : sliders[currentIndex].order + 1.5;

    try {
      const res = await fetch('/api/admin/slider', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, order: newOrder }),
      });

      if (res.ok) {
        fetchSliders();
      }
    } catch (error) {
      console.error('Error reordering slider:', error);
    }
  };

  const SliderForm = ({ slider, onSave, onCancel }: {
    slider?: SliderImage | null;
    onSave: (data: Partial<SliderImage>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<Partial<SliderImage>>(
      slider || {
        title: '',
        titleAr: '',
        subtitle: '',
        subtitleAr: '',
        imageUrl: '',
        link: '',
        buttonText: '',
        buttonTextAr: '',
        order: sliders.length + 1,
        isActive: true,
      }
    );

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>العنوان (English)</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Title"
            />
          </div>
          <div>
            <Label>العنوان (عربي)</Label>
            <Input
              value={formData.titleAr || ''}
              onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
              placeholder="العنوان"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>الوصف (English)</Label>
            <Input
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Subtitle"
            />
          </div>
          <div>
            <Label>الوصف (عربي)</Label>
            <Input
              value={formData.subtitleAr || ''}
              onChange={(e) => setFormData({ ...formData, subtitleAr: e.target.value })}
              placeholder="الوصف"
            />
          </div>
        </div>

        <div>
          <Label>رابط الصورة</Label>
          <Input
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <Label>الرابط عند الضغط</Label>
          <Input
            value={formData.link || ''}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="/products"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>نص الزر (English)</Label>
            <Input
              value={formData.buttonText || ''}
              onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
              placeholder="Shop Now"
            />
          </div>
          <div>
            <Label>نص الزر (عربي)</Label>
            <Input
              value={formData.buttonTextAr || ''}
              onChange={(e) => setFormData({ ...formData, buttonTextAr: e.target.value })}
              placeholder="تسوق الآن"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button onClick={() => onSave(formData)}>
            حفظ
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">إدارة صور السلايدر</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/settings">
              <Button variant="outline">
                الإعدادات العامة
              </Button>
            </Link>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                  إضافة صورة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingSlider ? 'تعديل الصورة' : 'إضافة صورة جديدة'}
                  </DialogTitle>
                </DialogHeader>
                <SliderForm
                  slider={editingSlider}
                  onSave={handleSave}
                  onCancel={() => {
                    setIsDialogOpen(false);
                    setEditingSlider(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-4">
          {sliders.map((slider, index) => (
            <Card key={slider.id} className="p-6">
              <div className="flex gap-6">
                <div className="relative w-64 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={slider.imageUrl}
                    alt={slider.titleAr || slider.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x200?text=No+Image';
                    }}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{slider.titleAr || slider.title}</h3>
                      <p className="text-gray-600 mt-1">{slider.subtitleAr || slider.subtitle}</p>
                      {slider.link && (
                        <p className="text-sm text-blue-600 mt-2">الرابط: {slider.link}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleActive(slider.id, slider.isActive)}
                      >
                        {slider.isActive ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                      {index > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReorder(slider.id, 'up')}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                      )}
                      {index < sliders.length - 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReorder(slider.id, 'down')}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingSlider(slider);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(slider.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {sliders.length === 0 && (
            <Card className="p-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">لا توجد صور في السلايدر</p>
              <p className="text-gray-500 mt-2">قم بإضافة صورة جديدة للبدء</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
