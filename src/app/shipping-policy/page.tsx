import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Truck, MapPin, Clock, Package, DollarSign } from 'lucide-react';

export const metadata: Metadata = {
  title: 'سياسة الشحن والتوصيل - Remostore',
  description: 'تعرف على سياسة الشحن والتوصيل في ريموستور - نوفر شحن سريع لجميع أنحاء مصر مع إمكانية الدفع عند الاستلام',
  keywords: ['شحن', 'توصيل', 'رسوم الشحن', 'مدة التوصيل', 'COD'],
};

export default function ShippingPolicyPage() {
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
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-t-2xl p-8 text-white text-center">
          <Truck className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">سياسة الشحن والتوصيل</h1>
          <p className="text-blue-100">نوصل طلباتك بسرعة وأمان لجميع أنحاء مصر</p>
        </div>

        {/* Content */}
        <div className="bg-white/95 backdrop-blur-sm rounded-b-2xl p-8 shadow-2xl">
          
          {/* مناطق التوصيل */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">🗺️ مناطق التوصيل</h2>
            </div>
            <div className="bg-blue-50 border-r-4 border-blue-600 p-6 rounded-lg">
              <p className="text-gray-700 mb-4 font-semibold text-lg">
                ✅ نوصل لجميع محافظات جمهورية مصر العربية
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">📍 القاهرة الكبرى</h3>
                  <p className="text-sm text-gray-600">القاهرة، الجيزة، القليوبية</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">🏖️ محافظات الساحل</h3>
                  <p className="text-sm text-gray-600">الإسكندرية، مطروح، شمال سيناء، جنوب سيناء</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">🌾 محافظات الدلتا</h3>
                  <p className="text-sm text-gray-600">الشرقية، الدقهلية، الغربية، المنوفية، البحيرة، كفر الشيخ، دمياط</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">🏜️ محافظات الصعيد</h3>
                  <p className="text-sm text-gray-600">بني سويف، الفيوم، المنيا، أسيوط، سوهاج، قنا، الأقصر، أسوان، الوادي الجديد، البحر الأحمر</p>
                </div>
              </div>
            </div>
          </section>

          {/* مدة التوصيل */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">⏱️ مدة التوصيل</h2>
            </div>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-green-600 text-white rounded-full px-3 py-1 text-sm font-bold">
                    ⚡ سريع
                  </div>
                  <h3 className="font-bold text-gray-800">القاهرة والجيزة وبعض مناطق القليوبية</h3>
                </div>
                <p className="text-gray-700">
                  <strong className="text-green-600">1-2 يوم عمل</strong> في معظم المناطق
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-600 text-white rounded-full px-3 py-1 text-sm font-bold">
                    📦 عادي
                  </div>
                  <h3 className="font-bold text-gray-800">باقي محافظات الوجه البحري</h3>
                </div>
                <p className="text-gray-700">
                  <strong className="text-blue-600">2-3 أيام عمل</strong>
                </p>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-5 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-orange-600 text-white rounded-full px-3 py-1 text-sm font-bold">
                    🚚 قياسي
                  </div>
                  <h3 className="font-bold text-gray-800">محافظات الصعيد والمناطق النائية</h3>
                </div>
                <p className="text-gray-700">
                  <strong className="text-orange-600">3-5 أيام عمل</strong>
                </p>
              </div>
            </div>
            
            <div className="mt-4 bg-yellow-50 border border-yellow-300 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>ملحوظة:</strong> المدة قد تختلف خلال المواسم والأعياد والظروف الاستثنائية. سيتم إخطارك بأي تأخير.
              </p>
            </div>
          </section>

          {/* رسوم الشحن */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">💰 رسوم الشحن</h2>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-r-4 border-purple-600 p-6 rounded-lg mb-4">
              <h3 className="font-bold text-xl text-purple-800 mb-3">
                🎁 شحن مجاني للطلبات أكثر من 500 جنيه!
              </h3>
              <p className="text-gray-700">
                تمتع بشحن مجاني لجميع المحافظات عند الشراء بقيمة 500 جنيه أو أكثر
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <th className="p-4 text-right">المنطقة</th>
                    <th className="p-4 text-center">رسوم الشحن</th>
                    <th className="p-4 text-center">مدة التوصيل</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4">القاهرة والجيزة</td>
                    <td className="p-4 text-center font-semibold text-green-600">30 جنيه</td>
                    <td className="p-4 text-center">1-2 يوم</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4">القليوبية</td>
                    <td className="p-4 text-center font-semibold text-green-600">35 جنيه</td>
                    <td className="p-4 text-center">1-2 يوم</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4">الإسكندرية</td>
                    <td className="p-4 text-center font-semibold text-blue-600">40 جنيه</td>
                    <td className="p-4 text-center">2-3 يوم</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4">الدلتا (الشرقية، الدقهلية، الغربية، المنوفية)</td>
                    <td className="p-4 text-center font-semibold text-blue-600">45 جنيه</td>
                    <td className="p-4 text-center">2-3 يوم</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4">قناة السويس (الإسماعيلية، السويس، بورسعيد)</td>
                    <td className="p-4 text-center font-semibold text-blue-600">50 جنيه</td>
                    <td className="p-4 text-center">2-3 يوم</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4">الصعيد (بني سويف، الفيوم، المنيا)</td>
                    <td className="p-4 text-center font-semibold text-orange-600">50 جنيه</td>
                    <td className="p-4 text-center">3-4 يوم</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4">الصعيد الأوسط (أسيوط، سوهاج)</td>
                    <td className="p-4 text-center font-semibold text-orange-600">55 جنيه</td>
                    <td className="p-4 text-center">3-5 يوم</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-4">الصعيد البعيد (قنا، الأقصر، أسوان)</td>
                    <td className="p-4 text-center font-semibold text-red-600">60 جنيه</td>
                    <td className="p-4 text-center">4-5 يوم</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* طرق الدفع */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">💳 طرق الدفع المتاحة</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-3">💵 الدفع عند الاستلام (COD)</h3>
                <ul className="space-y-2 text-green-50">
                  <li>✓ ادفع عند استلام الطلب</li>
                  <li>✓ افحص المنتج قبل الدفع</li>
                  <li>✓ نقداً لموظف التوصيل</li>
                  <li>✓ الطريقة الأكثر أماناً</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-3">💳 الدفع الإلكتروني</h3>
                <ul className="space-y-2 text-blue-50">
                  <li>✓ بطاقات فيزا وماستركارد</li>
                  <li>✓ تحويل بنكي</li>
                  <li>✓ محافظ إلكترونية</li>
                  <li>✓ خصم 5% عند الدفع المسبق</li>
                </ul>
              </div>
            </div>
          </section>

          {/* عملية الشحن */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📦 خطوات الشحن والتوصيل</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">تأكيد الطلب</h3>
                  <p className="text-gray-600 text-sm">
                    بعد إتمام الطلب، سنتواصل معك خلال ساعات لتأكيد التفاصيل والعنوان
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">تحضير الطلب</h3>
                  <p className="text-gray-600 text-sm">
                    نقوم بفحص المنتجات وتجهيزها للشحن بعناية فائقة
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">الشحن</h3>
                  <p className="text-gray-600 text-sm">
                    يتم شحن الطلب عبر شركة شحن موثوقة (بوسطة أو شركات معتمدة)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">التتبع</h3>
                  <p className="text-gray-600 text-sm">
                    تستلم رقم تتبع (Tracking Number) لمتابعة شحنتك لحظة بلحظة
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">التوصيل</h3>
                  <p className="text-gray-600 text-sm">
                    يتصل بك موظف التوصيل قبل الوصول لتحديد الوقت المناسب
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">
                  ✓
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">الاستلام والفحص</h3>
                  <p className="text-gray-600 text-sm">
                    افحص المنتج أمام موظف التوصيل - يمكنك رفضه إذا كان معيباً أوغير مطابق
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ملاحظات هامة */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">⚠️ ملاحظات هامة</h2>
            <div className="bg-yellow-50 border-r-4 border-yellow-500 p-6 rounded-lg space-y-3">
              <p className="text-gray-700 flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>يجب وجود شخص لاستلام الطلب في العنوان المحدد</span>
              </p>
              <p className="text-gray-700 flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>تأكد من صحة رقم الهاتف والعنوان لتجنب التأخير</span>
              </p>
              <p className="text-gray-700 flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>في حالة رفض الاستلام لسبب غير عيب المنتج، يتحمل العميل رسوم الشحن ذهاباً وإياباً</span>
              </p>
              <p className="text-gray-700 flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>يمكنك تغيير العنوان قبل الشحن من خلال التواصل معنا</span>
              </p>
            </div>
          </section>

          {/* Contact CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold mb-2">استفسار عن الشحن؟</h3>
            <p className="mb-4 text-blue-100">تواصل معنا للحصول على معلومات دقيقة عن شحنتك</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a 
                href="https://wa.me/201555512778" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                📱 واتساب: 01555512778
              </a>
              <a 
                href="tel:01555512778"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors"
              >
                📞 اتصل بنا
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
