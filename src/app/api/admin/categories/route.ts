import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET: عرض كل الأصناف
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        nameAr: 'asc'
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'فشل في جلب الأصناف' }, { status: 500 });
  }
}

// POST: إضافة صنف جديد
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'VENDOR')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { nameAr, name, description, image } = body;

    if (!nameAr) {
      return NextResponse.json({ error: 'اسم الصنف بالعربي مطلوب' }, { status: 400 });
    }

    // التحقق من عدم وجود صنف بنفس الاسم
    const existingCategory = await prisma.category.findFirst({
      where: {
        nameAr: nameAr
      }
    });

    if (existingCategory) {
      return NextResponse.json({ error: 'يوجد صنف بهذا الاسم بالفعل' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        nameAr,
        name: name || nameAr,
        description: description || '',
        image: image || null
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'فشل في إنشاء الصنف' }, { status: 500 });
  }
}

// DELETE: حذف صنف
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح - مطلوب صلاحيات الإدارة' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('id');

    if (!categoryId) {
      return NextResponse.json({ error: 'معرف الصنف مطلوب' }, { status: 400 });
    }

    // التحقق من عدم وجود منتجات تستخدم هذا الصنف
    const productsCount = await prisma.product.count({
      where: {
        categoryId: categoryId
      }
    });

    if (productsCount > 0) {
      return NextResponse.json({ 
        error: `لا يمكن حذف الصنف لأن هناك ${productsCount} منتج يستخدم هذا الصنف`
      }, { status: 400 });
    }

    await prisma.category.delete({
      where: {
        id: categoryId
      }
    });

    return NextResponse.json({ message: 'تم حذف الصنف بنجاح' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'فشل في حذف الصنف' }, { status: 500 });
  }
}