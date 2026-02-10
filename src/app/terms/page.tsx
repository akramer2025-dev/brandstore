import { Metadata } from 'next'
import BrandBackgroundPattern from '@/components/BrandBackgroundPattern'
import { FileCheck, Scale, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'شروط الاستخدام | ريمو ستور',
  description: 'شروط وأحكام استخدام خدمات ريمو ستور',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <BrandBackgroundPattern />
      <div className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-primary/10">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-pink-500 rounded-full mb-6">
                <Scale className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-pink-500 to-primary bg-clip-text text-transparent mb-4">
                شروط الاستخدام
              </h1>
              <p className="text-gray-600 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                آخر تحديث: 10 فبراير 2026
              </p>
            </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none text-right" dir="rtl">
            
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">مرحباً بك في ريمو ستور</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                هذه الشروط والأحكام تنظم استخدامك لموقع <strong>www.remostore.net</strong>، تطبيق الموبايل، 
                وخدمة الماسنجر بوت الخاصة بنا. باستخدامك لأي من خدماتنا، فإنك توافق على الالتزام بهذه الشروط.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام خدماتنا.
              </p>
            </section>

            {/* Definitions */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">التعريفات</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>"نحن"، "لنا"، "خاصتنا":</strong> تشير إلى ريمو ستور</li>
                <li><strong>"أنت"، "لك"، "خاصتك":</strong> تشير إلى المستخدم أو العميل</li>
                <li><strong>"الخدمات":</strong> الموقع الإلكتروني، التطبيق، الماسنجر بوت، وأي خدمات أخرى نقدمها</li>
                <li><strong>"المنتجات":</strong> الملابس والمنتجات المعروضة للبيع</li>
                <li><strong>"الطلب":</strong> طلب شراء منتج أو أكثر</li>
              </ul>
            </section>

            {/* Eligibility */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">الأهلية للاستخدام</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                لاستخدام خدماتنا، يجب أن:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>تكون بعمر 18 عاماً أو أكثر</li>
                <li>تكون لديك الأهلية القانونية للدخول في عقود ملزمة</li>
                <li>تقدم معلومات دقيقة وكاملة عند التسجيل أو الطلب</li>
                <li>تلتزم بجميع القوانين والأنظمة المحلية</li>
              </ul>
            </section>

            {/* Account Registration */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">تسجيل الحساب</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                عند إنشاء حساب، أنت توافق على:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>تقديم معلومات صحيحة ومحدثة</li>
                <li>الحفاظ على سرية كلمة المرور الخاصة بك</li>
                <li>إخطارنا فوراً بأي استخدام غير مصرح به لحسابك</li>
                <li>تحمل المسؤولية عن جميع الأنشطة التي تتم من حسابك</li>
                <li>عدم إنشاء أكثر من حساب واحد شخصي</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                نحتفظ بالحق في تعليق أو إنهاء حسابك إذا شككنا في انتهاك هذه الشروط.
              </p>
            </section>

            {/* Orders and Purchases */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">الطلبات والمشتريات</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">تقديم الطلب</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>جميع الطلبات تخضع للقبول والتوافر</li>
                <li>نحتفظ بالحق في رفض أو إلغاء أي طلب لأي سبب</li>
                <li>الأسعار قابلة للتغيير دون إشعار مسبق</li>
                <li>الطلب يعتبر نهائياً عند تأكيده منا</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">الأسعار والدفع</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>جميع الأسعار بالجنيه المصري وتشمل ضريبة القيمة المضافة إن وجدت</li>
                <li>نقبل الدفع عند الاستلام (COD) للملابس</li>
                <li>رسوم الشحن تُحسب بناءً على العنوان والوزن</li>
                <li>الشحن مجاني للطلبات أكثر من 1000 جنيه</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">التوصيل</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>مدة التوصيل المتوقعة: 2-5 أيام عمل</li>
                <li>نوصل لجميع محافظات مصر</li>
                <li>يجب توفير عنوان توصيل دقيق وكامل</li>
                <li>غير مسؤولين عن التأخير بسبب ظروف خارجة عن إرادتنا</li>
              </ul>
            </section>

            {/* Returns and Refunds */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">الإرجاع والاسترداد</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">سياسة الإرجاع</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>يمكنك إرجاع المنتجات خلال 7 أيام من استلامها</li>
                <li>يجب أن تكون المنتجات في حالتها الأصلية مع البطاقات والعبوة</li>
                <li>لا نقبل إرجاع الملابس الداخلية أو المنتجات المخصصة</li>
                <li>عميل يتحمل تكلفة الإرجاع إلا في حالة عيب المصنع</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">الاسترداد</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>تتم معالجة الاستردادات خلال 7-14 يوم عمل</li>
                <li>يتم الاسترداد بنفس طريقة الدفع الأصلية</li>
                <li>رسوم الشحن غير قابلة للاسترداد</li>
              </ul>
            </section>

            {/* Messenger Bot */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">خدمة الماسنجر بوت</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                نوفر خدمة بوت ذكي عبر Facebook Messenger و Instagram Direct:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>البوت يستخدم الذكاء الاصطناعي لتقديم معلومات دقيقة عن المنتجات</li>
                <li>المعلومات المقدمة من البوت استرشادية وقد تتغير</li>
                <li>البوت متاح 24/7 لكن الردود قد تستغرق وقتاً</li>
                <li>لا نتحمل المسؤولية عن أي أخطاء قد تحدث في ردود البوت</li>
                <li>يمكنك التواصل مع فريقنا البشري مباشرة إذا لزم الأمر</li>
                <li>باستخدامك للبوت، توافق على معالجة رسائلك بواسطة AI</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">الملكية الفكرية</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                جميع المحتويات على موقعنا وتطبيقنا (النصوص، الصور، الشعارات، التصميمات) محمية بحقوق الملكية الفكرية.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>يُحظر عليك:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>نسخ أو توزيع أو تعديل أي محتوى دون إذن كتابي</li>
                <li>استخدام أي محتوى لأغراض تجارية</li>
                <li>إزالة أي علامات تجارية أو حقوق نشر</li>
                <li>استخدام أي وسيلة آلية لاستخراج البيانات (scraping)</li>
              </ul>
            </section>

            {/* Prohibited Activities */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">الأنشطة المحظورة</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                يُحظر عليك:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>استخدام الخدمات لأي أغراض غير قانونية أو احتيالية</li>
                <li>محاولة اختراق أو تعطيل أنظمتنا</li>
                <li>إرسال فيروسات أو برامج ضارة</li>
                <li>انتحال شخصية أي شخص أو جهة</li>
                <li>إزعاج أو مضايقة مستخدمين آخرين أو موظفينا</li>
                <li>جمع معلومات مستخدمين آخرين</li>
                <li>استخدام البوت للإزعاج أو إرسال رسائل غير لائقة</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">حدود المسؤولية</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                نقدم خدماتنا "كما هي" دون أي ضمانات صريحة أو ضمنية.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>لن نكون مسؤولين عن:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام خدماتنا</li>
                <li>فقدان البيانات أو الأرباح</li>
                <li>انقطاع الخدمة أو الأخطاء التقنية</li>
                <li>أخطاء في معلومات المنتجات أو الأسعار</li>
                <li>تصرفات أو إهمال شركات الشحن</li>
                <li>أخطاء أو معلومات خاطئة من البوت الذكي</li>
              </ul>
            </section>

            {/* Indemnification */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">التعويض</h2>
              <p className="text-gray-700 leading-relaxed">
                توافق على تعويضنا والدفاع عنا ضد أي مطالبات أو خسائر أو أضرار ناتجة عن:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                <li>انتهاكك لهذه الشروط</li>
                <li>انتهاكك لأي قانون أو حقوق طرف ثالث</li>
                <li>استخدامك غير المصرح به للخدمات</li>
              </ul>
            </section>

            {/* Modifications */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">التعديلات</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر التغييرات على هذه الصفحة مع تحديث التاريخ.
              </p>
              <p className="text-gray-700 leading-relaxed">
                استمرارك في استخدام خدماتنا بعد التعديلات يعني موافقتك على الشروط الجديدة.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">إنهاء الحساب</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                نحتفظ بالحق في:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>تعليق أو إنهاء حسابك في أي وقت</li>
                <li>رفض الخدمة لأي شخص لأي سبب</li>
                <li>إزالة أي محتوى تنشره</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                يمكنك إغلاق حسابك في أي وقت بالتواصل معنا.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">القانون الحاكم</h2>
              <p className="text-gray-700 leading-relaxed">
                تخضع هذه الشروط وتفسر وفقاً لقوانين جمهورية مصر العربية. أي نزاع ينشأ عن هذه الشروط 
                سيكون ضمن الاختصاص الحصري للمحاكم المصرية.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">اتصل بنا</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                إذا كان لديك أي أسئلة حول هذه الشروط:
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
                باستخدامك لخدماتنا، فإنك تقر بأنك قرأت وفهمت ووافقت على هذه الشروط والأحكام
              </p>
            </div>

          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
