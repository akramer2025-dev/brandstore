"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Volume2, VolumeX, Bell, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function TestSoundPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)

  const addResult = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
    setTestResults(prev => [...prev, `${emoji} ${message}`])
  }

  // Test 1: Web Audio API Support
  const testWebAudioSupport = () => {
    setTestResults([])
    addResult('بدء اختبار دعم Web Audio API...')
    
    if (typeof window !== 'undefined') {
      if (window.AudioContext || (window as any).webkitAudioContext) {
        addResult('Web Audio API مدعوم في المتصفح', 'success')
        return true
      } else {
        addResult('Web Audio API غير مدعوم في المتصفح', 'error')
        return false
      }
    }
    addResult('Window غير موجود', 'error')
    return false
  }

  // Test 2: Create Audio Context
  const testCreateAudioContext = () => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)()
      setAudioContext(context)
      addResult(`Audio Context تم إنشاؤه بنجاح (State: ${context.state})`, 'success')
      return context
    } catch (error: any) {
      addResult(`فشل إنشاء Audio Context: ${error.message}`, 'error')
      return null
    }
  }

  // Test 3: Play Simple Beep
  const playSimpleBeep = () => {
    try {
      const context = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)()
      setAudioContext(context)

      addResult('محاولة تشغيل صوت Beep بسيط...')

      const oscillator = context.createOscillator()
      const gainNode = context.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(context.destination)
      
      oscillator.frequency.value = 1200
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.5, context.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5)
      
      oscillator.start(context.currentTime)
      oscillator.stop(context.currentTime + 0.5)

      addResult('تم تشغيل صوت Beep واحد بنجاح', 'success')
      addResult('هل سمعت الصوت؟ إذا لم تسمعه، تحقق من مستوى الصوت', 'info')
    } catch (error: any) {
      addResult(`فشل تشغيل الصوت: ${error.message}`, 'error')
    }
  }

  // Test 4: Play Continuous Alert (like in vendor dashboard)
  const playContinuousAlert = () => {
    if (isPlaying) {
      stopContinuousAlert()
      return
    }

    try {
      const context = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)()
      setAudioContext(context)
      setIsPlaying(true)

      addResult('بدء تشغيل صوت إشعار مستمر (متكرر كل ثانية)...')

      let shouldContinue = true

      const playBeep = () => {
        if (!shouldContinue) return

        const oscillator = context.createOscillator()
        const gainNode = context.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(context.destination)
        
        oscillator.frequency.value = 1200
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.5, context.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5)
        
        oscillator.start(context.currentTime)
        oscillator.stop(context.currentTime + 0.5)
        
        setTimeout(() => playBeep(), 1000)
      }

      playBeep()

      // Save stop function
      ;(window as any).stopTestSound = () => {
        shouldContinue = false
        setIsPlaying(false)
        addResult('تم إيقاف الصوت المستمر', 'success')
      }

      addResult('الصوت المستمر يعمل الآن! اضغط زر "إيقاف" لإيقافه', 'success')
    } catch (error: any) {
      addResult(`فشل تشغيل الصوت المستمر: ${error.message}`, 'error')
      setIsPlaying(false)
    }
  }

  const stopContinuousAlert = () => {
    if ((window as any).stopTestSound) {
      ;(window as any).stopTestSound()
    } else {
      setIsPlaying(false)
      addResult('تم إيقاف الصوت', 'info')
    }
  }

  // Test 5: Test with User Interaction Required
  const testWithUserInteraction = async () => {
    addResult('اختبار بعد تفاعل المستخدم (User Interaction)...')
    
    try {
      const context = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)()
      
      if (context.state === 'suspended') {
        addResult('Audio Context في حالة suspended، محاولة استئنافه...', 'info')
        await context.resume()
        addResult(`Audio Context State بعد Resume: ${context.state}`, 'success')
      }
      
      setAudioContext(context)
      playSimpleBeep()
    } catch (error: any) {
      addResult(`فشل الاختبار: ${error.message}`, 'error')
    }
  }

  // Run All Tests
  const runAllTests = async () => {
    setTestResults([])
    addResult('========== بدء جميع الاختبارات ==========')
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Test 1
    const hasSupport = testWebAudioSupport()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (!hasSupport) {
      addResult('========== توقف الاختبارات: المتصفح لا يدعم Web Audio API ==========', 'error')
      return
    }
    
    // Test 2
    const context = testCreateAudioContext()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (!context) {
      addResult('========== توقف الاختبارات: فشل إنشاء Audio Context ==========', 'error')
      return
    }

    // Check state
    addResult(`حالة Audio Context: ${context.state}`)
    if (context.state === 'suspended') {
      addResult('ملاحظة: بعض المتصفحات تحتاج تفاعل مستخدم لبدء الصوت', 'info')
    }
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    addResult('========== انتهت جميع الاختبارات ==========')
    addResult('جرب الأزرار أدناه لاختبار الصوت', 'success')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Bell className="w-6 h-6 text-purple-600" />
              صفحة اختبار صوت الإشعارات
            </CardTitle>
            <CardDescription>
              هذه صفحة اختبار لفحص خاصية صوت الإشعارات الخاصة بالطلبات الجديدة
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Test Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>الاختبارات</CardTitle>
            <CardDescription>اضغط على الأزرار لاختبار الصوت</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={runAllTests} 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
              size="lg"
            >
              <AlertCircle className="w-5 h-5 mr-2" />
              تشغيل جميع الاختبارات التلقائية
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                onClick={testWithUserInteraction}
                variant="outline"
                className="w-full"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                اختبار صوت Beep واحد
              </Button>

              <Button 
                onClick={playContinuousAlert}
                variant={isPlaying ? "destructive" : "default"}
                className="w-full"
              >
                {isPlaying ? (
                  <>
                    <VolumeX className="w-4 h-4 mr-2" />
                    إيقاف الصوت المستمر
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    تشغيل صوت مستمر (متكرر)
                  </>
                )}
              </Button>
            </div>

            {isPlaying && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
                <p className="text-yellow-800 text-sm font-medium">
                  🔔 الصوت يعمل الآن! إذا لم تسمعه، تحقق من:
                </p>
                <ul className="text-yellow-700 text-sm mt-2 space-y-1 list-disc list-inside">
                  <li>مستوى صوت الجهاز</li>
                  <li>إعدادات صوت المتصفح</li>
                  <li>سماعات/مكبرات الصوت متصلة</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>نتائج الاختبارات</CardTitle>
            <CardDescription>سجل تفصيلي لجميع الاختبارات</CardDescription>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>لم يتم تشغيل أي اختبار بعد</p>
                <p className="text-sm">اضغط على "تشغيل جميع الاختبارات" للبدء</p>
              </div>
            ) : (
              <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm space-y-1 max-h-96 overflow-y-auto" dir="ltr">
                {testResults.map((result, index) => (
                  <div key={index} className="whitespace-pre-wrap">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">معلومات مهمة</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 space-y-2 text-sm">
            <p>• المتصفحات الحديثة تحتاج تفاعل المستخدم (نقرة) قبل تشغيل الصوت</p>
            <p>• إذا لم تسمع الصوت، تأكد من مستوى صوت الجهاز والمتصفح</p>
            <p>• بعض المتصفحات قد تمنع الأصوات التلقائية لأسباب أمنية</p>
            <p>• Audio Context قد يكون suspended حتى يحدث تفاعل من المستخدم</p>
            <p className="font-bold mt-4">🗑️ هذه صفحة اختبار فقط - سيتم حذفها بعد الاختبار</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
