import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
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

// POST - إنشاء مزاد جديد (Admin أو Vendor)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'VENDOR')) {
      return NextResponse.json(
        { error: 'غير مصرح لك بهذا الإجراء' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      productId,
      title,
      titleAr,
      description,
      descriptionAr,
      startingPrice,
      minimumBidIncrement,
      reservePrice,
      buyNowPrice,
      startDate,
      endDate,
      featured,
      extendOnBid,
      termsAndConditions,
      images
    } = body;

    // Validation
    if (!productId) {
      return NextResponse.json(
        { error: 'يجب تحديد المنتج' },
        { status: 400 }
      );
    }

    if (!titleAr && !title) {
      return NextResponse.json(
        { error: 'يجب إدخال عنوان المزاد' },
        { status: 400 }
      );
    }

    if (!startingPrice || startingPrice <= 0) {
      return NextResponse.json(
        { error: 'السعر الابتدائي غير صحيح' },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'يجب تحديد تاريخ البدء والانتهاء' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return NextResponse.json(
        { error: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء' },
        { status: 400 }
      );
    }

    // @ts-ignore - Temporarily ignore until migration applied
    const auction = await prisma.auction.create({
      data: {
        productId,
        title: title || titleAr,
        titleAr: titleAr || title,
        description,
        descriptionAr,
        startingPrice: parseFloat(startingPrice),
        currentPrice: parseFloat(startingPrice),
        minimumBidIncrement: parseFloat(minimumBidIncrement || 10),
        reservePrice: reservePrice ? parseFloat(reservePrice) : null,
        buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : null,
        startDate: start,
        endDate: end,
        featured: featured || false,
        extendOnBid: extendOnBid !== false,
        termsAndConditions,
        images: images || [],
        status: start <= new Date() ? 'ACTIVE' : 'SCHEDULED',
        viewCount: 0,
        bidCount: 0
      }
    });

    return NextResponse.json({
      success: true,
      auction
    });
  } catch (error) {
    console.error('Error creating auction:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء المزاد' },
      { status: 500 }
    );
  }
}
