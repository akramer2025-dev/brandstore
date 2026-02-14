import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get reviews (all or for specific product)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const rating = searchParams.get("rating");
    const sort = searchParams.get("sort") || "recent";

    // Build where clause
    const where: any = {
      isApproved: true, // Only show approved reviews to public
    };

    // If productId specified, filter by it
    if (productId) {
      where.productId = productId;
    }

    // If rating filter specified
    if (rating) {
      where.rating = parseInt(rating);
    }

    // Build orderBy clause
    let orderBy: any;
    switch (sort) {
      case "highest":
        orderBy = { rating: "desc" };
        break;
      case "lowest":
        orderBy = { rating: "asc" };
        break;
      case "recent":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy,
      take: productId ? undefined : 50, // Limit to 50 for all reviews page
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    // If productId specified, return array directly (backward compatibility)
    if (productId) {
      return NextResponse.json(reviews);
    }

    // For all reviews page, return object with reviews array
    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST - Create a new review
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, rating, comment, images } = body;

    if (!productId || !rating) {
      return NextResponse.json(
        { error: "معرف المنتج والتقييم مطلوبان" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "التقييم يجب أن يكون بين 1 و 5" },
        { status: 400 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId: session.user.id,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "لقد قمت بتقييم هذا المنتج مسبقاً" },
        { status: 400 }
      );
    }

    // Check if user has purchased this product
    // أولاً: نجد الطلبات الموصلة للمستخدم
    const deliveredOrders = await prisma.order.findMany({
      where: {
        customerId: session.user.id,
        status: "DELIVERED",
      },
      select: { id: true },
    });

    if (deliveredOrders.length === 0) {
      return NextResponse.json(
        { error: "لا توجد لديك طلبات مكتملة" },
        { status: 400 }
      );
    }

    const orderIds = deliveredOrders.map(o => o.id);

    // ثانياً: نتحقق من وجود المنتج في هذه الطلبات
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        orderId: { in: orderIds },
      },
    });

    if (!hasPurchased) {
      return NextResponse.json(
        { error: "يمكنك فقط تقييم المنتجات التي اشتريتها وتم تسليمها" },
        { status: 400 }
      );
    }

    // 🎁 حساب النقاط: 5 للتقييم + 5 للصورة
    let pointsToAward = 5; // 5 نقاط للتقييم
    const hasImages = images && images.trim().length > 0;
    if (hasImages) {
      pointsToAward += 5; // 5 نقاط إضافية للصورة
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        orderId: hasPurchased.orderId,
        rating,
        comment: comment || '',
        images: images || '',
        pointsAwarded: pointsToAward,
        isApproved: true, // تلقائي (يمكن تغييره للمراجعة اليدوية)
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    // ✨ منح النقاط للمستخدم
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        points: {
          increment: pointsToAward,
        },
      },
    });

    // تسجيل حركة النقاط
    await prisma.pointTransaction.create({
      data: {
        userId: session.user.id,
        points: pointsToAward,
        type: 'EARNED',
        orderId: hasPurchased.orderId,
        description: `تقييم منتج ${hasImages ? 'مع صورة 📸' : ''} - ${pointsToAward} نقطة`,
      },
    });

    console.log('✅ تقييم جديد مع نقاط:', {
      reviewId: review.id,
      points: pointsToAward,
      hasImages,
    });

    return NextResponse.json({ 
      review,
      pointsAwarded: pointsToAward,
      message: `شكراً على تقييمك! حصلت على ${pointsToAward} نقطة ⭐`,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "فشل في إنشاء التقييم" }, { status: 500 });
  }
}
