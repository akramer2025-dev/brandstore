'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { BackButton } from '@/components/BackButton'
import {
  Sparkles,
  Facebook,
  Instagram,
  Twitter,
  MessageCircle,
  Share2,
  Copy,
  Download,
  Megaphone,
  Target,
  TrendingUp,
  Users,
  Heart,
  Send,
  CheckCircle2,
  Globe,
  Package,
} from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  images: any[]
}

export default function ProductMarketingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const productId = resolvedParams.id
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState(false)
  const [aiContent, setAiContent] = useState<{
    general: string
    facebook: string
    instagram: string
    twitter: string
    whatsapp: string
  } | null>(null)
  const [generatingContent, setGeneratingContent] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/vendor/products/${productId}`)
      if (response.ok) {
        const data = await response.json()
        const productData = data.product || data
        setProduct(productData)
        // توليد المحتوى التسويقي بالذكاء الاصطناعي مباشرة
        generateAIContent(productData.id)
      } else {
        toast.error('فشل في تحميل بيانات المنتج')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('حدث خطأ أثناء تحميل المنتج')
    } finally {
      setLoading(false)
    }
  }

  const generateAIContent = async (productId: string) => {
    setGeneratingContent(true)
    try {
      const response = await fetch('/api/marketing/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.content) {
          setAiContent(data.content)
          toast.success('🤖 تم توليد المحتوى بالذكاء الاصطناعي!')
        }
      } else {
        console.error('Failed to generate AI content')
        toast.error('فشل توليد المحتوى، استخدام القالب الافتراضي')
      }
    } catch (error) {
      console.error('AI Content Error:', error)
    } finally {
      setGeneratingContent(false)
    }
  }

  const productUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/products/${productId}`

  const copyLink = () => {
    navigator.clipboard.writeText(productUrl)
    setCopiedLink(true)
    toast.success('تم نسخ الرابط!')
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareToTwitter = () => {
    const text = `${product?.name} - ${product?.description?.substring(0, 100) || ''}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(productUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareToWhatsApp = () => {
    const text = `شاهد هذا المنتج الرائع: ${product?.name}\n${productUrl}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const shareGeneral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description || '',
          url: productUrl,
        })
        toast.success('تم المشاركة بنجاح!')
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      copyLink()
    }
  }

  const downloadImage = () => {
    const imageUrl = product?.images?.[0]?.url
    if (!imageUrl) {
      toast.error('لا توجد صورة للمنتج')
      return
    }
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${product?.name || 'product'}.jpg`
    link.click()
    toast.success('جاري تحميل الصورة...')
  }

  const MARKETING_IDEAS = [
    {
      icon: Facebook,
      title: 'انشر على Facebook',
      description: 'شارك المنتج مع أصدقائك وعملائك على فيسبوك',
      color: 'blue',
      action: shareToFacebook,
    },
    {
      icon: MessageCircle,
      title: 'شارك على WhatsApp',
      description: 'أرسل رابط المنتج عبر واتساب للعملاء المحتملين',
      color: 'green',
      action: shareToWhatsApp,
    },
    {
      icon: Twitter,
      title: 'غرد على Twitter',
      description: 'انشر تغريدة عن المنتج للوصول لجمهور أوسع',
      color: 'cyan',
      action: shareToTwitter,
    },
    {
      icon: Instagram,
      title: 'قصة Instagram',
      description: 'حمّل الصورة وانشرها كقصة على انستجرام',
      color: 'purple',
      action: downloadImage,
    },
  ]

  const MARKETING_TIPS = [
    {
      icon: Target,
      title: 'استهدف الجمهور المناسب',
      description: 'حدد من هم عملاؤك المثاليون واستهدفهم بالإعلانات',
    },
    {
      icon: TrendingUp,
      title: 'استخدم الهاشتاجات الشائعة',
      description: 'اربط منتجك بالترندات الحالية لزيادة الوصول',
    },
    {
      icon: Heart,
      title: 'تفاعل مع العملاء',
      description: 'رد على التعليقات والأسئلة بسرعة لبناء الثقة',
    },
    {
      icon: Megaphone,
      title: 'أنشئ عروضاً خاصة',
      description: 'قدم خصومات محدودة لتحفيز قرار الشراء السريع',
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">المنتج غير موجود</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <BackButton fallbackUrl="/vendor/products" />
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              تسويق المنتج
            </h1>
            <p className="text-gray-400 mt-1 text-sm sm:text-base">روّج لمنتجك واحصل على المزيد من المبيعات</p>
          </div>
        </div>

        {/* Social Media Post Text */}
        <Card className="bg-white/5 backdrop-blur-sm border-pink-500/30 mb-6">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-pink-400" />
              نص البوست التسويقي - بالذكاء الاصطناعي 🤖
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {generatingContent ? (
              <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-6 border border-blue-500/20">
                <div className="flex items-center justify-center gap-3 text-white py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <p className="text-lg">🤖 الذكاء الاصطناعي يكتب محتوى احترافي لك...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Post Text Box */}
                <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-6 border border-blue-500/20">
                  <div className="bg-white/10 rounded-xl p-5 border border-white/20 font-arabic" dir="rtl">
                    {aiContent?.facebook ? (
                      <div className="text-white text-base leading-relaxed whitespace-pre-wrap">
                        {aiContent.facebook}
                      </div>
                    ) : (
                      <>
                        <p className="text-white text-lg leading-relaxed mb-4">
                          ✨ <span className="font-bold text-yellow-300">عرض خاص!</span> ✨
                        </p>
                        <p className="text-white text-base leading-relaxed mb-3">
                          🎁 <span className="font-semibold text-pink-300">{product.name}</span>
                        </p>
                        <p className="text-gray-200 text-sm leading-relaxed mb-4">
                          {product.description || 'منتج رائع بجودة عالية'}
                        </p>
                        <p className="text-green-400 text-xl font-black mb-3">
                          💰 السعر: {product.price} جنيه فقط!
                        </p>
                        <p className="text-yellow-300 text-sm font-semibold mb-3">
                          🔥 العرض لفترة محدودة!
                        </p>
                        <p className="text-blue-300 text-sm mb-4">
                          📦 توصيل لجميع المحافظات
                        </p>
                        <p className="text-purple-300 text-sm mb-4">
                          💳 الدفع عند الاستلام
                        </p>
                        <p className="text-emerald-400 text-base font-bold mb-3">
                          🛒 اطلب الآن:
                        </p>
                        <div className="bg-white/20 rounded-lg px-4 py-3 border border-white/30">
                          <p className="text-white text-sm break-all select-all">{productUrl}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Copy Post Text Button */}
                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={() => {
                      const postText = aiContent?.facebook || `✨ عرض خاص! ✨

🎁 ${product.name}

${product.description || 'منتج رائع بجودة عالية'}

💰 السعر: ${product?.price} جنيه فقط!
🔥 العرض لفترة محدودة!

📦 توصيل لجميع المحافظات
💳 الدفع عند الاستلام

🛒 اطلب الآن:
${productUrl}`;
                      navigator.clipboard.writeText(postText);
                      toast.success('تم نسخ نص البوست بنجاح! 🎉');
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-12 text-base"
                  >
                    <Copy className="w-5 h-5 mr-2" />
                    نسخ نص البوست
                  </Button>
                  <Button
                    onClick={downloadImage}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 h-12 px-6"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    تحميل الصورة
                  </Button>
                </div>

                {/* Tips */}
                <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-300 text-sm font-semibold mb-2">
                    {aiContent ? '🤖 محتوى احترافي بالذكاء الاصطناعي!' : '💡 نصيحة تسويقية:'}
                  </p>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    {aiContent 
                      ? 'تم توليد هذا المحتوى بواسطة GPT-4 لضمان أعلى جودة تسويقية. انسخ النص والصقه في منشور على فيسبوك أو إنستقرام، وأضف صورة المنتج.'
                      : 'انسخ النص أعلاه والصقه في منشور على فيسبوك أو إنستقرام، وأضف صورة المنتج من جهازك أو حملها باستخدام الزر أعلاه.'
                    }
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Marketing Channels */}
        <Card className="bg-white/5 backdrop-blur-sm border-purple-500/30 mb-6">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-400" />
              قنوات التسويق
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MARKETING_IDEAS.map((idea) => {
                const Icon = idea.icon
                return (
                  <button
                    key={idea.title}
                    onClick={idea.action}
                    className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-right group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-full bg-${idea.color}-500/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 text-${idea.color}-400`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{idea.title}</h4>
                        <p className="text-gray-400 text-sm">{idea.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* General Share Button */}
            <div className="mt-6 flex gap-3">
              <Button
                onClick={shareGeneral}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-base"
              >
                <Send className="h-5 w-5 mr-2" />
                مشاركة عامة
              </Button>
              <Button
                onClick={downloadImage}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 h-12 px-6"
              >
                <Download className="h-5 w-5 mr-2" />
                تحميل الصورة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Marketing Tips */}
        <Card className="bg-white/5 backdrop-blur-sm border-green-500/30">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-green-400" />
              نصائح تسويقية
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MARKETING_TIPS.map((tip) => {
                const Icon = tip.icon
                return (
                  <div
                    key={tip.title}
                    className="p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">{tip.title}</h4>
                        <p className="text-gray-400 text-sm">{tip.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 h-12 px-8"
          >
            العودة للمنتجات
          </Button>
        </div>
      </div>
    </div>
  )
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
