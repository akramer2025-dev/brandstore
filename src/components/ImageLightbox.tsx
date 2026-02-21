"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({ 
  images, 
  initialIndex = 0, 
  productName,
  isOpen,
  onClose 
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when lightbox is open
      document.body.style.overflow = 'hidden';
      
      // Keyboard navigation
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight') goToPrevious();
        if (e.key === 'ArrowLeft') goToNext();
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, currentIndex]);

  if (!isOpen) return null;

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Zoom Toggle */}
      <Button
        onClick={(e) => {
          e.stopPropagation();
          setIsZoomed(!isZoomed);
        }}
        variant="ghost"
        size="icon"
        className="absolute top-4 right-20 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full"
      >
        {isZoomed ? <ZoomOut className="w-6 h-6" /> : <ZoomIn className="w-6 h-6" />}
      </Button>

      {/* Image Counter */}
      <div className="absolute top-4 right-4 z-50 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Product Name */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full max-w-md text-center">
        <p className="font-bold text-lg truncate">{productName}</p>
      </div>

      {/* Main Image */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`relative ${isZoomed ? 'w-full h-full' : 'w-[90vw] h-[80vh] max-w-6xl'} transition-all duration-300`}>
          <Image
            src={images[currentIndex]}
            alt={`${productName} - صورة ${currentIndex + 1}`}
            fill
            className={`object-contain ${isZoomed ? 'object-cover' : ''} transition-all duration-300`}
            priority
            quality={100}
          />
        </div>
      </div>

      {/* Navigation Buttons - Only show if multiple images */}
      {images.length > 1 && (
        <>
          {/* Previous Button (Right side in RTL) */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>

          {/* Next Button (Left side in RTL) */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
        </>
      )}

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 bg-white/10 backdrop-blur-md p-3 rounded-2xl max-w-[90vw] overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
                setIsZoomed(false);
              }}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                index === currentIndex 
                  ? 'ring-4 ring-white scale-110' 
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={image}
                alt={`صورة ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
