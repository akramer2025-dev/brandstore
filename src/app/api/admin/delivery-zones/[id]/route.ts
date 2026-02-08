import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - Get single delivery zone
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { message: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const zone = await prisma.deliveryZone.findUnique({
      where: { id }
    });

    if (!zone) {
      return NextResponse.json(
        { message: 'منطقة التوصيل غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json(zone);
  } catch (error) {
    console.error('Error fetching delivery zone:', error);
    return NextResponse.json(
      { message: 'فشل في جلب منطقة التوصيل' },
      { status: 500 }
    );
  }
}

// PATCH - Update delivery zone (ADMIN only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'غير مصرح - صلاحيات إدارية مطلوبة' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { governorate, deliveryFee, minOrderValue, isActive } = body;

    const { id } = await params;
    // Check if zone exists
    const existing = await prisma.deliveryZone.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { message: 'منطقة التوصيل غير موجودة' },
        { status: 404 }
      );
    }

    // If governorate is being changed, check for duplicates
    if (governorate && governorate !== existing.governorate) {
      const duplicate = await prisma.deliveryZone.findUnique({
        where: { governorate }
      });

      if (duplicate) {
        return NextResponse.json(
          { message: 'هذه المحافظة موجودة بالفعل' },
          { status: 400 }
        );
      }
    }

    // Update zone
    const updated = await prisma.deliveryZone.update({
      where: { id },
      data: {
        ...(governorate && { governorate }),
        ...(deliveryFee !== undefined && { deliveryFee: parseFloat(deliveryFee) }),
        ...(minOrderValue !== undefined && { minOrderValue: parseFloat(minOrderValue) }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating delivery zone:', error);
    return NextResponse.json(
      { message: 'فشل في تحديث منطقة التوصيل' },
      { status: 500 }
    );
  }
}

// PUT - Update delivery zone (ADMIN only) - Same as PATCH
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(req, { params });
}

// DELETE - Delete delivery zone (ADMIN only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'غير مصرح - صلاحيات إدارية مطلوبة' },
        { status: 403 }
      );
    }

    const { id } = await params;
    // Check if zone exists
    const existing = await prisma.deliveryZone.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { message: 'منطقة التوصيل غير موجودة' },
        { status: 404 }
      );
    }

    // Delete zone
    await prisma.deliveryZone.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'تم حذف منطقة التوصيل بنجاح' });
  } catch (error) {
    console.error('Error deleting delivery zone:', error);
    return NextResponse.json(
      { message: 'فشل في حذف منطقة التوصيل' },
      { status: 500 }
    );
  }
}
