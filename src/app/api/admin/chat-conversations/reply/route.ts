import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { conversationId, content } = body

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: 'Conversation ID and content are required' },
        { status: 400 }
      )
    }

    // التأكد من وجود المحادثة
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // إضافة رسالة الأدمن
    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        role: 'admin',
        content,
      },
    })

    // تحديث وقت آخر رسالة
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        isResolved: false, // إعادة فتح المحادثة عند الرد
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error sending admin reply:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
