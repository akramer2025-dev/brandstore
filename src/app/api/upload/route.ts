import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { v2 as cloudinary } from 'cloudinary';

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

export async function POST(req: Request) {
  try {
    const session = await auth();

    // السماح للـ Admin والـ Vendor برفع الصور
    if (!session?.user || !['ADMIN', 'VENDOR'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    // استخدم Cloudinary في Production
    if (process.env.NODE_ENV === 'production' && isCloudinaryEnabled) {
      for (const file of files) {
        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json(
            { error: `Invalid file type for ${file.name}. Only JPEG, PNG, and WebP are allowed` },
            { status: 400 }
          );
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          return NextResponse.json(
            { error: `File ${file.name} exceeds 10MB limit` },
            { status: 400 }
          );
        }

        try {
          // رفع الصورة إلى Cloudinary
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const base64String = buffer.toString('base64');
          const dataURI = `data:${file.type};base64,${base64String}`;

          const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'remostore/products',
            resource_type: 'image',
            transformation: [
              { width: 1000, height: 1000, crop: 'limit' },
              { quality: 'auto:good' }
            ]
          });

          uploadedUrls.push(result.secure_url);
        } catch (uploadError: any) {
          console.error('Cloudinary upload error:', uploadError);
          return NextResponse.json(
            { error: `Failed to upload ${file.name} to Cloudinary: ${uploadError.message}` },
            { status: 500 }
          );
        }
      }
    } else {
      // استخدم التخزين المحلي في Development
      for (const file of files) {
        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json(
            { error: `Invalid file type for ${file.name}. Only JPEG, PNG, and WebP are allowed` },
            { status: 400 }
          );
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          return NextResponse.json(
            { error: `File ${file.name} exceeds 10MB limit` },
            { status: 400 }
          );
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), "public", "uploads");
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const ext = file.name.split(".").pop();
        const filename = `product-${timestamp}-${random}.${ext}`;
        const filepath = join(uploadsDir, filename);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Add to uploaded URLs
        uploadedUrls.push(`/uploads/${filename}`);
      }
    }

    // Return the public URLs
    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
