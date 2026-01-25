"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface MultipleImageUploadProps {
  currentImages?: string[];
  onImagesUploaded: (imageUrls: string[]) => void;
  maxImages?: number;
}

export function MultipleImageUpload({
  currentImages = [],
  onImagesUploaded,
  maxImages = 5,
}: MultipleImageUploadProps) {
  const [images, setImages] = useState<string[]>(currentImages);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check max images limit
    if (images.length + files.length > maxImages) {
      toast.error(`الحد الأقصى ${maxImages} صور فقط`);
      return;
    }

    // Validate files
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast.error("نوع الملف غير مدعوم", {
          description: "يرجى رفع صور بصيغة JPEG، PNG، أو WebP فقط",
        });
        return;
      }

      if (file.size > maxSize) {
        toast.error("حجم الملف كبير جداً", {
          description: "الحد الأقصى لحجم الصورة هو 5 ميجابايت",
        });
        return;
      }
    }

    // Upload images
    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "فشل رفع الصورة");
        }

        const data = await res.json();
        uploadedUrls.push(data.imageUrl);
      }

      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onImagesUploaded(newImages);
      toast.success(`تم رفع ${uploadedUrls.length} صورة بنجاح`);
    } catch (error: any) {
      console.error("Error uploading images:", error);
      toast.error(error.message || "فشل رفع الصور");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesUploaded(newImages);
    toast.success("تم حذف الصورة");
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {images.length < maxImages && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-32 flex flex-col items-center justify-center gap-3 hover:border-teal-500 hover:text-teal-600"
          >
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin" />
                <span>جاري رفع الصور...</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8" />
                <div className="text-center">
                  <p className="font-semibold">اضغط لرفع الصور</p>
                  <p className="text-xs text-gray-500 mt-1">
                    يمكنك رفع حتى {maxImages} صور (الحد الأقصى 5 ميجا للصورة)
                  </p>
                  <p className="text-xs text-gray-500">
                    متبقي: {maxImages - images.length} صورة
                  </p>
                </div>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-teal-500 transition-all"
            >
              <Image
                src={image}
                alt={`صورة ${index + 1}`}
                fill
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.jpg";
                }}
              />
              
              {/* Image Number Badge */}
              <div className="absolute top-2 left-2 bg-teal-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {index + 1}
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Primary Image Badge */}
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-teal-600/90 to-transparent text-white text-xs font-semibold py-2 text-center">
                  الصورة الرئيسية
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">لم يتم رفع أي صور بعد</p>
        </div>
      )}
    </div>
  );
}
