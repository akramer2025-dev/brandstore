import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// تحديث عنوان
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    // التحقق من أن العنوان يخص المستخدم
    const existingAddress = await prisma.savedAddress.findFirst({
      where: { 
        id,
        userId: session.user.id 
      }
    });

    if (!existingAddress) {
      return NextResponse.json({ error: 'العنوان غير موجود' }, { status: 404 });
    }

    // إذا كان العنوان المحدث افتراضي، إلغاء الافتراضي من العناوين الأخرى
    if (data.isDefault) {
      await prisma.savedAddress.updateMany({
        where: { 
          userId: session.user.id,
          isDefault: true,
          NOT: { id }
        },
        data: { isDefault: false }
      });
    }

    // تحديث العنوان
    const address = await prisma.savedAddress.update({
      where: { id },
      data: {
        title: data.title || existingAddress.title,
        fullName: data.fullName || existingAddress.fullName,
        phone: data.phone || existingAddress.phone,
        alternativePhone: data.alternativePhone,
        governorate: data.governorate || existingAddress.governorate,
        city: data.city || existingAddress.city,
        district: data.district || existingAddress.district,
        street: data.street || existingAddress.street,
        buildingNumber: data.buildingNumber,
        floorNumber: data.floorNumber,
        apartmentNumber: data.apartmentNumber,
        landmark: data.landmark,
        postalCode: data.postalCode,
        isDefault: data.isDefault !== undefined ? data.isDefault : existingAddress.isDefault,
      }
    });

    return NextResponse.json({ address });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث العنوان' },
      { status: 500 }
    );
  }
}

// حذف عنوان
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    const { id } = await params;

    // التحقق من أن العنوان يخص المستخدم
    const address = await prisma.savedAddress.findFirst({
      where: { 
        id,
        userId: session.user.id 
      }
    });

    if (!address) {
      return NextResponse.json({ error: 'العنوان غير موجود' }, { status: 404 });
    }

    // حذف العنوان
    await prisma.savedAddress.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'تم حذف العنوان بنجاح' });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف العنوان' },
      { status: 500 }
    );
  }
}

// تحديث جزئي لعنوان (PATCH)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    // التحقق من أن العنوان يخص المستخدم
    const address = await prisma.savedAddress.findFirst({
      where: { 
        id,
        userId: session.user.id 
      }
    });

    if (!address) {
      return NextResponse.json({ error: 'العنوان غير موجود' }, { status: 404 });
    }

    // إذا كان العنوان المحدث افتراضي، إلغاء الافتراضي من العناوين الأخرى
    if (data.isDefault === true) {
      await prisma.savedAddress.updateMany({
        where: { 
          userId: session.user.id,
          isDefault: true,
          NOT: { id }
        },
        data: { isDefault: false }
      });
    }

    // تحديث العنوان (فقط الحقول المرسلة)
    const updatedAddress = await prisma.savedAddress.update({
      where: { id },
      data,
    });

    return NextResponse.json({ address: updatedAddress });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث العنوان' },
      { status: 500 }
    );
  }
}
