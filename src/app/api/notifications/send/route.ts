// API لإرسال Push Notifications عبر FCM
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { messaging } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // فقط ADMIN يقدر يبعت notifications
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { 
      title, 
      body: messageBody, 
      userIds,    // array of user IDs (optional)
      sendToAll,  // إرسال لكل المستخدمين
      data,       // بيانات إضافية (orderId, productId, etc.)
      image,
      icon
    } = body;

    if (!title || !messageBody) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // جلب الـ tokens
    let tokens: string[] = [];

    if (sendToAll) {
      // كل الأجهزة النشطة
      const devices = await prisma.fCMDeviceToken.findMany({
        where: { isActive: true },
        select: { token: true }
      });
      tokens = devices.map(d => d.token);
    } else if (userIds && userIds.length > 0) {
      // أجهزة مستخدمين محددين
      const devices = await prisma.fCMDeviceToken.findMany({
        where: {
          userId: { in: userIds },
          isActive: true
        },
        select: { token: true }
      });
      tokens = devices.map(d => d.token);
    } else {
      return NextResponse.json(
        { error: 'Provide either userIds or set sendToAll to true' },
        { status: 400 }
      );
    }

    if (tokens.length === 0) {
      return NextResponse.json(
        { error: 'No active device tokens found' },
        { status: 404 }
      );
    }

    // إرسال الإشعارات باستخدام FCM
    const message = {
      notification: {
        title,
        body: messageBody,
        ...(image && { imageUrl: image }),
      },
      data: data || {},
      tokens: tokens.slice(0, 500) // FCM يدعم حد أقصى 500 token في المرة
    };

    const response = await messaging.sendEachForMulticast(message);

    // حفظ سجل الإشعار
    await prisma.pushNotification.create({
      data: {
        title,
        body: messageBody,
        image,
        icon,
        data: data || {},
        sentBy: session.user.id,
        sentToAll: sendToAll || false,
        recipientCount: tokens.length,
        successCount: response.successCount,
        failedCount: response.failureCount
      }
    });

    // تعطيل الـ tokens اللي فشلت
    if (response.failureCount > 0) {
      const failedTokens = response.responses
        .map((r, idx) => (r.success ? null : tokens[idx]))
        .filter(Boolean) as string[];

      if (failedTokens.length > 0) {
        await prisma.fCMDeviceToken.updateMany({
          where: { token: { in: failedTokens } },
          data: { isActive: false }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent to ${response.successCount} devices`,
      details: {
        total: tokens.length,
        success: response.successCount,
        failed: response.failureCount
      }
    });

  } catch (error: any) {
    console.error('❌ خطأ في إرسال notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - جلب آخر الإشعارات المرسلة
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const notifications = await prisma.pushNotification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        body: true,
        recipientCount: true,
        successCount: true,
        failedCount: true,
        createdAt: true,
        sentToAll: true
      }
    });

    return NextResponse.json({ notifications });

  } catch (error) {
    console.error('❌ خطأ في جلب notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
