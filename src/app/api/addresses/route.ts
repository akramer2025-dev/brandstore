import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// جلب جميع العناوين المحفوظة للمستخدم
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    const addresses = await prisma.savedAddress.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: 'desc' }, // العنوان الافتراضي أولاً
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب العناوين' },
      { status: 500 }
    );
  }
}

// إضافة عنوان جديد
export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    const data = await req.json();

    // التحقق من الحقول المطلوبة
    if (!data.title || !data.fullName || !data.phone || !data.governorate || 
        !data.city || !data.district || !data.street) {
      return NextResponse.json(
        { error: 'يرجى ملء جميع الحقول المطلوبة' },
        { status: 400 }
      );
    }

    // إذا كان العنوان الجديد افتراضي، إلغاء الافتراضي من العناوين الأخرى
    if (data.isDefault) {
      await prisma.savedAddress.updateMany({
        where: { 
          userId: session.user.id,
          isDefault: true 
        },
        data: { isDefault: false }
      });
    }

    // إنشاء العنوان الجديد
    const address = await prisma.savedAddress.create({
      data: {
        userId: session.user.id,
        title: data.title,
        fullName: data.fullName,
        phone: data.phone,
        alternativePhone: data.alternativePhone || null,
        governorate: data.governorate,
        city: data.city,
        district: data.district,
        street: data.street,
        buildingNumber: data.buildingNumber || null,
        floorNumber: data.floorNumber || null,
        apartmentNumber: data.apartmentNumber || null,
        landmark: data.landmark || null,
        postalCode: data.postalCode || null,
        isDefault: data.isDefault || false,
      }
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حفظ العنوان' },
      { status: 500 }
    );
  }
}
