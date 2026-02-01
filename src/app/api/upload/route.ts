import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: Request) {
  try {
    const session = await auth();

    // السماح للـ Admin والـ Vendor برفع الصور
    if (!session?.user || !['ADMIN', 'VENDOR'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // في Production على Vercel، استخدم روابط خارجية أو خدمة تخزين سحابي
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { 
          error: "File upload is disabled in production. Please use external image URLs (Unsplash, Cloudinary, etc.) or configure a cloud storage service.",
          suggestion: "Use image URLs like: https://images.unsplash.com/... or configure Cloudinary"
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

    for (const file of files) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type for ${file.name}. Only JPEG, PNG, and WebP are allowed` },
          { status: 400 }
        );
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 5MB limit` },
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
