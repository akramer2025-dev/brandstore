import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// دالة توليد محتوى تسويقي مجاني (بدون OpenAI)
function generateFreeMarketingContent(product: any, productUrl: string) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // محتوى رئيسي
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

    // توليد المحتوى مباشرة باستخدام Template مجاني (استجابة فورية ⚡)
    const marketingContent = generateFreeMarketingContent(product, productUrl);

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
