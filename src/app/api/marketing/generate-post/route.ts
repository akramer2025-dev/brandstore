import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

// تهيئة OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// دالة توليد محتوى تسويقي مجاني (Fallback)
function generateFreeMarketingContent(product: any, productUrl: string) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const mainContent = `✨ ${product.nameAr} ✨

${product.descriptionAr || '🌟 منتج رائع وعالي الجودة يجمع بين الأناقة والراحة!'}

${hasDiscount ? `🔥 عرض خاص! خصم ${discountPercent}% 💥
💰 السعر: ${product.price.toFixed(2)} جنيه بدلاً من ${product.originalPrice.toFixed(2)} جنيه
` : `💰 السعر: ${product.price.toFixed(2)} جنيه فقط!`}

${product.stock > 0 ? `📦 متوفر الآن - الكمية محدودة!` : '⚡ كمية محدودة جداً!'}

🎁 مميزات المنتج:
✅ جودة عالية مضمونة
✅ توصيل سريع لجميع المحافظات
✅ الدفع عند الاستلام
✅ إمكانية الاستبدال والاسترجاع

⏰ اطلب الآن قبل نفاذ الكمية!`;

  return mainContent;
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || (session.user?.role !== "VENDOR" && session.user?.role !== "ADMIN")) {
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
    if (session.user?.role === "VENDOR") {
      // جلب الـ Vendor record للمستخدم الحالي
      const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (!vendor) {
        return NextResponse.json({ error: "حساب الشريك غير موجود" }, { status: 403 });
      }

      // التحقق من ملكية المنتج
      if (product.vendorId !== vendor.id) {
        return NextResponse.json({ error: "غير مصرح لك بالوصول لهذا المنتج" }, { status: 403 });
      }
    }

    // إنشاء لينك المنتج
    const productUrl = `https://www.remostore.net/products/${product.id}`;

    let marketingContent = "";

    // محاولة توليد محتوى باستخدام GPT-4 (فصلة واحدة فقط)
    try {
      console.log("🤖 Trying GPT-4...");
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

      marketingContent = completion.choices[0].message.content || "";
      console.log("✅ GPT-4 نجح!");

    } catch (gptError: any) {
      console.log("❌ GPT-4 فشل، استخدام Template مجاني:", gptError.message);
      // Fallback للمحتوى المجاني
      marketingContent = "";
    }

    // إذا فشل GPT-4 أو لم يعطي محتوى، استخدم Template مجاني
    if (!marketingContent) {
      console.log("📝 استخدام Free Template...");
      marketingContent = generateFreeMarketingContent(product, productUrl);
    }

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
