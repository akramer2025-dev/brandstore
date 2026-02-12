// API endpoint لتسجيل device tokens للإشعارات
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    const body = await request.json()
    const { token, platform, deviceInfo } = body

    if (!token || !platform) {
      return NextResponse.json(
        { error: 'Token and platform are required' },
        { status: 400 }
      )
    }

    // البحث عن token موجود
    const existingToken = await prisma.fCMDeviceToken.findUnique({
      where: { token }
    });

    if (existingToken) {
      // تحديث lastUsedAt وربطه بالمستخدم لو مسجل دخول
      await prisma.fCMDeviceToken.update({
        where: { token },
        data: {
          userId: session?.user?.id || existingToken.userId,
          lastUsedAt: new Date(),
          isActive: true,
          deviceInfo: deviceInfo || existingToken.deviceInfo
        }
      });

      console.log('✅ تم تحديث device token:', {
        userId: session?.user?.id || 'guest',
        platform,
        tokenPreview: token.substring(0, 20) + '...'
      });

      return NextResponse.json({ 
        success: true,
        message: 'Token updated successfully' 
      });
    }

    // إنشاء token جديد
    await prisma.fCMDeviceToken.create({
      data: {
        token,
        platform,
        deviceInfo,
        userId: session?.user?.id || null,
        isActive: true
      }
    });

    console.log('✅ تم تسجيل device token جديد:', {
      userId: session?.user?.id || 'guest',
      platform,
      tokenPreview: token.substring(0, 20) + '...'
    });

    return NextResponse.json({ 
      success: true,
      message: 'Token registered successfully' 
    });

  } catch (error) {
    console.error('❌ خطأ في تسجيل الجهاز:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - الحصول على جميع tokens للمستخدم الحالي
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const tokens = await prisma.fCMDeviceToken.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      orderBy: {
        lastUsedAt: 'desc'
      }
    });

    return NextResponse.json({ tokens });

  } catch (error) {
    console.error('❌ خطأ في جلب device tokens:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
