// API endpoint لتسجيل device tokens للإشعارات
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    // يمكن حفظ الـ token حتى للمستخدمين غير المسجلين
    const body = await request.json()
    const { token, platform, deviceInfo } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Device token is required' },
        { status: 400 }
      )
    }

    // حفظ أو تحديث الـ token
    // ملاحظة: تحتاج لإنشاء جدول DeviceToken في schema.prisma
    
    // بشكل مؤقت، يمكنك حفظه في السجلات فقط
    console.log('📱 تسجيل جهاز جديد:', {
      userId: session?.user?.id || 'guest',
      token,
      platform,
      deviceInfo,
      timestamp: new Date().toISOString()
    })

    // TODO: حفظ في قاعدة البيانات
    // await prisma.deviceToken.upsert({
    //   where: { token },
    //   update: {
    //     userId: session?.user?.id,
    //     platform,
    //     deviceInfo,
    //     updatedAt: new Date()
    //   },
    //   create: {
    //     token,
    //     userId: session?.user?.id,
    //     platform,
    //     deviceInfo
    //   }
    // })

    return NextResponse.json({
      success: true,
      message: 'Device registered successfully',
      data: {
        token: token.substring(0, 20) + '...',
        registered: true
      }
    })

  } catch (error) {
    console.error('❌ خطأ في تسجيل الجهاز:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
