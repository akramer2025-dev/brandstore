"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  currentImage?: string | null;
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved?: () => void;
}

export function ImageUpload({
  currentImage,
  onImageUploaded,
  onImageRemoved,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  return (
    <div className="space-y-4">
      {/* Preview */}
      {preview ? (
        <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-purple-500/30 bg-gray-900">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-contain"
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={() => {
              setPreview(null);
              onImageRemoved?.();
              toast.success("تم حذف الصورة");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="w-full h-64 rounded-lg border-2 border-dashed border-purple-500/30 bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-500 mb-2" />
            <p className="text-sm text-gray-400">لا توجد صورة</p>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <CldUploadWidget
        uploadPreset="remostore"
        options={{
          maxFiles: 1,
          folder: "remostore/products",
          resourceType: "image",
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          maxFileSize: 5000000, // 5MB
        }}
        onSuccess={(result: any) => {
          const imageUrl = result.info.secure_url;
          setPreview(imageUrl);
          onImageUploaded(imageUrl);
          toast.success("تم رفع الصورة بنجاح!");
        }}
        onError={() => {
          toast.error("فشل رفع الصورة");
        }}
      >
        {({ open }) => (
          <Button
            type="button"
            onClick={() => open()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Upload className="mr-2 h-4 w-4" />
            {preview ? "تغيير الصورة" : "رفع صورة"}
          </Button>
        )}
      </CldUploadWidget>

      <p className="text-xs text-gray-500 text-center">
        الحد الأقصى: 5MB • الصيغ المدعومة: JPG, PNG, WebP
      </p>
    </div>
  );
}
