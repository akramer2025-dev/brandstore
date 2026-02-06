import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || (session.user?.role !== "PARTNER" && session.user?.role !== "ADMIN")) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }

    // جلب تفاصيل المنتج
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        vendor: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    // التحقق من أن الشريك يملك المنتج
    if (session.user?.role === "PARTNER" && product.vendorId !== session.user.id) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول لهذا المنتج" }, { status: 403 });
    }

    // إنشاء لينك المنتج
    const productUrl = `https://www.remostore.net/products/${product.id}`;

    // توليد محتوى تسويقي باستخدام OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `أنت خبير تسويق محترف متخصص في كتابة منشورات جذابة لوسائل التواصل الاجتماعي (فيسبوك وإنستجرام). 
          
مهمتك: كتابة منشور تسويقي احترافي ومبهر باللغة العربية يحتوي على:
1. عنوان جذاب مع إيموجيز مناسبة
2. وصف المنتج بشكل مثير ومقنع
3. ذكر المميزات الرئيسية بطريقة مبدعة
4. سعر المنتج بطريقة جذابة
5. Call-to-Action قوي
6. هاشتاجات مناسبة (5-7 هاشتاجات)
7. استخدام إيموجيز بشكل احترافي ومتناسق
8. أسلوب يناسب الجمهور المصري والعربي

ملاحظات:
- استخدم لغة عربية فصحى بسيطة ومفهومة
- اجعل المنشور مثير للاهتمام ويدفع للشراء
- استخدم تقنيات FOMO (الخوف من فوات الفرصة)
- اجعل النص متوسط الطول (ليس قصير جداً ولا طويل جداً)
- ركز على فوائد المنتج وليس فقط المواصفات`,
        },
        {
          role: "user",
          content: `اكتب منشور تسويقي احترافي لهذا المنتج:

اسم المنتج: ${product.nameAr}
الوصف: ${product.descriptionAr || "منتج رائع وعالي الجودة"}
السعر: ${product.price.toFixed(2)} جنيه
${product.originalPrice ? `السعر الأصلي: ${product.originalPrice.toFixed(2)} جنيه` : ''}
الفئة: ${product.category?.nameAr || 'منتجات'}
${product.stock > 0 ? `الكمية المتوفرة: ${product.stock}` : 'كمية محدودة'}

المنشور يجب أن يتضمن في النهاية رابط المنتج للطلب المباشر.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 800,
    });

    const marketingContent = completion.choices[0].message.content || "";

    // إضافة رابط المنتج في النهاية
    const fullContent = `${marketingContent}

🔗 اطلب الآن من هنا:
${productUrl}

💬 للطلب: تواصل معنا مباشرة
📱 واتساب: 01555512778`;

    // إنشاء نصوص بديلة للمنصات المختلفة
    const facebookPost = fullContent;
    
    const instagramPost = `${marketingContent}

🔗 الرابط في البايو
أو تواصل معنا مباشرة 💬
📱 01555512778

#remostore #تسوق_اونلاين #موضة #أزياء #عروض #تخفيضات #${product.category?.nameAr?.replace(/\s+/g, '_') || 'منتجات'}`;

    const twitterPost = marketingContent.split('\n').slice(0, 3).join('\n') + `\n\n🔗 ${productUrl}`;

    const whatsappMessage = `*${product.nameAr}*

${product.descriptionAr || 'منتج رائع وعالي الجودة'}

💰 السعر: *${product.price.toFixed(2)} جنيه*

🔗 شاهد المنتج وتفاصيله:
${productUrl}

🛒 اطلب الآن عبر الواتساب!`;

    return NextResponse.json({
      success: true,
      content: {
        general: fullContent,
        facebook: facebookPost,
        instagram: instagramPost,
        twitter: twitterPost,
        whatsapp: whatsappMessage,
      },
      product: {
        id: product.id,
        name: product.nameAr,
        price: product.price,
        url: productUrl,
        image: product.images?.split(',')[0]?.trim() || null,
      },
    });

  } catch (error: any) {
    console.error("Error generating marketing content:", error);
    
    // Fallback: إذا فشل OpenAI، نرجع محتوى تسويقي بسيط
    return NextResponse.json(
      { 
        error: "حدث خطأ في توليد المحتوى التسويقي",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
