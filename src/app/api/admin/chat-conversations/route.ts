import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('id')

    // جلب رسائل محادثة معينة
    if (conversationId) {
      const messages = await prisma.chatMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
      })
      return NextResponse.json(messages)
    }

    // جلب كل المحادثات مع آخر رسالة وعدد الرسائل
    const conversations = await prisma.chatConversation.findMany({
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
      take: 100,
    })

    const formatted = conversations.map(c => ({
      id: c.id,
      sessionId: c.sessionId,
      source: c.source,
      isResolved: c.isResolved,
      lastMessage: c.messages[0]?.content || '',
      lastMessageRole: c.messages[0]?.role || '',
      messageCount: c._count.messages,
      lastMessageAt: c.lastMessageAt,
      createdAt: c.createdAt,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching chat conversations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// حذف محادثة
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('id')

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 })
    }

    await prisma.chatConversation.delete({
      where: { id: conversationId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
