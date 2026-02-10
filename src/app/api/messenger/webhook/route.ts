// 💬 Messenger Auto Reply System
// نظام الرد التلقائي على ماسنجر

import { NextRequest, NextResponse } from 'next/server'

// Verify Token (اختاره بنفسك - للأمان)
const VERIFY_TOKEN = process.env.MESSENGER_VERIFY_TOKEN || 'remostore_messenger_2026'
const PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN

export const dynamic = 'force-dynamic'

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

// معالجة الرسائل والرد التلقائي
async function handleMessage(senderId: string, messageText: string) {
  let replyText = ''
  let quickReplies = null

  // الردود الذكية حسب محتوى الرسالة
  if (messageText.includes('السلام') || messageText.includes('مرحبا') || messageText.includes('هاي') || messageText.includes('hi') || messageText.includes('hello')) {
    replyText = `مرحباً بك في ريمو ستور! 👋\n\nكيف يمكنني مساعدتك اليوم؟\n\n🛍️ تسوق المنتجات\n📦 تتبع الطلبات\n💰 الأسعار والعروض\n📞 التواصل مع خدمة العملاء`
    
    quickReplies = [
      { content_type: 'text', title: '🛍️ المنتجات', payload: 'PRODUCTS' },
      { content_type: 'text', title: '📦 طلباتي', payload: 'ORDERS' },
      { content_type: 'text', title: '💰 العروض', payload: 'OFFERS' },
      { content_type: 'text', title: '📞 اتصل بنا', payload: 'CONTACT' }
    ]
  }
  
  else if (messageText.includes('منتج') || messageText.includes('product') || messageText.includes('ملابس')) {
    replyText = `🛍️ تسوق أحدث منتجاتنا!\n\n✨ ملابس عصرية\n👔 أزياء راقية\n👗 تشكيلة متنوعة\n\nزور موقعنا: www.remostore.net\nأو حمّل التطبيق من Google Play!\n\n💬 عايز تشوف منتج معين؟`
  }
  
  else if (messageText.includes('طلب') || messageText.includes('order') || messageText.includes('شحن') || messageText.includes('توصيل')) {
    replyText = `📦 معلومات الطلبات والشحن:\n\n✅ شحن مجاني للطلبات +1000 جنيه\n🚚 التوصيل خلال 2-5 أيام\n💰 الدفع عند الاستلام متاح للملابس\n📍 نوصل لجميع المحافظات\n\n🔍 تتبع طلبك من التطبيق أو الموقع\n\nعايز تتبع طلب معين؟ ابعتلي رقم الطلب`
  }
  
  else if (messageText.includes('سعر') || messageText.includes('price') || messageText.includes('كام') || messageText.includes('تكلفة')) {
    replyText = `💰 الأسعار والعروض:\n\n🔥 خصومات تصل لـ 50%\n🎁 عروض يومية\n💳 أسعار منافسة\n📱 عروض حصرية عبر التطبيق\n\nشوف العروض على: www.remostore.net\n\nعايز تعرف سعر منتج معين؟`
  }
  
  else if (messageText.includes('تواصل') || messageText.includes('contact') || messageText.includes('phone') || messageText.includes('رقم')) {
    replyText = `📞 تواصل معنا:\n\n📱 واتساب: 01555512778\n📧 البريد: akram.er2025@gmail.com\n🌐 الموقع: www.remostore.net\n📍 العنوان: مصر - القاهرة\n\n⏰ نعمل: السبت - الخميس (9 صباحاً - 6 مساءً)\n\n💬 أو تكلم معنا هنا مباشرة!`
  }
  
  else if (messageText.includes('مساعدة') || messageText.includes('help') || messageText.includes('ساعدني')) {
    replyText = `❓ كيف يمكنني مساعدتك؟\n\n📝 يمكنك سؤالي عن:\n\n• المنتجات والأسعار\n• الطلبات والشحن\n• طرق الدفع\n• العروض الخاصة\n• معلومات التواصل\n• أي استفسار آخر!\n\nاكتب سؤالك وأنا هرد عليك فوراً 😊`
  }
  
  else if (messageText.includes('شكرا') || messageText.includes('thanks') || messageText.includes('تسلم')) {
    replyText = `العفو! 😊\n\nسعداء بخدمتك دائماً 💚\n\nمحتاج أي مساعدة تانية؟`
  }
  
  else if (messageText.includes('تطبيق') || messageText.includes('app') || messageText.includes('download')) {
    replyText = `📱 حمّل تطبيق ريمو ستور!\n\n✨ تسوق أسهل وأسرع\n🔔 إشعارات بالعروض\n📦 تتبع طلباتك\n💰 عروض حصرية\n\n📥 حمّله الآن من Google Play:\nقريباً متاح للتحميل!\n\nأو زور موقعنا: www.remostore.net`
  }
  
  else {
    // رد افتراضي لأي رسالة أخرى
    replyText = `شكراً لرسالتك! 😊\n\nأنا البوت الذكي لريمو ستور، أنا هنا لمساعدتك!\n\n💬 يمكنك سؤالي عن:\n• المنتجات\n• الطلبات\n• الأسعار\n• التواصل\n\nأو اكتب "مساعدة" لمعرفة المزيد!`
  }

  // إرسال الرد
  await sendMessage(senderId, replyText, quickReplies)
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
