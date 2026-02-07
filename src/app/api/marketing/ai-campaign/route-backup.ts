import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// AI Marketing Agent - يعمل كموظف تسويق محترف
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { action, data } = await req.json();

    switch (action) {
      case "generate_campaign":
        return await generateFullCampaign(data);
      
      case "analyze_competitors":
        return await analyzeCompetitors(data);
      
      case "suggest_posting_times":
        return await suggestPostingTimes(data);
      
      case "create_audience_personas":
        return await createAudiencePersonas(data);
      
      case "generate_ad_variations":
        return await generateAdVariations(data);
      
      case "create_content_calendar":
        return await createContentCalendar(data);
      
      case "analyze_trends":
        return await analyzeTrends(data);
      
      case "optimize_budget":
        return await optimizeBudget(data);
      
      default:
        return NextResponse.json({ error: "Action غير معروف" }, { status: 400 });
    }
  } catch (error) {
    console.error("AI Campaign Error:", error);
    return NextResponse.json({ 
      error: "حدث خطأ في معالجة الطلب" 
    }, { status: 500 });
  }
}

// 1. توليد حملة إعلانية كاملة
async function generateFullCampaign(data: any) {
  const { productName, productDescription, budget, targetAudience, platform } = data;

  const prompt = `أنت خبير تسويق رقمي محترف متخصص في Facebook و Instagram Ads.

المنتج: ${productName}
الوصف: ${productDescription}
الميزانية: ${budget} جنيه
الجمهور المستهدف: ${targetAudience || 'عام'}
المنصة: ${platform || 'Facebook & Instagram'}

أنشئ حملة إعلانية كاملة ومتكاملة تشمل:

1. **اسم الحملة:** (جذاب ومعبر)

2. **الهدف الإعلاني:** (Awareness, Traffic, Conversions, etc.)

3. **استراتيجية الاستهداف:**
   - العمر المثالي
   - الجنس
   - الاهتمامات (10 اهتمامات على الأقل)
   - السلوكيات
   - المناطق الجغرافية (مصر - محافظات محددة)

4. **Ad Sets (3 مجموعات إعلانية مختلفة):**
   لكل Ad Set:
   - الاسم
   - الجمهور المستهدف
   - الميزانية المقترحة
   - استراتيجية العرض (Bid Strategy)

5. **Creatives (5 أفكار إعلانية مختلفة):**
   لكل Creative:
   - نوع الإعلان (صورة/فيديو/Carousel)
   - الهوك الافتتاحي (Hook)
   - النص الإعلاني (Ad Copy) - عربي فصيح جذاب
   - الـ CTA المناسب
   - وصف الصورة/الفيديو المطلوب

6. **جدول النشر:**
   - أفضل الأوقات للنشر (حسب الجمهور المصري)
   - مدة الحملة المقترحة
   - توزيع الميزانية اليومي

7. **Landing Page Elements:**
   - العناصر الأساسية المطلوبة
   - الـ CTA الرئيسي
   - عناصر بناء الثقة

8. **KPIs ومؤشرات النجاح:**
   - ROAS المتوقع
   - CPA المتوقع
   - CTR المستهدف
   - معدل التحويل المتوقع

9. **خطة A/B Testing:**
   - ما سيتم اختباره
   - كيفية قياس النتائج

10. **نصائح التحسين:**
    - متى نوقف الإعلان
    - متى نزيد الميزانية (Scaling)
    - كيف نحسن الأداء

اكتب كل شيء بالتفصيل والوضوح. استخدم العربية الفصحى البسيطة. كن محترفاً ومباشراً.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "أنت خبير تسويق رقمي محترف متخصص في Facebook و Instagram Ads مع خبرة 10 سنوات في السوق المصري."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.8,
    max_tokens: 3000,
  });

  return NextResponse.json({
    campaign: completion.choices[0].message.content
  });
}

// 2. تحليل المنافسين
async function analyzeCompetitors(data: any) {
  const { industry, competitors } = data;

  const prompt = `أنت محلل تسويق محترف.

الصناعة: ${industry}
المنافسون: ${competitors || 'صفحات مشابهة في نفس المجال'}

قم بتحليل شامل للمنافسين في السوق المصري:

1. **استراتيجيات المحتوى:**
   - نوع المحتوى الأكثر نجاحاً
   - معدل النشر
   - أسلوب الكتابة

2. **استراتيجيات الإعلانات:**
   - نوع الإعلانات المستخدمة
   - الرسائل التسويقية الرئيسية
   - العروض والخصومات

3. **نقاط القوة عند المنافسين:**
   - ما يفعلونه بشكل جيد
   - لماذا ينجح

4. **نقاط الضعف:**
   - الفرص المتاحة
   - ما يمكن أن نفعله بشكل أفضل

5. **الفرص لنا:**
   - كيف نتميز
   - استراتيجيات للتفوق
   - نيتش غير مستغلة

6. **توصيات عملية:**
   - 5 خطوات فورية للتنفيذ
   - كيف نستحوذ على حصة سوقية

كن دقيقاً وعملياً في التحليل.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "أنت محلل تسويق محترف متخصص في تحليل المنافسين والسوق المصري."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return NextResponse.json({
    analysis: completion.choices[0].message.content
  });
}

// 3. اقتراح أفضل أوقات النشر
async function suggestPostingTimes(data: any) {
  const { targetAudience, platform } = data;

  const prompt = `أنت خبير Social Media في السوق المصري.

الجمهور المستهدف: ${targetAudience}
المنصة: ${platform}

بناءً على دراسات السوق المصري وسلوك المستخدمين، قدم:

1. **أفضل أوقات النشر على Facebook:**
   - أيام الأسبوع (كل يوم بتوقيته)
   - نهاية الأسبوع
   - السبب العلمي لكل وقت

2. **أفضل أوقات النشر على Instagram:**
   - Stories
   - Posts
   - Reels
   - التوقيت المثالي لكل نوع

3. **أوقات يجب تجنبها:**
   - متى لا ننشر
   - السبب

4. **خطة نشر أسبوعية:**
   - عدد البوستات المثالي
   - توزيع أنواع المحتوى
   - جدول زمني دقيق

5. **نصائح إضافية:**
   - كيف نزيد التفاعل
   - أفضل أيام للإعلانات المدفوعة

استخدم التوقيت المصري (القاهرة GMT+2). كن دقيقاً ومحدداً.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "أنت خبير Social Media متخصص في السوق المصري وسلوك المستخدمين."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  return NextResponse.json({
    schedule: completion.choices[0].message.content
  });
}

// 4. إنشاء Audience Personas
async function createAudiencePersonas(data: any) {
  const { productType, priceRange } = data;

  const prompt = `أنت خبير في دراسة الجمهور والسوق المصري.

نوع المنتج: ${productType}
السعر: ${priceRange} جنيه

أنشئ 3 Personas (شخصيات الجمهور المستهدف) تفصيلية:

لكل Persona:

1. **المعلومات الديموغرافية:**
   - الاسم والعمر
   - الجنس
   - المحافظة/المدينة
   - الحالة الاجتماعية
   - الوظيفة والدخل الشهري

2. **السلوكيات والاهتمامات:**
   - الهوايات
   - الاهتمامات على Facebook
   - الصفحات التي يتابعها
   - أنماط التسوق

3. **التحديات والمشاكل:**
   - ما يبحث عنه
   - مشاكله اليومية
   - كيف منتجنا يحل مشكلته

4. **سلوك الشراء:**
   - متى يشتري
   - كيف يتخذ القرار
   - ما يؤثر عليه

5. **أفضل طريقة للوصول إليه:**
   - نوع المحتوى المفضل
   - الرسالة التسويقية المناسبة
   - الـ CTA الأنسب

6. **استراتيجية الاستهداف:**
   - الاهتمامات على Facebook Ads
   - السلوكيات
   - الـ Lookalike Source

كن واقعياً ودقيقاً. استخدم أمثلة من السوق المصري.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "أنت خبير في دراسة الجمهور والسوق المصري مع فهم عميق للثقافة والسلوك الشرائي."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.8,
    max_tokens: 2500,
  });

  return NextResponse.json({
    personas: completion.choices[0].message.content
  });
}

// 5. توليد نصوص إعلانية متعددة للـ A/B Testing
async function generateAdVariations(data: any) {
  const { productName, sellingPoints, tone } = data;

  const prompt = `أنت Copywriter محترف متخصص في Facebook و Instagram Ads.

المنتج: ${productName}
مميزات البيع: ${sellingPoints}
الأسلوب المطلوب: ${tone || 'عاطفي وجذاب'}

أنشئ 10 نصوص إعلانية (Ad Copy) مختلفة للـ A/B Testing:

لكل نص:
- رقم النسخة
- الهوك (Hook) - جملة افتتاحية قوية
- Body Text - النص الرئيسي (3-4 أسطر)
- CTA - دعوة للعمل واضحة
- الاستراتيجية المستخدمة (FOMO, Social Proof, Problem-Solution, etc.)

تنوع في:
- الأسلوب (عاطفي، منطقي، فكاهي، جاد)
- طول النص (قصير، متوسط، طويل)
- الرسالة الأساسية
- نوع الـ CTA

استخدم:
- ✅ إيموجيز مناسبة
- ✅ لغة عربية فصيحة بسيطة
- ✅ تقنيات الإقناع
- ✅ أرقام ونتائج محددة

اجعل كل نسخة مميزة ومختلفة تماماً عن الأخرى!`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "أنت Copywriter محترف حائز على جوائز في كتابة الإعلانات الرقمية."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.9,
    max_tokens: 2500,
  });

  return NextResponse.json({
    variations: completion.choices[0].message.content
  });
}

// 6. إنشاء Content Calendar
async function createContentCalendar(data: any) {
  const { duration, postsPerWeek, contentTypes } = data;

  const prompt = `أنت مدير محتوى محترف.

المدة: ${duration} أيام
عدد البوستات أسبوعياً: ${postsPerWeek}
أنواع المحتوى: ${contentTypes || 'متنوع'}

أنشئ Content Calendar تفصيلي لـ ${duration} يوم:

لكل يوم:

📅 **[اليوم والتاريخ]**

1. **نوع المحتوى:** (Post / Story / Reel / Carousel)
2. **المنصة:** (Facebook / Instagram / Both)
3. **التوقيت:** (الساعة بالتحديد - بتوقيت القاهرة)
4. **موضوع البوست:** (عنوان واضح)
5. **الهدف:** (Awareness / Engagement / Conversion / Education)
6. **فكرة المحتوى:** (وصف مختصر)
7. **النص المقترح:** (Draft سريع)
8. **الهاشتاجات:** (5-10 هاشتاجات)
9. **CTA:** (ماذا نريد من الجمهور)
10. **الصورة/الفيديو المطلوب:** (وصف دقيق)

نوّع في:
- أنواع المحتوى (تعليمي، ترفيهي، ترويجي، تفاعلي)
- الأساليب (أسئلة، استطلاعات، قصص عملاء، مسابقات)
- التايمينج (صباحي، مسائي، ليلي)

اجعله عملي وقابل للتنفيذ فوراً!`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "أنت مدير محتوى محترف متخصص في Social Media للسوق المصري."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.8,
    max_tokens: 3000,
  });

  return NextResponse.json({
    calendar: completion.choices[0].message.content
  });
}

// 7. تحليل الترندات
async function analyzeTrends(data: any) {
  const { industry } = data;

  const prompt = `أنت محلل ترندات Social Media في السوق المصري.

الصناعة: ${industry}

قدم تقرير شامل عن:

1. **الترندات الحالية في مصر:**
   - أهم 10 ترندات على Facebook
   - أهم 10 ترندات على Instagram
   - كيف نستفيد منها

2. **Hashtags الرائجة:**
   - 20 هاشتاج رائج في ${industry}
   - 10 هاشتاجات مصرية عامة
   - كيفية استخدامها

3. **أنواع المحتوى الأكثر انتشاراً:**
   - Reels vs Posts vs Stories
   - مواضيع تحقق Viral
   - أساليب الكتابة الرائجة

4. **Challenges ومسابقات:**
   - أفكار مسابقات تناسب منتجنا
   - كيف ننشئ Challenge خاص بنا
   - أمثلة ناجحة

5. **المؤثرون والشراكات:**
   - نوع المؤثرين المناسب
   - كيف نتعاون معهم
   - الميزانية المتوقعة

6. **فرص فورية:**
   - 5 أفكار محتوى نفذها اليوم
   - كيف نركب الموجة
   - توقيت كل فكرة

كن محدثاً ومواكباً للسوق المصري 2026.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "أنت محلل ترندات محترف متابع لآخر التطورات في Social Media المصري."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.8,
    max_tokens: 2500,
  });

  return NextResponse.json({
    trends: completion.choices[0].message.content
  });
}

// 8. تحسين توزيع الميزانية
async function optimizeBudget(data: any) {
  const { totalBudget, platforms, goals } = data;

  const prompt = `أنت خبير في إدارة الميزانيات الإعلانية.

الميزانية الكلية: ${totalBudget} جنيه شهرياً
المنصات: ${platforms}
الأهداف: ${goals}

قدم خطة توزيع ميزانية محسّنة:

1. **توزيع الميزانية على المنصات:**
   - Facebook Ads: X%
   - Instagram Ads: X%
   - السبب لكل نسبة

2. **توزيع حسب الأهداف:**
   - Awareness: X%
   - Consideration: X%
   - Conversion: X%
   - الاستراتيجية لكل هدف

3. **توزيع حسب مراحل القمع (Funnel):**
   - Top of Funnel (Cold Audience): X%
   - Middle of Funnel (Warm Audience): X%
   - Bottom of Funnel (Hot Audience/Retargeting): X%

4. **الميزانية اليومية المقترحة:**
   - توزيع على 30 يوم
   - أيام زيادة الإنفاق
   - أيام تخفيض الإنفاق

5. **استراتيجية Bidding:**
   - Lowest Cost vs Target Cost
   - متى نستخدم كل واحدة
   - الـ Bid Cap المقترح

6. **خطة Scaling:**
   - متى نزيد الميزانية
   - بكم نزيد (%)
   - علامات النجاح

7. **الميزانية الاحتياطية:**
   - للطوارئ والفرص
   - كيف نستخدمها

8. **ROI المتوقع:**
   - العائد المتوقع لكل ${totalBudget} ج إنفاق
   - Break-even point
   - الربح المتوقع

كن دقيقاً في الأرقام والنسب. قدم جدول واضح.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "أنت خبير في تحسين ميزانيات الإعلانات الرقمية مع خلفية مالية قوية."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return NextResponse.json({
    budgetPlan: completion.choices[0].message.content
  });
}
