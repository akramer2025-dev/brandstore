import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { query, campaigns, analytics, orders, metrics } = await req.json();
    const response = generateResponse(query, campaigns, analytics, orders, metrics);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Media Buyer AI Query Error:", error);
    return NextResponse.json({ error: "فشل معالجة الاستفسار" }, { status: 500 });
  }
}

function generateResponse(query: string, campaigns: any[], analytics: any[], orders: any[], metrics: any) {
  const lowerQuery = query.toLowerCase();

  // ROAS queries
  if (lowerQuery.includes("roas") || lowerQuery.includes("عائد") || lowerQuery.includes("العائد على الإنفاق")) {
    return `💰 **تحليل ROAS**

الـ ROAS الحالي: **${metrics.roas.toFixed(2)}x**

${metrics.roas < 2 ? `
⚠️ **منخفض جداً!** الهدف: 3x+

🚀 **خطة سريعة:**
1. أوقف الحملات ذات ROI < 100% فوراً
2. ضاعف ميزانية الحملات ROI > 200%
3. استخدم Retargeting (Add to Cart)
4. حسّن Landing Page

متوقع: ROAS يصل ${(metrics.roas * 1.5).toFixed(2)}x خلال أسبوعين
` : metrics.roas >= 3 ? `
🏆 **ممتاز!** أنت فوق المتوسط

📈 **للتحسين أكثر:**
1. جرب Lookalike 1-2%
2. Scale تدريجياً (+20% كل 3 أيام)
3. Test creatives جديدة
4. وسع الجمهور بحذر
` : `
✅ **جيد** لكن يمكن أفضل

💡 **خطوات التحسين:**
1. حسّن استهداف الجمهور
2. اختبر عناوين جديدة (A/B Test)
3. استخدم Bid Cap Strategy
4. راجع صفحة الهبوط
`}`;
  }

  // CPA queries
  if (lowerQuery.includes("cpa") || lowerQuery.includes("تكلفة الاكتساب") || lowerQuery.includes("تكلفة العميل")) {
    return `🎯 **تحليل CPA (تكلفة الاكتساب)**

CPA الحالي: **${metrics.cpa.toFixed(0)} ج**

📊 **المقارنة:**
- الهدف المثالي: ${(metrics.cpa * 0.7).toFixed(0)} ج
- CPA الصناعة: 150-250 ج

💡 **لتقليل CPA:**

**1. Retargeting أولاً (CPA أقل 50%):**
- من أضاف للسلة
- من زار الموقع
- من شاهد 75%+ من فيديو

**2. حسّن Quality Score:**
- مطابقة الإعلان للكلمة المفتاحية
- Landing Page سريعة
- CTR عالي

**3. استخدم Automatic Bidding:**
- Facebook: Lowest Cost
- Google: Target CPA (اضبطه ${(metrics.cpa * 0.8).toFixed(0)} ج)

🎯 **النتيجة المتوقعة:**
CPA ينزل من ${metrics.cpa.toFixed(0)} → ${(metrics.cpa * 0.7).toFixed(0)} ج خلال أسبوع`;
  }

  // Scaling queries
  if (lowerQuery.includes("scaling") || lowerQuery.includes("توسيع") || lowerQuery.includes("زيادة الميزانية") || lowerQuery.includes("مضاعفة")) {
    const topCampaign = campaigns.reduce((best: any, c: any) => c.roi > best.roi ? c : best, campaigns[0] || {});
    
    return `📈 **خطة Scaling**

${topCampaign.roi >= 200 ? `
✅ **جاهز للـ Scaling!**

أفضل حملة: "${topCampaign.name}"
- ROI: ${topCampaign.roi}%
- الميزانية الحالية: ${topCampaign.budget} ج

🚀 **خطة 4 أسابيع:**

**الأسبوع 1:**
زِد ${(topCampaign.budget * 0.2).toFixed(0)} ج (+20%)
الميزانية الجديدة: ${(topCampaign.budget * 1.2).toFixed(0)} ج

**الأسبوع 2:**
زِد ${(topCampaign.budget * 1.2 * 0.25).toFixed(0)} ج (+25%)
الميزانية الجديدة: ${(topCampaign.budget * 1.5).toFixed(0)} ج

**الأسبوع 3:**
زِد ${(topCampaign.budget * 1.5 * 0.3).toFixed(0)} ج (+30%)
الميزانية الجديدة: ${(topCampaign.budget * 2).toFixed(0)} ج

**الأسبوع 4:**
وسّع الجمهور:
- LAL 1% → LAL 2-3%
- Top 3 محافظات → Top 10
- Feed → Feed + Stories + Reels

📊 **المتوقع:**
الإيرادات تزيد من ${(topCampaign.budget * (topCampaign.roi / 100)).toFixed(0)} ج
إلى ${(topCampaign.budget * 2 * (topCampaign.roi / 100) * 0.85).toFixed(0)} ج يومياً

⚠️ **توقف إذا:**
- ROAS نزل أقل من 2x
- CPA زاد أكثر من 30%
` : `
⚠️ **لست جاهزاً بعد!**

ROI الحالي: ${topCampaign.roi}%
الهدف: 200%+

💡 **حسّن الأداء أولاً:**
1. استخدم Retargeting
2. حسّن الكرييتف
3. اختبر audiences جديدة
4. حسّن صفحة الهبوط

بعدها ابدأ الـ Scaling!
`}`;
  }

  // Creative/Design queries
  if (lowerQuery.includes("تصميم") || lowerQuery.includes("صور") || lowerQuery.includes("فيديو") || lowerQuery.includes("creative") || lowerQuery.includes("كرييتف")) {
    return `🎨 **تحسين الكرييتف**

الكرييتف = 90% من نجاح الإعلان!

✅ **صيغة الكرييتف الفائز:**

**الصور/الفيديو:**
1. Hook قوي أول 3 ثوان
2. شخص يستخدم المنتج (ليس ينظر للكاميرا)
3. ألوان جذابة (أحمر، أصفر، برتقالي)
4. Before/After إن أمكن
5. User Generated Content

**النص (Copy):**

**Hook:** "لا تشتري [منتج] قبل ما تشوف ده!"

**Problem:** "متعرفش تلاقي [منتج] [صفة]؟"

**Solution:** "[منتجنا] مصمم خصيصاً عشان..."

**Benefits:**
✨ ميزة 1
💃 ميزة 2
🎨 ميزة 3

**Social Proof:** "⭐⭐⭐⭐⭐ (500+ تقييم)"

**Urgency:** "🔥 العرض ينتهي خلال 6 ساعات"

**CTA:** "👇 اطلب دلوقتي واحصل على خصم 30%"

---

🧪 **اختبر 3 أنواع:**
1. Product Focus (صورة المنتج)
2. Lifestyle (شخص يستخدمه)
3. Before/After

💡 **Pro Tip:**
غير الكرييتف كل أسبوعين حتى لو شغال كويس!`;
  }

  // Audience/Targeting queries
  if (lowerQuery.includes("جمهور") || lowerQuery.includes("استهداف") || lowerQuery.includes("audience") || lowerQuery.includes("targeting")) {
    return `🎯 **استراتيجية الاستهداف**

📊 **أولويات الاستهداف:**

**1️⃣ Hot (الأفضل):**
🔥 Add to Cart (CPA: ${(metrics.cpa * 0.5).toFixed(0)} ج)
🔥 Product Viewers (CPA: ${(metrics.cpa * 0.7).toFixed(0)} ج)
🔥 Website Visitors (CPA: ${(metrics.cpa * 0.9).toFixed(0)} ج)

**2️⃣ Warm:**
🌟 Lookalike 1% (CPA: ${(metrics.cpa * 1.2).toFixed(0)} ج)
🌟 Engaged Users (CPA: ${(metrics.cpa * 1.3).toFixed(0)} ج)

**3️⃣ Cold:**
❄️ Interest Targeting (CPA: ${(metrics.cpa * 2).toFixed(0)} ج)

---

💰 **توزيع الميزانية:**
- 40% → Retargeting (Hot)
- 30% → Lookalike 1-2%
- 20% → Engaged
- 10% → Testing

---

❌ **Exclusions مهمة:**
- من اشترى خلال آخر 30 يوم
- موظفيك وأصدقائك
- مناطق لا توصل لها

---

⏰ **أفضل الأوقات:**
- 4-7 مساءً (ROAS أعلى 3.2x)
- 8-11 مساءً
- تجنب: 12-6 صباحاً

💡 **نصيحة:**
ابدأ Narrow (ضيق) ثم وسع تدريجياً`;
  }

  // A/B Testing queries
  if (lowerQuery.includes("a/b") || lowerQuery.includes("اختبار") || lowerQuery.includes("test")) {
    return `🧪 **A/B Testing**

📊 **ما تختبره:**

**Priority 1 (الأهم):**
✅ العناوين
✅ الصور/الفيديوهات
✅ CTA (Call-to-Action)

**Priority 2:**
✅ الجمهور (Narrow vs Broad)
✅ Placements (Feed vs Stories)
✅ Bid Strategy

**Priority 3:**
✅ الألوان
✅ مدة الفيديو
✅ نوع المحتوى

---

📏 **القواعد:**

1️⃣ **اختبر عنصر واحد فقط:**
❌ عنوان + صورة معاً
✅ عنوان فقط OR صورة فقط

2️⃣ **انتظر البيانات:**
- 100+ تحويل كحد أدنى
- 3-7 أيام كحد أدنى

3️⃣ **طبق النتائج فوراً:**
استخدم الفائز في كل الحملات

---

مثال:
**Test:** عنوان A vs B
- A: "خصم 50%"
- B: "وفر 500 ج"

النتيجة: B فاز بـ 25% تحويلات أكثر
→ استخدم B في كل مكان

💡 **اختبر باستمرار!**
2-3 tests أسبوعياً = تحسين مستمر`;
  }

  // General advice
  return `🤖 **Media Buyer AI**

سؤالك: "${query}"

📊 **تحليل سريع:**
- ROAS: ${metrics.roas.toFixed(2)}x ${metrics.roas >= 3 ? "🏆" : metrics.roas >= 2 ? "✅" : "⚠️"}
- CPA: ${metrics.cpa.toFixed(0)} ج
- CTR: ${metrics.ctr.toFixed(2)}% ${metrics.ctr >= 3 ? "🏆" : "⚠️"}
- معدل التحويل: ${metrics.conversionRate.toFixed(2)}%

---

💡 **توصيات سريعة:**

${metrics.roas < 2 ? "1. ⚠️ ROAS منخفض - استخدم Retargeting وحسّن الاستهداف\n" : ""}
${metrics.ctr < 2 ? "2. ⚠️ CTR منخفض - جرب creatives جديدة وعناوين أقوى\n" : ""}
${metrics.conversionRate < 2 ? "3. ⚠️ معدل تحويل منخفض - حسّن صفحة الهبوط\n" : ""}
${metrics.roas >= 3 && metrics.ctr >= 3 ? "✅ أداء ممتاز! جاهز للـ Scaling\n" : ""}

---

❓ **أسئلة يمكنك طرحها:**
- "كيف أحسن ROAS؟"
- "كيف أقلل CPA؟"
- "استراتيجية Scaling؟"
- "كيف أحسن الكرييتف؟"
- "أفضل استراتيجية استهداف؟"
- "كيف أعمل A/B Testing؟"`;
}
