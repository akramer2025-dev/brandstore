# 🖼️ إعداد Cloudinary للصور (بديل آمن للـ uploads)

## لماذا Cloudinary؟
- ✅ **البيانات لا تُمسح أبداً** - محفوظة على السحابة
- ✅ مجاني حتى 25 GB
- ✅ CDN سريع جداً
- ✅ تحسين الصور تلقائياً
- ✅ بديل احترافي لـ public/uploads

---

## الخطوة 1: إنشاء حساب

1. **اذهب إلى:** https://cloudinary.com
2. **Sign Up** (مجاني)
3. **احتفظ بالمعلومات:**
   ```
   Cloud Name: your-cloud-name
   API Key: 123456789012345
   API Secret: abc123def456ghi789
   ```

---

## الخطوة 2: تثبيت المكتبة

```powershell
cd D:\markting
npm install cloudinary next-cloudinary
```

---

## الخطوة 3: إضافة Environment Variables

أضف في `.env`:

```env
# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abc123def456ghi789
```

**وفي Vercel Dashboard:**
- Settings → Environment Variables
- أضف نفس الـ 3 variables

---

## الخطوة 4: إنشاء ملف تكوين Cloudinary

إنشاء: `src/lib/cloudinary.ts`

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export default cloudinary;

// رفع صورة
export async function uploadImage(file: File | string) {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'brandstore/products',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

// حذف صورة
export async function deleteImage(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
}
```

---

## الخطوة 5: تعديل ImageUpload Component

تحديث `src/components/ImageUpload.tsx`:

```typescript
'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { ImagePlus, X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  disabled
}: ImageUploadProps) {
  const onUpload = (result: any) => {
    onChange(result.info.secure_url);
  };

  const onRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative w-full aspect-square max-w-sm">
          <Image
            src={value}
            alt="Product image"
            fill
            className="object-cover rounded-lg"
          />
          <Button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <CldUploadWidget
          onUpload={onUpload}
          uploadPreset="brandstore" // أنشئه في Cloudinary Dashboard
          options={{
            maxFiles: 1,
            maxFileSize: 5000000, // 5MB
            folder: 'brandstore/products'
          }}
        >
          {({ open }) => (
            <Button
              type="button"
              disabled={disabled}
              variant="outline"
              onClick={() => open()}
              className="w-full h-32"
            >
              <ImagePlus className="h-8 w-8 mr-2" />
              رفع صورة
            </Button>
          )}
        </CldUploadWidget>
      )}
    </div>
  );
}
```

---

## الخطوة 6: إنشاء Upload Preset في Cloudinary

1. **Dashboard** → **Settings** → **Upload**
2. **Upload Presets** → **Add upload preset**
3. اسمه: `brandstore`
4. Signing Mode: **Unsigned**
5. Folder: `brandstore`
6. **Save**

---

## الخطوة 7: تعديل next.config.ts

أضف Cloudinary domains:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',
    },
    // ... existing patterns
  ],
}
```

---

## ✅ النتيجة:

### قبل Cloudinary:
```
الصورة → public/uploads/ → Vercel → ❌ تتمسح بعد deployment
```

### بعد Cloudinary:
```
الصورة → Cloudinary CDN → ✅ محفوظة للأبد
```

---

## 💾 حماية البيانات الحالية

### خيار A: نقل الصور الموجودة إلى Cloudinary

```typescript
// src/scripts/migrate-to-cloudinary.ts
import cloudinary from '@/lib/cloudinary';
import { readdir } from 'fs/promises';
import path from 'path';

async function migrateImages() {
  const uploadsDir = path.join(process.cwd(), 'public/uploads');
  const files = await readdir(uploadsDir, { recursive: true });
  
  for (const file of files) {
    if (file.endsWith('.jpg') || file.endsWith('.png')) {
      const filePath = path.join(uploadsDir, file);
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'brandstore/products'
      });
      
      console.log(`Uploaded: ${file} → ${result.secure_url}`);
      
      // Update database with new URL
      // await prisma.product.update({
      //   where: { image: `/uploads/${file}` },
      //   data: { image: result.secure_url }
      // });
    }
  }
}

migrateImages();
```

### خيار B: Backup منتظم

```powershell
# كل أسبوع أو شهر
npx prisma db pull
# هيحفظ كل البيانات في ملف SQL
```

---

## 🔐 ضمان عدم فقدان البيانات

### 1. قاعدة البيانات (Neon):
- ✅ Point-in-Time Recovery (حتى 7 أيام)
- ✅ Automated backups
- ✅ Read replicas (نسخ احتياطية)

### 2. الصور (Cloudinary):
- ✅ محفوظة للأبد
- ✅ Version control
- ✅ Backup automatic

### 3. الكود (GitHub):
- ✅ كل commit محفوظ
- ✅ History كامل
- ✅ Rollback أي وقت

---

## 💰 التكاليف

### Cloudinary Free Plan:
```
✅ 25 GB Storage
✅ 25 GB Bandwidth/month
✅ Unlimited transformations
✅ CDN عالمي

يكفي حوالي: 5000-10000 صورة
```

### بعد الـ Free Plan:
```
Pay as you go:
- Storage: $0.04/GB/month
- Bandwidth: $0.08/GB

مثال: 100 GB = $4/month = 120 ج.م
```

---

## 🚀 البدء السريع

```powershell
# 1. تثبيت
npm install cloudinary next-cloudinary

# 2. إضافة env variables
# (راجع الخطوة 3)

# 3. إنشاء upload preset في Cloudinary
# (راجع الخطوة 6)

# 4. تعديل ImageUpload component
# (راجع الخطوة 5)

# 5. Push
git add .
git commit -m "Add Cloudinary - Images now safe forever"
git push
```

---

## ✅ Checklist

- [ ] حساب Cloudinary مُنشأ
- [ ] Environment variables مضافة
- [ ] Upload preset مُنشأ
- [ ] ImageUpload component محدّث
- [ ] next.config.ts محدّث
- [ ] البيانات القديمة منقولة (اختياري)
- [ ] التطبيق يرفع على Cloudinary

---

## 🆘 استكشاف الأخطاء

### "Upload failed"
- تأكد من Upload Preset: **Unsigned**
- تأكد من API keys صحيحة

### "Images not loading"
- تأكد من `res.cloudinary.com` في next.config.ts
- تأكد من CLOUD_NAME صحيح

---

**البيانات الآن آمنة 100%! 🔒✅**
