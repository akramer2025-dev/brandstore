import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { prisma } from '@/lib/prisma'

// إعداد Groq client بشكل lazy
let groqClient: Groq | null = null
function getGroq() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is missing')
    }
    groqClient = new Groq({ apiKey })
  }
  return groqClient
}

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// جلب بيانات من قاعدة البيانات لسياق المحادثة
async function getContextData() {
  try {
    // جلب بعض المنتجات المميزة
    const featuredProducts = await prisma.product.findMany({
      where: { 
        status: 'ACTIVE',
        isAvailable: true,
        stock: { gt: 0 }
      },
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        brand: true,
        stock: true,
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    })

    // جلب الفئات المتاحة
    const categories = await prisma.product.findMany({
      where: { 
        status: 'ACTIVE',
        isAvailable: true 
      },
      select: { category: true },
      distinct: ['category'],
    })

    // جلب الماركات المتاحة
    const brands = await prisma.product.findMany({
      where: { 
        status: 'ACTIVE',
        isAvailable: true 
      },
      select: { brand: true },
      distinct: ['brand'],
    })

    return {
      products: featuredProducts,
      categories: categories.map(c => c.category),
      brands: brands.map(b => b.brand).filter(Boolean),
    }
  } catch (error) {
    console.error('Error fetching context data:', error)
    return {
      products: [],
      categories: [],
      brands: [],
    }
  }
}

// التعليمات الأساسية للمساعد الذكي
const SYSTEM_INSTRUCTIONS = `أنت مساعد ذكي لمتجر "ريمو ستور" (Remo Store) - متجر إلكتروني متخصص في بيع الملابس والأحذية والاكسسوارات النسائية في مصر.

دورك:
- رد على استفسارات العملاء بطريقة احترافية ودودة
- استخدم اللغة العربية الفصحى مع لمسة من العامية المصرية المحببة
- قدم معلومات دقيقة عن المنتجات والأسعار من البيانات المتوفرة
- ساعد العملاء في اختيار المنتجات المناسبة لهم
- أجب على الأسئلة عن الشحن والدفع والإرجاع

معلومات عن المتجر:
- الاسم: ريمو ستور (Remo Store)
- التخصص: ملابس وأحذية واكسسوارات نسائية
- الموقع: مصر - القاهرة
- التوصيل: جميع محافظات مصر (2-5 أيام عمل)
- الشحن المجاني: للطلبات أكثر من 500 جنيه
- طرق الدفع: 
  * الدفع عند الاستلام (كاش) - متاح فقط للملابس
  * فيزا / ماستركارد
  * فوري
  * فودافون كاش
- سياسة الإرجاع: 14 يوم من تاريخ الاستلام
- خدمة العملاء:
  * واتساب: 01555512778
  * البريد: remostore.egy@gmail.com
  * الموقع: www.remostore.net
  * فيسبوك ماسنجر: m.me/remostore.egy

الفئات المتاحة:
{CATEGORIES}

الماركات المتاحة:
{BRANDS}

بعض المنتجات المميزة:
{PRODUCTS}

ملاحظات مهمة:
- إذا سأل العميل عن منتج معين، ابحث في قائمة المنتجات المتاحة
- إذا كان المنتج غير متوفر في القائمة، أخبر العميل أنك ستتحقق وتنصحه بالتواصل
- رد بإيموجي مناسبة لتحسين تجربة المحادثة 😊
- كن مختصراً وواضحاً، لا تكتب أكثر من 3-4 جمل في الرد الواحد
- إذا كان السؤال معقد أو يحتاج تدخل بشري، وجه العميل لخدمة العملاء

أسلوب الرد:
- ابدأ بتحية لطيفة
- كن محترفاً وودوداً
- استخدم الإيموجي باعتدال
- أعط معلومات محددة (أسعار، مواصفات)
- اختم باستعداد للمساعدة أكثر`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory = [] } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    console.log('[Assistant API] New message:', message)

    // جلب بيانات السياق من قاعدة البيانات
    const contextData = await getContextData()
    
    // تنسيق البيانات للإضافة للتعليمات
    const productsInfo = contextData.products.length > 0
      ? contextData.products.map(p => 
          `- ${p.name} (${p.category || 'عام'}): ${p.price} جنيه - ${p.stock > 10 ? 'متوفر' : 'كمية محدودة'}`
        ).join('\n')
      : 'لا توجد منتجات متاحة حالياً'

    const categoriesInfo = contextData.categories.length > 0
      ? contextData.categories.join(', ')
      : 'جاري التحديث'

    const brandsInfo = contextData.brands.length > 0
      ? contextData.brands.join(', ')
      : 'متنوعة'

    // إعداد التعليمات مع البيانات الحقيقية
    const systemPrompt = SYSTEM_INSTRUCTIONS
      .replace('{PRODUCTS}', productsInfo)
      .replace('{CATEGORIES}', categoriesInfo)
      .replace('{BRANDS}', brandsInfo)

    // بناء تاريخ المحادثة
    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6), // آخر 6 رسائل فقط للحفاظ على السياق
      { role: 'user', content: message }
    ]

    console.log('[Assistant API] Sending to Groq...')

    // استدعاء Groq AI
    const groq = getGroq()
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.9,
    })

    const reply = chatCompletion.choices[0]?.message?.content || 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'

    console.log('[Assistant API] AI Response:', reply)

    return NextResponse.json({
      success: true,
      reply,
      conversationHistory: [
        ...conversationHistory.slice(-6),
        { role: 'user', content: message },
        { role: 'assistant', content: reply }
      ]
    })

  } catch (error) {
    console.error('[Assistant API] Error:', error)
    return NextResponse.json(
      { 
        error: 'حدث خطأ في المساعد الذكي',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// إضافة تكوين route للتأكد من التشغيل الديناميكي
export const dynamic = 'force-dynamic'
