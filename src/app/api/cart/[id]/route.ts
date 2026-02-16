import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 🗑️ DELETE: حذف منتج واحد من السلة
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    const { id: cartItemId } = await params;

    // التحقق من ملكية العنصر قبل الحذف
    const cartItem = await prisma.cart.findFirst({
      where: {
        id: cartItemId,
        userId: session.user.id
      }
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'العنصر غير موجود في السلة' },
        { status: 404 }
      );
    }

    // حذف العنصر
    await prisma.cart.delete({
      where: { id: cartItemId }
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف المنتج من السلة'
    });
  } catch (error: any) {
    console.error('❌ Error deleting cart item:', error);
    
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
      { error: 'فشل حذف المنتج من السلة' },
      { status: 500 }
    );
  }
}
