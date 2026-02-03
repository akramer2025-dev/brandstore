import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'MANUFACTURER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const productions = await prisma.production.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            nameAr: true,
            name: true
          }
        }
      }
    });

    const formattedProductions = productions.map(p => ({
      id: p.id,
      productName: p.product?.nameAr || p.product?.name || 'منتج غير معروف',
      quantity: p.quantity,
      status: p.status,
      createdAt: p.createdAt.toISOString()
    }));

    return NextResponse.json({ productions: formattedProductions });

  } catch (error) {
    console.error('Error fetching productions:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب أوامر الإنتاج' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'MANUFACTURER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, quantity, notes } = body;

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: 'المنتج والكمية مطلوبان' },
        { status: 400 }
      );
    }

    const production = await prisma.production.create({
      data: {
        productId,
        quantity: parseInt(quantity),
        notes: notes || '',
        status: 'PENDING'
      }
    });

    return NextResponse.json({ production });

  } catch (error) {
    console.error('Error creating production:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء أمر الإنتاج' },
      { status: 500 }
    );
  }
}
