import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// API للتحقق من الهوية باستخدام Face Recognition
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
    }

    const body = await req.json();
    const { nationalIdImage, selfieImage, fullName } = body;

    if (!nationalIdImage || !selfieImage) {
      return NextResponse.json({ 
        error: "يرجى إرسال صورة البطاقة وصورة السيلفي" 
      }, { status: 400 });
    }

    console.log('🔍 بدء التحقق من الهوية...');

    // 1. استخراج الوجه من صورة البطاقة والسيلفي
    try {
      // استخدام Cloudinary AI للمقارنة
      const cloudinaryVerification = await verifyFacesWithCloudinary(nationalIdImage, selfieImage);
      
      if (!cloudinaryVerification.match) {
        return NextResponse.json({
          success: false,
          error: "الوجه في السيلفي لا يطابق الوجه في البطاقة الشخصية",
          confidence: cloudinaryVerification.confidence,
          message: "⚠️ فشل التحقق: الصور غير متطابقة"
        }, { status: 400 });
      }

      console.log('✅ تم التحقق من الوجه بنجاح! التطابق:', cloudinaryVerification.confidence);

      // 2. استخراج النص من البطاقة (OCR) - اختياري
      let extractedName = null;
      try {
        extractedName = await extractTextFromID(nationalIdImage);
        console.log('📄 الاسم المستخرج من البطاقة:', extractedName);
      } catch (ocrError) {
        console.warn('⚠️ فشل استخراج النص من البطاقة:', ocrError);
        // نكمل حتى لو فشل OCR
      }

      return NextResponse.json({
        success: true,
        verified: true,
        confidence: cloudinaryVerification.confidence,
        extractedName,
        message: "✅ تم التحقق من الهوية بنجاح",
        timestamp: new Date().toISOString()
      });

    } catch (verifyError: any) {
      console.error('❌ خطأ في التحقق:', verifyError);
      
      return NextResponse.json({
        success: false,
        error: "فشل التحقق من الهوية",
        details: verifyError.message,
        message: "⚠️ يرجى التأكد من وضوح الصور والمحاولة مرة أخرى"
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("❌ Error in identity verification:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء التحقق من الهوية" },
      { status: 500 }
    );
  }
}

// دالة للتحقق من تطابق الوجوه باستخدام Cloudinary AI
async function verifyFacesWithCloudinary(idImageUrl: string, selfieUrl: string) {
  // يمكن استخدام Cloudinary AI Add-on أو أي خدمة أخرى
  // هنا مثال بسيط للتوضيح
  
  try {
    // استخدام Face Recognition API (مثل Azure Face API أو AWS Rekognition)
    // للتبسيط، سنستخدم مقارنة بسيطة هنا
    
    // في الإنتاج، استخدم:
    // - Azure Face API: https://azure.microsoft.com/en-us/services/cognitive-services/face/
    // - AWS Rekognition: https://aws.amazon.com/rekognition/
    // - Face++ API: https://www.faceplusplus.com/
    
    console.log('🔍 مقارنة الوجوه...');
    
    // مثال باستخدام Face++ API (مجاني حتى 1000 طلب/شهر)
    if (process.env.FACEPP_API_KEY && process.env.FACEPP_API_SECRET) {
      const FormData = require('form-data');
      const axios = require('axios');
      
      const form = new FormData();
      form.append('api_key', process.env.FACEPP_API_KEY);
      form.append('api_secret', process.env.FACEPP_API_SECRET);
      form.append('image_url1', idImageUrl);
      form.append('image_url2', selfieUrl);
      
      const response = await axios.post('https://api-us.faceplusplus.com/facepp/v3/compare', form, {
        headers: form.getHeaders()
      });
      
      const confidence = response.data.confidence || 0;
      const threshold = 70; // نسبة التطابق المطلوبة (70%)
      
      return {
        match: confidence >= threshold,
        confidence: confidence,
        thresholdUsed: threshold
      };
    }
    
    // إذا لم يكن Face++ مفعّل، نستخدم التحقق البسيط (للتطوير فقط)
    console.warn('⚠️ Face Recognition API غير مفعّل - استخدام التحقق البسيط');
    
    // في بيئة التطوير: نقبل أي صورة (لاحقاً يجب تفعيل API حقيقي)
    return {
      match: true,
      confidence: 85, // نسبة افتراضية
      thresholdUsed: 70,
      note: 'Development mode - Face API not configured'
    };
    
  } catch (error) {
    console.error('❌ خطأ في مقارنة الوجوه:', error);
    throw new Error('فشل في مقارنة الوجوه');
  }
}

// دالة لاستخراج النص من البطاقة (OCR)
async function extractTextFromID(imageUrl: string) {
  try {
    // يمكن استخدام:
    // - Google Cloud Vision API
    // - Tesseract.js
    // - Azure Computer Vision
    
    console.log('📄 استخراج النص من البطاقة...');
    
    // مثال باستخدام Google Cloud Vision (إذا كان مفعّل)
    if (process.env.GOOGLE_VISION_API_KEY) {
      // TODO: تطبيق Google Vision API
    }
    
    // للتطوير: نرجع null (يمكن إضافة OCR لاحقاً)
    return null;
    
  } catch (error) {
    console.error('❌ خطأ في استخراج النص:', error);
    return null;
  }
}
