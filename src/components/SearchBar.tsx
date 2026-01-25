'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Camera, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function SearchBar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // عرض معاينة الصورة
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // رفع الصورة للبحث
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        // البحث بالصورة (يمكن استخدام AI للبحث المشابه)
        router.push(`/products?imageSearch=${encodeURIComponent(data.url)}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-gradient-to-br from-teal-900/50 to-gray-900/50 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-2xl border border-teal-700/30">
      <form onSubmit={handleSearch} className="space-y-3 md:space-y-4">
        {/* حقل البحث */}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-400 w-4 h-4 md:w-5 md:h-5" />
            <Input
              type="text"
              placeholder="ابحث عن منتج بالاسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 bg-gray-900/50 border-teal-700/50 text-white placeholder:text-gray-400 focus:border-teal-500 h-10 md:h-12 text-sm md:text-base"
            />
          </div>
          
          <Button 
            type="submit" 
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 md:px-8 h-10 md:h-12 text-sm md:text-base"
          >
            بحث
          </Button>
        </div>

        {/* البحث بالصورة */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex-1 h-px bg-teal-700/30"></div>
          <span className="text-teal-400 text-xs md:text-sm">أو</span>
          <div className="flex-1 h-px bg-teal-700/30"></div>
        </div>

        <div className="flex flex-col gap-3 md:gap-4">
          {imagePreview ? (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-32 md:h-40 object-cover rounded-lg border border-teal-700/50"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 left-2"
                onClick={clearImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 md:h-40 border-2 border-dashed border-teal-700/50 rounded-lg cursor-pointer hover:border-teal-500 transition-colors bg-gray-900/30">
              <div className="flex flex-col items-center justify-center gap-2">
                <Camera className="w-8 h-8 md:w-10 md:h-10 text-teal-400" />
                <p className="text-xs md:text-sm text-teal-400">ارفع صورة للبحث بها</p>
                <p className="text-[10px] md:text-xs text-gray-400">JPG, PNG أو GIF</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
          )}
          
          {isUploading && (
            <p className="text-xs md:text-sm text-center text-teal-400">جاري البحث...</p>
          )}
        </div>
      </form>
    </div>
  );
}
