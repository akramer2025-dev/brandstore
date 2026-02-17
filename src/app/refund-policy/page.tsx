import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Package, Clock, CheckCircle, XCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'سياسة الاسترجاع والاستبدال - Remostore',
  description: 'تعرف على سياسة الاسترجاع والاستبدال في ريموستور - نوفر لك ضمان استرجاع المنتجات خلال 14 يوم',
  keywords: ['استرجاع', 'استبدال', 'ضمان', 'سياسة الاسترجاع', 'رد المبلغ'],
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-purple-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          <span>العودة للرئيسية</span>
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl p-8 text-white text-center">
          <Package className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">سياسة الاسترجاع والاستبدال</h1>
          <p className="text-purple-100">راحتك ورضاك هو هدفنا الأول - استرجع أو استبدل منتجاتك بكل سهولة</p>
        </div>

        {/* Content */}
        <div className="bg-white/95 backdrop-blur-sm rounded-b-2xl p-8 shadow-2xl">
          
          {/* مدة الاسترجاع */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">⏰ مدة الاسترجاع والاستبدال</h2>
            </div>
            <div className="bg-purple-50 border-r-4 border-purple-600 p-6 rounded-lg">
              <p className="text-gray-700 mb-3 font-semibold text-lg">
                ✅ يمكنك استرجاع أو استبدال المنتج خلال <span className="text-purple-600 font-bold">14 يوم</span> من تاريخ الاستلام
              </p>
              <p className="text-gray-600 text-sm">
                * يجب أن يكون المنتج بحالته الأصلية مع جميع الملحقات والعلامات
              </p>
            </div>
          </section>

          {/* شروط الاسترجاع */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">✅ شروط قبول الاسترجاع</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <div className="mt-1">✔️</div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">المنتج بحالته الأصلية</h3>
                  <p className="text-sm text-gray-600">لم يتم استخدامه أو ارتداؤه، مع جميع الملصقات والعلامات</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <div className="mt-1">✔️</div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">العبوة الأصلية</h3>
                  <p className="text-sm text-gray-600">المنتج في عبوته الأصلية مع جميع الملحقات</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <div className="mt-1">✔️</div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">فاتورة الشراء</h3>
                  <p className="text-sm text-gray-600">تقديم فاتورة الشراء أو رقم الطلب</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <div className="mt-1">✔️</div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">خلال المدة المحددة</h3>
                  <p className="text-sm text-gray-600">طلب الاسترجاع خلال 14 يوم من تاريخ الاستلام</p>
                </div>
              </div>
            </div>
          </section>

          {/* الحالات المستثناة */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-800">❌ منتجات لا تقبل الاسترجاع</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                <div className="mt-1">❌</div>
                <div className="text-gray-700">
                  <strong>الملابس الداخلية:</strong> لأسباب صحية
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                <div className="mt-1">❌</div>
                <div className="text-gray-700">
                  <strong>المنتجات المستخدمة:</strong> المنتجات التي تم استخدامها أو ارتداؤها
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                <div className="mt-1">❌</div>
                <div className="text-gray-700">
                  <strong>المنتجات المخصصة:</strong> المنتجات المصنوعة حسب الطلب
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                <div className="mt-1">❌</div>
                <div className="text-gray-700">
                  <strong>منتجات التنزيلات:</strong> بعض منتجات التخفيضات الخاصة (يتم التنويه عنها)
                </div>
              </div>
            </div>
          </section>

          {/* طريقة الاسترجاع */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 كيفية طلب الاسترجاع</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">تواصل معنا</h3>
                  <p className="text-gray-600 text-sm">
                    اتصل بنا على رقم <strong className="text-purple-600">01555512778</strong> أو عبر WhatsApp
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">أرسل بيانات الطلب</h3>
                  <p className="text-gray-600 text-sm">
                    رقم الطلب، سبب الاسترجاع، وصور للمنتج (إن أمكن)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">انتظر الموافقة</h3>
                  <p className="text-gray-600 text-sm">
                    سيتم مراجعة طلبك خلال 24 ساعة والرد عليك
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">إرسال المنتج</h3>
                  <p className="text-gray-600 text-sm">
                    سنرتب عملية استلام المنتج من عندك (مجاناً) أو يمكنك إرساله بنفسك
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                  5
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">استرداد المبلغ</h3>
                  <p className="text-gray-600 text-sm">
                    بعد استلام المنتج والتحقق منه، سيتم رد المبلغ خلال 3-7 أيام عمل
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* رد المبلغ */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">💰 طريقة رد المبلغ</h2>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span><strong>الدفع عند الاستلام:</strong> سيتم رد المبلغ نقداً عند استلام المنتج المسترجع</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span><strong>التحويل البنكي:</strong> رد المبلغ على حسابك البنكي خلال 3-7 أيام عمل</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span><strong>رصيد المتجر:</strong> يمكنك استخدام المبلغ كرصيد لشراء منتجات أخرى (فوري)</span>
                </li>
              </ul>
            </div>
          </section>

          {/* الاستبدال */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔄 الاستبدال</h2>
            <div className="bg-blue-50 border-r-4 border-blue-600 p-6 rounded-lg">
              <p className="text-gray-700 mb-3">
                يمكنك استبدال المنتج بمنتج آخر من نفس القيمة أو أكثر (مع دفع الفرق)
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>تغيير المقاس أو اللون مجاناً</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>استبدال بمنتج مختلف من نفس السعر</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>الاستبدال أسرع من الاسترجاع (فوري عند التوفر)</span>
                </li>
              </ul>
            </div>
          </section>

          {/* تكاليف الشحن */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🚚 تكاليف الشحن</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">✅ الشحن مجاني في هذه الحالات:</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• المنتج معيب أو تالف</li>
                  <li>• خطأ في الشحن (منتج خاطئ)</li>
                  <li>• عدم مطابقة الوصف</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h3 className="font-semibold text-orange-800 mb-2">⚠️ يتحمل العميل رسوم الشحن:</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• تغيير الرأي</li>
                  <li>• عدم الإعجاب بالمنتج</li>
                  <li>• طلب مقاس خاطئ</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold mb-2">لديك استفسار؟</h3>
            <p className="mb-4 text-purple-100">فريق خدمة العملاء جاهز لمساعدتك</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a 
                href="https://wa.me/201555512778" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                📱 واتساب: 01555512778
              </a>
              <a 
                href="mailto:remostore.egy@gmail.com"
                className="bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-400 transition-colors"
              >
                📧 البريد الإلكتروني
              </a>
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            آخر تحديث: فبراير 2026
          </div>
        </div>
      </div>
    </div>
  );
}
