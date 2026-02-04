import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - List all delivery zones
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { message: 'غير مصرح' },
        { status: 401 }
      );
    }

    const zones = await prisma.deliveryZone.findMany({
      orderBy: { governorate: 'asc' }
    });

    return NextResponse.json(zones);
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    return NextResponse.json(
      { message: 'فشل في جلب مناطق التوصيل' },
      { status: 500 }
    );
  }
}

// POST - Create new delivery zone (ADMIN only)
export async function POST(req: NextRequest) {
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

    // Validate required fields
    if (!governorate || deliveryFee === undefined) {
      return NextResponse.json(
        { message: 'الحقول المطلوبة مفقودة' },
        { status: 400 }
      );
    }

    // Check if governorate already exists
    const existing = await prisma.deliveryZone.findUnique({
      where: { governorate }
    });

    if (existing) {
      return NextResponse.json(
        { message: 'هذه المحافظة موجودة بالفعل' },
        { status: 400 }
      );
    }

    // Create delivery zone
    const zone = await prisma.deliveryZone.create({
      data: {
        governorate,
        deliveryFee: parseFloat(deliveryFee),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json(zone, { status: 201 });
  } catch (error) {
    console.error('Error creating delivery zone:', error);
    return NextResponse.json(
      { message: 'فشل في إضافة منطقة التوصيل' },
      { status: 500 }
    );
  }
}
