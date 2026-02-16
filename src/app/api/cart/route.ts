import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 📋 GET: جلب سلة المستخدم
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('🔒 [CART API] No session - user not logged in');
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    console.log('✅ [CART API] Fetching cart for user:', session.user.id);

    const cartItems = await prisma.cart.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            price: true,
            originalPrice: true,
            images: true,
            stock: true,
            isActive: true,
            categoryId: true,
            category: {
              select: {
                nameAr: true
              }
            },
            variants: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📦 [CART API] Found ${cartItems.length} items in cart`);

    // تحويل البيانات للـ format المطلوب
    const formattedItems = cartItems.map(item => {
      const product = item.product;
      const imageArray = product.images ? product.images.split(',') : [];
      
      return {
        id: item.id,
        productId: product.id,
        name: product.name,
        nameAr: product.nameAr,
        price: item.price,
        originalPrice: product.originalPrice,
        quantity: item.quantity,
        image: imageArray[0] || null,
        categoryName: product.category?.nameAr,
        stock: product.stock,
        isActive: product.isActive,
        variant: item.variantId ? product.variants.find(v => v.id === item.variantId) : null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };
    });

    return NextResponse.json({
      success: true,
      items: formattedItems,
      totalItems: formattedItems.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: formattedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    });
  } catch (error: any) {
    console.error('❌ [CART API ERROR] Details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack
    });
    
    // ⚠️ TEMPORARY FIX: If Cart table doesn't exist on Vercel, return empty cart
    // This happens when database migration hasn't run yet
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      console.log('⚠️ [CART API] Cart table not found - returning empty cart (migration needed)');
      return NextResponse.json({
        success: true,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        warning: 'Cart sync disabled - database migration required'
      });
    }
    
    return NextResponse.json(
      { 
        error: 'فشل جلب السلة',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

// ➕ POST: إضافة منتج إلى السلة
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, variantId, price, quantity = 1 } = body;

    if (!productId || !price) {
      return NextResponse.json(
        { error: 'بيانات غير كاملة' },
        { status: 400 }
      );
    }

    // التحقق من المنتج
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { 
        id: true, 
        stock: true, 
        isActive: true,
        nameAr: true
      }
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'المنتج غير متاح' },
        { status: 404 }
      );
    }

    // البحث عن المنتج في السلة
    const existingCartItem = await prisma.cart.findUnique({
      where: {
        userId_productId_variantId: {
          userId: session.user.id,
          productId,
          variantId: variantId || null
        }
      }
    });

    let cartItem;

    if (existingCartItem) {
      // تحديث الكمية
      const newQuantity = existingCartItem.quantity + quantity;
      
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { error: `الحد الأقصى المتاح: ${product.stock}` },
          { status: 400 }
        );
      }

      cartItem = await prisma.cart.update({
        where: { id: existingCartItem.id },
        data: { 
          quantity: newQuantity,
          price: price // تحديث السعر في حالة تغييره
        },
        include: {
          product: {
            select: {
              nameAr: true,
              images: true
            }
          }
        }
      });
    } else {
      // إنشاء عنصر جديد
      if (quantity > product.stock) {
        return NextResponse.json(
          { error: `الحد الأقصى المتاح: ${product.stock}` },
          { status: 400 }
        );
      }

      cartItem = await prisma.cart.create({
        data: {
          userId: session.user.id,
          productId,
          variantId: variantId || null,
          quantity,
          price
        },
        include: {
          product: {
            select: {
              nameAr: true,
              images: true
            }
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `✅ تمت إضافة ${product.nameAr} إلى السلة`,
      item: cartItem
    });
  } catch (error: any) {
    console.error('❌ Error adding to cart:', error);
    
    // ⚠️ TEMPORARY FIX: If Cart table doesn't exist, return success but warn
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      console.log('⚠️ [CART API] Cart table not found - cart sync disabled');
      return NextResponse.json({
        success: true,
        message: 'تم الحفظ محلياً (المزامنة معطلة مؤقتاً)',
        warning: 'Cart sync disabled - using localStorage only'
      });
    }
    
    return NextResponse.json(
      { error: 'فشل إضافة المنتج إلى السلة' },
      { status: 500 }
    );
  }
}

// ✏️ PUT: تعديل كمية منتج في السلة
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cartItemId, quantity } = body;

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json(
        { error: 'بيانات غير كاملة' },
        { status: 400 }
      );
    }

    // التحقق من ملكية العنصر
    const cartItem = await prisma.cart.findFirst({
      where: {
        id: cartItemId,
        userId: session.user.id
      },
      include: {
        product: {
          select: {
            stock: true,
            nameAr: true
          }
        }
      }
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'العنصر غير موجود في السلة' },
        { status: 404 }
      );
    }

    // حذف إذا الكمية 0
    if (quantity <= 0) {
      await prisma.cart.delete({ where: { id: cartItemId } });
      return NextResponse.json({
        success: true,
        message: 'تم حذف المنتج من السلة',
        deleted: true
      });
    }

    // التحقق من المخزون
    if (quantity > cartItem.product.stock) {
      return NextResponse.json(
        { error: `الحد الأقصى المتاح: ${cartItem.product.stock}` },
        { status: 400 }
      );
    }

    // تحديث الكمية
    const updatedItem = await prisma.cart.update({
      where: { id: cartItemId },
      data: { quantity }
    });

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الكمية',
      item: updatedItem
    });
  } catch (error: any) {
    console.error('❌ Error updating cart:', error);
    
    // ⚠️ TEMPORARY FIX: If Cart table doesn't exist, return success
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      console.log('⚠️ [CART API] Cart table not found - cart sync disabled');
      return NextResponse.json({
        success: true,
        message: 'تم التحديث محلياً',
        warning: 'Cart sync disabled'
      });
    }
    
    return NextResponse.json(
      { error: 'فشل تحديث السلة' },
      { status: 500 }
    );
  }
}

// 🗑️ DELETE: حذف جميع عناصر السلة
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    await prisma.cart.deleteMany({
      where: { userId: session.user.id }
    });

    return NextResponse.json({
      success: true,
      message: 'تم إفراغ السلة'
    });
  } catch (error: any) {
    console.error('❌ Error clearing cart:', error);
    
    // ⚠️ TEMPORARY FIX: If Cart table doesn't exist, return success
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      console.log('⚠️ [CART API] Cart table not found - cart sync disabled');
      return NextResponse.json({
        success: true,
        message: 'تم الحذف محلياً',
        warning: 'Cart sync disabled'
      });
    }
    
    return NextResponse.json(
      { error: 'فشل إفراغ السلة' },
      { status: 500 }
    );
  }
}
