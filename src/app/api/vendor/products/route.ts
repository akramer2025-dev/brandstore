import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// إضافة منتج جديد
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id }
    });

    if (!vendor) {
      return NextResponse.json({ error: 'لم يتم العثور على الشريك' }, { status: 404 });
    }

    const data = await req.json();
    const {
      name,
      nameAr,
      description,
      descriptionAr,
      price,
      originalPrice,
      stock,
      categoryId,
      images,
      isVisible = true,
      sizes,
      colors,
      saleType = 'SINGLE',
      productionCost,
      platformCommission = 5,
    } = data;

    // التحقق من البيانات المطلوبة
    if (!nameAr || !price || stock === undefined || !categoryId || !images) {
      return NextResponse.json(
        { error: 'الرجاء ملء جميع الحقول المطلوبة' },
        { status: 400 }
      );
    }

    // إنشاء المنتج
    const product = await prisma.product.create({
      data: {
        name: name || nameAr,
        nameAr,
        description: description || '',
        descriptionAr: descriptionAr || '',
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        stock: parseInt(stock),
        categoryId,
        images,
        vendorId: vendor.id,
        isVisible,
        sizes: sizes || null,
        colors: colors || null,
        saleType: saleType || 'SINGLE',
        productionCost: productionCost ? parseFloat(productionCost) : null,
        platformCommission: platformCommission || 5,
      },
      include: {
        category: true,
        vendor: true,
      }
    });

    return NextResponse.json({ 
      message: 'تم إضافة المنتج بنجاح',
      product 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إضافة المنتج' },
      { status: 500 }
    );
  }
}

// جلب منتجات الشريك
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'VENDOR') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id }
    });

    if (!vendor) {
      return NextResponse.json({ error: 'لم يتم العثور على الشريك' }, { status: 404 });
    }

    const products = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ products });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المنتجات' },
      { status: 500 }
    );
  }
}
