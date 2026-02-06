import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

// تهيئة OpenAI
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

    // توليد محتوى تسويقي باستخدام GPT-4 (فصلة واحدة فقط)
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `أنت خبير تسويق محترف متخصص في كتابة محتوى تسويقي جذاب باللغة العربية للسوشيال ميديا. 
اكتب بأسلوب مشوق وجذاب مع استخدام الإيموجي المناسبة.`
        },
        {
          role: "user",
          content: `اكتب بوست تسويقي احترافي باللغة العربية لهذا المنتج:

المنتج: ${product.nameAr}
الوصف: ${product.descriptionAr || 'منتج عالي الجودة'}
السعر: ${product.price} جنيه
${product.originalPrice && product.originalPrice > product.price ? `السعر الأصلي: ${product.originalPrice} جنيه (خصم ${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%)` : ''}
الكمية المتاحة: ${product.stock > 0 ? 'متوفر' : 'كمية محدودة جداً'}
القسم: ${product.category?.nameAr || 'منتجات عامة'}

اجعل البوست جذاباً ومشجعاً على الشراء مع استخدام إيموجي مناسبة وعبارات تسويقية قوية.`
        }
      ],
      temperature: 0.8,
      max_tokens: 800,
    });

    const marketingContent = completion.choices[0].message.content || "لم يتم توليد محتوى";

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
