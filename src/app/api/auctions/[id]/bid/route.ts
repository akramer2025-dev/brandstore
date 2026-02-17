import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - تقديم مزايدة جديدة
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول للمزايدة' },
        { status: 401 }
      );
    }

    const { amount, isAutoBid, maxAutoBidAmount } = await request.json();

    // التحقق من المزاد
    const auction = await prisma.auction.findUnique({
      where: { id: params.id },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
          take: 1
        }
      }
    });

    if (!auction) {
      return NextResponse.json(
        { error: 'المزاد غير موجود' },
        { status: 404 }
      );
    }

    // التحقق من حالة المزاد
    if (auction.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'المزاد غير نشط حالياً' },
        { status: 400 }
      );
    }

    // التحقق من انتهاء المزاد
    if (new Date() > auction.endDate) {
      return NextResponse.json(
        { error: 'انتهى وقت المزاد' },
        { status: 400 }
      );
    }

    // التحقق من المبلغ المطلوب
    const currentHighestBid = auction.bids[0]?.amount || auction.startingPrice;
    const minimumRequiredBid = currentHighestBid + auction.minimumBidIncrement;

    if (amount < minimumRequiredBid) {
      return NextResponse.json(
        { error: `الحد الأدنى للمزايدة هو ${minimumRequiredBid} جنيه` },
        { status: 400 }
      );
    }

    // إنشاء المزايدة
    const bid = await prisma.bid.create({
      data: {
        auctionId: params.id,
        bidderId: session.user.id!,
        amount,
        isAutoBid: isAutoBid || false,
        maxAutoBidAmount: maxAutoBidAmount || null,
        status: 'WINNING',
        isWinning: true,
        ip: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined
      }
    });

    // تحديث المزايدات السابقة
    await prisma.bid.updateMany({
      where: {
        auctionId: params.id,
        id: { not: bid.id },
        status: 'WINNING'
      },
      data: {
        status: 'OUTBID',
        isWinning: false
      }
    });

    // تحديث المزاد
    await prisma.auction.update({
      where: { id: params.id },
      data: {
        currentPrice: amount,
        bidCount: { increment: 1 }
      }
    });

    // تمديد المزاد إذا كانت المزايدة في آخر 5 دقائق
    if (auction.extendOnBid) {
      const now = new Date();
      const endDate = new Date(auction.endDate);
      const fiveMinutes = 5 * 60 * 1000;

      if (endDate.getTime() - now.getTime() < fiveMinutes) {
        await prisma.auction.update({
          where: { id: params.id },
          data: {
            endDate: new Date(now.getTime() + fiveMinutes)
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'تم تقديم المزايدة بنجاح',
      bid
    });
  } catch (error) {
    console.error('Error placing bid:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تقديم المزايدة' },
      { status: 500 }
    );
  }
}
