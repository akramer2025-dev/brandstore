// 💬 Messenger AI-Powered Bot
// بوت ماسنجر ذكي بالذكاء الاصطناعي

import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { PrismaClient } from '@prisma/client'

// Verify Token (اختاره بنفسك - للأمان)
const VERIFY_TOKEN = process.env.MESSENGER_VERIFY_TOKEN || 'remostore_messenger_2026'
const PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN

// Lazy initialization for Groq to avoid build-time errors
let groqInstance: Groq | null = null
function getGroq() {
  if (!groqInstance && process.env.GROQ_API_KEY) {
    groqInstance = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return groqInstance
}

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// تخزين سياق المحادثة (في ذاكرة مؤقتة)
const conversationHistory = new Map<string, Array<{ role: string; content: string }>>()

// Webhook Verification (Facebook يتحقق من الـ endpoint)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified!')
    return new Response(challenge, { status: 200 })
  } else {
    console.log('❌ Webhook verification failed')
    return new Response('Forbidden', { status: 403 })
  }
}

// استقبال الرسائل من Messenger
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📩 رسالة جديدة من Messenger:', JSON.stringify(body, null, 2))

    // التحقق من وجود رسائل
    if (body.object === 'page') {
      body.entry.forEach((entry: any) => {
        entry.messaging.forEach(async (event: any) => {
          if (event.message && event.message.text) {
            const senderId = event.sender.id
            const messageText = event.message.text.toLowerCase().trim()

            console.log(`📨 رسالة من ${senderId}: ${messageText}`)

            // الرد التلقائي حسب محتوى الرسالة
            await handleMessage(senderId, messageText)
          }
        })
      })

      return NextResponse.json({ status: 'ok' })
    }

    return NextResponse.json({ status: 'not_page_event' })
  } catch (error) {
    console.error('❌ خطأ في معالجة الرسالة:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// معالجة الرسائل بالذكاء الاصطناعي
async function handleMessage(senderId: string, messageText: string) {
  try {
    // الحصول على بيانات من قاعدة البيانات
    const contextData = await getContextData(messageText)
    
    // الحصول على سياق المحادثة السابق
    let history = conversationHistory.get(senderId) || []
    
    // إضافة رسالة المستخدم الجديدة
    history.push({ role: 'user', content: messageText })
    
    // إبقاء آخر 10 رسائل فقط لتوفير الذاكرة
    if (history.length > 10) {
      history = history.slice(-10)
    }
    
    // تجهيز رسالة النظام مع البيانات الحقيقية
    const systemMessage = {
      role: 'system',
      content: `أنت موظف خدمة عملاء محترف في ريمو ستور (Remo Store) - متجر إلكتروني للملابس.
      
معلومات المتجر:
- الاسم: ريمو ستور Remo Store
- الموقع: www.remostore.net
- الهاتف/واتساب: 01555512778
- البريد: info@remostore.net
- العنوان: مصر - القاهرة
- أوقات العمل: السبت - الخميس (9 صباحاً - 6 مساءً)

سياسات الشحن والدفع:
- شحن مجاني للطلبات أكثر من 1000 جنيه
- التوصيل خلال 2-5 أيام
- الدفع عند الاستلام متاح
- نوصل لجميع المحافظات

معلومات حقيقية من قاعدة البيانات:
${contextData}

الأسلوب المطلوب:
- تحدث بطريقة ودودة واحترافية
- استخدم اللغة العربية المصرية بشكل أساسي
- اذكر الأسعار والمنتجات الحقيقية من البيانات أعلاه
- إذا سأل عن منتج غير متوفر، اقترح بدائل مشابهة
- كن مساعداً ومهتماً بحل مشاكل العميل
- استخدم الإيموجي بشكل مناسب لجعل المحادثة ودودة
- إذا كانت المعلومات غير كافية، اسأل العميل أسئلة توضيحية
- لا تذكر أنك روبوت أو AI، تصرف كموظف حقيقي

إذا سأل عن:
- المنتجات: اعرض المنتجات المتاحة مع الأسعار الحقيقية من البيانات
- الطلبات: اطلب رقم الطلب أو تفاصيل للمساعدة
- الأسعار: قدم الأسعار الفعلية من قاعدة البيانات
- العروض: اذكر المنتجات ذات الخصومات إن وجدت`
    }

    // استدعاء Groq AI للحصول على رد ذكي
    const groq = getGroq()
    if (!groq) {
      throw new Error('Groq API is not configured')
    }
    
    const completion = await groq.chat.completions.create({
      messages: [systemMessage, ...history] as any,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 500,
      stream: false,
    })

    const aiResponse = completion.choices[0]?.message?.content || 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'

    // إضافة رد AI للتاريخ
    history.push({ role: 'assistant', content: aiResponse })
    conversationHistory.set(senderId, history)

    // Quick replies للتفاعل السريع
    const quickReplies = [
      { content_type: 'text', title: '🛍️ المنتجات', payload: 'PRODUCTS' },
      { content_type: 'text', title: '📦 طلباتي', payload: 'ORDERS' },
      { content_type: 'text', title: '💰 العروض', payload: 'OFFERS' },
      { content_type: 'text', title: '📞 اتصل بنا', payload: 'CONTACT' }
    ]

    // إرسال الرد
    await sendMessage(senderId, aiResponse, quickReplies)

  } catch (error) {
    console.error('❌ خطأ في معالجة الرسالة بالـ AI:', error)
    
    // رد احتياطي في حالة الخطأ
    const fallbackMessage = `عذراً، حدث خطأ مؤقت 😔\n\nيمكنك التواصل معنا مباشرة:\n📱 واتساب: 01555512778\n📧 البريد: remostore.egy@gmail.com\n\nأو حاول مرة أخرى بعد قليل`
    
    await sendMessage(senderId, fallbackMessage)
  }
}

// جلب البيانات من قاعدة البيانات حسب سياق السؤال
async function getContextData(messageText: string): Promise<string> {
  try {
    const lowerText = messageText.toLowerCase()
    let contextData = ''

    // البحث عن منتجات
    if (lowerText.includes('منتج') || lowerText.includes('ملابس') || lowerText.includes('سعر') || 
        lowerText.includes('كام') || lowerText.includes('عايز') || lowerText.includes('product')) {
      
      // جلب أحدث المنتجات المتاحة
      const products = await prisma.product.findMany({
        where: {
          isAvailable: true,
          quantity: { gt: 0 }
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          price: true,
          fakePrice: true,
          quantity: true,
          category: true,
        }
      })

      if (products.length > 0) {
        contextData += '\n\n📦 المنتجات المتاحة حالياً:\n'
        products.forEach((product, index) => {
          const discount = product.fakePrice && product.fakePrice > product.price 
            ? Math.round(((product.fakePrice - product.price) / product.fakePrice) * 100)
            : 0
          
          contextData += `\n${index + 1}. ${product.name}`
          contextData += `\n   💰 السعر: ${product.price} جنيه`
          
          if (discount > 0) {
            contextData += ` (قبل الخصم: ${product.fakePrice} جنيه - خصم ${discount}%)`
          }
          
          contextData += `\n   📊 الكمية المتاحة: ${product.quantity}`
          
          if (product.category) {
            contextData += `\n   🏷️ الفئة: ${product.category}`
          }
          contextData += '\n'
        })
      }

      // معلومات إضافية عن الفئات
      const categories = await prisma.product.findMany({
        where: { isAvailable: true },
        distinct: ['category'],
        select: { category: true }
      })

      if (categories.length > 0) {
        contextData += '\n\n🏷️ الفئات المتوفرة: '
        contextData += categories.map(c => c.category).filter(Boolean).join(', ')
      }
    }

    // البحث عن طلبات
    if (lowerText.includes('طلب') || lowerText.includes('order') || lowerText.includes('تتبع')) {
      const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true,
        }
      })

      if (recentOrders.length > 0) {
        contextData += '\n\n📊 معلومات عن حالة الطلبات:\n'
        contextData += `- عدد الطلبات الأخيرة: ${recentOrders.length}\n`
        contextData += `- حالات الطلبات المتاحة: قيد المعالجة، تم الشحن، تم التسليم، ملغي\n`
        contextData += '- لتتبع طلب معين، نحتاج رقم الطلب أو معلومات العميل\n'
      }
    }

    // إحصائيات عامة
    if (!contextData) {
      const [productCount, orderCount] = await Promise.all([
        prisma.product.count({ where: { isAvailable: true } }),
        prisma.order.count()
      ])

      contextData += '\n\n📊 معلومات عامة عن المتجر:\n'
      contextData += `- عدد المنتجات المتاحة: ${productCount}\n`
      contextData += `- إجمالي الطلبات: ${orderCount}\n`
    }

    return contextData || 'لا توجد بيانات إضافية حالياً'

  } catch (error) {
    console.error('❌ خطأ في جلب البيانات:', error)
    return 'حدث خطأ في جلب البيانات من قاعدة البيانات'
  }
}

// إرسال رسالة للمستخدم
async function sendMessage(recipientId: string, messageText: string, quickReplies: any = null) {
  if (!PAGE_ACCESS_TOKEN) {
    console.error('❌ PAGE_ACCESS_TOKEN غير موجود!')
    return
  }

  const messageData: any = {
    recipient: { id: recipientId },
    message: { text: messageText }
  }

  // إضافة quick replies إذا كانت موجودة
  if (quickReplies) {
    messageData.message.quick_replies = quickReplies
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      }
    )

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ تم إرسال الرد بنجاح')
    } else {
      console.error('❌ خطأ في إرسال الرد:', result)
    }
  } catch (error) {
    console.error('❌ خطأ في الاتصال بـ Messenger:', error)
  }
}
