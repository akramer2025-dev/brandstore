import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { v2 as cloudinary } from 'cloudinary';
import {
  uploadRateLimit,
  validateFileType,
  validateFileSize,
  sanitizeFilename,
  secureResponse,
  handleError
} from '@/lib/security';

// تكوين Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// التحقق من تفعيل Cloudinary
const isCloudinaryEnabled = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

export async function POST(req: NextRequest) {
  try {
    // 🛡️ 1. Rate Limiting - منع رفع ملفات كثيرة
    const rateCheck = await uploadRateLimit(req);
    if (!rateCheck.success) {
      return NextResponse.json(
        { 
          error: rateCheck.error,
          remaining: rateCheck.remaining,
          resetAt: new Date(rateCheck.reset).toISOString()
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateCheck.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateCheck.reset).toISOString(),
          }
        }
      );
    }

    // 🛡️ 2. Authentication & Authorization
    const session = await auth();

    // السماح للـ Admin والـ Vendor برفع الصور
    if (!session?.user || !['ADMIN', 'VENDOR'].includes(session.user.role)) {
      return NextResponse.json({ error: "غير مصرح لك برفع الملفات" }, { status: 401 });
    }

    // في Production: استخدم Cloudinary إذا كان متاح، وإلا اعرض رسالة خطأ
    if (process.env.NODE_ENV === 'production' && !isCloudinaryEnabled) {
      return NextResponse.json(
        { 
          error: "File upload requires Cloudinary configuration in production.",
          suggestion: "Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables."
        },
        { status: 501 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "لم يتم توفير ملفات" }, { status: 400 });
    }

    // 🛡️ 3. التحقق من عدد الملفات (10 كحد أقصى في مرة واحدة)
    if (files.length > 10) {
      return NextResponse.json(
        { error: "لا يمكن رفع أكثر من 10 ملفات في المرة الواحدة" },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    // في Production: استخدم Cloudinary
    if (isCloudinaryEnabled) {
      for (const file of files) {
        // 🛡️ 4. التحقق من نوع الملف باستخدام Security Library
        if (!validateFileType(file.name, allowedExtensions)) {
          return NextResponse.json(
            { 
              error: `نوع الملف ${file.name} غير مسموح`,
              allowedTypes: allowedExtensions
            },
            { status: 400 }
          );
        }

        // 🛡️ 5. التحقق من حجم الملف (10MB)
        if (!validateFileSize(file.size, 10)) {
          const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
          return NextResponse.json(
            { 
              error: `حجم الملف ${file.name} يتجاوز الحد المسموح (10MB)`,
              fileSize: `${fileSizeMB}MB`,
              maxSize: '10MB'
            },
            { status: 400 }
          );
        }

        // 🛡️ 6. تنظيف اسم الملف من المحارف الخطيرة
        const safeName = sanitizeFilename(file.name);

        try {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          const result = await cloudinary.uploader.upload(
            `data:${file.type};base64,${buffer.toString('base64')}`,
            {
              folder: 'products',
              public_id: safeName.split('.')[0],
              transformation: [
                { width: 1000, height: 1000, crop: 'limit' },
                { quality: 'auto:good' }
              ]
            }
          );

          uploadedUrls.push(result.secure_url);
          console.log(`✅ Uploaded to Cloudinary: ${safeName}`);
        } catch (uploadError: any) {
          console.error('❌ Cloudinary upload error:', uploadError);
          return NextResponse.json(
            { error: `فشل في رفع ${file.name}: ${uploadError.message}` },
            { status: 500 }
          );
        }
      }
    } else {
      // استخدم التخزين المحلي في Development
      const uploadsDir = join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      for (const file of files) {
        // 🛡️ التحقق من نوع الملف
        if (!validateFileType(file.name, allowedExtensions)) {
          return NextResponse.json(
            { 
              error: `نوع الملف ${file.name} غير مسموح`,
              allowedTypes: allowedExtensions
            },
            { status: 400 }
          );
        }

        // 🛡️ التحقق من حجم الملف
        if (!validateFileSize(file.size, 10)) {
          return NextResponse.json(
            { error: `حجم الملف ${file.name} يتجاوز 10MB` },
            { status: 400 }
          );
        }

        // 🛡️ تنظيف اسم الملف
        const safeName = sanitizeFilename(file.name);

        // Generate unique filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const ext = safeName.split(".").pop();
        const filename = `product-${timestamp}-${random}.${ext}`;
        const filepath = join(uploadsDir, filename);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Add to uploaded URLs
        uploadedUrls.push(`/uploads/${filename}`);
        console.log(`✅ Uploaded locally: ${filename}`);
      }
    }

    // Return the public URLs with security headers
    return secureResponse({
      success: true,
      urls: uploadedUrls,
      count: uploadedUrls.length,
      message: `تم رفع ${uploadedUrls.length} ملف بنجاح`,
      remaining: rateCheck.remaining
    });
  } catch (error: any) {
    console.error("❌ Error uploading file:", error);
    return handleError(error);
  }
}
