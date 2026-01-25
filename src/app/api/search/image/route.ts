import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // حفظ الصورة مؤقتاً
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'search');
    const fileName = `search-${Date.now()}-${file.name}`;
    const filePath = join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    // في الوقت الحالي، نبحث عن منتجات عشوائية
    // يمكن استخدام AI للبحث بالصورة لاحقاً
    const products = await prisma.product.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ 
      success: true, 
      products,
      message: 'البحث بالصورة قيد التطوير - عرض نتائج عشوائية'
    });
  } catch (error) {
    console.error('Image search error:', error);
    return NextResponse.json(
      { error: 'Failed to process image search' },
      { status: 500 }
    );
  }
}
