'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BackButtonProps {
  label?: string
  className?: string
  fallbackUrl?: string
  showHomeButton?: boolean
}

export function BackButton({ 
  label = 'رجوع', 
  className = '',
  fallbackUrl,
  showHomeButton = false
}: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else if (fallbackUrl) {
      router.push(fallbackUrl)
    } else {
      router.push('/')
    }
  }

  const handleHome = () => {
    router.push('/')
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={handleBack}
        variant="outline"
        size="sm"
        className="flex items-center gap-1.5 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-purple-600 hover:border-purple-400 transition-all duration-200 shadow-sm hover:shadow-md rounded-lg"
      >
        <ArrowRight className="w-4 h-4" />
        <span className="text-xs sm:text-sm font-medium">{label}</span>
      </Button>

      {showHomeButton && (
        <Button
          onClick={handleHome}
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-purple-600 hover:border-purple-400 transition-all duration-200 shadow-sm hover:shadow-md rounded-lg"
        >
          <Home className="w-4 h-4" />
          <span className="text-xs sm:text-sm font-medium hidden sm:inline">الرئيسية</span>
        </Button>
      )}
    </div>
  )
}
