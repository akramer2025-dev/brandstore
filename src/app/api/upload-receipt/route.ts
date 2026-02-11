import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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

    // يجب أن يكون المستخدم مسجل دخول
    if (!session?.user) {
      return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
    }

    // التحقق من تفعيل Cloudinary
    if (!isCloudinaryEnabled) {
      return NextResponse.json(
        { 
          error: "خدمة رفع الصور غير متاحة حالياً",
          suggestion: "يرجى التواصل مع الدعم الفني"
        },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "لم يتم اختيار صورة" }, { status: 400 });
    }

    // التحقق من نوع الملف
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "نوع الملف غير مسموح. يرجى اختيار صورة (JPEG, PNG, WebP)" },
        { status: 400 }
      );
    }

    // التحقق من حجم الملف (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت" },
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
        folder: 'remostore/receipts', // مجلد خاص بالإيصالات
        resource_type: 'image',
        transformation: [
          { width: 1500, height: 1500, crop: 'limit' },
          { quality: 'auto:good' }
        ],
        // إضافة معلومات إضافية للتتبع
        context: {
          user_id: session.user.id,
          uploaded_at: new Date().toISOString()
        }
      });

      // إرجاع رابط الصورة
      return NextResponse.json({
        success: true,
        url: result.secure_url,
        message: "تم رفع الصورة بنجاح"
      });
    } catch (uploadError: any) {
      console.error('Cloudinary upload error:', uploadError);
      return NextResponse.json(
        { error: `فشل رفع الصورة: ${uploadError.message || 'خطأ غير معروف'}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error uploading receipt:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء رفع الصورة" },
      { status: 500 }
    );
  }
}
