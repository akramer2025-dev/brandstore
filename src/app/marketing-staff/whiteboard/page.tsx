"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Square,
  Circle,
  Type,
  Pencil,
  Eraser,
  Highlighter,
  Undo,
  Redo,
  Trash2,
  Save,
  Download,
  ArrowLeft,
  MousePointer,
  Minus,
  Triangle,
  Image as ImageIcon,
  Palette,
} from 'lucide-react'
import Link from 'next/link'

type Tool = 'select' | 'pen' | 'rectangle' | 'circle' | 'line' | 'triangle' | 'text' | 'highlighter' | 'eraser'

interface DrawingElement {
  type: Tool
  x: number
  y: number
  width?: number
  height?: number
  endX?: number
  endY?: number
  color: string
  strokeWidth: number
  text?: string
  points?: { x: number; y: number }[]
}

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [isDrawing, setIsDrawing] = useState(false)
  const [elements, setElements] = useState<DrawingElement[]>([])
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null)
  const [history, setHistory] = useState<DrawingElement[][]>([])
  const [historyStep, setHistoryStep] = useState(0)

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFFFFF'
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw all elements
    elements.forEach(element => {
      drawElement(ctx, element)
    })

    // Draw current element
    if (currentElement) {
      drawElement(ctx, currentElement)
    }
  }, [elements, currentElement])

  const drawElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    ctx.strokeStyle = element.color
    ctx.fillStyle = element.color
    ctx.lineWidth = element.strokeWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    switch (element.type) {
      case 'pen':
        if (element.points && element.points.length > 1) {
          ctx.beginPath()
          ctx.moveTo(element.points[0].x, element.points[0].y)
          element.points.forEach(point => {
            ctx.lineTo(point.x, point.y)
          })
          ctx.stroke()
        }
        break

      case 'rectangle':
        if (element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height)
        }
        break

      case 'circle':
        if (element.width && element.height) {
          const radiusX = Math.abs(element.width) / 2
          const radiusY = Math.abs(element.height) / 2
          const centerX = element.x + element.width / 2
          const centerY = element.y + element.height / 2
          ctx.beginPath()
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)
          ctx.stroke()
        }
        break

      case 'line':
        if (element.endX !== undefined && element.endY !== undefined) {
          ctx.beginPath()
          ctx.moveTo(element.x, element.y)
          ctx.lineTo(element.endX, element.endY)
          ctx.stroke()
        }
        break

      case 'triangle':
        if (element.endX !== undefined && element.endY !== undefined) {
          const midX = (element.x + element.endX) / 2
          ctx.beginPath()
          ctx.moveTo(midX, element.y)
          ctx.lineTo(element.endX, element.endY)
          ctx.lineTo(element.x, element.endY)
          ctx.closePath()
          ctx.stroke()
        }
        break

      case 'text':
        ctx.font = `${element.strokeWidth * 8}px Arial`
        ctx.fillText(element.text || '', element.x, element.y)
        break

      case 'highlighter':
        ctx.globalAlpha = 0.3
        if (element.points && element.points.length > 1) {
          ctx.lineWidth = element.strokeWidth * 3
          ctx.beginPath()
          ctx.moveTo(element.points[0].x, element.points[0].y)
          element.points.forEach(point => {
            ctx.lineTo(point.x, point.y)
          })
          ctx.stroke()
        }
        ctx.globalAlpha = 1
        break
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)

    if (tool === 'text') {
      const text = prompt('أدخل النص:')
      if (text) {
        const newElement: DrawingElement = {
          type: 'text',
          x,
          y,
          color,
          strokeWidth,
          text
        }
        setElements(prev => [...prev, newElement])
        saveToHistory([...elements, newElement])
      }
      return
    }

    const newElement: DrawingElement = {
      type: tool,
      x,
      y,
      color,
      strokeWidth,
      points: tool === 'pen' || tool === 'highlighter' ? [{ x, y }] : undefined
    }

    setCurrentElement(newElement)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentElement) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === 'pen' || tool === 'highlighter') {
      setCurrentElement({
        ...currentElement,
        points: [...(currentElement.points || []), { x, y }]
      })
    } else if (tool === 'rectangle' || tool === 'circle') {
      setCurrentElement({
        ...currentElement,
        width: x - currentElement.x,
        height: y - currentElement.y
      })
    } else if (tool === 'line' || tool === 'triangle') {
      setCurrentElement({
        ...currentElement,
        endX: x,
        endY: y
      })
    }
  }

  const stopDrawing = () => {
    if (currentElement && isDrawing) {
      const newElements = [...elements, currentElement]
      setElements(newElements)
      saveToHistory(newElements)
      setCurrentElement(null)
    }
    setIsDrawing(false)
  }

  const saveToHistory = (newElements: DrawingElement[]) => {
    const newHistory = history.slice(0, historyStep + 1)
    newHistory.push(newElements)
    setHistory(newHistory)
    setHistoryStep(newHistory.length - 1)
  }

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1)
      setElements(history[historyStep - 1] || [])
    }
  }

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1)
      setElements(history[historyStep + 1])
    }
  }

  const clearCanvas = () => {
    const newElements: DrawingElement[] = []
    setElements(newElements)
    saveToHistory(newElements)
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `whiteboard-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const tools = [
    { id: 'select' as Tool, icon: MousePointer, label: 'تحديد' },
    { id: 'pen' as Tool, icon: Pencil, label: 'قلم' },
    { id: 'rectangle' as Tool, icon: Square, label: 'مربع' },
    { id: 'circle' as Tool, icon: Circle, label: 'دائرة' },
    { id: 'line' as Tool, icon: Minus, label: 'خط' },
    { id: 'triangle' as Tool, icon: Triangle, label: 'مثلث' },
    { id: 'text' as Tool, icon: Type, label: 'نص' },
    { id: 'highlighter' as Tool, icon: Highlighter, label: 'تظليل' },
    { id: 'eraser' as Tool, icon: Eraser, label: 'ممحاة' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/marketing-staff/training"
            className="text-purple-300 hover:text-purple-200 mb-4 inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للتدريب
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">📝 السبورة التفاعلية</h1>
          <p className="text-purple-200">أدوات احترافية للشرح والتقديم</p>
        </div>

        {/* Toolbar */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Tools */}
              <div className="col-span-2 md:col-span-4 lg:col-span-3">
                <p className="text-white text-sm mb-2 font-semibold">🛠️ الأدوات</p>
                <div className="grid grid-cols-3 gap-2">
                  {tools.map(({ id, icon: Icon, label }) => (
                    <Button
                      key={id}
                      variant={tool === id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTool(id)}
                      className={`
                        ${tool === id 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500' 
                          : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="col-span-2 md:col-span-2 lg:col-span-2">
                <p className="text-white text-sm mb-2 font-semibold flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  الألوان
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`
                        w-10 h-10 rounded-lg border-2 transition-all
                        ${color === c ? 'border-white scale-110' : 'border-white/30 hover:scale-105'}
                      `}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Stroke Width */}
              <div className="col-span-2 md:col-span-2 lg:col-span-1">
                <p className="text-white text-sm mb-2 font-semibold">📏 السمك</p>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-white text-xs text-center mt-1">{strokeWidth}px</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={historyStep === 0}
                className="bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
              >
                <Undo className="h-4 w-4 mr-1" />
                تراجع
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={historyStep === history.length - 1}
                className="bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
              >
                <Redo className="h-4 w-4 mr-1" />
                إعادة
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCanvas}
                className="bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                مسح الكل
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadCanvas}
                className="bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20"
              >
                <Download className="h-4 w-4 mr-1" />
                تحميل
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Canvas */}
        <Card className="bg-white border-white/20 shadow-2xl">
          <CardContent className="p-0">
            <canvas
              ref={canvasRef}
              width={1200}
              height={700}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full cursor-crosshair rounded-lg"
              style={{ touchAction: 'none' }}
            />
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mt-4">
          <CardContent className="p-4">
            <h3 className="text-white font-semibold mb-2">💡 نصائح الاستخدام:</h3>
            <ul className="text-purple-200 text-sm space-y-1">
              <li>• استخدم القلم للرسم الحر</li>
              <li>• الأشكال الهندسية: اضغط واسحب لتحديد الحجم</li>
              <li>• التظليل: يعمل مثل القلم لكن بشفافية</li>
              <li>• النص: اضغط ثم أدخل النص المطلوب</li>
              <li>• يمكنك التراجع عن أي عملية باستخدام زر التراجع</li>
              <li>• احفظ عملك بتحميله كصورةPNG</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
