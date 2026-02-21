'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Plus, X, Save, Download, Target, AlertTriangle, TrendingUp, Shield } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SWOTItem {
  id: string
  text: string
}

interface SWOTData {
  strengths: SWOTItem[]
  weaknesses: SWOTItem[]
  opportunities: SWOTItem[]
  threats: SWOTItem[]
}

export default function SWOTAnalysisPage() {
  const [title, setTitle] = useState('')
  const [swotData, setSWOTData] = useState<SWOTData>({
    strengths: [{ id: '1', text: '' }],
    weaknesses: [{ id: '2', text: '' }],
    opportunities: [{ id: '3', text: '' }],
    threats: [{ id: '4', text: '' }]
  })
  const [strategies, setStrategies] = useState('')
  const [loading, setLoading] = useState(false)

  const addItem = (category: keyof SWOTData) => {
    setSWOTData(prev => ({
      ...prev,
      [category]: [...prev[category], { id: Date.now().toString(), text: '' }]
    }))
  }

  const removeItem = (category: keyof SWOTData, id: string) => {
    setSWOTData(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== id)
    }))
  }

  const updateItem = (category: keyof SWOTData, id: string, text: string) => {
    setSWOTData(prev => ({
      ...prev,
      [category]: prev[category].map(item =>
        item.id === id ? { ...item, text } : item
      )
    }))
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('الرجاء إدخال عنوان التحليل')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/marketing-staff/tools/swot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          strengths: swotData.strengths.filter(s => s.text.trim()).map(s => s.text),
          weaknesses: swotData.weaknesses.filter(w => w.text.trim()).map(w => w.text),
          opportunities: swotData.opportunities.filter(o => o.text.trim()).map(o => o.text),
          threats: swotData.threats.filter(t => t.text.trim()).map(t => t.text),
          strategies: strategies.trim()
        })
      })

      if (response.ok) {
        toast.success('تم حفظ التحليل بنجاح ✅')
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
تحليل SWOT - ${title}
=====================================

📌 نقاط القوة (Strengths):
${swotData.strengths.filter(s => s.text.trim()).map((s, i) => `${i + 1}. ${s.text}`).join('\n')}

⚠️ نقاط الضعف (Weaknesses):
${swotData.weaknesses.filter(w => w.text.trim()).map((w, i) => `${i + 1}. ${w.text}`).join('\n')}

🚀 الفرص (Opportunities):
${swotData.opportunities.filter(o => o.text.trim()).map((o, i) => `${i + 1}. ${o.text}`).join('\n')}

🛡️ التهديدات (Threats):
${swotData.threats.filter(t => t.text.trim()).map((t, i) => `${i + 1}. ${t.text}`).join('\n')}

💡 الاستراتيجيات المقترحة:
${strategies || 'لم يتم إضافة استراتيجيات'}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SWOT-${title || 'تحليل'}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('تم تحميل التحليل! 📥')
  }

  const renderQuadrant = (
    title: string,
    category: keyof SWOTData,
    icon: any,
    color: string,
    bgColor: string
  ) => (
    <Card className={`${bgColor} border-2 ${color}`}>
      <CardHeader className="border-b border-white/10">
        <CardTitle className="text-white flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {swotData[category].map((item, index) => (
          <div key={item.id} className="flex gap-2">
            <Input
              value={item.text}
              onChange={(e) => updateItem(category, item.id, e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder={`${title} رقم ${index + 1}`}
            />
            {swotData[category].length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(category, item.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addItem(category)}
          className="w-full border-white/20 text-white hover:bg-white/10"
        >
          <Plus className="h-4 w-4 mr-2" />
          إضافة نقطة
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Target className="h-7 w-7 text-white" />
            </div>
            تحليل SWOT
          </h1>
          <p className="text-gray-300">
            أداة احترافية لتحليل نقاط القوة والضعف والفرص والتهديدات
          </p>
        </div>

        <div className="space-y-6">
          {/* Title Input */}
          <Card className="bg-white/5 backdrop-blur-sm border-blue-500/30">
            <CardContent className="pt-6">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12 text-lg"
                placeholder="عنوان التحليل (مثال: تحليل SWOT لمنتج XYZ)"
              />
            </CardContent>
          </Card>

          {/* SWOT Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderQuadrant(
              'نقاط القوة (Strengths)',
              'strengths',
              <Shield className="h-5 w-5 text-green-400" />,
              'border-green-500/50',
              'bg-green-900/20'
            )}
            {renderQuadrant(
              'نقاط الضعف (Weaknesses)',
              'weaknesses',
              <AlertTriangle className="h-5 w-5 text-yellow-400" />,
              'border-yellow-500/50',
              'bg-yellow-900/20'
            )}
            {renderQuadrant(
              'الفرص (Opportunities)',
              'opportunities',
              <TrendingUp className="h-5 w-5 text-blue-400" />,
              'border-blue-500/50',
              'bg-blue-900/20'
            )}
            {renderQuadrant(
              'التهديدات (Threats)',
              'threats',
              <AlertTriangle className="h-5 w-5 text-red-400" />,
              'border-red-500/50',
              'bg-red-900/20'
            )}
          </div>

          {/* Strategies Section */}
          <Card className="bg-purple-900/20 border-2 border-purple-500/50">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white flex items-center gap-2">
                💡 الاستراتيجيات المقترحة
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Textarea
                value={strategies}
                onChange={(e) => setStrategies(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[150px]"
                placeholder="بناءً على تحليل SWOT، اكتب الاستراتيجيات التسويقية المقترحة..."
                rows={6}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white h-12 text-lg font-semibold"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? 'جاري الحفظ...' : 'حفظ التحليل'}
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
