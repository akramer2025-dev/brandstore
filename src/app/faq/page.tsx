import { Metadata } from 'next'
import BrandBackgroundPattern from '@/components/BrandBackgroundPattern'
import { HelpCircle, Package, Truck, CreditCard, RotateCcw, Phone, MessageCircle, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة | ريمو ستور - Remo Store FAQ',
  description: 'إجابات على أكثر الأسئلة شيوعاً حول التسوق، الشحن، الدفع، والإرجاع في ريمو ستور',
}

export default function FAQPage() {
  const faqs = [
    {
      category: 'الطلبات والشراء',
      icon: Package,
      questions: [
        {
          q: 'كيف أطلب من ريمو ستور؟',
          a: 'اختر المنتج اللي عاجبك، اضغط "أضف للسلة"، أكمل بيانات التوصيل والدفع، وخلاص! هنوصلك الطلب في خلال 2-5 أيام.'
        },
        {
          q: 'هل يمكنني تعديل أو إلغاء الطلب؟',
          a: 'نعم، يمكن إلغاء أو تعديل الطلب خلال ساعتين من تقديمه. بعد كده الطلب يدخل في التجهيز. اتصل بنا على 01555512778 أو تكلم معنا على الماسنجر.'
        },
        {
          q: 'إزاي أتتبع طلبي؟',
          a: 'من حسابك في التطبيق أو الموقع، اذهب لـ "طلباتي" وهتلاقي حالة الطلب ورقم التتبع. أو اسأل البوت على الماسنجر عن حالة طلبك.'
        },
        {
          q: 'ما هي مدة تجهيز الطلب؟',
          a: 'عادة 24-48 ساعة لتجهيز الطلب. بعدها يتم الشحن ويستغرق التوصيل 2-5 أيام حسب المحافظة.'
        }
      ]
    },
    {
      category: 'الشحن والتوصيل',
      icon: Truck,
      questions: [
        {
          q: 'كم تكلفة الشحن؟',
          a: 'الشحن مجاني للطلبات أكثر من 1000 جنيه! وللطلبات الأقل، رسوم الشحن تبدأ من 40 جنيه حسب المحافظة.'
        },
        {
          q: 'كم مدة التوصيل؟',
          a: 'التوصيل داخل القاهرة والجيزة: 2-3 أيام. باقي المحافظات: 3-5 أيام. المناطق النائية قد تستغرق 5-7 أيام.'
        },
        {
          q: 'هل توصلون لجميع المحافظات؟',
          a: 'نعم! نوصل لجميع محافظات مصر بدون استثناء.'
        },
        {
          q: 'ماذا لو لم أكن موجوداً وقت التوصيل؟',
          a: 'مندوب التوصيل هيتصل بيك قبل الوصول. لو مش موجود، ممكن تحدد ميعاد تاني أو توصيل لشخص تاني في نفس العنوان.'
        }
      ]
    },
    {
      category: 'الدفع',
      icon: CreditCard,
      questions: [
        {
          q: 'ما هي طرق الدفع المتاحة؟',
          a: 'نوفر: دفع عند الاستلام (COD) للملابس، بطاقات الائتمان (Visa/Mastercard)، المحافظ الإلكترونية، والتحويل البنكي.'
        },
        {
          q: 'هل الدفع عند الاستلام متاح؟',
          a: 'نعم! الدفع عند الاستلام متاح لمعظم المنتجات (الملابس). بعض المنتجات الإلكترونية تحتاج دفع مقدم.'
        },
        {
          q: 'هل الدفع آمن؟',
          a: 'نعم 100%! نستخدم تشفير SSL لحماية معلوماتك المالية. ما نحتفظش بتفاصيل بطاقتك الائتمانية.'
        },
        {
          q: 'هل يمكن الدفع بالتقسيط؟',
          a: 'نعم، نوفر التقسيط من خلال بطاقات الائتمان (3-6 أشهر) حسب البنك. الشروط تطبق.'
        }
      ]
    },
    {
      category: 'الإرجاع والاسترداد',
      icon: RotateCcw,
      questions: [
        {
          q: 'ما هي سياسة الإرجاع؟',
          a: 'يمكنك إرجاع أي منتج خلال 7 أيام من الاستلام إذا كان بحالته الأصلية مع البطاقات والعبوة.'
        },
        {
          q: 'كيف أرجع منتج؟',
          a: 'اتصل بنا على 01555512778 أو تكلم معنا على الماسنجر. هنرسل مندوب يستلم المنتج من عندك مجاناً (إذا كان فيه عيب مصنع).'
        },
        {
          q: 'متى أستلم فلوسي بعد الإرجاع؟',
          a: 'بعد استلام المنتج وفحصه (2-3 أيام)، يتم استرداد المبلغ خلال 7-14 يوم عمل حسب طريقة الدفع الأصلية.'
        },
        {
          q: 'هل يمكن استبدال المنتج بدلاً من إرجاعه؟',
          a: 'نعم بالتأكيد! يمكنك استبدال المنتج بمقاس أو لون آخر. اتصل بنا وهنساعدك.'
        }
      ]
    },
    {
      category: 'المنتجات',
      icon: Package,
      questions: [
        {
          q: 'هل المنتجات أصلية؟',
          a: 'نعم 100%! جميع منتجاتنا أصلية ومن موردين معتمدين. نقدم ضمان الجودة على كل منتج.'
        },
        {
          q: 'كيف أعرف مقاسي الصحيح؟',
          a: 'كل منتج عليه جدول مقاسات مفصل. أو اسأل البوت على الماسنجر وهيساعدك تختار المقاس المناسب.'
        },
        {
          q: 'هل الألوان مطابقة للصور؟',
          a: 'نحاول نوفر صور دقيقة قدر الإمكان. لكن قد يكون فيه اختلاف بسيط حسب إضاءة شاشتك.'
        },
        {
          q: 'متى يتم تحديث المنتجات؟',
          a: 'نضيف منتجات جديدة أسبوعياً! تابعنا على Facebook و Instagram عشان تعرف أحدث المنتجات والعروض.'
        }
      ]
    },
    {
      category: 'خدمة العملاء',
      icon: MessageCircle,
      questions: [
        {
          q: 'كيف أتواصل معكم؟',
          a: 'يمكنك التواصل معنا عبر: الهاتف 01555512778، الماسنجر بوت 24/7، البريد remostore.egy@gmail.com، أو واتساب.'
        },
        {
          q: 'ما هي مواعيد العمل؟',
          a: 'من السبت للخميس: 9 صباحاً - 6 مساءً. الماسنجر بوت متاح 24/7 للرد الفوري!'
        },
        {
          q: 'ما هو الماسنجر بوت؟',
          a: 'بوت ذكي على Facebook و Instagram يرد على أسئلتك فوراً عن المنتجات، الأسعار، والطلبات. جربه دلوقتي!'
        },
        {
          q: 'كيف أقدم شكوى؟',
          a: 'نعتذر إذا واجهت أي مشكلة! اتصل بنا على 01555512778 أو ابعتلنا على البريد وهنحل المشكلة في أسرع وقت.'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BrandBackgroundPattern />
      <div className="relative z-10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-pink-500 rounded-full mb-6">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-pink-500 to-primary bg-clip-text text-transparent mb-4">
              الأسئلة الشائعة
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              إجابات سريعة على أكثر الأسئلة شيوعاً. مالقيتش اللي تدور عليه؟ تكلم معنا!
            </p>
          </div>

          {/* Quick Contact CTA */}
          <div className="bg-gradient-to-r from-primary to-pink-500 rounded-3xl p-8 mb-12 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">محتاج مساعدة فورية؟ 🤖</h2>
            <p className="mb-6">تكلم مع البوت الذكي على الماسنجر - بيرد 24/7!</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a 
                href="https://m.me/103042954595602" 
                target="_blank"
                className="bg-white text-primary px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Messenger
              </a>
              <a 
                href="tel:01555512778" 
                className="bg-white text-primary px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                01555512778
              </a>
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {faqs.map((category, categoryIndex) => {
              const Icon = category.icon
              return (
                <div key={categoryIndex} className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 md:p-8 border border-primary/10">
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary/20">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-pink-500 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{category.category}</h2>
                  </div>

                  {/* Questions */}
                  <div className="space-y-6">
                    {category.questions.map((item, index) => (
                      <div key={index} className="group">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-start gap-2">
                          <span className="text-primary mt-1">❓</span>
                          <span className="flex-1">{item.q}</span>
                        </h3>
                        <p className="text-gray-700 leading-relaxed pr-7">
                          {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Still Have Questions */}
          <div className="mt-12 bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center border border-primary/10">
            <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">لسه عندك أسئلة تانية؟</h2>
            <p className="text-gray-600 mb-6">
              فريقنا جاهز لمساعدتك! تواصل معنا بأي وسيلة تناسبك
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a 
                href="https://m.me/103042954595602" 
                target="_blank"
                className="bg-gradient-to-r from-primary to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                ابعتلنا على Messenger
              </a>
              <a 
                href="tel:01555512778" 
                className="border-2 border-primary text-primary px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                اتصل بنا
              </a>
              <a 
                href="mailto:remostore.egy@gmail.com" 
                className="border-2 border-primary text-primary px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
              >
                📧 ابعتلنا إيميل
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
