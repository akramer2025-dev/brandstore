import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json(
        { error: 'غير مصرح لك' },
        { status: 401 }
      );
    }

    // جلب معلومات الشريك
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      select: {
        coverImage: true,
        logo: true,
        storeBio: true,
        storeBioAr: true,
        storeThemeColor: true,
        facebookUrl: true,
        instagramUrl: true,
        twitterUrl: true,
        youtubeUrl: true,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'الشريك غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(vendor);

  } catch (error) {
    console.error('Error fetching store settings:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الإعدادات' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json(
        { error: 'غير مصرح لك' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      coverImage,
      logo,
      storeBio,
      storeBioAr,
      storeThemeColor,
      facebookUrl,
      instagramUrl,
      twitterUrl,
      youtubeUrl,
    } = body;

    // التحقق من صحة الروابط
    const urlPattern = /^https?:\/\/.+/;
    if (facebookUrl && !urlPattern.test(facebookUrl)) {
      return NextResponse.json(
        { error: 'رابط فيسبوك غير صحيح' },
        { status: 400 }
      );
    }
    if (instagramUrl && !urlPattern.test(instagramUrl)) {
      return NextResponse.json(
        { error: 'رابط إنستجرام غير صحيح' },
        { status: 400 }
      );
    }

    // تحديث إعدادات الشريك
    const vendor = await prisma.vendor.update({
      where: { userId: session.user.id },
      data: {
        coverImage: coverImage || null,
        logo: logo || null,
        storeBio: storeBio || null,
        storeBioAr: storeBioAr || null,
        storeThemeColor: storeThemeColor || null,
        facebookUrl: facebookUrl || null,
        instagramUrl: instagramUrl || null,
        twitterUrl: twitterUrl || null,
        youtubeUrl: youtubeUrl || null,
      },
      select: {
        id: true,
        coverImage: true,
        logo: true,
        storeBio: true,
        storeBioAr: true,
        storeThemeColor: true,
        facebookUrl: true,
        instagramUrl: true,
        twitterUrl: true,
        youtubeUrl: true,
      },
    });

    return NextResponse.json({
      message: 'تم حفظ الإعدادات بنجاح',
      vendor,
    });

  } catch (error) {
    console.error('Error updating store settings:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حفظ الإعدادات' },
      { status: 500 }
    );
  }
}
