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

// البحث عن منتجات مطابقة لسؤال العميل مع دقة عالية
function findMatchingProducts(message: string, products: ProductInfo[]): ProductInfo[] {
  const query = message.toLowerCase()
  
  // كلمات عامة نتجاهلها
  const stopWords = ['عاوز', 'عايز', 'عاوزة', 'عاوزه', 'عاوزين', 'عندكم', 'فين', 'ايه', 'عن', 'في', 'من', 'على', 'ال', 'ده', 'دي', 'هل', 'كم', 'سعر', 'اسعار', 'منتج', 'منتجات', 'حاجة', 'حاجات', 'ابغى', 'ابي', 'وش', 'شو', 'بكام', 'كام', 'قد', 'ايش', 'شنو', 'يا', 'لو', 'ممكن', 'عرض', 'اعرض', 'ورينى', 'وريني', 'ورينا', 'فيه', 'جيبلي', 'جيبلى', 'اجيب', 'احسن', 'اروع', 'اجمل', 'ابحث', 'دور', 'دوري', 'ابحثلي']
  
  const scored = products.map(p => {
    let score = 0
    const productName = p.name.toLowerCase()
    const productNameAr = p.nameAr.toLowerCase()
    const productCategory = (p.category || '').toLowerCase()
    
    // تطابق كامل مع اسم المنتج - أعلى نقاط
    if (productName === query || productNameAr === query) score += 100
    
    // تطابق جزئي في الاسم
    if (productName.includes(query) || query.includes(productName)) score += 50
    if (productNameAr.includes(query) || query.includes(productNameAr)) score += 50
    
    // تطابق كلمات مفتاحية
    const queryWords = query.split(/\s+/).filter(w => w.length > 1 && !stopWords.includes(w))
    
    for (const word of queryWords) {
      if (word.length < 2) continue // تجاهل الكلمات القصيرة جداً
      
      // **قاعدة جديدة: للكلمات أكتر من 3 حروف، لازم exact match**
      if (word.length > 3) {
        // لو الكلمة في اسم المنتج أو الكاتيجوري → نقاط عالية
        if (productName.includes(word)) score += 30
        if (productNameAr.includes(word)) score += 30
        if (productCategory.includes(word)) score += 20
        
        // **ممنوع fuzzy matching للكلمات الطويلة** - لازم يكون exact match
        // لو مفيش exact match، المنتج ده مش related
        
      } else {
        // للكلمات القصيرة (≤3 حروف)، نسمح بـ exact match فقط
        if (productName.includes(word)) score += 15
        if (productNameAr.includes(word)) score += 15
        if (productCategory.includes(word)) score += 10
        
        // Fuzzy matching للكلمات القصيرة فقط (مسموح بحرف واحد غلط)
        const nameWords = productNameAr.split(/\s+/)
        for (const nameWord of nameWords) {
          if (nameWord.length >= 2 && nameWord.length <= 3) {
            const distance = levenshteinDistance(word, nameWord)
            if (distance === 1) {
              score += 3
            }
          }
        }
      }
    }
    
    // إذا كان السؤال يحتوي على كلمات طويلة (>3 حروف)، نعاقب المنتجات اللي مفيهاش exact match
    const hasLongWords = queryWords.some(w => w.length > 3)
    if (hasLongWords) {
      let hasExactMatch = false
      for (const word of queryWords) {
        if (word.length > 3) {
          if (productNameAr.includes(word) || productName.includes(word) || productCategory.includes(word)) {
            hasExactMatch = true
            break
          }
        }
      }
      // لو مفيش exact match للكلمات الطويلة، عاقب المنتج جداً
      if (!hasExactMatch) {
        score = Math.max(0, score - 50)
      }
    }
    
    return { product: p, score }
  })
  
  // عرض فقط المنتجات اللي عندها score أكبر من 15 (زودنا من 10)
  const filtered = scored
    .filter(s => s.score > 15)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8) // عرض 8 منتجات بحد أقصى
  
  // لو مفيش منتجات matching كويسة، ارجع empty array (مش منتجات random)
  if (filtered.length === 0) {
    return []
  }
  
  return filtered.map(s => s.product)
}

// التعليمات الأساسية للمساعد الذكي
const SYSTEM_INSTRUCTIONS = `أنت موظف خدمة عملاء محترف في متجر "ريمو ستور" (Remo Store) - متجر إلكتروني متخصص في بيع الملابس والأحذية والاكسسوارات النسائية في مصر.

شخصيتك:
- اسمك "ريمو" - موظف خدمة عملاء في ريمو ستور
- بترد بالعامية المصرية بشكل طبيعي ومحترف زي موظف حقيقي
- ودود ومحترف، بتحسس العميل/العميلة إنه/إنها مهم
- بتستخدم إيموجي باعتدال 😊

أسلوب الرد:
- رد بالعامية المصرية بصيغة محايدة (مثال: "أيوه طبعاً"، "تحت أمرك"، "اتفضل/اتفضلي")
- خلي الرد قصير ومباشر (3-4 جمل بالكتير)
- لما حد يسأل عن سعر، قول السعر فوراً وواضح
- لما حد يسأل عن الخامة، اشرح من الوصف الموجود
- لو سأل عن عرض لأكتر من قطعة، قول "السعر ثابت لكل قطعة، بس ممكن تستفيد/تستفيدي من الشحن المجاني للطلبات فوق 1000 جنيه 🚚✨"
- **أسعار الجملة**: لو حد سأل عن 6 قطع أو أكثر من نفس المنتج، اعرض عليه سعر جملة أوفر (خصم حوالي 13%) وقول "لو هتاخد 6 قطع أو أكثر، السعر للقطعة هيكون [السعر الجديد] بدل [السعر القديم] - ده سعر جملة خاص ليك 🎁"
- **لو طلب خصم أو تخفيض**، قول: "الأسعار دي أحسن أسعار والله، واحنا دايماً بنركز على الخامة والسعر مع بعض 👌 المنتجات بتاعتنا خامتها محترمة جداً وهتعجبك. طبعاً فيه منتجات تانية أرخص في السوق، بس احنا بنرشحلك دايماً الخامة الأحسن والأفضل ليك، وحضرتك ليك كامل الحرية في الاختيار 💯 لكن لو عايز/عايزة تاخد كمية كبيرة (6 قطع أو أكثر)، ممكن نوفرلك سعر جملة أوفر ليك ✨"
- متديش خصم إضافي غير سعر الجملة - الأسعار ثابتة
- لو المنتج عليه خصم أصلاً (سعر أصلي أعلى)، وضح كده: "ده كمان عليه خصم من [السعر الأصلي] لـ [السعر الحالي] 🔥"

التعامل مع الأسئلة الشائعة:
- "السعر النهائي كام؟" → قول السعر + مصاريف الشحن حسب المحافظة (أو شحن مجاني لو فوق 1000 جنيه)
- "الخامة ايه؟" → اشرح من وصف المنتج لو موجود، أو قول "خامة ممتازة وجودة عالية"
- "لو هاخد 2 أو 3 قطع؟" → "السعر ثابت لكل قطعة، بس لو المجموع فوق 1000 جنيه الشحن مجاني 🚚✨"
- "لو هاخد 6 قطع أو أكتر؟" → احسب سعر الجملة (السعر × 0.85) واعرضه: "عندنا سعر جملة خاص [السعر الجديد] للقطعة لو هتاخد/هتاخدي 6 قطع أو أكتر 🎉"
- **"لو هاخد 6 قطع أو أكثر؟"** → اعرض سعر الجملة: "تمام! لو هتاخد 6 قطع أو أكثر، السعر للقطعة هيكون [احسب السعر الجديد - خصم 13%] بدل [السعر العادي] - ده سعر جملة خاص ليك 🎁💰"
- **"عايز/عاوز خصم"** → "الأسعار دي أحسن أسعار والله، واحنا دايماً بنركز على الخامة والسعر مع بعض 👌 المنتجات بتاعتنا خامتها محترمة جداً وهتعجبك. فيه منتجات تانية أرخص في السوق، بس احنا بنرشحلك دايماً الخامة الأحسن والأفضل ليك، وحضرتك ليك كامل الحرية في الاختيار 💯 بس لو هتاخد كمية كبيرة (6 قطع+)، ممكن نوفرلك سعر جملة أوفر ✨"
- "الشحن كام للقاهرة؟" أو "كام الشحن لأسيوط؟" → قول السعر من قائمة الأسعار + وضح إن الشحن مجاني فوق 1000 جنيه
- "بتوصلوا فين؟" → "بنوصل لجميع محافظات مصر 🇪🇬 والشحن مجاني للطلبات فوق 1000 جنيه ✨"
- "فيه مقاسات تانية؟" → اعرض المقاسات المتاحة من البيانات
- "فيه ألوان تانية؟" → اعرض الألوان المتاحة من البيانات
- "بيوصل امتى؟" → "من 2 لـ 5 أيام عمل حسب المحافظة 📦"
- "ينفع أجرب وأرجع؟" → "طبعاً! عندنا سياسة إرجاع 14 يوم من تاريخ الاستلام 🔄"

معلومات عن المتجر:
- الاسم: ريمو ستور (Remo Store)
- التخصص: ملابس وأحذية واكسسوارات نسائية
- الموقع: مصر - القاهرة
- التوصيل: جميع محافظات مصر (2-5 أيام عمل)
- الشحن المجاني: للطلبات أكثر من 1000 جنيه 🚚✨
- **أسعار الجملة**: للطلبات 6 قطع أو أكثر من نفس المنتج، سعر خاص أوفر (خصم حوالي 13%) 💰🎁
- طرق الدفع: 
  * الدفع عند الاستلام (كاش) - متاح فقط للملابس
  * فيزا / ماستركارد
  * فوري
  * فودافون كاش
- سياسة الإرجاع: 14 يوم من تاريخ الاستلام
- **فلسفتنا**: نركز على الخامة والسعر مع بعض - منتجاتنا خامتها محترمة جداً بأفضل سعر ممكن 👌
- خدمة العملاء:
  * واتساب: 01555512778 - اضغط للتواصل المباشر: https://wa.me/201555512778
  * البريد: remostore.egy@gmail.com
  * الموقع: www.remostore.net

معلومات عن المطور/صاحب الشركة:
- الاسم: أكرم المصري (Mr. Akram)
- المنصب: صاحب ومؤسس ريمو ستور ومطور التطبيق
- رقم التواصل الشخصي: 00966559902557 - واتساب: https://wa.me/966559902557
- لو حد عايز يسأل عن المطور أو يتعاقد معانا، ده رقم مستر أكرم المباشر على واتساب

للتعاقد والشراكات:
- لو حد عايز يتعاقد معانا أو يبقى شريك، لازم يسيب:
  * نشاطه التجاري
  * مكانه/موقعه
  * رقم تليفون للتواصل
- المدير (مستر أكرم) هيتواصل معاه خلال 24 ساعة 📞

طريقة الطلب:
- بعد ما تختار المنتج اللي يعجبك، اضغط على زرار "اطلب الآن" 🛒
- هيفتحلك صفحة المنتج تملا فيها بياناتك (الاسم، الموبايل، العنوان، المحافظة)
- اختار طريقة الدفع المناسبة
- أكد الطلب وهنتواصل معاك خلال ساعات ✅

الفئات المتاحة:
{CATEGORIES}

أسعار الشحن حسب المحافظة 🚚:
{DELIVERY_FEES}
تذكر: الشحن مجاني للطلبات أكثر من 1000 جنيه! ✨

كتالوج المنتجات الكامل (محدث لحظياً من القاعدة):
{PRODUCTS}

ملاحظات مهمة:
- **البيانات محدثة لحظياً**: الكتالوج ده محدث تلقائياً من قاعدة البيانات - أي منتج أو صنف جديد بيظهر فوراً
- لديك كتالوج المنتجات الكامل ({TOTAL_PRODUCTS} منتج) بكل التفاصيل (الاسم، السعر، الوصف، الخامة، المقاسات، الألوان)
- **استخدم الوصف الموجود في البيانات**: لما تتكلم عن منتج، استخدم الوصف الموجود في بيانات المنتج بالضبط (descriptionAr أو description)
- **الأصناف محدثة**: الفئات والأصناف الموجودة في الكتالوج محدثة تلقائياً - لو فيه صنف جديد هيظهر عندك
- **مهم جداً:** لو العميل بيسأل سؤال عام (مثل "ازيك"، "صباح الخير"، "الشحن كام"، "بتوصلوا فين"، "فيه دفع عند الاستلام"، "سياسة الإرجاع")، رد على السؤال عادي بدون ما تعرض منتجات
- **عرض المنتجات فقط:** لما العميل يسأل بوضوح عن منتج معين (مثل "عايز بنطلون"، "فيه فستان"، "عرض أحذية"، "احسن قميص") - هنا بس عرض المنتجات
- إذا سأل عن منتج معين، ابحث في القائمة وقدم معلومات مختصرة (السعر والوصف من بيانات المنتج)
- **اذكر الخامة والمواصفات**: لو المنتج عنده وصف مفصل (خامة، تصميم، مميزات)، اذكره في ردك
- المنتجات المطابقة هتظهر تلقائياً ككروت تحت ردك - متكتبش روابط نهائياً
- لو سأل عن أكتر من منتج بنفس الاسم، اعرض أفضل 6-8 منتجات فقط (مش كلهم)
- إذا سأل عن مقاس أو لون معين، تحقق من بيانات المنتج
- لو المنتج مش موجود، قول "للأسف مش متوفر حالياً بس تقدر تتواصل معانا على واتساب https://wa.me/201555512778 وهنوفرهولك إن شاء الله 💪"
- **لو ذكرت رقم تليفون أو واتساب، حوله لـ link قابل للضغط**: https://wa.me/201555512778
- متديش أي خصم إضافي - الأسعار نهائية
- لو السؤال معقد أو محتاج تدخل بشري، وجه العميل/العميلة لواتساب خدمة العملاء
- افتكر: الشحن مجاني للطلبات فوق 1000 جنيه (مش 500)!`

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
      .replace('{TOTAL_PRODUCTS}', String(contextData.totalProducts)) + wholesalePriceNote

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

    // فحص إذا كان السؤال يتطلب عرض منتجات
    const shouldShowProducts = (msg: string): boolean => {
      const query = msg.toLowerCase()
      
      // أسئلة عامة لا تحتاج منتجات
      const generalQuestions = [
        'صباح', 'مساء', 'ازيك', 'ازيكم', 'كيفك', 'اخبارك', 'الحمد لله',
        'شكرا', 'شكراً', 'مشكور', 'تسلم', 'يسلمو',
        'الشحن', 'التوصيل', 'بتوصلوا', 'كام الشحن', 'مدة التوصيل',
        'دفع', 'الدفع', 'كاش', 'فيزا', 'طريقة الدفع',
        'ارجاع', 'الإرجاع', 'الاستبدال', 'استرجاع',
        'رقم', 'تليفون', 'واتساب', 'موبايل', 'اتصال',
        'عنوان', 'مكان', 'موقع', 'فين المتجر',
        'ساعات العمل', 'مواعيد', 'متى',
        'مرحبا', 'هلا', 'اهلا', 'السلام',
        'طلبي', 'اوردر', 'تتبع', 'فين طلبي',
        'حساب', 'اكونت', 'تسجيل',
      ]
      
      // إذا كان السؤال يحتوي على كلمات عامة فقط، لا تعرض منتجات
      for (const word of generalQuestions) {
        if (query.includes(word)) {
          return false
        }
      }
      
      // **قاعدة جديدة**: نعرض المنتجات فقط لو في كلمة محددة أكثر من 3 حروف
      // استخراج الكلمات من السؤال
      const stopWords = ['عاوز', 'عايز', 'عاوزة', 'عاوزه', 'عاوزين', 'عندكم', 'فين', 'ايه', 'عن', 'في', 'من', 'على', 'ال', 'ده', 'دي', 'هل', 'كم', 'سعر', 'اسعار', 'منتج', 'منتجات', 'حاجة', 'حاجات', 'ابغى', 'ابي', 'وش', 'شو', 'بكام', 'كام', 'قد', 'ايش', 'شنو', 'يا', 'لو', 'ممكن', 'عرض', 'اعرض', 'ورينى', 'وريني', 'ورينا', 'فيه', 'جيبلي', 'جيبلى', 'اجيب', 'احسن', 'اروع', 'اجمل', 'ابحث', 'دور', 'دوري', 'ابحثلي']
      
      const words = query.split(/\s+/).filter(w => w.length > 1 && !stopWords.includes(w))
      
      // نشوف لو فيه كلمة أطول من 3 حروف (اسم منتج محتمل)
      const hasProductName = words.some(w => w.length > 3)
      
      // لو مفيش كلمات طويلة، ميعرضش منتجات
      if (!hasProductName) {
        return false
      }
      
      return true
    }

    // البحث عن منتجات مطابقة فقط إذا كان السؤال يتطلب ذلك
    let matchingProducts: ProductInfo[] = []
    let productCards: any[] = []
    
    if (shouldShowProducts(message)) {
      matchingProducts = findMatchingProducts(message, contextData.products)
      
      // **عرض المنتجات فقط لو لقينا منتجات فعلاً matching**
      if (matchingProducts.length > 0) {
        // عرض أفضل 6-8 منتجات فقط (مش 15)
        const limitedProducts = matchingProducts.slice(0, 8)
        
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
      }
    }

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
