import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { productDescription, campaignTypes, country } = body;

    if (!productDescription || !campaignTypes || campaignTypes.length === 0) {
      return NextResponse.json(
        { error: "يجب توفير وصف المنتج ونوع الحملة" },
        { status: 400 }
      );
    }

    // استخدام OpenAI لتحليل المنتج واقتراح البيانات
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "OpenAI API key غير متوفر" },
        { status: 500 }
      );
    }

    const prompt = `أنت موظف ميديا باير محترف. قم بتحليل المنتج/الخدمة التالية واقترح حملة إعلانية كاملة:

**المنتج/الخدمة:** ${productDescription}
**أنواع الحملة:** ${campaignTypes.join(", ")}
**البلد المستهدف:** ${country}

قدم الاقتراحات التالية بتنسيق JSON:
{
  "name": "اسم الحملة المقترح (عربي، جذاب، قصير)",
  "platform": "المنصات المناسبة (مثل: Facebook, Instagram)",
  "budget": "الميزانية المقترحة بالأرقام فقط (مثلاً: 5000)",
  "targetAudience": "وصف مفصل للجمهور المستهدف (العمر، الجنس، الاهتمامات، الموقع)",
  "keywords": "كلمات مفتاحية مناسبة مفصولة بفواصل (10-15 كلمة على الأقل)",
  "adCopy": "نص إعلان احترافي وجذاب (3-4 أسطر)"
}

**مهم:**
- اكتب باللغة العربية فقط
- كن محدداً واحترافياً
- اقترح ميزانية واقعية بناءً على المنتج والسوق
- اختر كلمات مفتاحية عالية البحث
- اكتب نص إعلان إقناعي ومؤثر`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // استخدام gpt-4o-mini - أسرع وأرخص ويدعم JSON mode
        messages: [
          {
            role: "system",
            content: "أنت موظف ميديا باير محترف متخصص في التسويق الرقمي والإعلانات المدفوعة. تجيد تحليل المنتجات واستهداف الجمهور الصحيح وكتابة نصوص إعلانية مقنعة. قم بالرد دائماً بصيغة JSON فقط.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error("OpenAI error:", error);
      return NextResponse.json(
        { error: "فشل في الحصول على اقتراحات الذكاء الاصطناعي" },
        { status: 500 }
      );
    }

    const openaiData = await openaiResponse.json();
    const suggestions = JSON.parse(openaiData.choices[0].message.content);

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("AI assist error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة الطلب" },
      { status: 500 }
    );
  }
}
