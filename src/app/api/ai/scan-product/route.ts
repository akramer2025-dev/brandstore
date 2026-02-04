import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * API للتعرف على المنتج من الصورة باستخدام Vision AI
 * يستخرج: اسم المنتج، البار كود، الوصف، السعر المقترح
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !['VENDOR', 'ADMIN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'يرجى إرفاق صورة المنتج' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI API Key غير متوفر',
        suggestion: 'يرجى إضافة OPENAI_API_KEY في ملف .env'
      }, { status: 500 });
    }

    // استخدام GPT-4 Vision لتحليل الصورة
    // gpt-4o-mini = أرخص 10 مرات | gpt-4o = أقوى وأدق
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // غيّر لـ "gpt-4o" للحصول على دقة أعلى
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `أنت خبير في تحليل منتجات المتاجر الإلكترونية. قم بتحليل هذه الصورة واستخرج المعلومات التالية بدقة:

1. **اسم المنتج** (بالعربية): اسم واضح ومختصر للمنتج
2. **اسم المنتج** (بالإنجليزية): ترجمة احترافية
3. **رقم الباركود**: إذا كان موجوداً في الصورة، اقرأه بدقة
4. **الوصف** (بالعربية): وصف تفصيلي شامل (المادة، الخصائص، الاستخدام)
5. **الوصف** (بالإنجليزية): ترجمة احترافية
6. **السعر المقترح** (بالجنيه المصري): بناءً على نوع المنتج وجودته
7. **الفئة**: تحديد الفئة المناسبة (ملابس رجالي، نسائي، إكسسوارات، إلخ)
8. **المقاسات المتاحة**: إذا كان منتج ملابس (XS, S, M, L, XL, XXL, XXXL)
9. **الألوان المتاحة**: قائمة بالألوان الممكنة

أرجع النتيجة في JSON فقط بهذا الشكل:
{
  "nameAr": "اسم المنتج بالعربية",
  "name": "Product Name in English",
  "barcode": "1234567890123",
  "descriptionAr": "وصف تفصيلي بالعربية",
  "description": "Detailed description in English",
  "suggestedPrice": 250,
  "category": "ملابس رجالي",
  "sizes": ["M", "L", "XL"],
  "colors": ["أسود", "أبيض", "رمادي"],
  "confidence": 0.95
}

إذا لم تستطع قراءة الباركود، ضع null.
confidence يمثل مدى ثقتك في التحليل (0-1).`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.2, // دقة عالية
    });

    const content = response.choices[0]?.message?.content || '';
    
    // استخراج JSON من الرد
    let extractedData;
    try {
      // البحث عن JSON في النص
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json({
        error: 'فشل تحليل الصورة',
        suggestion: 'حاول مع صورة أوضح',
        rawResponse: content
      }, { status: 500 });
    }

    // التحقق من وجود البيانات الأساسية
    if (!extractedData.nameAr) {
      return NextResponse.json({
        error: 'لم يتم التعرف على المنتج',
        suggestion: 'تأكد من وضوح الصورة وأن المنتج ظاهر بالكامل'
      }, { status: 400 });
    }

    // إضافة معلومات إضافية
    const result = {
      ...extractedData,
      scannedAt: new Date().toISOString(),
      scannedBy: session.user.id,
    };

    return NextResponse.json({
      success: true,
      data: result,
      message: `✅ تم التعرف على المنتج بنسبة ${Math.round((extractedData.confidence || 0.8) * 100)}%`
    });

  } catch (error: any) {
    console.error('Error scanning product:', error);
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json({
        error: 'انتهى رصيد OpenAI API',
        suggestion: 'يرجى تجديد الرصيد أو التواصل مع المطور'
      }, { status: 402 });
    }

    return NextResponse.json({
      error: 'حدث خطأ أثناء تحليل الصورة',
      details: error.message
    }, { status: 500 });
  }
}
