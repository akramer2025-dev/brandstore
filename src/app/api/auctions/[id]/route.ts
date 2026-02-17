import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - جلب تفاصيل مزاد واحد
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: params.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            description: true,
            descriptionAr: true,
            images: true,
            categoryId: true,
            category: {
              select: {
                name: true,
                nameAr: true
              }
            }
          }
        },
        winner: {
          select: {
            id: true,
            name: true
          }
        },
        bids: {
          take: 10,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            amount: true,
            createdAt: true,
            bidder: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            bids: true
          }
        }
      }
    });

    if (!auction) {
      return NextResponse.json(
        { error: 'المزاد غير موجود' },
        { status: 404 }
      );
    }

    // تحديث عدد المشاهدات
    await prisma.auction.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      auction
    });
  } catch (error) {
    console.error('Error fetching auction:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المزاد' },
      { status: 500 }
    );
  }
}
