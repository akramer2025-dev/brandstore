import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET: جلب فئة واحدة
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json({ error: 'الفئة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'فشل في جلب الفئة' }, { status: 500 });
  }
}

// PUT: تحديث فئة
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'VENDOR')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { nameAr, name, description, image } = body;

    if (!nameAr) {
      return NextResponse.json({ error: 'اسم الفئة بالعربي مطلوب' }, { status: 400 });
    }

    // التحقق من عدم وجود فئة أخرى بنفس الاسم
    const existingCategory = await prisma.category.findFirst({
      where: {
        nameAr: nameAr,
        NOT: {
          id: params.id
        }
      }
    });

    if (existingCategory) {
      return NextResponse.json({ error: 'يوجد فئة بهذا الاسم بالفعل' }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        nameAr,
        name: name || nameAr,
        description: description || null,
        image: image || null
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'فشل في تحديث الفئة' }, { status: 500 });
  }
}

// DELETE: حذف فئة
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح - مطلوب صلاحيات الإدارة' }, { status: 401 });
    }

    // التحقق من عدم وجود منتجات تستخدم هذه الفئة
    const productsCount = await prisma.product.count({
      where: {
        categoryId: params.id
      }
    });

    if (productsCount > 0) {
      return NextResponse.json({ 
        error: `لا يمكن حذف الفئة لأن هناك ${productsCount} منتج يستخدم هذه الفئة`
      }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'تم حذف الفئة بنجاح' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'فشل في حذف الفئة' }, { status: 500 });
  }
}
