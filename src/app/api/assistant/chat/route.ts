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

// حساب سعر الجملة (6 قطع أو أكثر = خصم)
function calculateWholesalePrice(retailPrice: number, quantity: number): { price: number, discount: number } {
  if (quantity >= 6) {
    // السعر الأصلي فيه هامش 30%، نخليه 15% للجملة
    // يعني خصم حوالي 13% من سعر التجزئة
    const wholesalePrice = Math.round(retailPrice * 0.87) // خصم 13%
    const discount = Math.round(((retailPrice - wholesalePrice) / retailPrice) * 100)
    return { price: wholesalePrice, discount }
  }
  return { price: retailPrice, discount: 0 }
}

// كشف إذا كان العميل بيسأل عن كميات كبيرة
function detectQuantityInMessage(message: string): number {
  const query = message.toLowerCase()
  
  // البحث عن أرقام في الرسالة
  const numbers = message.match(/\d+/)
  if (numbers) {
    const num = parseInt(numbers[0])
    if (num >= 2 && num <= 100) {
      // تأكد إنه بيتكلم عن كمية مش سعر
      if (query.includes('قطع') || query.includes('قطعة') || query.includes('حبة') || query.includes('حبه') || 
          query.includes('هاخد') || query.includes('عايز') || query.includes('اشتري') || query.includes('اطلب')) {
        return num
      }
    }
  }
  
  return 0
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

    // جلب أسعار الشحن للمحافظات
    const deliveryZones = await prisma.deliveryZone.findMany({
      where: { isActive: true },
      orderBy: { governorate: 'asc' }
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
      
      // لو مفيش صورة، استخدم صورة افتراضية
      if (!imageUrl) {
        console.warn(`⚠️ المنتج "${p.nameAr || p.name}" (ID: ${p.id}) مفيهوش صورة`)
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
      deliveryZones,
    }
  } catch (error) {
    console.error('Error fetching context data:', error)
    return {
      products: [] as ProductInfo[],
      categories: [],
      brands: [],
      deliveryZones: [],
      totalProducts: 0,
    }
  }
}

// حساب مسافة Levenshtein للبحث الغامض (Fuzzy Search)
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []
  for (let i = 0; i <= str2.length; i++) matrix[i] = [i]
  for (let j = 0; j <= str1.length; j++) matrix[0][j] = j
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[str2.length][str1.length]
}

// البحث عن منتجات مطابقة لسؤال العميل - دقة عالية
function findMatchingProducts(message: string, products: ProductInfo[]): ProductInfo[] {
  let query = message.toLowerCase()
  
  // 🔄 مرادفات للمنتجات (synonyms mapping)
  const synonyms: Record<string, string> = {
    // إسدال / ملحفة variations
    'إسدال': 'اسدال',
    'إسدالات': 'اسدال',
    'اسدالات': 'اسدال',
    'ملحفة': 'اسدال',
    'ملحفه': 'اسدال',
    'ملحفات': 'اسدال',
    // طرحة / حجاب variations
    'حجاب': 'طرحة',
    'حجابات': 'طرحة',
    'شيلة': 'طرحة',
    'شيلات': 'طرحة',
    'طرح': 'طرحة',
    'طرحه': 'طرحة',
    // عباءة variations
    'عباية': 'عباءة',
    'عبايه': 'عباءة',
    'عبايات': 'عباءة',
    'عباءات': 'عباءة',
    // ملابس عامة
    'بلوزة': 'بلوزه',
    'تنورة': 'تنوره',
    'جلابية': 'جلابيه',
    'جلابيه': 'جلابيه',
  }
  
  console.log('[Search] Original query:', message)
  console.log('[Search] Lowercase query:', query)
  
  // استبدال المرادفات في النص
  for (const [synonym, replacement] of Object.entries(synonyms)) {
    const regex = new RegExp(`\\b${synonym}\\b`, 'gi')
    if (regex.test(query)) {
      console.log(`[Search] Replacing "${synonym}" with "${replacement}"`)
      query = query.replace(regex, replacement)
    }
  }
  
  console.log('[Search] Final query after synonyms:', query)
  
  // كلمات عامة نتجاهلها
  const stopWords = ['عاوز', 'عايز', 'عاوزة', 'عاوزه', 'عاوزين', 'عندكم', 'فين', 'ايه', 'عن', 'في', 'من', 'على', 'ال', 'ده', 'دي', 'هل', 'كم', 'سعر', 'اسعار', 'منتج', 'منتجات', 'حاجة', 'حاجات', 'ابغى', 'ابي', 'وش', 'شو', 'بكام', 'كام', 'قد', 'ايش', 'شنو', 'يا', 'لو', 'ممكن']
  
  const scored = products.map(p => {
    let score = 0
    const productName = p.name.toLowerCase()
    const productNameAr = p.nameAr.toLowerCase()
    const productCategory = (p.category || '').toLowerCase()
    
    // تطابق كامل مع اسم المنتج - أعلى نقاط (نقاط أكبر بكتير)
    if (productName === query || productNameAr === query) score += 200
    
    // تطابق جزئي في الاسم - نقاط عالية جداً
    if (productName.includes(query) || query.includes(productName)) score += 100
    if (productNameAr.includes(query) || query.includes(productNameAr)) score += 100
    
    // تطابق الكاتيجوري
    if (productCategory.includes(query) || query.includes(productCategory)) score += 40
    
    // تطابق كلمات مفتاحية
    const queryWords = query.split(/\s+/).filter(w => w.length > 1 && !stopWords.includes(w))
    
    for (const word of queryWords) {
      if (word.length < 2) continue
      
      // Exact matching - نقاط أعلى
      if (productName.includes(word)) score += 30
      if (productNameAr.includes(word)) score += 30
      if (productCategory.includes(word)) score += 20
      
      // Fuzzy matching للكلمات الطويلة (مسموح بحرفين غلط)
      if (word.length > 3) {
        const nameWords = productNameAr.split(/\s+/)
        for (const nameWord of nameWords) {
          if (nameWord.length >= 3) {
            const distance = levenshteinDistance(word, nameWord)
            if (distance <= 2) {
              score += Math.max(5, 12 - distance * 3)
            }
          }
        }
      }
    }
    
    if (score > 0) {
      console.log(`[Search] Product "${p.nameAr}" scored ${score}`)
    }
    
    return { product: p, score }
  })
  
  // عرض فقط المنتجات اللي عندها score أكبر من 5 (كان 10 - خفضناه)
  const filtered = scored
    .filter(s => s.score > 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
  
  console.log(`[Search] Found ${filtered.length} matching products (score > 5)`)
  
  return filtered.map(s => s.product)
}

// التعليمات الأساسية للمساعد الذكي
const SYSTEM_INSTRUCTIONS = `أنت موظف خدمة عملاء في متجر "ريمو ستور" - متجر ملابس نسائية أونلاين.

**شخصيتك:**
- اسمك "ريمو"
- **رد بالعامية المصرية** (مثال: "أيوه"، "تمام"، "اتفضل"، "اختار")
- **مختصر جداً** - جملة واحدة أو اتنين بالكتير
- استخدم إيموجي باعتدال 😊

**⚠️ قواعد مهمة:**

**🔄 فهم المرادفات:**
   - "ملحفة" أو "ملحفه" = إسدال
   - "حجاب" أو "شيلة" = طرحة
   - "عباية" أو "عبايه" = عباءة
   (النظام بيحول المرادفات تلقائياً)

**1️⃣ لما حد يسأل عن منتج (مثال: "سعر الإسدال؟"):**
   - **رد بجملة واحدة قصيرة:**
     * "اتفضل الإسدالات المتاحة 👇"
     * "دي المنتجات المتاحة 😊"
     * "تمام! اختار اللي يعجبك 👇"
   - **❌ متقولش السعر أو الخامة** - ده كله موجود في الكروت
   - **❌ متذكرش أي تفاصيل** - خلي العميل يشوف في الكروت بنفسه

**2️⃣ لما حد يقول "عاوز أشتري" أو "ازاي أطلب":**
   اشرحله الخطوات دي:
   • تمام! علشان تطلب:
   • 1️⃣ اضغط على المنتج
   • 2️⃣ ضيفه للسلة 🛒
   • 3️⃣ اكتب عنوانك
   • 4️⃣ اضغط "إتمام الدفع"
   • 📦 الشحنة توصلك من 2 لـ 5 أيام
   - **❌ متتكلمش عن أسعار** - كل حاجة في صفحة المنتج

**3️⃣ أسئلة شائعة:**
   - "السعر كام؟" → "اضغط على المنتج وهتشوف السعر 📱"
   - "الخامة ايه؟" → "كل التفاصيل في صفحة المنتج 📱"
   - "فيه ألوان تانية؟" → "الألوان المتاحة في صفحة المنتج"
   - "بيوصل امتى؟" → "من 2 لـ 5 أيام حسب المحافظة 📦"
   - "الشحن كام؟" → "حسب المحافظة، شحن مجاني فوق 1000 جنيه 🚚"
   - "عايز خصم" → "الأسعار كويسة والخامة محترمة 👌 لو عايز كمية كبيرة (6+) راسلنا"

**4️⃣ أمثلة على الرد الصح:**
   ✅ "اتفضل الإسدالات المتاحة 👇"
   ❌ "الإسدال عندنا بـ385 جنيه، الخامة قطيفة فاخرة..."
   
   ✅ "تمام! اختار المنتج واضغط عليه 😊"
   ❌ "السعر النهائي 385 + مصاريف الشحن..."

**معلومات المتجر:**
- التوصيل: جميع محافظات مصر (2-5 أيام)
- الشحن المجاني: فوق 1000 جنيه 🚚
- أسعار الجملة: 6 قطع+ (راسلنا)
- طرق الدفع: كاش، فيزا، فوري، فودافون كاش
- الإرجاع: 14 يوم
- التواصل: راسلنا على الواتساب
- المطور: أكرم المصري - https://wa.me/966559902557

**الفئات:**
{CATEGORIES}

**أسعار الشحن:**
{DELIVERY_FEES}
(شحن مجاني فوق 1000 جنيه)

**كتالوج المنتجات ({TOTAL_PRODUCTS} منتج):**
{PRODUCTS}

**⚠️  ملاحظات نهائية:**
- المنتجات محدثة لحظياً
- **متعرضش منتجات** إلالو العميل سأل عنها بوضوح
- **الرد جملة واحدة** عند السؤال عن منتج
- **متذكرش تفاصيل** - خلي العميل يشوف الكروت
- لو المنتج مش موجود: "للأسف مش متوفر 😔 راسلنا"
- لو السؤال معقد: "راسلنا على الواتساب 📱"`

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
    
    // 🔍 فحص إذا كان السؤال عن منتج معين
    const shouldSearchProducts = (msg: string): boolean => {
      const query = msg.toLowerCase()
      
      // استبعاد أسئلة الشحن والخدمات (حتى لو فيها "كام" أو "سعر")
      const excludedTopics = [
        'شحن', 'توصيل', 'ديليفري', 'delivery', 'الشحن', 'التوصيل',
        'الدفع', 'payment', 'طريقة دفع', 'فيزا', 'كاش', 'كارت',
        'ارجاع', 'استرجاع', 'رجوع', 'return', 'refund',
        'خدمة', 'عناوين', 'عنوان', 'فرع', 'فروع', 'محل',
        'تواصل', 'واتساب', 'whatsapp', 'رقم', 'موبايل'
      ]
      
      for (const topic of excludedTopics) {
        if (query.includes(topic)) {
          console.log(`[Search] ⛔ تجاهل البحث - السؤال عن "${topic}" (خدمات لا منتجات)`)
          return false
        }
      }
      
      const productKeywords = [
        'عاوز', 'عايز', 'عندكم', 'فيه', 'في', 'موجود', 'متوفر',
        'عرض', 'ورينى', 'وريني', 'ورينا', 'اعرض', 'جيبلي', 'جيبلى',
        'ابغى', 'ابي', 'احسن', 'اروع', 'اجمل', 'ابحث', 'دور',
        'بكام', 'سعر', 'اسعار', 'كام',
      ]
      
      for (const keyword of productKeywords) {
        if (query.includes(keyword)) return true
      }
      
      const categories = ['فستان', 'بنطلون', 'قميص', 'بلوزة', 'جاكيت', 'حذاء', 'شنطة', 'اكسسوار', 'ساعة', 'نظارة', 'ايشادو', 'مكياج', 'بريمر', 'بلاشر', 'اسدال', 'طرحة', 'حجاب', 'روج', 'ماسكرا', 'كونسيلر', 'فاونديشن']
      for (const cat of categories) {
        if (query.includes(cat)) return true
      }
      
      return false
    }
    
    // 🔍 البحث عن منتجات مطابقة إذا كان السؤال يتطلب ذلك
    let searchedProducts: ProductInfo[] = []
    let productAvailabilityNote = ''
    
    if (shouldSearchProducts(message)) {
      searchedProducts = findMatchingProducts(message, contextData.products)
      
      if (searchedProducts.length > 0) {
        // ✅ لقينا منتجات matching
        productAvailabilityNote = `\n\n✅ **منتجات متاحة للعميل (${searchedProducts.length}):**\n` + 
          searchedProducts.slice(0, 5).map(p => 
            `• ${p.nameAr || p.name} - ${p.price} جنيه - ${p.stock > 0 ? 'متوفر' : 'نفذ'}`
          ).join('\n') +
          `\n\n⚠️ **هذه هي المنتجات المتوفرة اللي تطابق سؤال العميل. اعرضها في ردك!**`
      } else {
        // ❌ مفيش منتجات matching
        productAvailabilityNote = `\n\n❌ **تنبيه مهم:** مفيش منتجات متوفرة تطابق سؤال العميل!\n` +
          `⚠️ **واجبك:** قول للعميل صراحة: "للأسف المنتج ده مش متوفر عندنا دلوقتي 😔 بس عندنا منتجات تانية ممتازة، راسلنا على الواتساب ونساعدك 💬"\n` +
          `**متقولش إن حاجة موجودة إلا لو شايفها في القائمة فوق!**`
      }
    }
    
    // كشف الكمية المطلوبة من رسالة العميل
    const requestedQuantity = detectQuantityInMessage(message)
    let wholesalePriceNote = ''
    
    if (requestedQuantity >= 6) {
      wholesalePriceNote = `\n\n⚠️ العميل يسأل عن ${requestedQuantity} قطعة - اعرض سعر الجملة! احسب السعر الجديد (حوالي 13% أقل) وقول "لو هتاخد ${requestedQuantity} قطعة، السعر للقطعة هيكون [السعر الجديد] بدل [السعر القديم] - ده سعر جملة خاص ليك 🎁"`
    }
    
    // تنسيق البيانات للإضافة للتعليمات - بيانات كاملة
    const productsInfo = contextData.products.length > 0
      ? contextData.products.map(p => {
          let info = `- [${p.id}] ${p.nameAr || p.name} (${p.category || 'عام'}): ${p.price} جنيه`
          
          // إضافة سعر الجملة إذا كان العميل يسأل عن كمية كبيرة
          if (requestedQuantity >= 6) {
            const wholesale = calculateWholesalePrice(p.price, requestedQuantity)
            info += ` | سعر الجملة (${requestedQuantity}+ قطعة): ${wholesale.price} جنيه/قطعة (خصم ${wholesale.discount}%)`
          }
          
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

    // تنسيق أسعار الشحن
    const deliveryFeesInfo = contextData.deliveryZones.length > 0
      ? contextData.deliveryZones.map(z => 
          `${z.governorate}: ${z.deliveryFee} جنيه${z.minOrderValue > 0 ? ` (الحد الأدنى للطلب: ${z.minOrderValue} جنيه)` : ''}`
        ).join('\n')
      : 'الشحن حسب المحافظة'

    // إعداد التعليمات مع البيانات الحقيقية
    const systemPrompt = SYSTEM_INSTRUCTIONS
      .replace('{PRODUCTS}', productsInfo)
      .replace('{CATEGORIES}', categoriesInfo)
      .replace('{DELIVERY_FEES}', deliveryFeesInfo)
      .replace('{TOTAL_PRODUCTS}', String(contextData.totalProducts)) + 
      productAvailabilityNote + 
      wholesalePriceNote

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

    // استخدام المنتجات اللي بحثنا عنها بالفعل
    let productCards: any[] = []
    
    // **عرض المنتجات فقط لو لقينا منتجات فعلاً matching**
    if (searchedProducts.length > 0) {
      // عرض أفضل 6-8 منتجات فقط (مش 15)
      const limitedProducts = searchedProducts.slice(0, 8)
      
      // تنسيق المنتجات المطابقة للإرسال للعميل مع روابط كاملة
      productCards = limitedProducts.map(p => ({
        id: p.id,
        name: p.nameAr || p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        imageUrl: p.imageUrl,
        category: p.category,
        stock: p.stock,
        link: `https://www.remostore.net/products/${p.id}`,
      }))
      
      console.log(`[Assistant API] 📦 إرجاع ${productCards.length} منتج:`)
      productCards.forEach(p => {
        console.log(`  - ${p.name} (${p.price} ج.م) - صورة: ${p.imageUrl ? '✅' : '❌'}`)
      })
    } else {
      console.log('[Assistant API] ❌ مفيش منتجات مطابقة')
    }

    // حفظ رد المساعد في قاعدة البيانات
    if (conversationId) {
      try {
        await prisma.chatMessage.create({
          data: {
            conversationId,
            role: 'assistant',
            content: reply,
            productIds: searchedProducts.length > 0 ? searchedProducts.map(p => p.id).join(',') : null,
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
