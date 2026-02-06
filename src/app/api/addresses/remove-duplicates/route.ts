import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    // جلب جميع عناوين المستخدم
    const allAddresses = await prisma.savedAddress.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' }, // الأقدم أولاً
    });

    // تتبع العناوين الفريدة والمكررة
    const uniqueAddresses = new Map<string, string>(); // key -> addressId
    const duplicateIds: string[] = [];

    for (const address of allAddresses) {
      // إنشاء key فريد بناءً على البيانات الأساسية
      const key = [
        address.governorate,
        address.city,
        address.district,
        address.street,
        address.buildingNumber || '',
        address.floorNumber || '',
        address.apartmentNumber || '',
      ].join('|').toLowerCase();

      if (uniqueAddresses.has(key)) {
        // عنوان مكرر - نضيفه للقائمة المراد حذفها
        duplicateIds.push(address.id);
      } else {
        // عنوان فريد - نحتفظ به
        uniqueAddresses.set(key, address.id);
      }
    }

    // حذف العناوين المكررة
    if (duplicateIds.length > 0) {
      await prisma.savedAddress.deleteMany({
        where: {
          id: { in: duplicateIds },
        },
      });
    }

    console.log(`✅ تم حذف ${duplicateIds.length} عنوان مكرر`);

    return NextResponse.json({
      success: true,
      deletedCount: duplicateIds.length,
      remainingCount: uniqueAddresses.size,
    });
  } catch (error) {
    console.error('Error removing duplicate addresses:', error);
    return NextResponse.json(
      { error: 'فشل حذف العناوين المكررة' },
      { status: 500 }
    );
  }
}
