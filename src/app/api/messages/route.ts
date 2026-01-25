import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - جلب المحادثات
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const withUserId = searchParams.get('with');
    
    let messages;
    
    if (session.user.role === 'ADMIN') {
      // الإدارة: جلب جميع المحادثات أو محادثة محددة
      if (withUserId) {
        messages = await prisma.message.findMany({
          where: {
            OR: [
              { senderId: session.user.id, receiverId: withUserId },
              { senderId: withUserId, receiverId: session.user.id }
            ]
          },
          include: {
            sender: {
              select: { id: true, name: true, email: true, image: true }
            },
            receiver: {
              select: { id: true, name: true, email: true, image: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        });
      } else {
        // جلب جميع المحادثات مع آخر رسالة لكل عميل
        const allMessages = await prisma.message.findMany({
          where: {
            OR: [
              { senderId: session.user.id },
              { receiverId: session.user.id }
            ]
          },
          include: {
            sender: {
              select: { id: true, name: true, email: true, image: true, role: true }
            },
            receiver: {
              select: { id: true, name: true, email: true, image: true, role: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
        
        // تجميع المحادثات حسب المستخدم
        const conversations = new Map();
        
        allMessages.forEach(msg => {
          const otherUser = msg.senderId === session.user.id ? msg.receiver : msg.sender;
          if (!otherUser || otherUser.role === 'ADMIN') return;
          
          if (!conversations.has(otherUser.id)) {
            conversations.set(otherUser.id, {
              user: otherUser,
              lastMessage: msg,
              unreadCount: 0
            });
          }
          
          // عد الرسائل غير المقروءة
          if (!msg.isRead && msg.receiverId === session.user.id) {
            conversations.get(otherUser.id).unreadCount++;
          }
        });
        
        return NextResponse.json(Array.from(conversations.values()));
      }
    } else {
      // العميل: جلب محادثاته مع الإدارة فقط
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true }
      });
      
      if (!adminUser) {
        return NextResponse.json([]);
      }
      
      messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id, receiverId: adminUser.id },
            { senderId: adminUser.id, receiverId: session.user.id }
          ]
        },
        include: {
          sender: {
            select: { id: true, name: true, email: true, image: true }
          },
          receiver: {
            select: { id: true, name: true, email: true, image: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      });
    }
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'فشل جلب المحادثات' }, { status: 500 });
  }
}

// POST - إرسال رسالة جديدة
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { content, receiverId, orderId, attachmentUrl } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'الرسالة فارغة' }, { status: 400 });
    }

    // التحقق من المستلم
    let finalReceiverId = receiverId;
    
    if (session.user.role !== 'ADMIN' && !receiverId) {
      // إذا كان العميل يرسل بدون تحديد مستلم، نرسل للإدارة
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true }
      });
      
      if (!adminUser) {
        return NextResponse.json({ error: 'لم يتم العثور على الإدارة' }, { status: 404 });
      }
      
      finalReceiverId = adminUser.id;
    }

    if (!finalReceiverId) {
      return NextResponse.json({ error: 'يجب تحديد المستلم' }, { status: 400 });
    }

    // إنشاء الرسالة
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: session.user.id,
        receiverId: finalReceiverId,
        isAdminMessage: session.user.role === 'ADMIN',
        orderId: orderId || null,
        attachmentUrl: attachmentUrl || null
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, image: true }
        },
        receiver: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'فشل إرسال الرسالة' }, { status: 500 });
  }
}

// PATCH - تحديث حالة القراءة
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { messageIds } = await req.json();

    if (!messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json({ error: 'معرفات رسائل غير صحيحة' }, { status: 400 });
    }

    // تحديث حالة القراءة للرسائل المستلمة فقط
    await prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        receiverId: session.user.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ error: 'فشل تحديث حالة القراءة' }, { status: 500 });
  }
}
