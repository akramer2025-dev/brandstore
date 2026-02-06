'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BackButtonProps {
  label?: string
  className?: string
  fallbackUrl?: string
}

export function BackButton({ 
  label = 'رجوع', 
  className = '',
  fallbackUrl 
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

  return (
    <Button
      onClick={handleBack}
      variant="outline"
      size="sm"
      className={`flex items-center gap-1 bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700 hover:text-white ${className}`}
    >
      <ArrowRight className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  )
}
