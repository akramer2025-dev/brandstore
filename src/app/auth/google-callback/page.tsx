"use client"

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function GoogleCallbackPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (status === 'unauthenticated') {
      console.log('❌ No session found, redirecting to login')
      router.push('/auth/login')
      return
    }

    if (session?.user) {
      const role = session.user.role
      console.log('✅ Google Sign-in successful! User role:', role)

      // التوجيه حسب الـrole
      if (role === 'ADMIN') {
        console.log('🔐 Redirecting to admin dashboard')
        router.push('/admin')
      } else if (role === 'VENDOR') {
        console.log('🏪 Redirecting to vendor dashboard')
        router.push('/vendor/dashboard')
      } else if (role === 'MANUFACTURER') {
        console.log('🏭 Redirecting to manufacturer dashboard')
        router.push('/manufacturer/dashboard')
      } else if (role === 'DELIVERY_STAFF') {
        console.log('🚚 Redirecting to delivery dashboard')
        router.push('/delivery-dashboard')
      } else {
        console.log('🏠 Redirecting to home page (Customer/Default)')
        router.push('/')
      }
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/30">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">جاري تسجيل الدخول...</h2>
          <p className="text-white/80">يرجى الانتظار قليلاً</p>
        </div>
      </div>
    </div>
  )
}
