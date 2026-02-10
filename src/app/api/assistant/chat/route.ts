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

interface ProductInfo {
  id: string
  name: string
  nameAr: string
  description: string | null
  descriptionAr: string | null
  price: number
  originalPrice?: number | null
  category: string | null
  stock: number
  imageUrl: string | null
  sizes: string | null
  colors: string | null
  allowCashOnDelivery: boolean
}

// جلب بيانات من قاعدة البيانات لسياق المحادثة
async function getContextData() {
  try {
    // جلب كل المنتجات المتاحة مع كل التفاصيل
    const allProducts = await prisma.product.findMany({
      where: { 
        isActive: true,
        isVisible: true,
      },
      select: {
        id: true,
        name: true,
        nameAr: true,
        description: true,
        descriptionAr: true,
        price: true,
        originalPrice: true,
        stock: true,
        images: true,
        sizes: true,
        colors: true,
        allowCashOnDelivery: true,
        category: {
          select: {
            name: true,
            nameAr: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' }
    })

    // جلب الفئات المتاحة
    const categories = await prisma.category.findMany({
      select: { name: true, nameAr: true },
    })

    // تنسيق المنتجات مع أول صورة
    const products: ProductInfo[] = allProducts.map(p => {
      let imageUrl: string | null = null
      if (p.images) {
        try {
          const imgs = JSON.parse(p.images)
          imageUrl = Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : p.images
        } catch {
          imageUrl = p.images.split(',')[0]?.trim() || null
        }
      }
      return {
        id: p.id,
        name: p.name,
        nameAr: p.nameAr,
        description: p.description,
        descriptionAr: p.descriptionAr,
        price: p.price,
        originalPrice: p.originalPrice,
        category: p.category?.nameAr || p.category?.name || null,
        stock: p.stock,
        imageUrl,
        sizes: p.sizes,
        colors: p.colors,
        allowCashOnDelivery: p.allowCashOnDelivery,
      }
    })

    return {
      products,
      categories: categories.map(c => c.nameAr || c.name),
      brands: [] as string[],
      totalProducts: allProducts.length,
    }
  } catch (error) {
    console.error('Error fetching context data:', error)
    return {
      products: [] as ProductInfo[],
      categories: [],
      brands: [],
      totalProducts: 0,
    }
  }
}

// البحث عن منتجات مطابقة لسؤال العميل
function findMatchingProducts(message: string, products: ProductInfo[]): ProductInfo[] {
  const query = message.toLowerCase()
  
  // كلمات عامة نتجاهلها
  const stopWords = ['عاوز', 'عايز', 'عندكم', 'فين', 'ايه', 'عن', 'في', 'من', 'على', 'ال', 'ده', 'دي', 'هل', 'كم', 'سعر', 'اسعار', 'منتج', 'منتجات', 'حاجة', 'حاجات', 'ابغى', 'ابي', 'وش', 'شو', 'بكام', 'كام', 'قد', 'ايش', 'شنو', 'يا', 'لو', 'ممكن', 'عرض', 'اعرض', 'ورينى', 'وريني', 'فيه']
  
  const scored = products.map(p => {
    let score = 0
    const productName = p.name.toLowerCase()
    const productNameAr = p.nameAr.toLowerCase()
    const productCategory = (p.category || '').toLowerCase()
    const productDesc = (p.descriptionAr || p.description || '').toLowerCase()
    
    // تطابق كامل مع اسم المنتج
    if (productName.includes(query) || query.includes(productName)) score += 15
    if (productNameAr.includes(query) || query.includes(productNameAr)) score += 15
    
    // تطابق كلمات مفتاحية
    const queryWords = query.split(/\s+/).filter(w => w.length > 1 && !stopWords.includes(w))
    for (const word of queryWords) {
      if (productName.includes(word)) score += 5
      if (productNameAr.includes(word)) score += 5
      if (productCategory.includes(word)) score += 3
      if (productDesc.includes(word)) score += 2
    }
    
    return { product: p, score }
  })
  
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(s => s.product)
}

// التعليمات الأساسية للمساعد الذكي
const SYSTEM_INSTRUCTIONS = `أنت موظف خدمة عملاء محترف في متجر "ريمو ستور" (Remo Store) - متجر إلكتروني متخصص في بيع الملابس والأحذية والاكسسوارات النسائية في مصر.

شخصيتك:
- اسمك "ريمو" - موظف خدمة عملاء في ريمو ستور
- بترد بالعامية المصرية بشكل طبيعي ومحترف زي موظف حقيقي
- ودود ومحترف، بتحسسي العميلة إنها مهمة
- بتستخدم إيموجي باعتدال 😊

أسلوب الرد:
- رد بالعامية المصرية (مثال: "أيوه طبعاً"، "تحت أمرك"، "اتفضلي")
- خلي الرد قصير ومباشر (3-4 جمل بالكتير)
- لما حد يسأل عن سعر، قولي السعر فوراً وواضح
- لما حد يسأل عن الخامة، اشرحيلها من الوصف الموجود
- لو سأل عن عرض لأكتر من قطعة، قولي "السعر ثابت يا قمر لكن ممكن تستفيدي من الشحن المجاني للطلبات فوق 500 جنيه 🚚"
- لو طلب خصم أو تخفيض، قولي "الأسعار دي أحسن أسعار والله يا قمر، وكمان الجودة هتعجبك جداً ✨ لو عايزة حاجة تانية أنا تحت أمرك"
- متديش خصم أو تغيري في السعر أبداً - الأسعار ثابتة
- لو المنتج عليه خصم أصلاً (سعر أصلي أعلى)، وضحي كده: "ده كمان عليه خصم من [السعر الأصلي] لـ [السعر الحالي] 🔥"

التعامل مع الأسئلة الشائعة:
- "السعر النهائي كام؟" → قولي السعر + مصاريف الشحن حسب المحافظة
- "الخامة ايه؟" → اشرحي من وصف المنتج لو موجود، أو قولي "خامة ممتازة وجودة عالية"
- "لو هاخد 2 أو 3 قطع؟" → "السعر ثابت يا قمر لكل قطعة، بس لو المجموع فوق 500 جنيه الشحن مجاني 🚚"
- "فيه مقاسات تانية؟" → اعرضي المقاسات المتاحة من البيانات
- "فيه ألوان تانية؟" → اعرضي الألوان المتاحة من البيانات
- "بيوصل امتى؟" → "من 2 لـ 5 أيام عمل حسب المحافظة 📦"
- "ينفع أجرب وأرجع؟" → "طبعاً! عندنا سياسة إرجاع 14 يوم من تاريخ الاستلام 🔄"

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

الفئات المتاحة:
{CATEGORIES}

كتالوج المنتجات الكامل:
{PRODUCTS}

ملاحظات مهمة:
- لديك كتالوج المنتجات الكامل ({TOTAL_PRODUCTS} منتج) بكل التفاصيل
- إذا سألت العميلة عن منتج معين، ابحثي في القائمة وقدمي معلومات كاملة (السعر، المقاسات، الألوان، الوصف)
- المنتجات المطابقة هتظهر تلقائياً ككروت تحت ردك - متكتبيش روابط
- إذا سألت عن مقاس أو لون معين، تحققي من بيانات المنتج
- لو المنتج مش موجود، قولي "للأسف مش متوفر حالياً بس تقدري تتواصلي معانا على واتساب 01555512778 وهنوفرهولك إن شاء الله 💪"
- متديش أي خصم إضافي - الأسعار نهائية
- لو السؤال معقد أو محتاج تدخل بشري، وجهي العميلة لواتساب خدمة العملاء`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory = [], sessionId, source = 'website' } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    console.log('[Assistant API] New message:', message)

    // إنشاء أو جلب المحادثة
    let conversationId: string | null = null
    if (sessionId) {
      try {
        const conversation = await prisma.chatConversation.upsert({
          where: { sessionId },
          create: {
            sessionId,
            source,
            customerIP: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
          },
          update: {
            lastMessageAt: new Date(),
          },
        })
        conversationId = conversation.id

        // حفظ رسالة العميل
        await prisma.chatMessage.create({
          data: {
            conversationId: conversation.id,
            role: 'user',
            content: message,
          },
        })
      } catch (dbError) {
        console.error('[Assistant API] DB save error (user msg):', dbError)
      }
    }

    // جلب بيانات السياق من قاعدة البيانات
    const contextData = await getContextData()
    
    // تنسيق البيانات للإضافة للتعليمات - بيانات كاملة
    const productsInfo = contextData.products.length > 0
      ? contextData.products.map(p => {
          let info = `- [${p.id}] ${p.nameAr || p.name} (${p.category || 'عام'}): ${p.price} جنيه`
          if (p.originalPrice && p.originalPrice > p.price) {
            const discount = Math.round((1 - p.price / p.originalPrice) * 100)
            info += ` (بدل ${p.originalPrice} جنيه - خصم ${discount}%)`
          }
          if (p.descriptionAr || p.description) info += ` | الوصف: ${p.descriptionAr || p.description}`
          if (p.sizes && p.sizes.length > 0) info += ` | المقاسات: ${p.sizes}`
          if (p.colors && p.colors.length > 0) info += ` | الألوان: ${p.colors}`
          info += ` | ${p.allowCashOnDelivery ? 'دفع عند الاستلام متاح' : 'الدفع أونلاين فقط'}`
          info += ` | المخزون: ${p.stock > 10 ? 'متوفر' : p.stock > 0 ? 'كمية محدودة' : 'نفذ'}`
          return info
        }).join('\n')
      : 'لا توجد منتجات متاحة حالياً'

    const categoriesInfo = contextData.categories.length > 0
      ? contextData.categories.join(', ')
      : 'جاري التحديث'

    // إعداد التعليمات مع البيانات الحقيقية
    const systemPrompt = SYSTEM_INSTRUCTIONS
      .replace('{PRODUCTS}', productsInfo)
      .replace('{CATEGORIES}', categoriesInfo)
      .replace('{TOTAL_PRODUCTS}', String(contextData.totalProducts))

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

    // البحث عن منتجات مطابقة للسؤال
    const matchingProducts = findMatchingProducts(message, contextData.products)
    
    // تنسيق المنتجات المطابقة للإرسال للعميل
    const productCards = matchingProducts.map(p => ({
      id: p.id,
      name: p.nameAr || p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      imageUrl: p.imageUrl,
      category: p.category,
      link: `/products/${p.id}`,
    }))

    // حفظ رد المساعد في قاعدة البيانات
    if (conversationId) {
      try {
        await prisma.chatMessage.create({
          data: {
            conversationId,
            role: 'assistant',
            content: reply,
            productIds: matchingProducts.length > 0 ? matchingProducts.map(p => p.id).join(',') : null,
          },
        })
      } catch (dbError) {
        console.error('[Assistant API] DB save error (assistant msg):', dbError)
      }
    }

    return NextResponse.json({
      success: true,
      reply,
      products: productCards,
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
