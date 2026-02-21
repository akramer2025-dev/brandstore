'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Save, Download, Target, DollarSign, Users, Megaphone } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface CampaignData {
  title: string
  // 4Ps
  product: string
  price: string
  place: string
  promotion: string
  // 4Cs
  customer: string
  cost: string
  convenience: string
  communication: string
  // USP & Targeting
  usp: string
  targetAudience: string
  budget: string
  duration: string
  goals: string
}

export default function CampaignPlannerPage() {
  const [formData, setFormData] = useState<CampaignData>({
    title: '',
    product: '',
    price: '',
    place: '',
    promotion: '',
    customer: '',
    cost: '',
    convenience: '',
    communication: '',
    usp: '',
    targetAudience: '',
    budget: '',
    duration: '',
    goals: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (field: keyof CampaignData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('الرجاء إدخال عنوان الحملة')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/marketing-staff/tools/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('تم حفظ خطة الحملة بنجاح ✅')
      } else {
        toast.error('فشل في الحفظ')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const content = `
خطة الحملة التسويقية - ${formData.title}
=====================================

🎯 معلومات الحملة:
- العنوان: ${formData.title}
- الميزانية: ${formData.budget || 'غير محدد'}
- المدة: ${formData.duration || 'غير محدد'}

📊 الأهداف:
${formData.goals || 'لم يتم تحديد أهداف'}

💎 عرض القيمة الفريد (USP):
${formData.usp || 'غير محدد'}

👥 الجمهور المستهدف:
${formData.targetAudience || 'غير محدد'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔷 المزيج التسويقي (4Ps):

📦 المنتج (Product):
${formData.product || 'لم يتم تحديده'}

💰 السعر (Price):
${formData.price || 'لم يتم تحديده'}

📍 المكان (Place):
${formData.place || 'لم يتم تحديده'}

📢 الترويج (Promotion):
${formData.promotion || 'لم يتم تحديده'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔶 المزيج التسويقي من منظور العميل (4Cs):

👤 العميل (Customer):
${formData.customer || 'لم يتم تحديده'}

💵 التكلفة (Cost):
${formData.cost || 'لم يتم تحديده'}

🚚 الراحة (Convenience):
${formData.convenience || 'لم يتم تحديده'}

💬 التواصل (Communication):
${formData.communication || 'لم يتم تحديده'}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Campaign-${formData.title || 'خطة'}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('تم تحميل الخطة! 📥')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Megaphone className="h-7 w-7 text-white" />
            </div>
            مخطط الحملات التسويقية
          </h1>
          <p className="text-gray-300">
            أداة شاملة لتخطيط الحملات باستخدام 4Ps و 4Cs
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="bg-white/5 backdrop-blur-sm border-purple-500/30">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white flex items-center gap-2">
                📋 معلومات أساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label className="text-white mb-2 block">عنوان الحملة *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="مثال: حملة إطلاق منتج XYZ"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white mb-2 block">الميزانية</Label>
                  <Input
                    value={formData.budget}
                    onChange={(e) => handleChange('budget', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="مثال: 50,000 جنيه"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2 block">المدة الزمنية</Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="مثال: شهر واحد"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2 block">💎 USP</Label>
                  <Input
                    value={formData.usp}
                    onChange={(e) => handleChange('usp', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="ما يميز منتجك؟"
                  />
                </div>
              </div>
              <div>
                <Label className="text-white mb-2 block">الأهداف</Label>
                <Textarea
                  value={formData.goals}
                  onChange={(e) => handleChange('goals', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="أهداف الحملة (مثال: زيادة المبيعات 20%، الوصول لـ 10,000 عميل جديد...)"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-white mb-2 block">الجمهور المستهدف</Label>
                <Textarea
                  value={formData.targetAudience}
                  onChange={(e) => handleChange('targetAudience', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="وصف الجمهور المستهدف (العمر، الاهتمامات، السلوك الشرائي...)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* 4Ps Marketing Mix */}
          <Card className="bg-blue-900/20 border-2 border-blue-500/50">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white flex items-center gap-2">
                🔷 المزيج التسويقي (4Ps)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label className="text-white mb-2 block flex items-center gap-2">
                  📦 المنتج (Product)
                </Label>
                <Textarea
                  value={formData.product}
                  onChange={(e) => handleChange('product', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="وصف المنتج/الخدمة، الميزات، الفوائد..."
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-white mb-2 block flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> السعر (Price)
                </Label>
                <Textarea
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="استراتيجية التسعير، الخصومات، العروض..."
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-white mb-2 block flex items-center gap-2">
                  📍 المكان (Place)
                </Label>
                <Textarea
                  value={formData.place}
                  onChange={(e) => handleChange('place', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="قنوات التوزيع (متجر إلكتروني، محلات، موزعين...)"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-white mb-2 block flex items-center gap-2">
                  📢 الترويج (Promotion)
                </Label>
                <Textarea
                  value={formData.promotion}
                  onChange={(e) => handleChange('promotion', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="الإعلانات، السوشيال ميديا، الحملات الترويجية..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* 4Cs Customer-Centric */}
          <Card className="bg-purple-900/20 border-2 border-purple-500/50">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white flex items-center gap-2">
                🔶 المزيج التسويقي من منظور العميل (4Cs)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label className="text-white mb-2 block flex items-center gap-2">
                  <Users className="h-4 w-4" /> العميل (Customer Value)
                </Label>
                <Textarea
                  value={formData.customer}
                  onChange={(e) => handleChange('customer', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="ما القيمة التي يحصل عليها العميل؟ كيف نحل مشاكله؟"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-white mb-2 block flex items-center gap-2">
                  💵 التكلفة (Cost to Customer)
                </Label>
                <Textarea
                  value={formData.cost}
                  onChange={(e) => handleChange('cost', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="التكلفة الكلية على العميل (سعر + توصيل + وقت + جهد...)"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-white mb-2 block flex items-center gap-2">
                  🚚 الراحة (Convenience)
                </Label>
                <Textarea
                  value={formData.convenience}
                  onChange={(e) => handleChange('convenience', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="مدى سهولة الوصول للمنتج والشراء..."
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-white mb-2 block flex items-center gap-2">
                  💬 التواصل (Communication)
                </Label>
                <Textarea
                  value={formData.communication}
                  onChange={(e) => handleChange('communication', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="كيف نتواصل مع العملاء؟ القنوات، اللغة، الأسلوب..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12 text-lg font-semibold"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? 'جاري الحفظ...' : 'حفظ الخطة'}
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="border-2 border-white/20 text-white hover:bg-white/10 h-12 px-6"
            >
              <Download className="h-5 w-5 mr-2" />
              تحميل
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
