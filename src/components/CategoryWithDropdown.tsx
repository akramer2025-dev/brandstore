'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@prisma/client';

interface CategoryWithChildren extends Category {
  children?: Category[];
}

interface Props {
  category: CategoryWithChildren;
}

export default function CategoryWithDropdown({ category }: Props) {
  const [showDropdown, setShowDropdown] = useState(false);

  const hasChildren = category.children && category.children.length > 0;

  // دالة للحصول على صورة الفئة
  function getCategoryImage(nameAr: string, image?: string | null): string {
    if (image && image.trim() !== '') {
      return image;
    }

    const name = nameAr.toLowerCase().trim();
    
    // خريطة الفئات والصور
    if (name.includes('موبايل') || name.includes('جوال') || name.includes('هاتف')) {
      return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9';
    }
    if (name.includes('لاب') || name.includes('كمبيوتر')) {
      return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853';
    }
    if (name.includes('تيشيرت') || name.includes('ملابس')) {
      return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab';
    }
    if (name.includes('رجال') || name.includes('رجالي')) {
      return 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891';
    }
    if (name.includes('نسا') || name.includes('حريمي')) {
      return 'https://images.unsplash.com/photo-1483985988355-763728e1935b';
    }
    if (name.includes('أطفال') || name.includes('اطفال')) {
      return 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2';
    }
    if (name.includes('اكسسوار')) {
      return 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908';
    }
    if (name.includes('مستحضر') || name.includes('تجميل') || name.includes('جمال')) {
      return 'https://images.unsplash.com/photo-1596462502278-27bfdc403348';
    }
    if (name.includes('شي إن') || name.includes('shein')) {
      return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8';
    }
    if (name.includes('جواك') || name.includes('أحذية')) {
      return 'https://images.unsplash.com/photo-1549298916-b41d501d3772';
    }
    
    return 'https://images.unsplash.com/photo-1472851294608-062f824d29cc';
  }

  if (!hasChildren) {
    // عرض عادي بدون dropdown
    return (
      <Link
        href={`/categories/${category.id}`}
        className="relative flex items-center gap-1.5 sm:gap-3 md:gap-2 px-2 sm:px-6 md:px-5 py-2 sm:py-4 md:py-3 rounded-full transition-all duration-300 whitespace-nowrap group hover:shadow-md hover:scale-105 hover:-translate-y-1 bg-white/60 hover:bg-white/80"
        style={{
          borderWidth: '1.5px',
          borderStyle: 'solid',
          borderImage: 'linear-gradient(135deg, rgb(147 51 234) 0%, rgb(236 72 153) 50%, rgb(249 115 22) 100%) 1'
        }}
      >
        <div className="relative w-8 h-8 sm:w-14 sm:h-14 md:w-10 md:h-10 rounded-full overflow-hidden flex-shrink-0 ring-1 sm:ring-2 ring-purple-200">
          <Image
            src={getCategoryImage(category.nameAr, category.image)}
            alt={category.nameAr}
            width={32}
            height={32}
            sizes="(max-width: 640px) 32px, 56px"
            className="object-cover w-full h-full"
            loading="lazy"
            unoptimized
          />
        </div>
        <span className="text-xs sm:text-base md:text-sm font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:via-pink-600 group-hover:to-orange-600 transition-all">
          {category.nameAr}
        </span>
      </Link>
    );
  }

  // عرض مع dropdown للفئات الفرعية
  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
    >
      <Link
        href={`/categories/${category.id}`}
        className="relative flex items-center gap-1.5 sm:gap-3 md:gap-2 px-2 sm:px-6 md:px-5 py-2 sm:py-4 md:py-3 rounded-full transition-all duration-300 whitespace-nowrap group hover:shadow-md hover:scale-105 hover:-translate-y-1 bg-gradient-to-r from-purple-50/80 to-pink-50/80 hover:from-purple-100/80 hover:to-pink-100/80"
        style={{
          borderWidth: '1.5px',
          borderStyle: 'solid',
          borderImage: 'linear-gradient(135deg, rgb(147 51 234) 0%, rgb(236 72 153) 50%, rgb(249 115 22) 100%) 1'
        }}
      >
        <div className="relative w-8 h-8 sm:w-14 sm:h-14 md:w-10 md:h-10 rounded-full overflow-hidden flex-shrink-0 ring-1 sm:ring-2 ring-purple-200">
          <Image
            src={getCategoryImage(category.nameAr, category.image)}
            alt={category.nameAr}
            width={32}
            height={32}
            sizes="(max-width: 640px) 32px, 56px"
            className="object-cover w-full h-full"
            loading="lazy"
            unoptimized
          />
        </div>
        <span className="text-xs sm:text-base md:text-sm font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:via-pink-600 group-hover:to-orange-600 transition-all">
          {category.nameAr}
        </span>
        <svg 
          className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 transition-transform duration-200"
          style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Link>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white rounded-xl shadow-xl border-2 border-purple-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {category.children?.map((child) => (
            <Link
              key={child.id}
              href={`/categories/${child.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 border-b border-purple-100 last:border-b-0"
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-purple-200">
                <Image
                  src={getCategoryImage(child.nameAr, child.image)}
                  alt={child.nameAr}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                  loading="lazy"
                  unoptimized
                />
              </div>
              <span className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">
                {child.nameAr}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
