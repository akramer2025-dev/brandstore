import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - جلب جميع المزادات النشطة
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ACTIVE';
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (featured) {
      where.featured = true;
    }

    const [auctions, total] = await Promise.all([
      prisma.auction.findMany({
        where,
        take: limit,
        skip,
        orderBy: [
          { featured: 'desc' },
          { endDate: 'asc' }
        ],
        include: {
          product: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              images: true,
              categoryId: true
            }
          },
          winner: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              bids: true
            }
          }
        }
      }),
      prisma.auction.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      auctions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المزادات' },
      { status: 500 }
    );
  }
}
