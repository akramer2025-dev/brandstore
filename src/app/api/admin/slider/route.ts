import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - جلب جميع صور السلايدر
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sliders = await prisma.sliderImage.findMany({
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ sliders });
  } catch (error) {
    console.error('Error fetching sliders:', error);
    return NextResponse.json({ error: 'Failed to fetch sliders' }, { status: 500 });
  }
}

// POST - إضافة صورة جديدة
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const slider = await prisma.sliderImage.create({
      data: {
        title: data.title,
        titleAr: data.titleAr || null,
        subtitle: data.subtitle || null,
        subtitleAr: data.subtitleAr || null,
        imageUrl: data.imageUrl,
        link: data.link || null,
        buttonText: data.buttonText || null,
        buttonTextAr: data.buttonTextAr || null,
        order: data.order || 0,
        isActive: data.isActive ?? true
      }
    });

    return NextResponse.json({ slider });
  } catch (error) {
    console.error('Error creating slider:', error);
    return NextResponse.json({ error: 'Failed to create slider' }, { status: 500 });
  }
}

// PUT - تحديث صورة
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { id, ...updateData } = data;

    const slider = await prisma.sliderImage.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ slider });
  } catch (error) {
    console.error('Error updating slider:', error);
    return NextResponse.json({ error: 'Failed to update slider' }, { status: 500 });
  }
}

// DELETE - حذف صورة
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();

    await prisma.sliderImage.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting slider:', error);
    return NextResponse.json({ error: 'Failed to delete slider' }, { status: 500 });
  }
}
