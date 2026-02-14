import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      nameAr,
      description,
      descriptionAr,
      categoryId,
      images,
      variants, // المقاسات/الأعمار
      isOwnProduct,
      badge,
      sizes,
      colors,
    } = body;

    // التحقق من البيانات الأساسية
    if (!nameAr || !categoryId) {
      return NextResponse.json(
        { error: 'الرجاء ملء جميع الحقول المطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من وجود variants
    if (!variants || variants.length === 0) {
      return NextResponse.json(
        { error: 'يجب إضافة مقاس واحد على الأقل' },
        { status: 400 }
      );
    }

    // حساب السعر الأساسي (أقل سعر من الـ variants)
    const minPrice = Math.min(...variants.map((v: any) => v.price));
    const maxPrice = Math.max(...variants.map((v: any) => v.price));
    
    // حساب إجمالي المخزون
    const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);

    // إنشاء المنتج مع الـ variants
    const product = await prisma.product.create({
      data: {
        name: name || nameAr,
        nameAr,
        description,
        descriptionAr,
        price: minPrice, // السعر الأساسي = أقل سعر
        originalPrice: maxPrice > minPrice ? maxPrice : null, // أعلى سعر كـ original price
        categoryId,
        images,
        stock: totalStock,
        isActive: true,
        vendorId: session.user.role === 'VENDOR' ? session.user.id : null,
        isOwnProduct: isOwnProduct || false,
        badge,
        sizes,
        colors,
        // إنشاء الـ variants
        variants: {
          create: variants.map((variant: any, index: number) => ({
            variantType: variant.variantType || 'SIZE',
            name: variant.name || '',
            nameAr: variant.nameAr,
            sku: variant.sku || '',
            price: variant.price,
            stock: variant.stock || 0,
            isActive: variant.isActive !== false,
            sortOrder: variant.sortOrder || index + 1,
          })),
        },
      },
      include: {
        variants: true,
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      product,
      message: 'تم إضافة المنتج بنجاح',
    });
  } catch (error) {
    console.error('❌ Error creating product with variants:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إضافة المنتج' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (productId) {
      // جلب منتج محدد مع variants
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          variants: {
            orderBy: { sortOrder: 'asc' },
          },
          category: true,
        },
      });

      if (!product) {
        return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
      }

      return NextResponse.json({ product });
    } else {
      // جلب جميع منتجات الشريك مع variants
      const where = session.user.role === 'VENDOR' 
        ? { vendorId: session.user.id }
        : {};

      const products = await prisma.product.findMany({
        where,
        include: {
          variants: {
            orderBy: { sortOrder: 'asc' },
          },
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ products });
    }
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المنتجات' },
      { status: 500 }
    );
  }
}
