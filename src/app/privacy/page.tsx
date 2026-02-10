import { Metadata } from 'next'
import BrandBackgroundPattern from '@/components/BrandBackgroundPattern'
import { Shield, Lock, Eye, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | ريمو ستور',
  description: 'سياسة الخصوصية وحماية البيانات في ريمو ستور',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <BrandBackgroundPattern />
      <div className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-primary/10">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-pink-500 rounded-full mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-pink-500 to-primary bg-clip-text text-transparent mb-4">
                سياسة الخصوصية
              </h1>
              <p className="text-gray-600 flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                آخر تحديث: 10 فبراير 2026
              </p>
            </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none text-right" dir="rtl">
            
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">مقدمة</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                نحن في <strong>ريمو ستور</strong> (www.remostore.net) نقدر خصوصيتك ونلتزم بحماية بياناتك الشخصية. 
                توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك عند استخدام موقعنا الإلكتروني، 
                تطبيق الموبايل، أو خدمة الماسنجر بوت.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">المعلومات التي نجمعها</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">1. المعلومات التي تقدمها مباشرة</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>معلومات الحساب:</strong> الاسم، البريد الإلكتروني، رقم الهاتف، كلمة المرور</li>
                <li><strong>معلومات الطلب:</strong> عنوان التوصيل، تفاصيل الدفع، تاريخ الطلبات</li>
                <li><strong>رسائل الماسنجر:</strong> المحادثات مع البوت الذكي لتقديم خدمة أفضل</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2. المعلومات التي نجمعها تلقائياً</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>معلومات الجهاز:</strong> نوع المتصفح، نظام التشغيل، عنوان IP</li>
                <li><strong>معلومات الاستخدام:</strong> الصفحات التي تزورها، المنتجات التي تشاهدها</li>
                <li><strong>ملفات تعريف الارتباط (Cookies):</strong> لتحسين تجربتك وتذكر تفضيلاتك</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3. معلومات من مصادر أخرى</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Facebook/Instagram:</strong> معلومات عامة عند التواصل عبر Messenger</li>
                <li><strong>معلومات الدفع:</strong> من مزودي خدمات الدفع (لكن لا نحتفظ بتفاصيل بطاقتك)</li>
              </ul>
            </section>

            {/* How We Use Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">كيف نستخدم معلوماتك</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>معالجة الطلبات:</strong> إتمام عمليات الشراء والتوصيل</li>
                <li><strong>خدمة العملاء:</strong> الرد على استفساراتك عبر الماسنجر بوت أو الهاتف</li>
                <li><strong>تحسين الخدمة:</strong> فهم احتياجاتك وتطوير المنتجات والخدمات</li>
                <li><strong>التسويق:</strong> إرسال عروض خاصة (يمكنك إلغاء الاشتراك في أي وقت)</li>
                <li><strong>الأمان:</strong> منع الاحتيال وحماية حسابك</li>
                <li><strong>الامتثال القانوني:</strong> الالتزام بالقوانين المعمول بها</li>
              </ul>
            </section>

            {/* Messenger Bot */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">بوت الماسنجر الذكي</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                عند التواصل معنا عبر Facebook Messenger أو Instagram Direct:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>نستخدم الذكاء الاصطناعي (AI) لفهم استفساراتك والرد عليها بسرعة</li>
                <li>يتم تحليل رسائلك لتقديم معلومات دقيقة عن المنتجات والأسعار</li>
                <li>لا نشارك محادثاتك مع أطراف ثالثة</li>
                <li>يمكنك طلب حذف محادثاتك في أي وقت</li>
                <li>البوت متصل بقاعدة بياناتنا لعرض معلومات حقيقية ومحدثة</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">مشاركة المعلومات</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>لا نبيع معلوماتك الشخصية.</strong> لكن قد نشاركها مع:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>شركات الشحن:</strong> لتوصيل طلباتك</li>
                <li><strong>معالجي الدفع:</strong> لإتمام المعاملات المالية بأمان</li>
                <li><strong>مزودي الخدمات التقنية:</strong> لاستضافة الموقع والتطبيق</li>
                <li><strong>Facebook/Meta:</strong> لتشغيل خدمة الماسنجر بوت</li>
                <li><strong>الجهات القانونية:</strong> إذا طلب القانون ذلك</li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">أمان البيانات</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                نتخذ إجراءات أمنية صارمة لحماية معلوماتك:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>تشفير SSL/TLS لنقل البيانات</li>
                <li>تخزين آمن في قواعد بيانات محمية</li>
                <li>وصول محدود للموظفين المصرح لهم فقط</li>
                <li>مراقبة مستمرة للأنشطة المشبوهة</li>
                <li>نسخ احتياطي منتظم للبيانات</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">حقوقك</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>الوصول:</strong> طلب نسخة من بياناتك الشخصية</li>
                <li><strong>التصحيح:</strong> تحديث أو تصحيح معلوماتك</li>
                <li><strong>الحذف:</strong> طلب حذف بياناتك (إذا لم تكن ضرورية قانونياً)</li>
                <li><strong>الاعتراض:</strong> الاعتراض على معالجة بياناتك لأغراض تسويقية</li>
                <li><strong>النقل:</strong> الحصول على بياناتك بصيغة قابلة للقراءة</li>
                <li><strong>إلغاء الموافقة:</strong> سحب موافقتك في أي وقت</li>
              </ul>
            </section>

            {/* Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">ملفات تعريف الارتباط (Cookies)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                نستخدم الـ Cookies لـ:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>تذكر تسجيل دخولك</li>
                <li>حفظ سلة التسوق</li>
                <li>فهم كيفية استخدامك للموقع</li>
                <li>تخصيص المحتوى والإعلانات</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                يمكنك تعطيل الـ Cookies من إعدادات متصفحك، لكن قد يؤثر ذلك على بعض الخصائص.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">خصوصية الأطفال</h2>
              <p className="text-gray-700 leading-relaxed">
                خدماتنا غير موجهة للأطفال دون سن 18 عاماً. لا نجمع معلومات شخصية من الأطفال عمداً. 
                إذا اكتشفنا أننا جمعنا معلومات من طفل، سنحذفها فوراً.
              </p>
            </section>

            {/* International Transfers */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">النقل الدولي للبيانات</h2>
              <p className="text-gray-700 leading-relaxed">
                قد يتم تخزين بياناتك ومعالجتها في خوادم خارج مصر، بما في ذلك الولايات المتحدة (Vercel, Meta). 
                نضمن أن أي نقل يتم وفقاً للمعايير القانونية ومع ضمانات أمنية مناسبة.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">التغييرات على السياسة</h2>
              <p className="text-gray-700 leading-relaxed">
                قد نحدث هذه السياسة من وقت لآخر. سننشر أي تغييرات على هذه الصفحة مع تحديث تاريخ "آخر تحديث". 
                ننصحك بمراجعة هذه الصفحة بانتظام.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">اتصل بنا</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                إذا كان لديك أي أسئلة حول سياسة الخصوصية أو ترغب في ممارسة حقوقك:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>ريمو ستور - Remo Store</strong>
                </p>
                <p className="text-gray-700 mb-2">
                  📧 البريد الإلكتروني: <a href="mailto:akram.er2025@gmail.com" className="text-blue-600 hover:underline">akram.er2025@gmail.com</a>
                </p>
                <p className="text-gray-700 mb-2">
                  📱 واتساب/هاتف: <a href="tel:+201555512778" className="text-blue-600 hover:underline">01555512778</a>
                </p>
                <p className="text-gray-700 mb-2">
                  🌐 الموقع: <a href="https://www.remostore.net" className="text-blue-600 hover:underline">www.remostore.net</a>
                </p>
                <p className="text-gray-700">
                  📍 العنوان: مصر - القاهرة
                </p>
              </div>
            </section>

            {/* Footer Note */}
            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-600 text-center">
                بمواصلة استخدام خدماتنا، فإنك توافق على سياسة الخصوصية هذه
              </p>
            </div>

          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
