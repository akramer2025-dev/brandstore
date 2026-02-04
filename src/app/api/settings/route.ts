import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get system settings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const keys = searchParams.get('keys')?.split(',') || [];

    if (keys.length > 0) {
      // Get specific settings
      const settings = await prisma.systemSettings.findMany({
        where: {
          key: {
            in: keys
          }
        }
      });
      return NextResponse.json(settings);
    }

    // Get all settings
    const settings = await prisma.systemSettings.findMany();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { message: 'فشل في جلب الإعدادات' },
      { status: 500 }
    );
  }
}

// POST - Create/Update system setting (ADMIN only)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, value, description } = body;

    if (!key || !value) {
      return NextResponse.json(
        { message: 'الحقول المطلوبة مفقودة' },
        { status: 400 }
      );
    }

    const setting = await prisma.systemSettings.upsert({
      where: { key },
      create: { key, value, description },
      update: { value, description }
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { message: 'فشل في تحديث الإعداد' },
      { status: 500 }
    );
  }
}
