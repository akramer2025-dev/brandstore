'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingBag, Upload, Link as LinkIcon, Image as ImageIcon, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SheinOrderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    productLinks: ['', '', '', '', ''], // 5 حقول افتراضية
    productImages: [] as string[],
    notes: '',
  });

  const handleAddLink = () => {
    setFormData(prev => ({
      ...prev,
      productLinks: [...prev.productLinks, '']
    }));
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...formData.productLinks];
    newLinks[index] = value;
    setFormData(prev => ({ ...prev, productLinks: newLinks }));
  };

  const handleRemoveLink = (index: number) => {
    if (formData.productLinks.length > 1) {
      const newLinks = formData.productLinks.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, productLinks: newLinks }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    toast.info('جاري رفع الصور...');
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        }
      }

      setFormData(prev => ({
        ...prev,
        productImages: [...prev.productImages, ...uploadedUrls]
      }));

      toast.success(`تم رفع ${uploadedUrls.length} صورة بنجاح`);
    } catch (error) {
      console.error('خطأ في رفع الصور:', error);
      toast.error('فشل رفع بعض الصور');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من تسجيل الدخول
    if (status !== 'authenticated') {
      toast.error('يجب تسجيل الدخول أولاً');
      router.push('/auth/login?callbackUrl=/shein');
      return;
    }

    // التحقق من وجود روابط أو صور
    const validLinks = formData.productLinks.filter(link => link.trim() !== '');
    if (validLinks.length === 0 && formData.productImages.length === 0) {
      toast.error('يجب إضافة رابط واحد على الأقل أو رفع صورة');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/shein/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName || session.user?.name,
          customerPhone: formData.customerPhone,
          customerEmail: formData.customerEmail || session.user?.email,
          productLinks: validLinks,
          productImages: formData.productImages,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        toast.success('تم استلام الطلب بنجاح! 🎉');
      } else {
        toast.error(data.error || 'حدث خطأ أثناء إرسال الطلب');
      }
    } catch (error) {
      console.error('خطأ:', error);
      toast.error('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl border-2 border-green-200">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-green-100 p-6 rounded-full">
                <CheckCircle className="w-20 h-20 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              تم استلام طلبك بنجاح! ✅
            </h2>
            <p className="text-xl text-gray-600">
              سيتم التواصل معك من قبل الإدارة خلال 24 ساعة لتأكيد الطلب وتحديد التكلفة
            </p>
            <div className="bg-blue-50 p-4 rounded-lg text-right">
              <h3 className="font-bold text-blue-900 mb-2">📋 الخطوات التالية:</h3>
              <ul className="space-y-2 text-blue-800">
                <li>✓ مراجعة المنتجات المطلوبة</li>
                <li>✓ حساب التكلفة الإجمالية</li>
                <li>✓ التواصل معك لتأكيد الطلب</li>
                <li>✓ دفع 50% مقدم</li>
                <li>✓ طلب المنتجات من شي إن</li>
                <li>✓ دفع 50% المتبقي عند الاستلام</li>
              </ul>
            </div>
            <div className="flex gap-4">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  العودة للرئيسية
                </Button>
              </Link>
              <Button 
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    customerName: '',
                    customerPhone: '',
                    customerEmail: '',
                    productLinks: ['', '', '', '', ''],
                    productImages: [],
                    notes: '',
                  });
                }}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600"
              >
                طلب جديد
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white py-16 shadow-2xl">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 p-6 rounded-full backdrop-blur-sm">
              <ShoppingBag className="w-16 h-16" />
            </div>
          </div>
          <h1 className="text-5xl font-bold drop-shadow-lg mb-4">
            طلبات شي إن SHEIN 🛍️
          </h1>
          <p className="text-xl text-pink-100 max-w-3xl mx-auto leading-relaxed">
            اطلب أي منتج من شي إن بسهولة! نحن نوفر لك خدمة الطلب والشحن من شي إن بأفضل الأسعار
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 border-pink-200">
            <CardHeader className="bg-gradient-to-br from-pink-50 to-purple-50">
              <CardTitle className="flex items-center gap-2">
                <span className="text-3xl">💰</span>
                <span>نظام الدفع</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                دفع <span className="font-bold text-pink-600">50%</span> من المبلغ مقدماً 
                و <span className="font-bold text-purple-600">50%</span> عند استلام المنتجات
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-br from-purple-50 to-blue-50">
              <CardTitle className="flex items-center gap-2">
                <span className="text-3xl">📦</span>
                <span>الشحن السريع</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                نوصل لك المنتجات في <span className="font-bold text-purple-600">أسرع وقت ممكن</span> مع 
                متابعة مستمرة لحالة الطلب
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center gap-2">
                <span className="text-3xl">✨</span>
                <span>جودة مضمونة</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                نتأكد من <span className="font-bold text-blue-600">جودة المنتجات</span> قبل التسليم
                مع إمكانية الإرجاع في حالة وجود مشكلة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Order Form */}
        <Card className="max-w-4xl mx-auto shadow-2xl border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100">
            <CardTitle className="text-2xl">
              📝 إنشاء طلب جديد
            </CardTitle>
            <p className="text-gray-600 mt-2">
              أضف روابط المنتجات من شي إن أو صور المنتجات المطلوبة
            </p>
          </CardHeader>

          <CardContent className="p-8">
            {status !== 'authenticated' && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-amber-900 mb-1">
                    يجب تسجيل الدخول أولاً
                  </h3>
                  <p className="text-amber-800 mb-3">
                    لإنشاء طلب من شي إن، يجب أن يكون لديك حساب مسجل
                  </p>
                  <Link href="/auth/login?callbackUrl=/shein">
                    <Button variant="outline" className="border-amber-600 text-amber-800 hover:bg-amber-100">
                      تسجيل الدخول
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* معلومات الاتصال */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  معلومات الاتصال
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">الاسم *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="أدخل اسمك"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">رقم الهاتف *</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      placeholder="01xxxxxxxxx"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">البريد الإلكتروني (اختياري)</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              {/* روابط المنتجات */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <LinkIcon className="w-6 h-6 text-purple-600" />
                  روابط المنتجات من شي إن
                </h3>
                <p className="text-sm text-gray-600">
                  أضف روابط المنتجات من موقع SHEIN (يمكنك إضافة أكثر من 5 روابط)
                </p>

                <div className="space-y-3">
                  {formData.productLinks.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={link}
                        onChange={(e) => handleLinkChange(index, e.target.value)}
                        placeholder={`رابط المنتج ${index + 1}`}
                        className="flex-1"
                      />
                      {formData.productLinks.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveLink(index)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddLink}
                  className="w-full border-dashed border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50"
                >
                  + إضافة رابط آخر
                </Button>
              </div>

              {/* رفع الصور */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-pink-600" />
                  أو صور المنتجات
                </h3>
                <p className="text-sm text-gray-600">
                  يمكنك تصوير المنتجات المطلوبة ورفعها مباشرة
                </p>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 transition-colors">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">اضغط لرفع الصور أو اسحبها هنا</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button type="button" asChild>
                      <span>اختر الصور</span>
                    </Button>
                  </label>
                </div>

                {formData.productImages.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {formData.productImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = formData.productImages.filter((_, i) => i !== index);
                            setFormData({ ...formData, productImages: newImages });
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ملاحظات */}
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أي ملاحظات أو تفاصيل إضافية (المقاس، اللون، إلخ...)"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || status !== 'authenticated'}
                className="w-full text-lg py-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 ml-2" />
                    إرسال الطلب
                  </>
                )}
              </Button>

              {status !== 'authenticated' && (
                <p className="text-center text-sm text-gray-600">
                  يجب <Link href="/auth/login?callbackUrl=/shein" className="text-purple-600 font-bold hover:underline">تسجيل الدخول</Link> لإرسال الطلب
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* How it works */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardTitle className="text-2xl flex items-center gap-2">
                <span className="text-3xl">📚</span>
                كيف تعمل الخدمة؟
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ol className="space-y-4 text-gray-700">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">1</span>
                  <div>
                    <h4 className="font-bold mb-1">اختر المنتجات</h4>
                    <p>تصفح موقع SHEIN واختر المنتجات المطلوبة، انسخ الروابط أو صور المنتجات</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">2</span>
                  <div>
                    <h4 className="font-bold mb-1">أرسل الطلب</h4>
                    <p>املأ النموذج بمعلوماتك واضف روابط أو صور المنتجات مع أي ملاحظات</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">3</span>
                  <div>
                    <h4 className="font-bold mb-1">انتظر التواصل</h4>
                    <p>سنراجع طلبك ونتواصل معك خلال 24 ساعة لتأكيد الطلب وتحديد التكلفة</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">4</span>
                  <div>
                    <h4 className="font-bold mb-1">ادفع المقدم</h4>
                    <p>بعد الاتفاق على السعر، ادفع 50% من المبلغ كمقدم</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold">5</span>
                  <div>
                    <h4 className="font-bold mb-1">استلم منتجاتك</h4>
                    <p>سنطلب المنتجات ونوصلها لك، وتدفع 50% المتبقية عند الاستلام</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
