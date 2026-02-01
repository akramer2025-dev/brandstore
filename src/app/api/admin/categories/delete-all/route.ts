import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // حذف جميع المنتجات أولاً (لأن categoryId required في المنتجات)
    await prisma.product.deleteMany({});

    // ثانياً: حذف جميع الأصناف
    await prisma.category.deleteMany({});

    return NextResponse.json({
      success: true,
      message: 'تم حذف جميع الأصناف والمنتجات بنجاح'
    });
  } catch (error) {
    console.error('Error deleting categories:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الأصناف' },
      { status: 500 }
    );
  }
}
